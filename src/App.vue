<script setup>
import NavBar from './components/NavBar.vue'
import LoginModal from '@/components/LoginModal.vue'
import RegisterModal from '@/components/RegisterModal.vue'
import ProfileModal from '@/components/ProfileModal.vue'
import CartModal from '@/components/CartModal.vue'
import SellModal from '@/components/SellModal.vue'
</script>

<template>
  <div style="width: 100vw; height: 100vh; margin: 0; padding: 0; display: flex; flex-direction: column; overflow: hidden;" class="bg-white">
    <NavBar />

    <!-- Modals -->
    <LoginModal />
    <RegisterModal />
    <ProfileModal />
    <CartModal />
    <SellModal />

    <main style="flex: 1; width: 100vw; height: 100%; overflow-y: auto; overflow-x: hidden;">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
/* App styles */
</style>
