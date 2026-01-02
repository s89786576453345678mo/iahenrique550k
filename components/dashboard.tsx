"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import type { CryptoData, CryptoTicker } from "@/app/page"
import { CryptoCard } from "./crypto-card"
import { BannerCarousel } from "./banner-carousel"
import { Footer } from "./footer"
import { SignalTimer } from "./signal-timer"
import { useLanguage } from "@/lib/i18n"
import { MatrixText } from "./matrix-text"
import { MatrixOverlay } from "./matrix-overlay"

interface DashboardProps {
  cryptoData: CryptoData[]
  highlightedIndex: number
  onOperate: (ticker: CryptoTicker) => void
  onRefreshSignals: () => void
}

export function Dashboard({ cryptoData, highlightedIndex, onOperate, onRefreshSignals }: DashboardProps) {
  const [mounted, setMounted] = useState(false)
  const [timerProgress, setTimerProgress] = useState(1) // Added timer progress state
  const { t } = useLanguage()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div
      className={`min-h-screen flex flex-col transition-opacity duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}
    >
      <MatrixOverlay />

      <header className="pt-16 pb-10 text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-30 pointer-events-none" />

        <div className="relative">
          <div className="flex justify-center mb-4">
            <img src="/evo-logo.png" alt="EvoTrex" className="h-10 w-auto object-contain" />
          </div>

          <p className="mt-4 text-muted-foreground text-xs tracking-[0.3em] uppercase">
            <MatrixText delay={100}>{t("header.subtitle")}</MatrixText>
          </p>
        </div>
      </header>

      <section className="px-4 md:px-8 lg:px-12 mb-12">
        <BannerCarousel />
      </section>

      <section className="px-4 md:px-8 lg:px-12 pb-16 flex-1">
        <div className="max-w-3xl mx-auto lg:max-w-5xl">
          {" "}
          {/* Increased max width for desktop */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-foreground flex items-center gap-3">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <MatrixText delay={200}>{t("dashboard.signals")}</MatrixText>
            </h2>
            <SignalTimer onTimerComplete={onRefreshSignals} onProgressChange={setTimerProgress} />
          </div>
          <div className="flex flex-col gap-4 relative">
            {cryptoData.map((crypto, index) => (
              <motion.div
                key={crypto.ticker}
                layout
                layoutId={crypto.ticker}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                transition={{
                  layout: {
                    type: "spring",
                    stiffness: 350,
                    damping: 30,
                    mass: 1,
                  },
                  opacity: { duration: 0.2 },
                }}
                style={{ zIndex: cryptoData.length - index }}
              >
                <CryptoCard
                  data={crypto}
                  isHighlighted={index === highlightedIndex}
                  onOperate={() => onOperate(crypto.ticker)}
                  index={index}
                  matrixDelay={300 + index * 100}
                  timerProgress={timerProgress} // Pass timer progress
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
