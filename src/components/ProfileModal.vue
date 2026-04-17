<template>
  <div v-if="auth.showProfileModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div class="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-xl font-bold">Профиль</h3>
          <div class="text-sm text-slate-500">{{ auth.user?.email }}</div>
        </div>
        <button @click="logout" class="px-3 py-1 bg-red-500 text-white rounded">Выйти</button>
      </div>

      <div>
        <h4 class="font-semibold mb-2">История заказов</h4>
        <div v-if="orders.length === 0" class="text-black">Заказы отсутствуют</div>
        <ul v-else class="space-y-3">
          <li
            v-for="o in orders"
            :key="o._id"
            class="p-3 border rounded text-black"
          >
            <div class="font-semibold">
              Заказ от {{ new Date(o.createdAt).toLocaleString() }}
            </div>

            <div class="text-sm text-slate-600">
              Сумма: {{ formatPrice(o.total) }}
            </div>

            <ul class="mt-2 ml-4 list-disc text-sm">
              <li v-for="it in o.items" :key="it.productId">
                {{ it.qty }} × {{ formatPrice(it.price) }}
              </li>
            </ul>
          </li>
        </ul>

      </div>

      <button @click="auth.closeProfile" class="mt-4 text-sm text-slate-500">Закрыть</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
const orders = ref([])
const loading = ref(false)

async function loadOrders() {
  if (!auth.user?.email) return

  loading.value = true
  try {
    const res = await fetch(`/api/orders?email=${auth.user.email}`)
    const data = await res.json()
    orders.value = data
  } catch (e) {
    console.error('Ошибка загрузки заказов', e)
  } finally {
    loading.value = false
  }
}

// Загружать КАЖДЫЙ раз при открытии профиля
watch(
  () => auth.showProfileModal,
  (isOpen) => {
    if (isOpen) loadOrders()
  }
)

function logout() {
  auth.logout()
  auth.closeProfile()
}

function formatPrice(v) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'KZT'
  }).format(v)
}
</script>
