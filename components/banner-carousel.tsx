"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { useLanguage } from "@/lib/i18n"

export function BannerCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const totalSlides = 3
  const { t } = useLanguage()

  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [translateX, setTranslateX] = useState(0)

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides)
  }, [])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
  }, [])

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [nextSlide])

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setStartX(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const currentX = e.touches[0].clientX
    const diff = currentX - startX
    setTranslateX(diff)
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    setIsDragging(false)

    if (translateX > 50) {
      prevSlide()
    } else if (translateX < -50) {
      nextSlide()
    }
    setTranslateX(0)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const diff = e.clientX - startX
    setTranslateX(diff)
  }

  const handleMouseUp = () => {
    if (!isDragging) return
    setIsDragging(false)

    if (translateX > 50) {
      prevSlide()
    } else if (translateX < -50) {
      nextSlide()
    }
    setTranslateX(0)
  }

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false)
      setTranslateX(0)
    }
  }

  return (
    <div className="max-w-3xl mx-auto lg:max-w-5xl">
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-2xl glass-card select-none cursor-grab active:cursor-grabbing"
        style={{ aspectRatio: "16/9" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Slides Container */}
        <div
          className={`flex h-full ${isDragging ? "" : "transition-transform duration-700 ease-out"}`}
          style={{ transform: `translateX(calc(-${currentSlide * 100}% + ${translateX}px))` }}
        >
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="min-w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary/50 to-background/50 relative overflow-hidden"
            >
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-cyan/10 rounded-full blur-3xl" />

              <div className="relative z-10 pointer-events-none">
                <div className="w-20 h-20 mx-auto rounded-2xl border border-glass-border flex items-center justify-center bg-secondary/50 backdrop-blur-sm">
                  <span className="text-muted-foreground text-3xl font-light">{index + 1}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 rounded-full bg-background/40 backdrop-blur-sm">
          {[0, 1, 2].map((index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
