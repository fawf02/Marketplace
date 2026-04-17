<template>
  <div v-if="auth.showSellModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div class="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg max-h-96 overflow-y-auto">
      <h3 class="text-2xl font-bold mb-4">Создать объявление</h3>
      
      <!-- Title -->
      <div class="mb-3">
        <label class="block text-sm font-semibold text-gray-700 mb-1">Название товара</label>
        <input 
          v-model="title" 
          placeholder="Введите название товара" 
          class="w-full p-3 border rounded text-black placeholder-gray-400" 
        />
      </div>

      <!-- Category -->
      <div class="mb-3">
        <label class="block text-sm font-semibold text-gray-700 mb-1">Категория</label>
        <select v-model="category" class="w-full p-3 border rounded text-black">
          <option value="">Выберите категорию</option>
          <option value="electronics">Электроника</option>
          <option value="clothing">Одежда</option>
          <option value="furniture">Мебель</option>
          <option value="sports">Спорт</option>
          <option value="books">Книги</option>
          <option value="toys">Игрушки</option>
          <option value="other">Прочее</option>
        </select>
      </div>

      <!-- Price -->
      <div class="mb-3">
        <label class="block text-sm font-semibold text-gray-700 mb-1">Цена (KZT)</label>
        <input 
          v-model.number="price" 
          type="number" 
          placeholder="0" 
          class="w-full p-3 border rounded text-black placeholder-gray-400" 
        />
      </div>


      <!-- Address -->
      <div class="mb-3">
        <label class="block text-sm font-semibold text-gray-700 mb-1">Адрес (место сделки)</label>
        <input
          v-model="address"
          placeholder="Город, район, улица..."
          class="w-full p-3 border rounded text-black placeholder-gray-400"
        />
      </div>

      <!-- Description -->
      <div class="mb-3">
        <label class="block text-sm font-semibold text-gray-700 mb-1">Описание</label>
        <textarea 
          v-model="description" 
          placeholder="Опишите товар (необязательно)" 
          class="w-full p-3 border rounded text-black placeholder-gray-400 h-20 resize-none"
        ></textarea>
      </div>

      <!-- Image URLs -->
      <div class="mb-3">
        <label class="block text-sm font-semibold text-gray-700 mb-1">Ссылки на изображения (необязательно)</label>
        <div v-for="(img, idx) in images" :key="idx" class="flex gap-2 mb-2 items-center">
          <input
            v-model="images[idx]"
            placeholder="https://example.com/image.jpg"
            class="flex-1 p-3 border rounded text-black placeholder-gray-400"
          />
          <button
            type="button"
            @click="removeImage(idx)"
            class="text-red-600 hover:text-red-800"
          >
            ✕
          </button>
        </div>
        <button
          type="button"
          @click="addImage"
          class="text-blue-600 hover:underline text-sm"
        >Добавить ещё</button>
      </div>

      <!-- Error message -->
      <p v-if="error" class="text-red-600 mb-3 text-sm">{{ error }}</p>

      <!-- Buttons -->
      <div class="flex gap-3">
        <button 
          @click="submit" 
          :disabled="loading" 
          :class="loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-600'" 
          class="flex-1 py-2 bg-orange-500 text-white rounded font-semibold transition-colors"
        >
          {{ loading ? 'Создание...' : 'Создать объявление' }}
        </button>
        <button 
          @click="auth.closeSell" 
          class="flex-1 py-2 bg-gray-300 text-gray-700 rounded font-semibold hover:bg-gray-400 transition-colors"
        >
          Отмена
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()

const title = ref('')
const category = ref('')
const price = ref(null)
const description = ref('')
const images = ref([''])
const address = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''

  // Validation
  if (!title.value.trim()) {
    error.value = 'Введите название товара'
    return
  }
  if (!category.value) {
    error.value = 'Выберите категорию'
    return
  }
  if (!price.value || price.value <= 0) {
    error.value = 'Введите корректную цену'
    return
  }
  if (!auth.isAuthenticated) {
    error.value = 'Вы должны войти в акаунт'
    return
  }

  loading.value = true
  try {
    const response = await auth.api('/api/products', {
      method: 'POST',
      body: {
        title: title.value.trim(),
        category: category.value,
        price: Number(price.value),
        address: address.value.trim(),
        description: description.value.trim(),
        images: images.value.filter(i => i.trim()),
        image: images.value.find(i => i.trim()) || ''
      }
    })

    // Reset form
    title.value = ''
    category.value = ''
    price.value = null
    description.value = ''

    images.value = ['']
    address.value = ''
    error.value = ''

    // Show success message
    alert('Объявление создано успешно! ✓')
    auth.closeSell()
  } catch (e) {
    error.value = e.message || 'Ошибка создания объявления'
  } finally {
    loading.value = false
  }
}

function addImage() {
  images.value.push('')
}

function removeImage(idx) {
  images.value.splice(idx, 1)
}
</script>
