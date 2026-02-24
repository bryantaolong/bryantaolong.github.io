import { ref } from 'vue'
import { marked } from 'marked'

// Function to strip basic markdown syntax from text
function stripMarkdownSyntax(text) {
  if (!text) return '';
  
  // Remove markdown headings
  text = text.replace(/^#{1,6}\s+/gm, '');
  
  // Remove bold and italic markers
  text = text.replace(/\*\*(.*?)\*\*/g, '$1'); // **bold**
  text = text.replace(/\*(.*?)\*/g, '$1');     // *italic*
  text = text.replace(/__(.*?)__/g, '$1');     // __bold__
  text = text.replace(/_(.*?)_/g, '$1');       // _italic_
  
  // Remove links [text](url)
  text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
  
  // Remove images ![alt](url)
  text = text.replace(/!\[([^\]]*)\]\([^\)]+\)/g, '$1');
  
  // Remove inline code
  text = text.replace(/`([^`]+)`/g, '$1');
  
  // Remove blockquotes
  text = text.replace(/^\s*>\s?/gm, '');
  
  // Remove list markers
  text = text.replace(/^\s*[\-*+]\s+/gm, '');
  text = text.replace(/^\s*\d+\.\s+/gm, '');
  
  // Remove horizontal rules
  text = text.replace(/^\s*[-*_]{3,}\s*$/gm, '');
  
  // Clean up multiple spaces
  text = text.replace(/\s+/g, ' ');
  
  return text.trim();
}

// Reference to all posts
const posts = ref([])

/**
 * Extract frontmatter and content from markdown text
 */
function parseFrontmatter(markdown) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n?---\s*\n([\s\S]*)/;
  const match = frontmatterRegex.exec(markdown);
  
  if (match) {
    const frontmatterText = match[1];
    const content = match[2] || '';
    
    // Parse frontmatter (simple key: value format)
    const frontmatter = {};
    const lines = frontmatterText.split('\n');
    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim().replace(/^['"]|['"]$/g, '');
        frontmatter[key] = value;
      }
    }
    
    return {
      frontmatter,
      content: content.trim()
    };
  }
  
  // If no frontmatter, treat entire content as body
  return {
    frontmatter: {},
    content: markdown.trim()
  };
}

// Use Vite's import.meta.glob to dynamically import all markdown files
// This will be processed at build time and hot-reloaded during development
// Using relative path from src/composables to posts directory
const postModules = import.meta.glob('../../posts/*.md', { 
  query: '?raw', 
  import: 'default',
  eager: true 
})

/**
 * Load all posts from the posts directory
 */
async function loadPosts() {
  try {
    // Clear existing posts to ensure fresh start
    posts.value = [];
    
    const fetchedPosts = [];
    
    // Process each markdown file
    for (const path in postModules) {
      try {
        // Get filename from path (e.g., '/posts/文章.md' -> '文章.md')
        const filename = path.split('/').pop();
        
        // Get the raw markdown content
        const markdown = postModules[path];
        
        if (!markdown || typeof markdown !== 'string') {
          console.warn(`Empty or invalid content for ${filename}`);
          continue;
        }
        
        // Skip if content starts with HTML doctype (shouldn't happen with glob)
        if (markdown.trim().startsWith('<!DOCTYPE html>') || markdown.trim().startsWith('<html')) {
          console.log(`File ${filename} returned HTML instead of markdown, skipping`);
          continue;
        }
        
        const parsed = parseFrontmatter(markdown);
        
        const post = {
          filename,
          title: parsed.frontmatter.title || filename.replace('.md', ''),
          date: parsed.frontmatter.date || new Date().toISOString().split('T')[0],
          excerpt: parsed.frontmatter.excerpt || stripMarkdownSyntax(markdown).substring(0, 100) + '...',
          content: marked.parse(parsed.content)
        };
        
        fetchedPosts.push(post);
      } catch (err) {
        console.error(`Error processing post at ${path}:`, err);
      }
    }
    
    // Sort posts by date (newest first)
    fetchedPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    posts.value = fetchedPosts;
    return posts.value;
  } catch (error) {
    console.error('Error loading posts:', error);
    return [];
  }
}

/**
 * Get a specific post by filename
 */
async function getPost(filename) {
  // Check if post is already loaded in cache
  const cachedPost = posts.value.find(post => post.filename === filename);
  if (cachedPost) {
    return cachedPost;
  }
  
  // If not found in cache, try to find it in the modules
  const path = `../../posts/${filename}`;
  if (postModules[path]) {
    try {
      const markdown = postModules[path];
      
      // Check if content is HTML instead of markdown (shouldn't happen with glob)
      if (markdown.trim().startsWith('<!DOCTYPE html>') || markdown.trim().startsWith('<html')) {
        throw new Error('Post not found (server returned HTML)');
      }
      
      const parsed = parseFrontmatter(markdown);
      
      const post = {
        filename,
        title: parsed.frontmatter.title || filename.replace('.md', ''),
        date: parsed.frontmatter.date || new Date().toISOString().split('T')[0],
        excerpt: parsed.frontmatter.excerpt || stripMarkdownSyntax(markdown).substring(0, 100) + '...',
        content: marked.parse(parsed.content)
      };
      
      // Add to posts if not already there
      const existingIndex = posts.value.findIndex(p => p.filename === filename);
      if (existingIndex === -1) {
        posts.value.push(post);
      } else {
        posts.value[existingIndex] = post;
      }
      
      return post;
    } catch (error) {
      console.error(`Error fetching post ${filename}:`, error);
      return null;
    }
  }
  
  return null;
}

export function usePosts() {
  return {
    posts,
    loadPosts,
    getPost
  }
}
