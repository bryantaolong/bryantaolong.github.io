import { ref, reactive } from 'vue'
import { marked } from 'marked'

export interface Post {
  filename: string
  title: string
  date: string
  excerpt: string
  summary: string
  tags: string[]
  content: string
}

interface Frontmatter {
  [key: string]: string | string[] | undefined
  title?: string
  date?: string
  tags?: string[]
  summary?: string
  excerpt?: string
}

function stripMarkdownSyntax(text: string): string {
  if (!text) return ''
  text = text.replace(/^#{1,6}\s+/gm, '')
  text = text.replace(/\*\*(.*?)\*\*/g, '$1')
  text = text.replace(/\*(.*?)\*/g, '$1')
  text = text.replace(/__(.*?)__/g, '$1')
  text = text.replace(/_(.*?)_/g, '$1')
  text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
  text = text.replace(/!\[([^\]]*)\]\([^\)]+\)/g, '$1')
  text = text.replace(/`([^`]+)`/g, '$1')
  text = text.replace(/^\s*>\s?/gm, '')
  text = text.replace(/^\s*[\-*+]\s+/gm, '')
  text = text.replace(/^\s*\d+\.\s+/gm, '')
  text = text.replace(/^\s*[-*_]{3,}\s*$/gm, '')
  text = text.replace(/\s+/g, ' ')
  return text.trim()
}

function parseTags(tagsValue: string | string[] | undefined): string[] {
  if (!tagsValue) return []
  if (Array.isArray(tagsValue)) {
    return tagsValue.map(tag => tag.trim()).filter(Boolean)
  }
  if (typeof tagsValue === 'string') {
    return tagsValue.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
  }
  return []
}

function parseFrontmatter(markdown: string): ParsedMarkdown {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n?---\s*\n([\s\S]*)/
  const match = frontmatterRegex.exec(markdown)

  if (match) {
    const frontmatterText = match[1]
    const content = match[2] || ''
    const frontmatter: Frontmatter = {}
    const lines = frontmatterText.split('\n')
    let currentKey: string | null = null

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      const indent = line.length - line.trimStart().length
      if (indent > 0 && currentKey) {
        const existing = frontmatter[currentKey]
        if (Array.isArray(existing)) {
          const item = trimmed.replace(/^[-*+]\s+/, '').trim()
          if (item) existing.push(item)
        } else if (typeof existing === 'string') {
          frontmatter[currentKey] = existing + '\n' + trimmed
        }
        continue
      }

      const colonIndex = line.indexOf(':')
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim()
        let value = line.substring(colonIndex + 1).trim()

        if (trimmed.startsWith('- ') || trimmed.startsWith('-')) {
          const item = trimmed.replace(/^[-*+]\s+/, '').trim()
          frontmatter[key] = item ? [item] : []
          currentKey = key
        } else if (value) {
          frontmatter[key] = value
          currentKey = key
        } else {
          frontmatter[key] = ''
          currentKey = key
        }
      }
    }
    if (frontmatter.tags) {
      frontmatter.tags = parseTags(frontmatter.tags)
    }
    return { frontmatter, content: content.trim() }
  }

  return { frontmatter: {}, content: markdown.trim() }
}

interface ParsedMarkdown {
  frontmatter: Frontmatter
  content: string
}

const postModules = import.meta.glob<string>('../../posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true
})

const posts = ref<Post[]>([])
const postsCache = reactive<Record<string, Post>>({})

async function loadPosts() {
  const fetchedPosts: Post[] = []

  for (const path in postModules) {
    try {
      const filename = path.split('/').pop() || ''
      const markdown = postModules[path]

      if (!markdown || typeof markdown !== 'string') continue
      if (markdown.trim().startsWith('<!DOCTYPE html>') || markdown.trim().startsWith('<html')) continue

      const parsed = parseFrontmatter(markdown)

      const post: Post = {
        filename,
        title: (parsed.frontmatter.title as string) || filename.replace('.md', ''),
        date: (parsed.frontmatter.date as string) || new Date().toISOString().split('T')[0],
        excerpt: (parsed.frontmatter.summary as string) || (parsed.frontmatter.excerpt as string) || stripMarkdownSyntax(parsed.content).substring(0, 100) + '...',
        summary: (parsed.frontmatter.summary as string) || '',
        tags: Array.isArray(parsed.frontmatter.tags) ? parsed.frontmatter.tags : [],
        content: marked.parse(parsed.content) as string
      }

      postsCache[post.filename] = post
      fetchedPosts.push(post)
    } catch (err) {
      console.error(`Error processing post at ${path}:`, err)
    }
  }

  fetchedPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  posts.value = fetchedPosts
}

async function getPost(filename: string): Promise<Post | null> {
  if (postsCache[filename]) {
    return postsCache[filename]
  }

  const path = `../../posts/${filename}`
  if (postModules[path]) {
    try {
      const markdown = postModules[path]
      if (markdown.trim().startsWith('<!DOCTYPE html>') || markdown.trim().startsWith('<html')) {
        throw new Error('Post not found (server returned HTML)')
      }

      const parsed = parseFrontmatter(markdown)

      const post: Post = {
        filename,
        title: (parsed.frontmatter.title as string) || filename.replace('.md', ''),
        date: (parsed.frontmatter.date as string) || new Date().toISOString().split('T')[0],
        excerpt: (parsed.frontmatter.summary as string) || (parsed.frontmatter.excerpt as string) || stripMarkdownSyntax(parsed.content).substring(0, 100) + '...',
        summary: (parsed.frontmatter.summary as string) || '',
        tags: Array.isArray(parsed.frontmatter.tags) ? parsed.frontmatter.tags : [],
        content: marked.parse(parsed.content) as string
      }

      postsCache[filename] = post
      return post
    } catch (error) {
      console.error(`Error fetching post ${filename}:`, error)
      return null
    }
  }

  return null
}

export function usePosts() {
  return {
    posts,
    loadPosts,
    getPost
  }
}
