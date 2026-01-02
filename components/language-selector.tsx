"use client"

import { useState, useRef, useEffect } from "react"
import { useLanguage, type Language } from "@/lib/i18n"
import { motion, AnimatePresence } from "framer-motion"

const languages: { code: Language; label: string; flag: string }[] = [
  { code: "pt", label: "PT", flag: "🇧🇷" },
  { code: "en", label: "EN", flag: "🇺🇸" },
  { code: "es", label: "ES", flag: "🇪🇸" },
]

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const currentLang = languages.find((l) => l.code === language) || languages[0]
  const otherLangs = languages.filter((l) => l.code !== language)
  const leftLang = otherLangs[0]
  const rightLang = otherLangs[1]

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (code: Language) => {
    setLanguage(code)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="flex flex-row items-center justify-center gap-2">
      {/* Left language option */}
      <AnimatePresence>
        {isOpen && leftLang && (
          <motion.button
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={() => handleSelect(leftLang.code)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-transparent border border-white/10 hover:border-white/30 hover:bg-white/5 backdrop-blur-sm transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-lg">{leftLang.flag}</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Center - Current language trigger */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full bg-transparent border backdrop-blur-sm transition-all duration-300 ${
          isOpen ? "border-primary/50 bg-primary/10" : "border-white/10 hover:border-white/20"
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="text-lg">{currentLang.flag}</span>
        <motion.svg
          className="w-3 h-3 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </motion.svg>
      </motion.button>

      {/* Right language option */}
      <AnimatePresence>
        {isOpen && rightLang && (
          <motion.button
            initial={{ opacity: 0, x: -20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={() => handleSelect(rightLang.code)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-transparent border border-white/10 hover:border-white/30 hover:bg-white/5 backdrop-blur-sm transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-lg">{rightLang.flag}</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
