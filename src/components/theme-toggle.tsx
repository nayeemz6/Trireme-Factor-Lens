"use client"

import { Moon, Sun } from "lucide-react"
import { Button } from "./ui/button"

interface ThemeToggleProps {
  isDarkMode: boolean
  onToggle: () => void
}

export default function ThemeToggle({ isDarkMode, onToggle }: ThemeToggleProps) {
  return (
    <Button variant="outline" size="icon" onClick={onToggle} aria-label="Toggle theme">
      {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  )
}
