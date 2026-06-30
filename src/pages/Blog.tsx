import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { usePosts } from '../contexts/PostsContext'
import type { Post } from '../contexts/PostsContext'

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toISOString().split('T')[0]
}

type SearchType = 'title' | 'tags' | 'date'

export default function Blog() {
  const { posts, loadPosts } = usePosts()
  const [searchType, setSearchType] = useState<SearchType>('title')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  const searchPlaceholder = useMemo(() => {
    switch (searchType) {
      case 'title':
        return 'Search by title...'
      case 'tags':
        return 'Search by tag (e.g., Vue, Obsidian)...'
      case 'date':
        return 'Search by date (e.g., 2024, 2024-03, 2024-03-20)...'
      default:
        return 'Search...'
    }
  }, [searchType])

  const filteredPosts = useMemo<Post[]>(() => {
    if (!searchQuery.trim()) {
      return posts
    }

    const query = searchQuery.toLowerCase().trim()

    return posts.filter(post => {
      switch (searchType) {
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
  }, [posts, searchQuery, searchType])

  const clearSearch = () => {
    setSearchQuery('')
  }

  return (
    <div className="container">
      <main className="main">
        <div className="blog-list">
          <div className="blog-header">
            <h1>Blog Posts</h1>
            <p>Collection of my thoughts and experiences</p>
          </div>

          <div className="search-wrapper">
            <div className="search-bar">
              <select
                value={searchType}
                onChange={e => setSearchType(e.target.value as SearchType)}
                className="search-select"
                title="Search by"
              >
                <option value="title">Title</option>
                <option value="tags">Tags</option>
                <option value="date">Date</option>
              </select>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                type="text"
                placeholder={searchPlaceholder}
                className="search-input"
              />
              {searchQuery && (
                <button onClick={clearSearch} className="clear-btn" title="Clear">&times;</button>
              )}
            </div>
            {filteredPosts.length !== posts.length && (
              <div className="search-hint">{filteredPosts.length} results</div>
            )}
          </div>

          {filteredPosts.length > 0 ? (
            <div className="blog-posts">
              {filteredPosts.map(post => (
                <article className="blog-item" key={post.filename}>
                  <div className="blog-meta">
                    <span className="blog-date">{formatDate(post.date)}</span>
                    {post.tags && post.tags.length > 0 && (
                      <div className="blog-tags">
                        {post.tags.map(tag => (
                          <span key={tag} className="blog-tag">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <h3 className="blog-title">
                    <Link to={`/post/${post.filename}`}>{post.title || post.filename}</Link>
                  </h3>
                  <p className="blog-excerpt">{post.excerpt || 'No excerpt available'}</p>
                </article>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="no-results">
              No posts found matching "{searchQuery}"
            </div>
          ) : (
            <div className="loading">Loading blog posts...</div>
          )}
        </div>
      </main>
    </div>
  )
}
