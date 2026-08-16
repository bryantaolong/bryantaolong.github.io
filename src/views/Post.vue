<template>
  <div class="container">
    <main class="main">
      <div v-if="post" class="post">
        <header class="post-header">
          <h1 class="post-title">{{ post.title || filename }}</h1>
          <div class="post-meta">
            <span>{{ formatDate(post.date) }}</span>
          </div>
          <div v-if="post.tags && post.tags.length > 0" class="post-tags">
            <span v-for="tag in post.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
          <div v-if="post.summary" class="post-summary">{{ post.summary }}</div>
        </header>
        <article class="post-content" v-html="post.content" />
      </div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else class="loading">Loading post...</div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePosts, type Post } from '../composables/usePosts'

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Invalid Date'
  return date.toISOString().split('T')[0]
}

const route = useRoute()
const { getPost } = usePosts()

const post = ref<Post | null>(null)
const error = ref<string | null>(null)

async function fetchPost(fn: string) {
  post.value = null
  error.value = null

  try {
    const result = await getPost(fn)
    if (result) {
      post.value = result
    } else {
      error.value = `Post "${fn}" not found.`
    }
  } catch (err) {
    error.value = `Error loading post: ${err instanceof Error ? err.message : String(err)}`
  }
}

onMounted(() => {
  const fn = route.params.filename as string | undefined
  if (fn) {
    fetchPost(fn)
  }
})

watch(() => route.params.filename, (newFilename) => {
  const fn = newFilename as string | undefined
  if (fn) {
    fetchPost(fn)
  }
})
</script>
