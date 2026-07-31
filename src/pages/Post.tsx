import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { usePosts, type Post } from '../contexts/PostsContext'

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Invalid Date'
  return date.toISOString().split('T')[0]
}

export default function PostPage() {
  const { filename } = useParams<{ filename: string }>()
  const { getPost } = usePosts()
  const [post, setPost] = useState<Post | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!filename) return
    const fn = filename
    let cancelled = false

    async function fetchPost() {
      try {
        const result = await getPost(fn)
        if (!cancelled) {
          if (result) {
            setPost(result)
          } else {
            setError(`Post "${fn}" not found.`)
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(`Error loading post: ${err instanceof Error ? err.message : String(err)}`)
        }
      }
    }

    fetchPost()
    return () => { cancelled = true }
  }, [filename, getPost])

  if (post) {
    return (
      <div className="container">
        <main className="main">
          <div className="post">
            <header className="post-header">
              <h1 className="post-title">{post.title || filename}</h1>
              <div className="post-meta">
                <span>{formatDate(post.date)}</span>
              </div>
              {post.tags && post.tags.length > 0 && (
                <div className="post-tags">
                  {post.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              )}
              {post.summary && (
                <div className="post-summary">{post.summary}</div>
              )}
            </header>
            <article className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <main className="main">
          <div className="error">{error}</div>
        </main>
      </div>
    )
  }

  return (
    <div className="container">
      <main className="main">
        <div className="loading">Loading post...</div>
      </main>
    </div>
  )
}
