<template>
  <div class="w-full min-h-screen bg-white">
    <div class="w-full px-6 sm:px-8 lg:px-16 xl:px-20 py-12">
      <!-- Header Section -->
      <div class="mb-16">
        <h1 class="text-4xl sm:text-5xl font-bold text-slate-950 mb-4">Каталог товаров</h1>
        <p class="text-lg text-slate-600 max-w-2xl">
          Найдите всё необходимое для успешной учёбы. От учебников до электроники — всё в одном месте.
        </p>
      </div>

      <!-- Main Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Sidebar Filters -->
        <aside class="lg:col-span-1">
          <div class="sticky top-32 space-y-6">
            <div class="card-hover bg-white rounded-2xl p-6 shadow-md border border-slate-200 hover:shadow-lg transition-all duration-300">
              <div class="flex items-center space-x-3 mb-6">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <h2 class="text-xl font-bold text-slate-950">Фильтры</h2>
              </div>

              <!-- Category Filter -->
              <div class="mb-8 pb-8 border-b border-slate-200">
                <h3 class="font-semibold text-slate-950 mb-4">Категория</h3>
                <div class="space-y-3">
                  <label v-for="cat in categories" :key="cat.value" class="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      :value="cat.value"
                      v-model="selectedCategories"
                      @change="applyFilters"
                      class="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                    />
                    <span class="ml-3 text-slate-700 font-medium group-hover:text-blue-600 transition-colors">{{ cat.label }}</span>
                  </label>
                </div>
              </div>

              <!-- Price Filter -->
              <div class="mb-8 pb-8 border-b border-slate-200">
                <h3 class="font-semibold text-slate-950 mb-4">Цена</h3>
                <div class="space-y-3">
                  <label v-for="(range, idx) in priceRanges" :key="idx" class="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      :value="idx"
                      v-model="selectedPriceRanges"
                      @change="applyFilters"
                      class="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                    />
                    <span class="ml-3 text-slate-700 font-medium group-hover:text-emerald-600 transition-colors">{{ range.label }}</span>
                  </label>
                </div>
              </div>

              <!-- Rating Filter -->
              <div>
                <h3 class="font-semibold text-slate-950 mb-4">Рейтинг</h3>
                <div class="space-y-3">
                  <label v-for="(rating, idx) in ratings" :key="idx" class="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      :value="idx"
                      v-model="selectedRatings"
                      @change="applyFilters"
                      class="w-5 h-5 text-violet-600 rounded border-slate-300 focus:ring-2 focus:ring-violet-500/20 cursor-pointer"
                    />
                    <span class="ml-3 text-slate-700 font-medium group-hover:text-violet-600 transition-colors">{{ rating.label }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- Products Section -->
        <main class="lg:col-span-3">
          <!-- Toolbar -->
          <div class="mb-8 bg-white rounded-2xl p-6 shadow-md border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div class="flex items-center space-x-2">
              <span class="text-slate-600 font-medium">Товаров найдено:</span>
              <span class="text-2xl font-bold text-blue-600">{{ products.length }}</span>
            </div>
            <div class="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
              <div v-if="error" class="text-red-600 font-medium mr-4">Ошибка: {{ error }}</div>
              <select
                v-model="sortBy"
                @change="applyFilters"
                class="w-full sm:w-auto px-4 py-2.5 border border-slate-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 bg-white text-slate-700 font-medium cursor-pointer hover:border-slate-400 transition-all">
                <option value="">Сортировка</option>
                <option value="price_asc">Сначала дешевле</option>
                <option value="price_desc">Сначала дороже</option>
                <option value="newest">Новые товары</option>
                <option value="rating_desc">Лучший рейтинг</option>
              </select>
            </div>
          </div>

          <!-- Products: loading / empty / grid -->
          <div v-if="loading" class="text-center py-10">Загрузка товаров...</div>
          <div v-else-if="error" class="text-red-600 py-10">{{ error }}</div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            <article
              v-for="product in products"
              :key="product._id || product.id"
              class="bg-white rounded-2xl p-6 shadow-md border border-slate-200 hover:shadow-lg transition-all"
            >
              <div class="mb-4 h-48 flex items-center justify-center bg-slate-50 rounded-lg overflow-hidden">
                <img v-if="(product.images && product.images.length) || product.image" :src="(product.images && product.images[0]) || product.image" alt="" class="object-contain h-full" />
                <div v-else class="text-slate-400">Нет изображения</div>
              </div>

              <h3 class="text-lg font-semibold text-slate-950 mb-2 truncate">{{ product.title || product.name }}</h3>
              <p class="text-slate-600 mb-4 line-clamp-2">{{ product.description || product.desc }}</p>

              <div class="flex flex-col gap-2">
                <div class="flex items-center justify-between">
                  <div class="text-xl font-bold text-emerald-600">{{ formatPrice(product.price) }}</div>
                  <button @click="viewDetails(product)" class="text-blue-600 font-semibold hover:underline">Детали</button>
                </div>
                <div class="flex gap-2 mt-2">
                  <button @click="addToCart(product)" class="flex-1 py-2 bg-slate-200 rounded hover:bg-slate-300">
                    В корзину
                  </button>
                  <button @click="buyNow(product)" class="flex-1 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">
                    Купить
                  </button>
                </div>
              </div>
            </article>
          </div>
        </main>
      </div>
    </div>

    <!-- Details Modal -->
    <div v-if="showDetails" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div @click.self="closeDetails" class="absolute inset-0"></div>
      <div class="bg-white rounded-lg p-6 w-full max-w-3xl shadow-lg max-h-[90vh] overflow-y-auto z-10">
        <button @click="closeDetails" class="absolute top-4 right-4 text-slate-600 hover:text-slate-900 text-2xl leading-none">&times;</button>
        <div v-if="selectedProduct">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div class="w-full h-64 bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center">
                <img v-if="selectedImage" :src="selectedImage" class="object-contain h-full" />
                <div v-else class="text-slate-400">Нет изображения</div>
              </div>
              <div class="flex gap-2 mt-2 overflow-x-auto">
                <img
                  v-for="(img, idx) in (selectedProduct.images && selectedProduct.images.length ? selectedProduct.images : [selectedProduct.image])"
                  :key="idx"
                  :src="img"
                  class="w-16 h-16 object-cover cursor-pointer border rounded"
                  @click="selectedImage = img"
                />
              </div>
            </div>
            <div>
              <h2 class="text-2xl font-bold text-slate-950 mb-4">{{ selectedProduct.title || selectedProduct.name }}</h2>
              <p class="text-slate-600 mb-4">{{ selectedProduct.description || selectedProduct.desc }}</p>
              <div class="text-2xl font-bold text-emerald-600 mb-6">{{ formatPrice(selectedProduct.price) }}</div>
              <div class="mb-4">
                <div class="flex items-center gap-2">
                  <span class="font-semibold text-slate-700">Адрес:</span>
                  <span v-if="!isEditingAddress">{{ selectedProduct.address || 'Не указан' }}</span>
                  <input v-else v-model="editedAddress" class="border rounded px-2 py-1 text-black" />
                  <button v-if="auth.isAuthenticated && !isEditingAddress" @click="startEditAddress" class="ml-2 text-blue-600 hover:underline text-sm">Редактировать</button>
                  <button v-if="isEditingAddress" @click="saveAddress" class="ml-2 text-emerald-600 hover:underline text-sm">Сохранить</button>
                  <button v-if="isEditingAddress" @click="cancelEditAddress" class="ml-2 text-gray-500 hover:underline text-sm">Отмена</button>
                </div>
              </div>
              <div class="flex gap-3">
                <button @click="addToCart(selectedProduct)" class="px-6 py-2 bg-slate-200 rounded hover:bg-slate-300">
                  В корзину
                </button>
                <button @click="buyNow(selectedProduct)" class="px-6 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">
                  Купить
                </button>
              </div>
              <button
                @click="openChat(selectedProduct)"
                class="mt-3 w-full py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Связаться с продавцом
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Modal -->
    <div v-if="showPayment" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div class="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg">
        <h3 class="text-2xl font-bold mb-4">Оформление покупки</h3>
        <p class="mb-2">Товар: <strong>{{ paymentProduct?.title || paymentProduct?.name }}</strong></p>
        <p class="mb-4">Цена: <strong>{{ formatPrice(paymentProduct?.price) }}</strong></p>
        <form @submit.prevent="submitOrder">
          <div class="mb-3">
            <label class="block text-sm font-semibold text-gray-700 mb-1">Номер карты</label>
            <input
              v-model="payment.cardNumber"
              type="text"
              maxlength="19"
              placeholder="1234 5678 9012 3456"
              class="w-full p-3 border rounded text-black placeholder-gray-400"
              required
            />
          </div>
          <div class="flex gap-4">
            <div class="mb-3 flex-1">
              <label class="block text-sm font-semibold text-gray-700 mb-1">MM/YY</label>
              <input
                v-model="payment.expiry"
                type="text"
                maxlength="5"
                placeholder="MM/YY"
                class="w-full p-3 border rounded text-black placeholder-gray-400"
                required
              />
            </div>
            <div class="mb-3 flex-1">
              <label class="block text-sm font-semibold text-gray-700 mb-1">CVV</label>
              <input
                v-model="payment.cvv"
                type="text"
                maxlength="4"
                placeholder="123"
                class="w-full p-3 border rounded text-black placeholder-gray-400"
                required
              />
            </div>
          </div>
          <div class="flex justify-end gap-4 mt-6">
            <button type="button" @click="closePayment" class="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300">
              Отмена
            </button>
            <button type="submit" class="px-6 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">
              Оплатить {{ formatPrice(paymentProduct?.price) }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Chat Modal -->
    <ChatModal
      :isOpen="isChatOpen"
      :sellerId="chatSellerId"
      :sellerName="chatSellerName"
      :adId="chatAdId"
      @close="isChatOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import ChatModal from '@/components/ChatModal.vue'

const auth = useAuthStore()
const cart = useCartStore()

const products = ref([])
const loading = ref(false)
const error = ref(null)

// Details modal
const showDetails = ref(false)
const selectedProduct = ref(null)
const selectedImage = ref('')

// Payment modal
const showPayment = ref(false)
const paymentProduct = ref(null)
const payment = ref({ cardNumber: '', expiry: '', cvv: '' })

// Chat modal
const isChatOpen = ref(false)
const chatSellerId = ref('')
const chatSellerName = ref('')
const chatAdId = ref('')

// Фильтры и сортировка
const selectedCategories = ref([])
const selectedPriceRanges = ref([])
const selectedRatings = ref([])
const sortBy = ref('')

const categories = ref([
  { value: 'electronics', label: 'Электроника' },
  { value: 'clothing', label: 'Одежда' },
  { value: 'furniture', label: 'Мебель' },
  { value: 'sports', label: 'Спорт' },
  { value: 'books', label: 'Книги' },
  { value: 'toys', label: 'Игрушки' },
  { value: 'other', label: 'Прочее' }
])
const priceRanges = ref([
  { label: '0 - 50,000 ₸', min: 0, max: 50000 },
  { label: '50,000 - 200,000 ₸', min: 50000, max: 200000 },
  { label: '200,000 - 500,000 ₸', min: 200000, max: 500000 },
  { label: '500,000+ ₸', min: 500000, max: Infinity }
])
const ratings = ref([
  { label: '⭐⭐⭐⭐⭐', min: 5 },
  { label: '⭐⭐⭐⭐ и выше', min: 4 },
  { label: '⭐⭐⭐ и выше', min: 3 }
])

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function formatPrice(val) {
  if (val == null) return '—'
  try {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'KZT' }).format(Number(val))
  } catch {
    return String(val)
  }
}

async function fetchProducts() {
  loading.value = true
  error.value = null
  try {
    const queryParams = new URLSearchParams()

    // --- НОВОЕ: Просим сервер вернуть больше товаров (например, 1000) ---
    // Если ваш бэкенд поддерживает значение '0' для выдачи всех товаров, напишите '0'
    queryParams.append('limit', '1000') 
    // -------------------------------------------------------------------

    if (selectedCategories.value.length > 0) {
      queryParams.append('category', selectedCategories.value.join(','))
    }
    if (selectedPriceRanges.value.length > 0) {
      const ranges = selectedPriceRanges.value.map(idx => priceRanges.value[idx])
      const minPrice = Math.min(...ranges.map(r => r.min))
      const maxPrice = Math.min(...ranges.map(r => r.max))
      if (minPrice !== Infinity) queryParams.append('minPrice', minPrice)
      if (maxPrice !== Infinity) queryParams.append('maxPrice', maxPrice)
    }
    if (selectedRatings.value.length > 0) {
      const minRating = Math.min(...selectedRatings.value.map(idx => ratings.value[idx].min))
      queryParams.append('rating', minRating)
    }
    if (sortBy.value) {
      queryParams.append('sort', sortBy.value)
    }

    const url = `${API_BASE}/api/products${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(await res.text())
    products.value = (await res.json()) || []
  } catch (err) {
    console.error('Ошибка загрузки товаров:', err)
    error.value = err.message || String(err)
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  fetchProducts()
}

function viewDetails(prod) {
  selectedProduct.value = prod
  selectedImage.value = (prod.images && prod.images.length ? prod.images[0] : prod.image) || ''
  showDetails.value = true
}

function closeDetails() {
  showDetails.value = false
  selectedProduct.value = null
  selectedImage.value = ''
}

async function addToCart(product) {
  try {
    if (!auth.isAuthenticated) {
      alert('Пожалуйста, войдите в личный кабинет')
      auth.openLogin()
      return
    }
    await cart.addToCart(product)
    alert('Товар добавлен в корзину')
  } catch (err) {
    console.error('Ошибка добавления в корзину:', err)
    alert('Ошибка добавления товара в корзину: ' + (err.message || 'Неизвестная ошибка'))
  }
}

function buyNow(product) {
  if (!auth.user) {
    alert('Войдите в аккаунт')
    return
  }
  paymentProduct.value = product
  showPayment.value = true
}

function openChat(product) {
  if (!auth.isAuthenticated) {
    alert('Пожалуйста, войдите в личный кабинет')
    auth.openLogin()
    return
  }
  chatAdId.value = product._id?.toString() || product.id
  chatSellerId.value = product.sellerId?.toString() || ''
  chatSellerName.value = product.sellerName || 'Продавец'
  isChatOpen.value = true
}

function closePayment() {
  showPayment.value = false
  paymentProduct.value = null
  payment.value = { cardNumber: '', expiry: '', cvv: '' }
}

async function submitOrder() {
  if (!paymentProduct.value) return
  const order = {
    customer: {
      name: auth.user.name,
      email: auth.user.email,
      address: 'Не указано'
    },
    items: [{ productId: paymentProduct.value._id, qty: 1, price: paymentProduct.value.price }],
    total: paymentProduct.value.price,
    payment: { ...payment.value }
  }
  try {
    const res = await fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      },
      body: JSON.stringify(order)
    })
    if (!res.ok) throw new Error(await res.text())
    alert('Заказ успешно оформлен')
    closePayment()
  } catch (e) {
    console.error(e)
    alert('Ошибка оформления заказа')
  }
}

onMounted(fetchProducts)
</script>

<style scoped>
label {
  transition: all 0.2s ease;
}
</style>
