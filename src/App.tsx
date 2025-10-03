"use client"

import { useState, useEffect } from "react"
import LoginModal from "./components/login-modal"
import Dashboard from "./components/dashboard"
import ThemeToggle from "./components/theme-toggle"

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated
    const auth = sessionStorage.getItem("trireme_authenticated")
    if (auth === "true") {
      setIsAuthenticated(true)
    }

    // Check for saved theme preference
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark")
    }
  }, [])

  useEffect(() => {
    // Apply theme to document
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    localStorage.setItem("theme", isDarkMode ? "dark" : "light")
  }, [isDarkMode])

  const handleLogin = () => {
    setIsAuthenticated(true)
    sessionStorage.setItem("trireme_authenticated", "true")
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem("trireme_authenticated")
  }

  if (!isAuthenticated) {
    return <LoginModal onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-primary">Trireme Factor Lens</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Analytics Dashboard</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle isDarkMode={isDarkMode} onToggle={() => setIsDarkMode(!isDarkMode)} />
            <button
              onClick={handleLogout}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <Dashboard />
      </main>
    </div>
  )
}
