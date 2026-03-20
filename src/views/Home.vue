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

      <!-- Blog posts from the last 3 days since last post -->
      <section class="blog">
        <h2>Recent Blogs</h2>
        <div class="blog-list" v-if="recentPosts.length > 0">
          <article class="blog-item" v-for="post in recentPosts" :key="post.filename">
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
        <div v-else-if="posts.length > 0" class="loading">
          No recent posts in the last 3 days.
        </div>
        <div v-else class="loading">
          Loading blog posts...
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePosts } from '../composables/usePosts'

const router = useRouter()
const { posts, loadPosts } = usePosts()

// Filter posts from the 3 most recent dates with posts
const recentPosts = computed(() => {
  if (posts.value.length === 0) return []
  
  // Get unique dates (normalized to midnight)
  const uniqueDates = [...new Set(posts.value.map(post => {
    const date = new Date(post.date)
    date.setHours(0, 0, 0, 0)
    return date.getTime()
  }))].sort((a, b) => b - a) // Sort descending
  
  // Take the 3 most recent dates
  const recentThreeDates = uniqueDates.slice(0, 3)
  
  // Filter posts that belong to these 3 dates
  return posts.value.filter(post => {
    const postDate = new Date(post.date)
    postDate.setHours(0, 0, 0, 0)
    return recentThreeDates.includes(postDate.getTime())
  })
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toISOString().split('T')[0]
}

onMounted(() => {
  loadPosts()
})
</script>

<style scoped>
/* Blog tags styling */
.blog-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.blog-date {
  color: var(--secondary-text-color, #666);
  font-size: 0.875rem;
}

.blog-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.blog-tag {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  background-color: var(--accent-bg, #f0f0f0);
  color: var(--secondary-text-color, #666);
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}
</style>
