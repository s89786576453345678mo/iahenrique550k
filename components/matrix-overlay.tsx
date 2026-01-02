"use client"

import { useEffect, useState } from "react"
import { useLanguage } from "@/lib/i18n"
import { motion, AnimatePresence } from "framer-motion"

const CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*!?<>[]{}=/\\|~^アイウエオカキクケコサシスセソ"

interface MatrixColumn {
  x: number
  chars: string[]
  speed: number
  opacity: number
}

export function MatrixOverlay() {
  const { isChanging } = useLanguage()
  const [columns, setColumns] = useState<MatrixColumn[]>([])

  useEffect(() => {
    if (!isChanging) {
      setColumns([])
      return
    }

    // Generate random columns
    const numColumns = Math.floor(window.innerWidth / 20)
    const newColumns: MatrixColumn[] = []

    for (let i = 0; i < numColumns; i++) {
      const numChars = Math.floor(Math.random() * 15) + 5
      const chars: string[] = []
      for (let j = 0; j < numChars; j++) {
        chars.push(CHARS[Math.floor(Math.random() * CHARS.length)])
      }
      newColumns.push({
        x: (i / numColumns) * 100,
        chars,
        speed: Math.random() * 0.5 + 0.5,
        opacity: Math.random() * 0.3 + 0.1,
      })
    }

    setColumns(newColumns)
  }, [isChanging])

  return (
    <AnimatePresence>
      {isChanging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
          style={{ background: "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.3) 100%)" }}
        >
          {columns.map((col, i) => (
            <motion.div
              key={i}
              className="absolute top-0 text-primary font-mono text-xs leading-none"
              style={{
                left: `${col.x}%`,
                opacity: col.opacity,
                textShadow: "0 0 8px currentColor",
              }}
              initial={{ y: "-100%" }}
              animate={{ y: "100vh" }}
              transition={{
                duration: 1.2 * col.speed,
                ease: "linear",
              }}
            >
              {col.chars.map((char, j) => (
                <div
                  key={j}
                  style={{
                    opacity: 1 - (j / col.chars.length) * 0.7,
                  }}
                >
                  {char}
                </div>
              ))}
            </motion.div>
          ))}

          {/* Scan line effect */}
          <motion.div
            className="absolute left-0 right-0 h-1 bg-gradient-to-b from-transparent via-primary/30 to-transparent"
            initial={{ top: "-10%" }}
            animate={{ top: "110%" }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
