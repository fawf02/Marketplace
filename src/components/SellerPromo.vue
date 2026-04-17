<template>
  <div @click="openSell" class="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 md:p-12 text-white text-center shadow-xl cursor-pointer hover:shadow-2xl transition-shadow duration-300">
    <h2 class="text-3xl md:text-4xl font-bold mb-4">Есть что продать?</h2>
    <p class="text-xl mb-6 text-orange-100">Размести объявление бесплатно и найди покупателя за минуты</p>
    <button 
      @click.stop="openSell"
      class="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
    >
      Создать объявление
    </button>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()

function openSell() {
  if (!auth.isAuthenticated) {
    auth.openLogin()
  } else {
    auth.openSell()
  }
}
</script>
