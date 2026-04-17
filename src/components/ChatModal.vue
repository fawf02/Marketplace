<template>
  <transition name="chat-fade">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center" @keydown.esc="$emit('close')">
      <!-- Overlay -->
      <div class="absolute inset-0 bg-black/50" @click="$emit('close')"></div>

      <!-- Chat Window -->
      <div class="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl flex flex-col max-h-[80vh] z-10">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 rounded-t-2xl bg-gradient-to-r from-blue-600 to-blue-700">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 class="text-white font-semibold text-lg leading-tight">{{ sellerName }}</h3>
              <p class="text-blue-200 text-xs">Продавец</p>
            </div>
          </div>
          <button
            @click="$emit('close')"
            class="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Chat Body -->
        <div ref="chatBody" class="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 min-h-[300px]">
          <!-- Loading -->
          <div v-if="loadingMessages" class="flex items-center justify-center h-full">
            <div class="text-center">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
              <p class="text-slate-500 text-sm">Загрузка сообщений...</p>
            </div>
          </div>

          <!-- Empty state -->
          <div v-else-if="messages.length === 0" class="flex items-center justify-center h-full">
            <div class="text-center">
              <svg class="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p class="text-slate-500 text-sm font-medium">Нет сообщений</p>
              <p class="text-slate-400 text-xs mt-1">Напишите продавцу первым!</p>
            </div>
          </div>

          <!-- Messages -->
          <template v-else>
            <div
              v-for="msg in messages"
              :key="msg._id"
              class="flex"
              :class="isMyMessage(msg) ? 'justify-end' : 'justify-start'"
            >
              <div
                class="max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm"
                :class="isMyMessage(msg)
                  ? 'bg-blue-600 text-white rounded-br-md'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-bl-md'"
              >
                <p>{{ msg.text }}</p>
                <p
                  class="text-[10px] mt-1"
                  :class="isMyMessage(msg) ? 'text-blue-200' : 'text-slate-400'"
                >
                  {{ formatTime(msg.createdAt) }}
                </p>
              </div>
            </div>
          </template>
        </div>

        <!-- Footer / Input -->
        <div class="border-t border-slate-200 p-4 bg-white rounded-b-2xl">
          <form @submit.prevent="sendMessage" class="flex gap-2">
            <input
              v-model="newMessage"
              type="text"
              placeholder="Напишите сообщение..."
              class="flex-1 px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              :disabled="sending"
            />
            <button
              type="submit"
              :disabled="!newMessage.trim() || sending"
              class="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span class="hidden sm:inline">Отправить</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  sellerId: { type: String, default: '' },
  sellerName: { type: String, default: 'Продавец' },
  adId: { type: String, default: '' }
})

const emit = defineEmits(['close'])

const auth = useAuthStore()
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const messages = ref([])
const newMessage = ref('')
const loadingMessages = ref(false)
const sending = ref(false)
const chatBody = ref(null)

// Определяем, наше ли сообщение
function isMyMessage(msg) {
  const userId = auth.user?.id || auth.user?._id
  if (!userId) return false
  return msg.senderId === userId || msg.senderId?.toString() === userId
}

// Форматирование времени
function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

// Автопрокрутка к последнему сообщению
async function scrollToBottom() {
  await nextTick()
  if (chatBody.value) {
    chatBody.value.scrollTop = chatBody.value.scrollHeight
  }
}

// Загрузка истории сообщений при открытии
async function fetchMessages() {
  if (!props.adId || !props.sellerId) return
  loadingMessages.value = true
  try {
    const res = await fetch(
      `${API_BASE}/api/messages/${props.adId}?sellerId=${props.sellerId}`,
      {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      }
    )
    if (!res.ok) throw new Error(await res.text())
    messages.value = await res.json()
    scrollToBottom()
  } catch (err) {
    console.error('Ошибка загрузки сообщений:', err)
    alert('Не удалось загрузить сообщения. Попробуйте позже.')
  } finally {
    loadingMessages.value = false
  }
}

// Отправка нового сообщения
async function sendMessage() {
  const text = newMessage.value.trim()
  if (!text) return

  sending.value = true
  try {
    const res = await fetch(`${API_BASE}/api/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      },
      body: JSON.stringify({
        adId: props.adId,
        sellerId: props.sellerId,
        text
      })
    })
    if (!res.ok) throw new Error(await res.text())
    const saved = await res.json()
    messages.value.push(saved)
    newMessage.value = ''
    scrollToBottom()
  } catch (err) {
    console.error('Ошибка отправки сообщения:', err)
    alert('Не удалось отправить сообщение. Попробуйте позже.')
  } finally {
    sending.value = false
  }
}

// Watch isOpen — загрузить историю при открытии
watch(() => props.isOpen, (open) => {
  if (open) {
    messages.value = []
    newMessage.value = ''
    fetchMessages()
  }
})
</script>

<style scoped>
.chat-fade-enter-active,
.chat-fade-leave-active {
  transition: opacity 0.2s ease;
}
.chat-fade-enter-from,
.chat-fade-leave-to {
  opacity: 0;
}
</style>
