<template>
  <div class="container">
    <!-- Main content area -->
    <main class="main">
      <!-- Simple introduction -->
      <section class="introduction">
        <h1>Bryan Tao Long</h1>
        <p class="bio">Developer, Reader</p>
        <p class="description">
          Welcome to my personal space where I share thoughts, and projects.
        </p>
      </section>

      <!-- Blog posts in chronological order -->
      <section class="blog">
        <h2>Recent Blogs</h2>
        <div class="blog-list" v-if="posts.length > 0">
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
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePosts } from '../composables/usePosts'

const router = useRouter()
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