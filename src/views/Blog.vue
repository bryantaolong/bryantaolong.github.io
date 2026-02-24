<template>
  <div class="container">
    <main class="main">
      <div class="blog-list">
        <div class="blog-header">
          <h1>Blog Posts</h1>
          <p>Collection of my thoughts and experiences</p>
        </div>
        
        <div class="blog-posts" v-if="posts.length > 0">
          <article class="blog-item" v-for="post in posts" :key="post.filename">
            <div class="blog-meta">
              <span class="blog-date">{{ formatDate(post.date) }}</span>
            </div>
            <h3 class="blog-title">
              <router-link :to="`/post/${post.filename}`">{{ post.title || post.filename }}</router-link>
            </h3>
            <p class="blog-excerpt">{{ post.excerpt || 'No excerpt available' }}</p>
          </article>
        </div>
        <div v-else class="loading">
          Loading blog posts...
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { usePosts } from '../composables/usePosts'

const { posts, loadPosts } = usePosts()

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toISOString().split('T')[0]
}

onMounted(() => {
  loadPosts()
})
</script>

<style scoped>
/* Styles are imported globally from simple.css */
</style>