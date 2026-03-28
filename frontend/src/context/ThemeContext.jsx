// src/context/ThemeContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext({})

export function ThemeProvider({ children }) {
  const [isDark, setIsDark]       = useState(() => localStorage.getItem('mh-theme') === 'dark')
  const [isTelugu, setIsTelugu]   = useState(() => localStorage.getItem('mh-lang') === 'telugu')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    localStorage.setItem('mh-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  useEffect(() => {
    localStorage.setItem('mh-lang', isTelugu ? 'telugu' : 'english')
  }, [isTelugu])

  const toggleTheme  = () => setIsDark(d => !d)
  const toggleLang   = () => setIsTelugu(t => !t)

  // Telugu translations
  const t = (en, te) => isTelugu && te ? te : en

  return (
    <ThemeContext.Provider value={{ isDark, isTelugu, toggleTheme, toggleLang, t }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)