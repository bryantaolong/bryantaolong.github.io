import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy, type ReactNode } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'

const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Blog = lazy(() => import('./pages/Blog'))
const Post = lazy(() => import('./pages/Post'))

function Loading(): ReactNode {
  return <div className="container"><main className="main"><div className="loading">Loading...</div></main></div>
}

export default function App() {
  return (
    <div id="app">
      <Header />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/post/:filename?" element={<Post />} />
        </Routes>
      </Suspense>
      <Footer />
    </div>
  )
}
