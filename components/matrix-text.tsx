"use client"

import { useState, useEffect, useCallback } from "react"
import { useLanguage } from "@/lib/i18n"

interface MatrixTextProps {
  children: string
  className?: string
  delay?: number // Delay in ms based on vertical position
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*!?<>[]{}=/\\|~^"

export function MatrixText({ children, className = "", delay = 0 }: MatrixTextProps) {
  const { isChanging } = useLanguage()
  const [displayText, setDisplayText] = useState(children)
  const [isScrambling, setIsScrambling] = useState(false)

  const getRandomChar = useCallback(() => {
    return CHARS[Math.floor(Math.random() * CHARS.length)]
  }, [])

  const scrambleText = useCallback(
    (text: string) => {
      return text
        .split("")
        .map((char) => (char === " " ? " " : getRandomChar()))
        .join("")
    },
    [getRandomChar],
  )

  useEffect(() => {
    if (!isChanging) {
      // When not changing, show the actual text (handles initial load and after animation)
      setDisplayText(children)
      setIsScrambling(false)
      return
    }

    // Start scramble after delay (creates top-to-bottom wave effect)
    const startTimeout = setTimeout(() => {
      setIsScrambling(true)

      let iterations = 0
      const maxIterations = 15
      const interval = setInterval(() => {
        if (iterations < maxIterations / 2) {
          // Scramble phase
          setDisplayText(scrambleText(children))
        } else {
          // Unscramble phase - gradually reveal the new text
          const progress = (iterations - maxIterations / 2) / (maxIterations / 2)
          const revealCount = Math.floor(children.length * progress)

          const newText = children
            .split("")
            .map((char, i) => {
              if (char === " ") return " "
              if (i < revealCount) return char
              return getRandomChar()
            })
            .join("")

          setDisplayText(newText)
        }

        iterations++

        if (iterations >= maxIterations) {
          clearInterval(interval)
          setDisplayText(children)
          setIsScrambling(false)
        }
      }, 50)

      return () => clearInterval(interval)
    }, delay)

    return () => clearTimeout(startTimeout)
  }, [isChanging, children, delay, scrambleText, getRandomChar])

  return (
    <span
      className={`${className} ${isScrambling ? "text-primary/80" : ""}`}
      style={{
        transition: "color 0.2s ease",
        fontFamily: "inherit",
      }}
    >
      {displayText}
    </span>
  )
}
