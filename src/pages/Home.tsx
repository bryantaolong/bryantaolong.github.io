import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { usePosts } from '../contexts/PostsContext'
import type { Post } from '../contexts/PostsContext'

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Invalid Date'
  return date.toISOString().split('T')[0]
}

export default function Home() {
  const { posts, loadPosts } = usePosts()

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  const recentPosts = useMemo<Post[]>(() => {
    if (posts.length === 0) return []

    const uniqueDates = [...new Set(posts.map(post => {
      const date = new Date(post.date)
      date.setHours(0, 0, 0, 0)
      return date.getTime()
    }))].sort((a, b) => b - a)

    const recentThreeDates = uniqueDates.slice(0, 3)

    return posts.filter(post => {
      const postDate = new Date(post.date)
      postDate.setHours(0, 0, 0, 0)
      return recentThreeDates.includes(postDate.getTime())
    })
  }, [posts])

  return (
    <div className="container">
      <main className="main">
        <section className="introduction">
          <h1>Bryan Tao Long</h1>
          <p className="bio">Developer, Reader</p>
          <p className="description">
            Welcome to my personal space where I share thoughts, and projects.
          </p>
        </section>

        <section className="blog">
          <h2>Recent Blogs</h2>
          {recentPosts.length > 0 ? (
            <div className="blog-list">
              {recentPosts.map(post => (
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
            <div className="loading">No recent posts in the last 3 days.</div>
          ) : (
            <div className="loading">Loading blog posts...</div>
          )}
        </section>
      </main>
    </div>
  )
}
