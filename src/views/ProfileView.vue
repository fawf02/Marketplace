<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Header -->
    <section class="bg-white border-b border-slate-200 py-8">
      <div class="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-bold text-slate-900 mb-2">{{ auth.user?.name || 'Профиль' }}</h1>
            <p class="text-slate-600">{{ auth.user?.email }}</p>
          </div>
          <button 
            @click="auth.logout"
            class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Выход
          </button>
        </div>
      </div>
    </section>

    <!-- Tabs -->
    <div class="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 py-8">
      <div class="flex gap-4 border-b border-slate-200 mb-8">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'px-4 py-2 font-semibold transition-colors border-b-2',
            activeTab === tab.id
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          ]"
        >
          {{ tab.name }}
        </button>
      </div>

      <!-- Tab: My Advertisements -->
      <div v-if="activeTab === 'ads'" class="space-y-4">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-slate-900">Мои объявления</h2>
          <button
            @click="auth.openSell"
            class="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
          >
            + Создать объявление
          </button>
        </div>

        <div v-if="loading.ads" class="text-center py-8">
          <p class="text-slate-600">Загрузка...</p>
        </div>

        <div v-else-if="advertisements.length === 0" class="bg-white rounded-lg p-8 text-center">
          <p class="text-slate-600 mb-4">У вас еще нет объявлений</p>
          <button
            @click="auth.openSell"
            class="inline-block px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Создать первое объявление
          </button>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="ad in advertisements"
            :key="ad._id"
            class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
          >
            <img 
              v-if="(ad.images && ad.images.length) || ad.image"
              :src="(ad.images && ad.images.length ? ad.images[0] : ad.image)"
              :alt="ad.title"
              class="w-full h-40 object-cover"
            />
            <div class="p-4">
              <h3 class="font-bold text-slate-900 mb-1 line-clamp-2">{{ ad.title }}</h3>
              <p class="text-slate-600 text-sm mb-3 line-clamp-2">{{ ad.description }}</p>
              <div class="flex items-center justify-between mb-4">
                <span class="text-2xl font-bold text-blue-600">{{ ad.price }}KZT</span>
                <span class="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded">{{ ad.category }}</span>
              </div>
              <div class="flex gap-2">
                <button
                  @click="editAdvertisement(ad)"
                  class="flex-1 px-3 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors text-sm font-semibold"
                >
                  Редактировать
                </button>
                <button
                  @click="deleteAdvertisement(ad._id)"
                  class="flex-1 px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors text-sm font-semibold"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: My Orders -->
      <div v-if="activeTab === 'orders'" class="space-y-4">
        <h2 class="text-2xl font-bold text-slate-900 mb-6">Мои заказы</h2>

        <div v-if="loading.orders" class="text-center py-8">
          <p class="text-slate-600">Загрузка...</p>
        </div>

        <div v-else-if="orders.length === 0" class="bg-white rounded-lg p-8 text-center">
          <p class="text-slate-600">У вас еще нет заказов</p>
        </div>

        <div v-else class="space-y-4">
          <div 
            v-for="order in orders"
            :key="order._id"
            class="bg-white rounded-lg p-6 border border-slate-200 hover:border-blue-300 transition-colors"
          >
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="font-bold text-slate-900">Заказ #{{ order._id.toString().slice(-6).toUpperCase() }}</h3>
                <p class="text-sm text-slate-600">{{ formatDate(order.createdAt) }}</p>
                <p v-if="order.payment && order.payment.cardLast4" class="text-xs text-slate-500">
                  Оплачено картой ****{{ order.payment.cardLast4 }}
                </p>
              </div>
              <span class="text-lg font-bold text-green-600">{{ calculateTotal(order.items) }}KZT</span>
            </div>

            <div class="space-y-2">
              <h4 class="font-semibold text-slate-900 mb-2">Товары:</h4>
              <div 
                v-for="item in order.items"
                :key="item._id"
                class="flex justify-between text-sm text-slate-600"
              >
                <span>{{ item.title }} x{{ item.qty }}</span>
                <span>{{ item.price * item.qty }}KZT</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Information -->
      <div v-if="activeTab === 'info'" class="space-y-4">
        <h2 class="text-2xl font-bold text-slate-900 mb-6">Информация профиля</h2>

        <div class="bg-white rounded-lg p-8 space-y-6">
          <div>
            <label class="block text-sm font-semibold text-slate-900 mb-2">Имя</label>
            <p class="text-slate-600">{{ auth.user?.name }}</p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-900 mb-2">Email</label>
            <p class="text-slate-600">{{ auth.user?.email }}</p>
          </div>

          <div class="pt-4 border-t border-slate-200">
            <button
              @click="logout"
              class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              Выход из аккаунта
            </button>
          </div>
        </div>
      </div>

      <!-- Tab: Messages -->
      <div v-if="activeTab === 'messages'" class="space-y-4">
        <h2 class="text-2xl font-bold text-slate-900 mb-6">Сообщения</h2>

        <div v-if="loading.messages" class="text-center py-8">
          <p class="text-slate-600">Загрузка...</p>
        </div>

        <div v-else-if="conversations.length === 0" class="bg-white rounded-lg p-8 text-center">
          <svg class="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p class="text-slate-600">У вас пока нет сообщений</p>
          <p class="text-slate-400 text-sm mt-1">Сообщения появятся, когда покупатели свяжутся с вами</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="conv in conversations"
            :key="conv.adId + '_' + conv.otherUserId"
            class="bg-white rounded-xl p-5 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
            @click="openConversation(conv)"
          >
            <div class="flex gap-4">
              <!-- Ad image -->
              <div class="w-14 h-14 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
                <img v-if="conv.adImage" :src="conv.adImage" class="w-full h-full object-cover" />
                <svg v-else class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <h3 class="font-semibold text-slate-900 text-sm truncate">{{ conv.adTitle }}</h3>
                    <p class="text-blue-600 text-xs font-medium mt-0.5">
                      <svg class="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {{ conv.otherUserName }}
                    </p>
                  </div>
                  <div class="text-right flex-shrink-0">
                    <p class="text-xs text-slate-400">{{ formatDate(conv.lastMessageAt) }}</p>
                    <span class="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{{ conv.messageCount }} сообщ.</span>
                  </div>
                </div>
                <p class="text-slate-500 text-sm mt-2 truncate">«{{ conv.lastMessage }}»</p>
              </div>
            </div>

            <div class="mt-3 flex justify-end">
              <button
                @click.stop="openConversation(conv)"
                class="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all flex items-center gap-1.5"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Ответить
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg max-h-96 overflow-y-auto">
        <h3 class="text-2xl font-bold mb-4">Редактировать объявление</h3>
        
        <div class="mb-3">
          <label class="block text-sm font-semibold text-gray-700 mb-1">Название товара</label>
          <input 
            v-model="editForm.title" 
            class="w-full p-3 border rounded text-black placeholder-gray-400" 
          />
        </div>

        <div class="mb-3">
          <label class="block text-sm font-semibold text-gray-700 mb-1">Категория</label>
          <select v-model="editForm.category" class="w-full p-3 border rounded text-black">
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

        <div class="mb-3">
          <label class="block text-sm font-semibold text-gray-700 mb-1">Цена (KZT)</label>
          <input 
            v-model.number="editForm.price" 
            type="number" 
            class="w-full p-3 border rounded text-black" 
          />
        </div>

        <div class="mb-3">
          <label class="block text-sm font-semibold text-gray-700 mb-1">Описание</label>
          <textarea 
            v-model="editForm.description" 
            class="w-full p-3 border rounded text-black h-20 resize-none"
          ></textarea>
        </div>

        <div class="mb-3">
          <label class="block text-sm font-semibold text-gray-700 mb-1">Ссылки на изображения</label>
          <div v-for="(img, idx) in editForm.images" :key="idx" class="flex gap-2 mb-2 items-center">
            <input
              v-model="editForm.images[idx]"
              class="flex-1 p-3 border rounded text-black placeholder-gray-400"
            />
            <button type="button" @click="removeEditImage(idx)" class="text-red-600 hover:text-red-800">✕</button>
          </div>
          <button type="button" @click="addEditImage" class="text-blue-600 hover:underline text-sm">Добавить ещё</button>
        </div>

        <p v-if="editError" class="text-red-600 mb-3 text-sm">{{ editError }}</p>

        <div class="flex gap-3">
          <button 
            @click="saveEdit"
            :disabled="editLoading"
            class="flex-1 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {{ editLoading ? 'Сохранение...' : 'Сохранить' }}
          </button>
          <button 
            @click="showEditModal = false"
            class="flex-1 py-2 bg-gray-300 text-gray-700 rounded font-semibold hover:bg-gray-400"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>

    <!-- Chat Modal -->
    <ChatModal
      :isOpen="isChatOpen"
      :sellerId="chatOtherUserId"
      :sellerName="chatOtherUserName"
      :adId="chatAdId"
      @close="closeChatModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import ChatModal from '@/components/ChatModal.vue'

const auth = useAuthStore()
const router = useRouter()

const activeTab = ref('ads')
const tabs = [
  { id: 'ads', name: 'Мои объявления' },
  { id: 'messages', name: 'Сообщения' },
  { id: 'orders', name: 'Мои заказы' },
  { id: 'info', name: 'Информация' }
]

const advertisements = ref([])
const orders = ref([])
const conversations = ref([])
const loading = ref({ ads: false, orders: false, messages: false })

// Chat modal state
const isChatOpen = ref(false)
const chatAdId = ref('')
const chatOtherUserId = ref('')
const chatOtherUserName = ref('')

const showEditModal = ref(false)
const editForm = ref({})

function addEditImage() {
  if (!editForm.value.images) editForm.value.images = []
  editForm.value.images.push('')
}

function removeEditImage(idx) {
  if (!editForm.value.images) return
  editForm.value.images.splice(idx, 1)
}
const editLoading = ref(false)
const editError = ref('')

onMounted(async () => {
  if (!auth.isAuthenticated) {
    router.push('/catalog')
    return
  }

  await fetchAdvertisements()
  await fetchOrders()
  await fetchConversations()
})

async function fetchAdvertisements() {
  try {
    loading.value.ads = true
    console.log('Fetching advertisements...')
    const data = await auth.api('/api/user/advertisements')
    console.log('Advertisements received:', data)
    advertisements.value = data || []
  } catch (err) {
    console.error('Ошибка загрузки объявлений:', err.message)
    alert('Ошибка загрузки объявлений: ' + err.message)
  } finally {
    loading.value.ads = false
  }
}

async function fetchOrders() {
  try {
    loading.value.orders = true
    console.log('Fetching orders...')
    const data = await auth.api('/api/user/orders')
    console.log('Orders received:', data)
    orders.value = data || []
  } catch (err) {
    console.error('Ошибка загрузки заказов:', err.message)
    alert('Ошибка загрузки заказов: ' + err.message)
  } finally {
    loading.value.orders = false
  }
}

function editAdvertisement(ad) {
  editForm.value = {
    id: ad._id,
    title: ad.title,
    description: ad.description,
    price: ad.price,
    category: ad.category,
    images: ad.images ? [...ad.images] : (ad.image ? [ad.image] : [])
  }
  showEditModal.value = true
}

async function saveEdit() {
  try {
    editError.value = ''
    editLoading.value = true

    if (!editForm.value.title || !editForm.value.price || !editForm.value.category) {
      editError.value = 'Заполните обязательные поля'
      return
    }

    const body = {
      ...editForm.value,
      image: editForm.value.images && editForm.value.images.length ? editForm.value.images[0] : ''
    }

    await auth.api(`/api/advertisements/${editForm.value.id}`, {
      method: 'PUT',
      body
    })

    showEditModal.value = false
    await fetchAdvertisements()
  } catch (err) {
    editError.value = err.message || 'Ошибка при сохранении'
  } finally {
    editLoading.value = false
  }
}

async function deleteAdvertisement(id) {
  if (!confirm('Вы уверены что хотите удалить объявление?')) return

  try {
    await auth.api(`/api/advertisements/${id}`, {
      method: 'DELETE'
    })
    await fetchAdvertisements()
  } catch (err) {
    alert('Ошибка: ' + err.message)
  }
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0)
}

function logout() {
  auth.logout()
  router.push('/')
}

async function fetchConversations() {
  try {
    loading.value.messages = true
    const data = await auth.api('/api/conversations')
    conversations.value = data || []
  } catch (err) {
    console.error('Ошибка загрузки диалогов:', err.message)
  } finally {
    loading.value.messages = false
  }
}

function openConversation(conv) {
  chatAdId.value = conv.adId
  chatOtherUserId.value = conv.otherUserId
  chatOtherUserName.value = conv.otherUserName || 'Пользователь'
  isChatOpen.value = true
}

function closeChatModal() {
  isChatOpen.value = false
  // Обновить список диалогов после закрытия
  fetchConversations()
}
</script>
