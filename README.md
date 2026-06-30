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

```plaintext
├── index.html                # Entry HTML file
├── package.json              # Project dependencies and scripts
├── vite.config.ts            # Vite configuration
├── posts/                    # Blog posts (Markdown files)
└── src/
    ├── main.tsx              # Application entry point
    ├── App.tsx               # Root component
    ├── contexts/
    │   └── PostsContext.tsx # Posts loading logic
    ├── components/
    │   ├── Header.tsx       # Navigation header
    │   └── Footer.tsx       # Page footer
    ├── pages/
    │   ├── Home.tsx         # Home page with recent blogs
    │   ├── Blog.tsx         # Blog listing page
    │   ├── Post.tsx         # Individual blog post page
    │   └── About.tsx        # About page
    └── styles/
        └── simple.css        # Global styles
```

## Features

- **React 18** - JavaScript UI library
- **React Router** - Client-side routing
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
   tags: 技术, 思考
   description: Brief description of the post
   ---
   ```
3. Write your content in Markdown
4. The post will automatically appear on the home page

## License

MIT
