<template>
  <div class="container">
    <main class="main">
      <div class="post" v-if="post">
        <header class="post-header">
          <h1 class="post-title">{{ post.title || filename }}</h1>
          <div class="post-meta">
            <span>{{ formatDate(post.date) }}</span>
          </div>
          <!-- Tags display -->
          <div v-if="post.tags && post.tags.length > 0" class="post-tags">
            <span v-for="tag in post.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
          <!-- Summary display -->
          <div v-if="post.summary" class="post-summary">
            {{ post.summary }}
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

.post-tags {
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background-color: var(--accent-bg, #f0f0f0);
  color: var(--accent-text, #333);
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.post-summary {
  margin-top: 1.5rem;
  padding: 1rem 1.25rem;
  background-color: var(--accent-bg, #f8f9fa);
  border-left: 4px solid var(--accent, #007bff);
  border-radius: 0 0.5rem 0.5rem 0;
  font-style: italic;
  color: var(--text-secondary, #666);
  line-height: 1.6;
}
</style>