import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { PostsProvider } from './contexts/PostsContext'
import { ThemeProvider } from './contexts/ThemeContext'
import './styles/simple.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <ThemeProvider>
        <PostsProvider>
          <App />
        </PostsProvider>
      </ThemeProvider>
    </HashRouter>
  </React.StrictMode>
)
