<template>
  <div class="container">
    <main class="main">
      <div class="post" v-if="post">
        <header class="post-header">
          <h1 class="post-title">{{ post.title || filename }}</h1>
          <div class="post-meta">
            <span>{{ formatDate(post.date) }}</span>
          </div>
        </header>
        <article class="post-content" v-html="post.content"></article>
      </div>
      <div v-else-if="error" class="error">
        {{ error }}
      </div>
      <div v-else class="loading">
        Loading post...
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePosts } from '../composables/usePosts'

const route = useRoute()
const { getPost } = usePosts()

const post = ref(null)
const error = ref(null)
const filename = ref(route.params.filename)

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toISOString().split('T')[0]
}

onMounted(async () => {
  try {
    post.value = await getPost(filename.value)
    if (!post.value) {
      error.value = `Post "${filename.value}" not found.`
    }
  } catch (err) {
    error.value = `Error loading post: ${err.message}`
  }
})
</script>

<style scoped>
/* Styles are imported globally from simple.css */
</style>