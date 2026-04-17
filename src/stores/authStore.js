import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'auth'
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(null)
  const isAuthenticated = ref(false)

  // Init from localStorage
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      user.value = parsed.user || null
      isAuthenticated.value = !!parsed.isAuthenticated
      token.value = parsed.token || null
    }
  } catch (e) {
    console.warn('Не удалось прочитать auth из localStorage', e)
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: user.value, isAuthenticated: isAuthenticated.value, token: token.value }))
    } catch (e) {
      console.warn('Не удалось сохранить auth в localStorage', e)
    }
  }

  // Передача токена в cartStore (используется динамический импорт)
  function syncTokenToCart() {
    import('./cartStore.js').then(module => {
      const cart = module.useCartStore()
      cart.setToken(token.value)
    })
  }

  async function api(path, opts = {}) {
    const headers = { ...(opts.headers || {}) }
    if (token.value) {
      headers['Authorization'] = 'Bearer ' + token.value
      console.log('[API] Sending request to', path, 'with token:', token.value.slice(-10))
    } else {
      console.log('[API] No token, sending request to', path)
    }
    let body = opts.body
    if (body && typeof body === 'object' && !(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
      body = JSON.stringify(body)
    }

    const res = await fetch(API_BASE + path, { method: opts.method || 'GET', headers, body })
    let data = {}
    try { data = await res.json() } catch (e) { /* ignore */ }
    if (!res.ok) {
      console.error('[API] Error response:', res.status, data)
      throw new Error(data.error || 'Ошибка сервера')
    }
    console.log('[API] Response from', path, ':', data)
    return data
  }

  async function fetchMe() {
    if (!token.value) return
    try {
      const data = await api('/api/auth/me')
      user.value = data
      isAuthenticated.value = true
      persist()
      syncTokenToCart()
    } catch (e) {
      // token invalid or expired
      user.value = null
      token.value = null
      isAuthenticated.value = false
      persist()
      syncTokenToCart()
    }
  }

  async function login(email, password) {
    if (!email || !password) throw new Error('Заполните все поля')
    const data = await api('/api/auth/login', { method: 'POST', body: { email, password } })
    token.value = data.token
    user.value = data.user
    isAuthenticated.value = true
    persist()
    syncTokenToCart()
  }

  async function register(name, email, password) {
    if (!name || !email || !password) throw new Error('Заполните все поля')
    if (password.length < 6) throw new Error('Пароль должен быть не менее 6 символов')
    const data = await api('/api/auth/register', { method: 'POST', body: { name, email, password } })
    token.value = data.token
    user.value = data.user
    isAuthenticated.value = true
    persist()
    syncTokenToCart()
  }

  // If we have a token from storage, try to refresh user
  if (token.value) {
    // don't block init
    fetchMe()
  }

  // Modal controls for auth UI
  const showLoginModal = ref(false)
  const showRegisterModal = ref(false)
  const showProfileModal = ref(false)
  const showSellModal = ref(false)

  function openLogin() { showLoginModal.value = true }
  function closeLogin() { showLoginModal.value = false }
  function openRegister() { showRegisterModal.value = true }
  function closeRegister() { showRegisterModal.value = false }
  function openProfile() { showProfileModal.value = true }
  function closeProfile() { showProfileModal.value = false }
  function openSell() { showSellModal.value = true }
  function closeSell() { showSellModal.value = false }

  function logout() {
    user.value = null
    token.value = null
    isAuthenticated.value = false
    persist()
    syncTokenToCart()
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    register,
    fetchMe,
    api,
    // modals
    showLoginModal,
    showRegisterModal,
    showProfileModal,
    showSellModal,
    openLogin,
    closeLogin,
    openRegister,
    closeRegister,
    openProfile,
    closeProfile,
    openSell,
    closeSell
  }
})
