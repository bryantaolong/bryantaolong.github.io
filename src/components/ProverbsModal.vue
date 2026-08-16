<template>
  <div class="proverbs-modal" v-if="visible" @click.self="close">
    <div class="proverbs-modal-content">
      <div class="proverbs-modal-header">
        <h3>Programming Proverbs</h3>
        <button class="proverbs-close" @click="close" aria-label="Close">&times;</button>
      </div>
      <div class="proverbs-tabs">
        <button
          class="proverbs-tab"
          :class="{ active: activeTab === 'go' }"
          @click="activeTab = 'go'"
        >
          Go Proverbs
        </button>
        <button
          class="proverbs-tab"
          :class="{ active: activeTab === 'python' }"
          @click="activeTab = 'python'"
        >
          The Zen of Python
        </button>
      </div>
      <div class="proverbs-body">
        <ul v-if="activeTab === 'go'" class="proverbs-list">
          <li>Don't communicate by sharing memory, share memory by communicating.</li>
          <li>Concurrency is not parallelism.</li>
          <li>Channels orchestrate; mutexes serialize.</li>
          <li>The bigger the interface, the weaker the abstraction.</li>
          <li>Make the zero value useful.</li>
          <li>interface{} says nothing.</li>
          <li>Gofmt's style is no one's favorite, yet gofmt is everyone's favorite.</li>
          <li>A little copying is better than a little dependency.</li>
          <li>Syscall must always be guarded with build tags.</li>
          <li>Cgo must always be guarded with build tags.</li>
          <li>Ggo is not Go.</li>
          <li>With the unsafe package there are no guarantees.</li>
          <li>Clear is better than clever.</li>
          <li>Reflection is never clear.</li>
          <li>Errors are values.</li>
          <li>Don't just check errors, handle them gracefully.</li>
          <li>Design the architecture, name the components, document the details.</li>
          <li>Documentation is for users.</li>
          <li>Don't panic.</li>
        </ul>
        <ul v-else class="proverbs-list">
          <li>Beautiful is better than ugly.</li>
          <li>Explicit is better than implicit.</li>
          <li>Simple is better than complex.</li>
          <li>Complex is better than complicated.</li>
          <li>Flat is better than nested.</li>
          <li>Sparse is better than dense.</li>
          <li>Readability counts.</li>
          <li>Special cases aren't special enough to break the rules.</li>
          <li>Although practicality beats purity.</li>
          <li>Errors should never pass silently.</li>
          <li>Unless explicitly silenced.</li>
          <li>In the face of ambiguity, refuse the temptation to guess.</li>
          <li>There should be one-- and preferably only one --obvious way to do it.</li>
          <li>Although that way may not be obvious at first unless you're Dutch.</li>
          <li>Now is better than never.</li>
          <li>Although never is often better than *right* now.</li>
          <li>If the implementation is hard to explain, it's a bad idea.</li>
          <li>If the implementation is easy to explain, it may be a good idea.</li>
          <li>Namespaces are one honking great idea -- let's do more of those!</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const visible = ref(props.modelValue)
const activeTab = ref('go')

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) activeTab.value = 'go'
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

function close() {
  visible.value = false
}
</script>

<style scoped>
.proverbs-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  padding: var(--spacing-md, 1rem);
}

.proverbs-modal-content {
  background-color: var(--bg-color, #ffffff);
  color: var(--text-color, #333333);
  border-radius: 0.75rem;
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.proverbs-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md, 1rem) var(--spacing-lg, 1.5rem);
  border-bottom: 1px solid var(--border-color, #e5e5e5);
}

.proverbs-modal-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.proverbs-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  color: var(--secondary-text-color, #666);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.proverbs-close:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--text-color, #333);
}

.proverbs-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color, #e5e5e5);
}

.proverbs-tab {
  flex: 1;
  padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--secondary-text-color, #666);
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.proverbs-tab:hover {
  color: var(--link-color, #2563eb);
}

.proverbs-tab.active {
  color: var(--link-color, #2563eb);
  border-bottom-color: var(--link-color, #2563eb);
}

.proverbs-body {
  padding: var(--spacing-md, 1rem) var(--spacing-lg, 1.5rem);
  overflow-y: auto;
  flex: 1;
}

.proverbs-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 0.5rem);
}

.proverbs-list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color, #e5e5e5);
  font-size: 0.9375rem;
  line-height: 1.6;
}

.proverbs-list li:last-child {
  border-bottom: none;
}

.dark .proverbs-close:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.dark .proverbs-close:hover {
  color: var(--text-color, #e5e5e5);
}
</style>
