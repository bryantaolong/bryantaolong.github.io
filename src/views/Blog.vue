<template>
  <div class="container">
    <main class="main">
      <div class="blog-list">
        <div class="blog-header">
          <h1>Blog Posts</h1>
          <p>Collection of my thoughts and experiences</p>
        </div>

        <!-- Search Filter -->
        <div class="search-wrapper">
          <div class="search-bar">
            <select v-model="searchType" class="search-select" title="Search by">
              <option value="title">Title</option>
              <option value="tags">Tags</option>
              <option value="date">Date</option>
            </select>
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="searchPlaceholder"
              class="search-input"
            />
            <button v-if="searchQuery" @click="clearSearch" class="clear-btn" title="Clear">×</button>
          </div>
          <div v-if="filteredPosts.length !== posts.length" class="search-hint">
            {{ filteredPosts.length }} results
          </div>
        </div>

        <div class="blog-posts" v-if="filteredPosts.length > 0">
          <article class="blog-item" v-for="post in filteredPosts" :key="post.filename">
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
        <div v-else class="loading">
          Loading blog posts...
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePosts } from '../composables/usePosts'

const { posts, loadPosts } = usePosts()

// Search state
const searchType = ref('title')
const searchQuery = ref('')

// Dynamic placeholder based on search type
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

// Filter posts based on search type and query
const filteredPosts = computed(() => {
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
        const postDate = formatDate(post.date)
        return postDate.includes(query)

      default:
        return true
    }
  })
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toISOString().split('T')[0]
}

const clearSearch = () => {
  searchQuery.value = ''
}

onMounted(() => {
  loadPosts()
})
</script>

<style scoped>
/* Search Bar - Centered & Compact */
.search-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0.75rem 0 1rem;
}

/* Reduce blog-header margin */
.blog-header {
  margin-bottom: 0.5rem;
}

.search-bar {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  width: 100%;
  max-width: 600px;
  padding: 0.5rem 0.75rem;
  background-color: var(--accent-bg, #f8f9fa);
  border-radius: 0.5rem;
}

.search-select {
  padding: 0.375rem 0.5rem;
  border: 1px solid var(--border, #ddd);
  border-radius: 0.375rem;
  background-color: var(--bg, white);
  color: var(--text-secondary, #666);
  font-size: 0.875rem;
  cursor: pointer;
}

.search-select:focus {
  outline: none;
  border-color: var(--accent, #007bff);
}

.search-input {
  flex: 1;
  padding: 0.375rem 0.625rem;
  border: 1px solid var(--border, #ddd);
  border-radius: 0.375rem;
  background-color: var(--bg, white);
  color: var(--text, #333);
  font-size: 0.875rem;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent, #007bff);
}

.search-input::placeholder {
  color: var(--text-muted, #999);
}

.clear-btn {
  padding: 0.25rem 0.5rem;
  background: none;
  border: none;
  color: var(--text-muted, #999);
  font-size: 1.125rem;
  line-height: 1;
  cursor: pointer;
  transition: color 0.2s;
}

.clear-btn:hover {
  color: var(--text, #333);
}

.search-hint {
  font-size: 0.75rem;
  color: var(--text-muted, #999);
  margin-top: 0.375rem;
}

/* Blog Item Enhancements */
.blog-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.blog-date {
  color: var(--text-secondary, #666);
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
  color: var(--text-secondary, #666);
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.no-results {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-secondary, #666);
  font-style: italic;
}

/* Responsive */
@media (max-width: 640px) {
  .search-wrapper {
    margin-top: 0.25rem;
  }
  
  .search-bar {
    max-width: 100%;
  }
}
</style>
