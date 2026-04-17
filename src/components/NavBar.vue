<template>
  <nav class="w-full bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
    <div class="w-full px-6 sm:px-8 lg:px-16 xl:px-20">
      <div class="flex justify-between items-center h-20">
        <!-- Logo -->
        <router-link to="/" class="flex items-center space-x-3 hover:opacity-90 transition-opacity">
          <div class="w-15 h-15 rounded-xl flex items-center justify-center shadow-md">
            <span><img src="https://shakarim.university/logo.png"></span>
          </div>
          <span class="text-xl font-bold text-slate-950 hidden sm:block">StudentsHub</span>
        </router-link>

        <!-- Search Bar -->
        <div class="hidden lg:flex flex-1 mx-16">
          <div class="relative w-full max-w-sm">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Поиск товаров..."
              class="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 bg-white placeholder-slate-400 text-sm font-medium transition-all"
              @keyup.enter="handleSearch"
            />
            <svg
              class="absolute right-3 top-3 w-5 h-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <!-- Navigation Links & Icons -->
        <div class="flex items-center space-x-8">
          <!-- Desktop Navigation -->
          <div class="hidden lg:flex space-x-8">
            <router-link
              to="/"
              class="text-slate-700 hover:text-blue-600 font-semibold transition-colors py-2 border-b-2 border-transparent hover:border-blue-600 text-sm"
              :class="{ 'text-blue-600 border-b-2 border-emerald-500': isActive('/') }"
            >
              Главная
            </router-link>
            <router-link
              to="/catalog"
              class="text-slate-700 hover:text-blue-600 font-semibold transition-colors py-2 border-b-2 border-transparent hover:border-blue-600 text-sm"
              :class="{ 'text-blue-600 border-b-2 border-emerald-500': isActive('/catalog') }"
            >
              Каталог
            </router-link>
            <a href="#about" class="text-slate-700 hover:text-blue-600 font-semibold transition-colors py-2 border-b-2 border-transparent hover:border-blue-600 text-sm">
              О нас
            </a>
          </div>

          <!-- Cart Icon -->
          <button
            @click="cart.openCart()"
            class="relative p-2.5 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            aria-label="Корзина"
            title="Корзина"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <span v-if="cart.cartCount > 0" class="absolute top-0 right-0 w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {{ cart.cartCount }}
            </span>
          </button>

          <!-- Auth / Profile -->
          <div class="hidden sm:flex items-center space-x-4">
            <template v-if="auth.isAuthenticated">
              <router-link to="/profile" class="text-slate-700 hover:text-blue-600 font-semibold transition-colors">{{ auth.user?.name }}</router-link>
              <button @click="logout" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">Выйти</button>
            </template>
            <template v-else>
              <button @click="auth.openLogin" class="text-slate-700 hover:text-blue-600 font-semibold">Войти</button>
              <button @click="auth.openRegister" class="text-slate-700 hover:text-blue-600 font-semibold">Регистрация</button>
            </template>
          </div>

          <!-- Mobile Menu Button -->
          <button
            class="lg:hidden p-2.5 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            @click="isMenuOpen = !isMenuOpen"
            aria-label="Меню"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div
        v-if="isMenuOpen"
        class="lg:hidden pb-6 border-t border-slate-200 space-y-2 animate-in"
      >
        <router-link
          to="/"
          class="block px-4 py-3 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-semibold transition-all text-sm"
          @click="isMenuOpen = false"
        >
          Главная
        </router-link>
        <router-link
          to="/catalog"
          class="block px-4 py-3 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-semibold transition-all text-sm"
          @click="isMenuOpen = false"
        >
          Каталог
        </router-link>
        <a
          href="#about"
          class="block px-4 py-3 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-semibold transition-all text-sm"
        >
          О нас
        </a>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import { useRouter } from 'vue-router'

const searchQuery = ref('')
const isMenuOpen = ref(false)
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    console.log('Поиск:', searchQuery.value)
  }
}

function logout() {
  auth.logout()
  router.push('/')
}

const isActive = (path) => {
  return route.path === path
}
</script>

<style scoped>
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-in {
  animation: slideDown 0.3s ease-out;
}
</style>
