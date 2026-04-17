<template>
  <transition name="slide">
    <div v-if="cart.showCart" class="fixed inset-0 z-50 flex">
      <!-- Overlay -->
      <div class="absolute inset-0 bg-black/30" @click="cart.closeCart()"></div>
      
      <!-- Modal from right -->
      <div class="absolute right-0 top-0 h-screen w-full max-w-md bg-white shadow-2xl flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 class="text-2xl font-bold text-slate-950">Корзина</h2>
          <button
            @click="cart.closeCart()"
            class="p-2 text-slate-500 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-all"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Items Container -->
        <div class="flex-1 overflow-y-auto p-6 space-y-4">
          <div v-if="cart.loading" class="h-full flex items-center justify-center">
            <div class="text-center">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p class="text-slate-600 font-semibold">Загрузка корзины...</p>
            </div>
          </div>

          <div v-else-if="cart.items.length === 0" class="h-full flex items-center justify-center">
            <div class="text-center">
              <svg class="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p class="text-slate-600 font-semibold">Корзина пуста</p>
              <p class="text-slate-500 text-sm mt-1">Добавьте товары из каталога</p>
            </div>
          </div>

          <div
            v-else
            v-for="item in cart.items"
            :key="item._id"
            class="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-blue-300 transition-all"
          >
            <!-- Product Image & Info -->
            <div class="flex gap-4 mb-3">
              <div class="w-20 h-20 flex-shrink-0 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  v-if="item.image"
                  :src="item.image"
                  :alt="item.title || item.name"
                  class="w-full h-full object-contain"
                />
                <svg v-else class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>

              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-slate-950 truncate text-sm">
                  {{ item.title || item.name }}
                </h3>
                <p class="text-emerald-600 font-bold text-lg">{{ formatPrice(item.price) }}</p>
                <p v-if="item.description" class="text-slate-500 text-xs mt-1 line-clamp-2">
                  {{ item.description || item.desc }}
                </p>
              </div>
            </div>

            <!-- Quantity Control -->
            <div class="flex items-center gap-2 bg-white rounded-lg p-2 border border-slate-200">
              <button
                @click="handleUpdateQuantity(item._id, item.qty - 1)"
                class="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded transition-all"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                </svg>
              </button>
              <span class="flex-1 text-center font-semibold text-slate-950">{{ item.qty }}</span>
              <button
                @click="handleUpdateQuantity(item._id, item.qty + 1)"
                class="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded transition-all"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button
                @click="handleRemoveFromCart(item._id)"
                class="ml-2 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded text-sm font-medium transition-all"
              >
                Удалить
              </button>
            </div>

            <!-- Total for item -->
            <div class="text-right mt-2 text-sm text-slate-600">
              Сумма: <span class="font-bold text-slate-950">{{ formatPrice(item.price * item.qty) }}</span>
            </div>
          </div>
        </div>

        <!-- Footer with Total & Buttons -->
        <div class="border-t border-slate-200 p-6 space-y-4 bg-slate-50">
          <div class="flex items-center justify-between">
            <span class="text-slate-700 font-semibold">Итого:</span>
            <span class="text-3xl font-bold text-emerald-600">{{ formatPrice(cart.totalPrice) }}</span>
          </div>

          <div class="space-y-3">
            <button
              @click="handleCheckout"
              :disabled="cart.items.length === 0"
              :class="cart.items.length === 0 ? 'opacity-50 cursor-not-allowed' : ''"
              class="w-full py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all"
            >
              Оформить заказ
            </button>
            <button
              @click="handleClearCart"
              :disabled="cart.items.length === 0"
              :class="cart.items.length === 0 ? 'opacity-50 cursor-not-allowed' : ''"
              class="w-full py-3 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-all"
            >
              Очистить корзину
            </button>
            <button
              @click="cart.closeCart()"
              class="w-full py-3 bg-slate-200 text-slate-950 font-semibold rounded-lg hover:bg-slate-300 transition-all"
            >
              Продолжить покупки
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

const cart = useCartStore()
const auth = useAuthStore()
const router = useRouter()

// Форматирование цены в тенге (KZT)
function formatPrice(val) {
  if (val == null) return '—'
  try {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'KZT' }).format(Number(val))
  } catch {
    return String(val)
  }
}

// Оформление заказа
async function handleCheckout() {
  if (!auth.user) {
    alert('Пожалуйста, войдите в личный кабинет')
    cart.closeCart()
    auth.openLogin()
    return
  }

  const order = {
    customer: {
      name: auth.user.name,
      email: auth.user.email,
      address: 'Не указано'
    },
    items: cart.items.map(item => ({
      productId: item._id,
      qty: item.qty,
      price: item.price
    })),
    total: cart.totalPrice
  }

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

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
    alert('Заказ успешно оформлен!')
    await cart.clearCart()
    cart.closeCart()
    router.push('/')
  } catch (e) {
    console.error(e)
    alert('Ошибка при оформлении заказа: ' + (e.message || 'Неизвестная ошибка'))
  }
}

// Обновление количества с обработкой ошибок
async function handleUpdateQuantity(productId, qty) {
  try {
    await cart.updateQuantity(productId, qty)
  } catch (err) {
    console.error('Ошибка обновления количества:', err)
    alert('Ошибка обновления количества товара')
  }
}

// Удаление товара с обработкой ошибок
async function handleRemoveFromCart(productId) {
  try {
    await cart.removeFromCart(productId)
  } catch (err) {
    console.error('Ошибка удаления товара:', err)
    alert('Ошибка удаления товара из корзины')
  }
}

// Очистка корзины с обработкой ошибок
async function handleClearCart() {
  if (!confirm('Вы уверены, что хотите очистить корзину?')) return
  try {
    await cart.clearCart()
  } catch (err) {
    console.error('Ошибка очистки корзины:', err)
    alert('Ошибка очистки корзины')
  }
}
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
}

.slide-enter-from ::-webkit-scrollbar {
  display: none;
}

.slide-leave-to {
  opacity: 0;
}

.slide-leave-to > div:last-child {
  transform: translateX(100%);
}

.slide-enter-active > div:last-child {
  animation: slideInRight 0.3s ease;
}

.slide-leave-active > div:last-child {
  animation: slideOutRight 0.3s ease;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes slideOutRight {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(100%);
  }
}
</style>
