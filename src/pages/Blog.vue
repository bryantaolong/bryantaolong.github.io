<template>
  <div class="container">
    <main class="main">
      <div class="blog-list">
        <div class="blog-header">
          <h1>Blog Posts</h1>
          <p>Collection of my thoughts and experiences</p>
        </div>

        <div class="search-wrapper">
          <div class="search-bar">
            <a-select v-model="searchType" style="width: 120px">
              <a-option value="title">Title</a-option>
              <a-option value="tags">Tags</a-option>
              <a-option value="date">Date</a-option>
            </a-select>
            <a-input
              v-model="searchQuery"
              :placeholder="searchPlaceholder"
              style="flex: 1"
            />
            <a-button v-if="searchQuery" @click="clearSearch" type="text">&times;</a-button>
          </div>
          <div v-if="filteredPosts.length !== posts.length" class="search-hint">{{ filteredPosts.length }} results</div>
        </div>

        <div v-if="filteredPosts.length > 0" class="blog-posts">
          <article v-for="post in filteredPosts" :key="post.filename" class="blog-item">
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
        <div v-else-if="posts.length > 0" class="no-results">
          No posts found matching "{{ searchQuery }}"
        </div>
        <div v-else class="loading">Loading blog posts...</div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePosts, type Post } from '../composables/usePosts'

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Invalid Date'
  return date.toISOString().split('T')[0]
}

type SearchType = 'title' | 'tags' | 'date'

const { posts, loadPosts } = usePosts()

onMounted(() => {
  loadPosts()
})

const searchType = ref<SearchType>('title')
const searchQuery = ref('')

const searchPlaceholder = computed(() => {
  switch (searchType.value) {
    case 'title':
      return 'Search by title...'
    case 'tags':
      return 'Search by tag (e.g., Vue, Obsidian)...'
    case 'date':
      return 'Search by date (e.g., 2024, 2024-03, 2024-03-20)...'
    default:
      return 'Search...'
  }
})

const filteredPosts = computed<Post[]>(() => {
  if (!searchQuery.value.trim()) {
    return posts.value
  }

  const query = searchQuery.value.toLowerCase().trim()

  return posts.value.filter(post => {
    switch (searchType.value) {
      case 'title':
        return (post.title || post.filename).toLowerCase().includes(query)
      case 'tags':
        if (!post.tags || post.tags.length === 0) return false
        return post.tags.some(tag => tag.toLowerCase().includes(query))
      case 'date':
        return formatDate(post.date).includes(query)
      default:
        return true
    }
  })
})

const clearSearch = () => {
  searchQuery.value = ''
}
</script>
