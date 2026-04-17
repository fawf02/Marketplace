import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const showCart = ref(false)
  const loading = ref(false)
  const token = ref(null)

  // Установка токена (вызывается из authStore)
  function setToken(newToken) {
    token.value = newToken
    if (newToken) {
      loadCart()
    } else {
      items.value = []
    }
  }

  // Загрузка корзины с сервера
  async function loadCart() {
    if (!token.value) return

    loading.value = true
    try {
      const res = await fetch(`${API_BASE}/api/cart`, {
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      })
      if (!res.ok) {
        const ctype = res.headers.get('content-type') || ''
        const body = ctype.includes('application/json') ? JSON.stringify(await res.json()) : await res.text()
        throw new Error(`HTTP ${res.status} ${res.statusText}: ${body}`)
      }
      const data = await res.json()
      items.value = data.items || []
    } catch (err) {
      console.error('Ошибка загрузки корзины:', err)
    } finally {
      loading.value = false
    }
  }

  // Добавление товара в корзину
  async function addToCart(product) {
    if (!token.value) {
      console.error('Нет токена для добавления в корзину')
      return
    }

    try {
      const res = await fetch(`${API_BASE}/api/cart/items`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.value}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: product._id,
          qty: 1,
          title: product.title || product.name,
          price: product.price,
          image: (product.images && product.images[0]) || product.image,
          description: product.description || product.desc
        })
      })
      if (!res.ok) {
        const ctype = res.headers.get('content-type') || ''
        const body = ctype.includes('application/json') ? JSON.stringify(await res.json()) : await res.text()
        throw new Error(`HTTP ${res.status} ${res.statusText}: ${body}`)
      }
      const data = await res.json()
      items.value = data.cart.items || []
    } catch (err) {
      console.error('Ошибка добавления товара в корзину:', err)
      throw err
    }
  }

  // Удаление товара из корзины
  async function removeFromCart(productId) {
    if (!token.value) return

    try {
      const res = await fetch(`${API_BASE}/api/cart/items/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      })
      if (!res.ok) {
        const ctype = res.headers.get('content-type') || ''
        const body = ctype.includes('application/json') ? JSON.stringify(await res.json()) : await res.text()
        throw new Error(`HTTP ${res.status} ${res.statusText}: ${body}`)
      }
      const data = await res.json()
      items.value = data.cart.items || []
    } catch (err) {
      console.error('Ошибка удаления товара из корзины:', err)
      throw err
    }
  }

  // Изменение количества товара
  async function updateQuantity(productId, qty) {
    if (!token.value) return

    if (qty <= 0) {
      await removeFromCart(productId)
      return
    }

    try {
      const res = await fetch(`${API_BASE}/api/cart/items/${productId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token.value}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ qty })
      })
      if (!res.ok) {
        const ctype = res.headers.get('content-type') || ''
        const body = ctype.includes('application/json') ? JSON.stringify(await res.json()) : await res.text()
        throw new Error(`HTTP ${res.status} ${res.statusText}: ${body}`)
      }
      const data = await res.json()
      items.value = data.cart.items || []
    } catch (err) {
      console.error('Ошибка обновления количества товара:', err)
      throw err
    }
  }

  // Очистка корзины
  async function clearCart() {
    if (!token.value) return

    try {
      const res = await fetch(`${API_BASE}/api/cart`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      })
      if (!res.ok) {
        const ctype = res.headers.get('content-type') || ''
        const body = ctype.includes('application/json') ? JSON.stringify(await res.json()) : await res.text()
        throw new Error(`HTTP ${res.status} ${res.statusText}: ${body}`)
      }
      items.value = []
    } catch (err) {
      console.error('Ошибка очистки корзины:', err)
      throw err
    }
  }

  // Открытие/закрытие корзины
  function openCart() {
    showCart.value = true
  }

  function closeCart() {
    showCart.value = false
  }

  // Вычисляемое значение для количества товаров
  const cartCount = computed(() => {
    return items.value.reduce((sum, item) => sum + (item.qty || 1), 0)
  })

  // Вычисляемое значение для итоговой суммы
  const totalPrice = computed(() => {
    return items.value.reduce((sum, item) => {
      const price = Number(item.price) || 0
      const qty = Number(item.qty) || 1
      return sum + price * qty
    }, 0)
  })

  return {
    items,
    showCart,
    loading,
    cartCount,
    totalPrice,
    setToken,
    loadCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    openCart,
    closeCart
  }
})
