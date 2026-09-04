import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage.tsx'
import AnalyzerPage from './pages/AnalyzerPage.tsx'
import AboutPage from './pages/AboutPage.tsx'
import FeaturesPage from './pages/FeaturesPage.tsx'
import './App.css'
import React from 'react'

// Simple global error boundary
class GlobalErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(error: unknown) { console.error('Global error boundary caught:', error) }
  render() { return this.state.hasError ? <div style={{ padding: 24 }}>Something went wrong. Please refresh.</div> : this.props.children }
}

function App() {
  return (
    <GlobalErrorBoundary>
      <Router>
        <div className="App">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/analyzer" element={<AnalyzerPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/features" element={<FeaturesPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </GlobalErrorBoundary>
  )
}

export default App 