<template>
  <div v-if="auth.showRegisterModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div class="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
      <h3 class="text-xl font-bold mb-4">Регистрация</h3>
      <input v-model="name" placeholder="Имя" class="w-full mb-3 p-3 border rounded text-black placeholder-gray-400" />
      <input v-model="email" placeholder="Email" class="w-full mb-3 p-3 border rounded text-black placeholder-gray-400" />
      <input v-model="password" type="password" placeholder="Пароль" class="w-full mb-3 p-3 border rounded text-black placeholder-gray-400" />
      <p v-if="error" class="text-red-600 mb-3">{{ error }}</p>
      <div class="flex gap-3">
        <button @click="submit" :disabled="loading" :class="loading ? 'opacity-50 cursor-not-allowed' : ''" class="flex-1 py-2 bg-emerald-600 text-white rounded">{{ loading ? 'Подождите...' : 'Зарегистрироваться' }}</button>
        <button @click="switchToLogin" class="flex-1 py-2 bg-blue-600 text-white rounded">Войти</button>
      </div>
      <button @click="auth.closeRegister" class="mt-4 text-sm text-slate-500">Закрыть</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await auth.register(name.value.trim(), email.value.trim(), password.value)
    auth.closeRegister()
    auth.openProfile()
    name.value = ''
    email.value = ''
    password.value = ''
  } catch (e) {
    error.value = e.message || 'Ошибка'
  } finally {
    loading.value = false
  }
}

function switchToLogin() {
  auth.closeRegister()
  auth.openLogin()
}
</script>