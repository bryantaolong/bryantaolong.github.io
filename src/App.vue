<template>
  <div id="app">
    <Header />
    <main class="main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <Footer />
    <button class="proverbs-fab" @click="showProverbs = true" aria-label="Programming Proverbs" title="编程格言">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    </button>
    <ProverbsModal v-model="showProverbs" />
  </div>
</template>

<script setup lang="ts">
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import ProverbsModal from './components/ProverbsModal.vue'
import { ref } from 'vue'

const showProverbs = ref(false)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.proverbs-fab {
  position: fixed;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 900;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--border-color, #e5e5e5);
  background-color: var(--bg-color, #ffffff);
  color: var(--secondary-text-color, #666);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  opacity: 0.7;
}

.proverbs-fab:hover {
  opacity: 1;
  color: var(--link-color, #2563eb);
  border-color: var(--link-color, #2563eb);
  transform: translateY(-50%) translateY(-2px);
}

@media (max-width: 768px) {
  .proverbs-fab {
    right: 12px;
    width: 36px;
    height: 36px;
  }
}
</style>
