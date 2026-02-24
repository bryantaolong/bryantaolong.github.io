# Bryan Tao Long - Personal Website

My personal website and blog built with Vue 3 and Vite.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
├── index.html              # Entry HTML file
├── package.json            # Project dependencies and scripts
├── vite.config.js          # Vite configuration
├── posts/                  # Blog posts (Markdown files)
│   ├── 《Educated》读后感.md
│   ├── 《时势》阅读笔记.md
│   ├── 关于飞书与Obsidian.md
│   ├── HTTP 的不同连接方式.md
│   └── Unlocking the Codex harness：how we built the App Server（ChatGPT Blog）.md
└── src/
    ├── main.js             # Application entry point
    ├── App.vue             # Root component
    ├── router/
    │   └── index.js        # Vue Router configuration
    ├── composables/
    │   └── usePosts.js     # Posts loading logic
    ├── components/
    │   ├── Header.vue      # Navigation header
    │   └── Footer.vue      # Page footer
    ├── views/
    │   ├── Home.vue        # Home page with recent blogs
    │   ├── Blog.vue        # Blog listing page
    │   ├── Post.vue        # Individual blog post page
    │   └── About.vue       # About page
    └── styles/
        └── simple.css      # Global styles
```

## Features

- **Vue 3** - Progressive JavaScript framework
- **Vue Router** - Client-side routing
- **Vite** - Fast development server and build tool
- **Marked** - Markdown parser for blog posts
- **Responsive Design** - Mobile-friendly layout

## Adding Blog Posts

1. Create a new `.md` file in the `posts/` directory
2. Add frontmatter (optional):
   ```yaml
   ---
   title: Post Title
   date: 2026-02-24
   excerpt: Brief description of the post
   ---
   ```
3. Write your content in Markdown
4. The post will automatically appear on the home page

## License

MIT
