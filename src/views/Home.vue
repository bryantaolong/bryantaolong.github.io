<template>
  <div class="container">
    <main class="main">
      <section class="introduction">
        <h1>Bryan Tao Long</h1>
        <p class="bio">Developer, Reader</p>
        <p class="description">
          Welcome to my personal space where I share thoughts, and projects.
        </p>
      </section>

      <section class="blog">
        <h2>Recent Blogs</h2>
        <div v-if="recentPosts.length > 0" class="blog-list">
          <article v-for="post in recentPosts" :key="post.filename" class="blog-item">
            <div class="blog-meta">
              <span class="blog-date">{{ formatDate(post.date) }}</span>
              <div v-if="post.tags && post.tags.length > 0" class="blog-tags">
                <span v-for="tag in post.tags" :key="tag" class="blog-tag">{{ tag }}</span>
              </div>
            </div>
            <h3 class="blog-title">
              <router-link :to="`/post/${post.filename}`">{{ post.title || post.filename }}</router-link>
            </h3>
            <p class="blog-excerpt">{{ post.excerpt || 'No excerpt available' }}</p>
          </article>
        </div>
        <div v-else-if="posts.length > 0" class="loading">No recent posts in the last 3 days.</div>
        <div v-else class="loading">Loading blog posts...</div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { usePosts, type Post } from '../composables/usePosts'

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Invalid Date'
  return date.toISOString().split('T')[0]
}

const { posts, loadPosts } = usePosts()

onMounted(() => {
  loadPosts()
})

const recentPosts = computed<Post[]>(() => {
  if (posts.value.length === 0) return []

  const uniqueDates = [...new Set(posts.value.map(post => {
    const date = new Date(post.date)
    date.setHours(0, 0, 0, 0)
    return date.getTime()
  }))].sort((a, b) => b - a)

  const recentThreeDates = uniqueDates.slice(0, 3)

  return posts.value.filter(post => {
    const postDate = new Date(post.date)
    postDate.setHours(0, 0, 0, 0)
    return recentThreeDates.includes(postDate.getTime())
  })
})
</script>
