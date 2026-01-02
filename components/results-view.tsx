"use client"
import { useState, useMemo, useEffect, useRef } from "react"
import type React from "react"
import { motion } from "framer-motion"

import type { CryptoData, CryptoTicker } from "@/app/page"
import { Footer } from "./footer"
import { useLanguage } from "@/lib/i18n"
import { Lock } from "lucide-react" // Import the Lock icon

interface ResultsViewProps {
  cryptoData: CryptoData
  allCryptoData: CryptoData[]
  decision: "Comprar" | "Vender"
  recommendedTime: 1 | 2 | 3 | 5
  onNewAnalysis: () => void
  language: string
  probability: number
  support: number
  resistance: number
  confidenceData: number
  onBack: () => void
  brokerUrl?: string
}

interface ExtendedCryptoData extends CryptoData {
  payout: number
  probability: number
  volatility: string
  signal?: "Comprar" | "Vender"
  recommendedTime?: 1 | 2 | 3 | 5
}

const CryptoIcon = ({ ticker, size = "md" }: { ticker: CryptoTicker; size?: "sm" | "md" | "lg" }) => {
  const sizeClasses = {
    sm: "w-7 h-7",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  }

  const logos: Record<string, string> = {
    "BTC/USDT": "https://i.imgur.com/vDVBGOM.png",
    "ETH/USDT": "https://i.imgur.com/qnli9ZY.png",
    "XRP/USDT": "https://i.imgur.com/jjSTCRk.png",
    "SOL/USDT": "https://i.imgur.com/uazTeL1.png",
  }

  return (
    <img
      src={logos[ticker] || "/placeholder.svg"}
      alt={ticker.split("/")[0]}
      className={`${sizeClasses[size]} rounded-full object-cover`}
    />
  )
}

export function ResultsView({
  cryptoData,
  allCryptoData,
  decision,
  recommendedTime,
  onNewAnalysis,
  language,
  probability,
  support,
  resistance,
  confidenceData,
  onBack,
  brokerUrl = "https://app.b2xfinance.com/auth/login",
}: ResultsViewProps) {
  const { t } = useLanguage()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [selectedCrypto, setSelectedCrypto] = useState<
    (CryptoData & { signal?: "Comprar" | "Vender"; recommendedTime?: number }) | null
  >(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null)
  const [showSignalPopup, setShowSignalPopup] = useState(true)
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })
  const [popupInitialized, setPopupInitialized] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [showMenu, setShowMenu] = useState(false)
  const [isGrabbingOpportunity, setIsGrabbingOpportunity] = useState(false)
  const [currentSignalCrypto, setCurrentSignalCrypto] = useState<CryptoData | null>(null)
  const [detailPopupPosition, setDetailPopupPosition] = useState({ x: 0, y: 0 })
  const [isDetailDragging, setIsDetailDragging] = useState(false)
  const [detailDragOffset, setDetailDragOffset] = useState({ x: 0, y: 0 })

  const [staticPredictions, setStaticPredictions] = useState<
    Record<
      string,
      {
        signal: "Comprar" | "Vender"
        time: 1 | 2 | 3 | 5
        payout: number
        probability: number
        unlockTime: number
      }
    >
  >({})
  const [unlockCountdowns, setUnlockCountdowns] = useState<Record<string, number>>({})

  const [blockedCryptos, setBlockedCryptos] = useState<Record<string, number>>({})
  const [blockCountdowns, setBlockCountdowns] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [grabbedSignal, setGrabbedSignal] = useState<"Comprar" | "Vender" | null>(null)

  const [usedPredictions, setUsedPredictions] = useState<Set<string>>(new Set())
  const [showNoOpportunityPopup, setShowNoOpportunityPopup] = useState(false)
  const [noOpportunityCrypto, setNoOpportunityCrypto] = useState<string>("")

  const iframeUrl = "https://app.b2xfinance.com/auth/login"

  const entryTimeData = useMemo(() => {
    const now = new Date()
    const minutesToAdd = Math.floor(Math.random() * 3) + 1 // 1, 2 or 3 minutes
    const entryTime = new Date(now.getTime() + minutesToAdd * 60 * 1000)
    const timeframes = ["M1", "M5", "M15"] as const
    const timeframe = timeframes[Math.floor(Math.random() * timeframes.length)]
    return {
      entryTime,
      expirationSeconds: minutesToAdd * 60,
      timeframe,
    }
  }, [])

  useEffect(() => {
    setRemainingSeconds(entryTimeData.expirationSeconds)
  }, [entryTimeData.expirationSeconds])

  useEffect(() => {
    if (remainingSeconds === null || remainingSeconds <= 0) return

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null || prev <= 0) return 0
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [remainingSeconds])

  useEffect(() => {
    const hasBlocked = Object.values(blockedCryptos).some((time) => time > 0)
    if (!hasBlocked) return

    const interval = setInterval(() => {
      setBlockedCryptos((prev) => {
        const updated: Record<string, number> = {}
        let hasChanges = false

        for (const [ticker, time] of Object.entries(prev)) {
          if (time > 0) {
            updated[ticker] = time - 1
            hasChanges = true
          }
        }

        return hasChanges ? updated : prev
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [blockedCryptos])

  useEffect(() => {
    if (Object.keys(blockCountdowns).length === 0) return

    const interval = setInterval(() => {
      setBlockCountdowns((prev) => {
        const next = { ...prev }
        let changed = false
        for (const ticker in next) {
          if (next[ticker] > 0) {
            next[ticker] -= 1
            changed = true
          }
        }
        return changed ? next : prev
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [blockCountdowns])

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const formatEntryTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getTranslatedDecision = (dec: "Comprar" | "Vender") => {
    return dec === "Comprar" ? t("results.buy") : t("results.sell")
  }

  const otherCryptos = useMemo(() => {
    return allCryptoData
      .filter((c) => c.ticker !== cryptoData.ticker)
      .map((c, index) => {
        if (staticPredictions[c.ticker]) {
          return {
            ...c,
            signal: staticPredictions[c.ticker].signal,
            recommendedTime: staticPredictions[c.ticker].time,
            payout: staticPredictions[c.ticker].payout,
            probability: staticPredictions[c.ticker].probability,
            volatility: (Math.random() * 15 + 8).toFixed(1),
          }
        }

        const signal = Math.random() < 0.5 ? "Comprar" : "Vender"
        const times: (1 | 5 | 15)[] = [1, 5, 15]
        const time = times[Math.floor(Math.random() * times.length)]
        const payout = Math.floor(Math.random() * 15) + 80
        const probability = Math.floor(Math.random() * 20) + 70

        return {
          ...c,
          payout,
          probability,
          volatility: (Math.random() * 15 + 8).toFixed(1),
          signal: signal as "Comprar" | "Vender",
          recommendedTime: time,
        }
      })
  }, [allCryptoData, cryptoData.ticker, staticPredictions])

  useEffect(() => {
    if (Object.keys(staticPredictions).length === 0) {
      const initialPredictions: Record<
        string,
        {
          signal: "Comprar" | "Vender"
          time: 1 | 5 | 15
          payout: number
          probability: number
          unlockTime: number
        }
      > = {}

      const initialCountdowns: Record<string, number> = {}
      const unlockTimes = [120, 180, 240] // 2, 3, 4 minutos

      allCryptoData
        .filter((c) => c.ticker !== cryptoData.ticker)
        .forEach((crypto, index) => {
          const signal = Math.random() < 0.5 ? "Comprar" : "Vender"
          const times: (1 | 5 | 15)[] = [1, 5, 15]
          const time = times[Math.floor(Math.random() * times.length)]
          const unlockTime = unlockTimes[index % unlockTimes.length]

          initialPredictions[crypto.ticker] = {
            signal: signal as "Comprar" | "Vender",
            time,
            payout: Math.floor(Math.random() * 15) + 80,
            probability: Math.floor(Math.random() * 20) + 70,
            unlockTime,
          }

          initialCountdowns[crypto.ticker] = unlockTime
        })

      setStaticPredictions(initialPredictions)
      setUnlockCountdowns(initialCountdowns)
    }
  }, [allCryptoData, cryptoData.ticker, staticPredictions])

  useEffect(() => {
    if (Object.keys(unlockCountdowns).length === 0) return

    const interval = setInterval(() => {
      setUnlockCountdowns((prev) => {
        const next = { ...prev }
        let changed = false
        for (const ticker in next) {
          if (next[ticker] > 0) {
            next[ticker] -= 1
            changed = true
          }
        }
        return changed ? next : prev
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [unlockCountdowns])

  const isBuy = decision === "Comprar"

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - popupPosition.x,
      y: e.clientY - popupPosition.y,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const padding = 16
      const popupWidth = 300
      const popupHeight = 350

      const newX = Math.max(padding, Math.min(e.clientX - dragOffset.x, window.innerWidth - popupWidth - padding))
      const newY = Math.max(padding, Math.min(e.clientY - dragOffset.y, window.innerHeight - popupHeight - padding))

      setPopupPosition({
        x: newX,
        y: newY,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    setIsDragging(true)
    setDragOffset({
      x: touch.clientX - popupPosition.x,
      y: touch.clientY - popupPosition.y,
    })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      const touch = e.touches[0]
      const padding = 16
      const popupWidth = 300
      const popupHeight = 350

      const newX = Math.max(padding, Math.min(touch.clientX - dragOffset.x, window.innerWidth - popupWidth - padding))
      const newY = Math.max(padding, Math.min(touch.clientY - dragOffset.y, window.innerHeight - popupHeight - padding))

      setPopupPosition({
        x: newX,
        y: newY,
      })
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const activeCrypto = currentSignalCrypto
    ? { ...currentSignalCrypto, signal: grabbedSignal || decision }
    : { ...cryptoData, signal: decision }
  const activeDecision = activeCrypto.signal as "Comprar" | "Vender"
  const isActiveBuy = activeDecision === "Comprar"

  const handleGrabOpportunity = (crypto: CryptoData & { signal?: "Comprar" | "Vender" }) => {
    setCurrentSignalCrypto(crypto)
    if (crypto.signal) {
      setGrabbedSignal(crypto.signal)
    }

    // Mark this prediction as used
    setUsedPredictions((prev) => new Set(prev).add(crypto.ticker))

    // Add 2 minutes (120 seconds) to all OTHER locked predictions
    setUnlockCountdowns((prev) => {
      const updated = { ...prev }
      Object.keys(updated).forEach((ticker) => {
        if (ticker !== crypto.ticker && updated[ticker] > 0) {
          updated[ticker] += 120 // Add 2 minutes
        }
      })
      return updated
    })

    const blockTimes = [30, 60, 120]
    const shuffledTimes = [...blockTimes].sort(() => Math.random() - 0.5)

    const otherTickers = otherCryptos.filter((c) => c.ticker !== crypto.ticker).map((c) => c.ticker)

    const newBlocked: Record<string, number> = {}
    otherTickers.forEach((ticker, index) => {
      newBlocked[ticker] = Date.now() + shuffledTimes[index] * 1000
    })
    setBlockedCryptos(newBlocked)
    setBlockCountdowns(Object.fromEntries(otherTickers.map((ticker, index) => [ticker, shuffledTimes[index]])))

    setSelectedCrypto(null)
    window.scrollTo({ top: 0, behavior: "smooth" })

    setIsGrabbingOpportunity(true)
    setTimeout(() => {
      setIsGrabbingOpportunity(false)
    }, 1500)
  }

  useEffect(() => {
    if (selectedCrypto) {
      setDetailPopupPosition({
        x: window.innerWidth / 2 - 200,
        y: window.innerHeight / 2 - 250,
      })
    }
  }, [selectedCrypto])

  useEffect(() => {
    if (isFullscreen && !popupInitialized) {
      const isMobile = window.innerWidth < 768
      const padding = 16 // margem das bordas

      if (isMobile) {
        // No mobile: centralizado horizontalmente, no topo com margem
        const popupWidth = 280
        setPopupPosition({
          x: Math.max(padding, (window.innerWidth - popupWidth) / 2),
          y: padding + 60, // abaixo do botão de fechar
        })
      } else {
        // No desktop: canto superior esquerdo com margem
        setPopupPosition({
          x: padding + 10,
          y: 80,
        })
      }
      setPopupInitialized(true)
    }

    if (!isFullscreen) {
      setPopupInitialized(false)
    }
  }, [isFullscreen, popupInitialized])

  const entryTime = formatEntryTime(entryTimeData.entryTime)
  const timeframe = entryTimeData.timeframe

  const handleUsedPredictionClick = (ticker: string) => {
    setNoOpportunityCrypto(ticker)
    setShowNoOpportunityPopup(true)
  }

  return (
    <div className="min-h-screen pb-6 text-foreground relative overflow-hidden">
      <div className="fixed inset-0 -z-10 opacity-30">
        <iframe
          src="https://sunny-souffle-3d2bba.netlify.app"
          className="w-full h-full border-0 pointer-events-none"
          title="Background Animation"
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-background/20 border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center">
            <img src="/evo-logo.png" alt="EvoTrex" className="h-7 w-auto object-contain" />
          </div>
          <button
            onClick={onNewAnalysis}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] transition-all text-sm font-medium text-foreground/80 hover:text-foreground"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {t("results.newAnalysis")}
          </button>
        </div>
      </header>

      {/* Fullscreen overlay */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-[9999] bg-black"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="absolute top-4 left-4 z-[10000]">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-all text-left"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h18" />
              </svg>
              Menu
            </button>

            {/* Dropdown menu */}
            {showMenu && (
              <div className="absolute top-full left-0 mt-2 w-40 rounded-xl bg-black/80 backdrop-blur-md border border-white/20 overflow-hidden shadow-xl">
                <button
                  onClick={() => {
                    setIsFullscreen(false)
                    setShowMenu(false)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-white text-sm font-medium hover:bg-white/10 transition-all text-left"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  {t("analysis.back") || "Voltar"}
                </button>
                <button
                  onClick={() => {
                    setShowSignalPopup(true)
                    setShowMenu(false)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-white text-sm font-medium hover:bg-white/10 transition-all text-left border-t border-white/10"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {t("analysis.openSignal")}
                </button>
              </div>
            )}
          </div>

          {/* Signal Popup - draggable */}
          {showSignalPopup && activeCrypto && (
            <div
              className="absolute z-[10001] bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl select-none"
              style={{
                left: popupPosition.x,
                top: popupPosition.y,
                cursor: isDragging ? "grabbing" : "grab",
                minWidth: "280px",
                maxWidth: "320px",
              }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
            >
              {/* Popup Header - drag handle */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-white/30"></div>
                    <div className="w-2 h-2 rounded-full bg-white/30"></div>
                    <div className="w-2 h-2 rounded-full bg-white/30"></div>
                  </div>
                  <span className="text-white/50 text-xs font-medium uppercase tracking-wider">Sinal</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowSignalPopup(false)
                  }}
                  className="p-1 rounded-md hover:bg-white/10 transition-colors text-white/50 hover:text-white"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Popup Content */}
              <div className="p-4 space-y-4">
                {/* Crypto and Signal - Usar activeCrypto e isActiveBuy */}
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl border ${isActiveBuy ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"}`}
                  >
                    <CryptoIcon ticker={activeCrypto.ticker} size="sm" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white/50 text-[10px] uppercase tracking-wider">{activeCrypto.ticker}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-xl font-bold ${isActiveBuy ? "text-emerald-400" : "text-rose-400"}`}>
                        {getTranslatedDecision(activeDecision)}
                      </span>
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center ${isActiveBuy ? "bg-emerald-500" : "bg-rose-500"}`}
                      >
                        {isActiveBuy ? (
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={3}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={3}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Entry Time and Timeframe */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-white/40 text-[9px] uppercase tracking-wider mb-1">{t("results.entryTime")}</p>
                    <p className="text-lg font-bold text-amber-400">{formatEntryTime(entryTimeData.entryTime)}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-white/40 text-[9px] uppercase tracking-wider mb-1">{t("results.timeframe")}</p>
                    <p className="text-lg font-bold text-primary">{entryTimeData.timeframe}</p>
                  </div>
                </div>

                {/* Expiration countdown */}
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-white/40 text-[9px] uppercase tracking-wider mb-1">{t("results.expiresIn")}</p>
                  <p className={`text-lg font-bold ${remainingSeconds <= 30 ? "text-rose-400" : "text-sky-400"}`}>
                    {remainingSeconds > 0
                      ? `${Math.floor(remainingSeconds / 60)}:${(remainingSeconds % 60).toString().padStart(2, "0")}`
                      : t("results.expired")}
                  </p>
                </div>

                {/* Payout and Confidence */}
                <div className="flex items-center justify-around text-center pt-2 border-t border-white/10">
                  <div>
                    <p className="text-white/40 text-[9px] uppercase tracking-wider">{t("results.payout")}</p>
                    <p className="text-base font-bold text-emerald-400">92%</p>
                  </div>
                  <div className="w-px h-8 bg-white/10"></div>
                  <div>
                    <p className="text-white/40 text-[9px] uppercase tracking-wider">{t("results.confidence")}</p>
                    <p className="text-base font-bold text-primary">89%</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <iframe
            src={iframeUrl}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            scrolling="no"
            style={{ overflow: "hidden" }}
          />
        </div>
      )}

      {showNoOpportunityPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-rose-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>

            <h3 className="text-xl font-bold text-center text-foreground mb-2">
              {language === "pt"
                ? "Análise Já Realizada"
                : language === "es"
                  ? "Análisis Ya Realizado"
                  : "Analysis Already Done"}
            </h3>

            <p className="text-center text-foreground/70 mb-6">
              {language === "pt"
                ? `Não é possível analisar ${noOpportunityCrypto} novamente. Nenhuma oportunidade adicional foi encontrada para este ativo no momento.`
                : language === "es"
                  ? `No es posible analizar ${noOpportunityCrypto} nuevamente. No se encontró ninguna oportunidad adicional para este activo en este momento.`
                  : `Cannot analyze ${noOpportunityCrypto} again. No additional opportunities were found for this asset at this time.`}
            </p>

            <button
              onClick={() => setShowNoOpportunityPopup(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-cyan-500 text-white font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all"
            >
              {language === "pt" ? "Entendi" : language === "es" ? "Entendido" : "Got it"}
            </button>
          </motion.div>
        </div>
      )}

      <main className="px-4 pt-5">
        <div className="max-w-5xl mx-auto space-y-5">
          <div className="w-full">
            <div className="relative p-5 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] backdrop-blur-sm shadow-xl">
              {isGrabbingOpportunity ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                  <p className="text-lg font-medium text-foreground/70 animate-pulse">
                    {t("results.grabbingOpportunity")}
                  </p>
                </div>
              ) : activeCrypto ? (
                <>
                  {/* Glow effect */}
                  <div
                    className={`absolute inset-0 rounded-2xl blur-2xl opacity-20 ${activeCrypto.signal === "Comprar" ? "bg-emerald-500" : "bg-rose-500"}`}
                  />

                  <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-6">
                    {/* Crypto Info + Signal Direction */}
                    <div className="flex items-center justify-between lg:justify-start lg:gap-6 lg:flex-1">
                      <div className="flex items-center gap-3">
                        <CryptoIcon ticker={activeCrypto.ticker} size="md" />
                        <div>
                          <h2 className="text-base font-bold text-foreground">{activeCrypto.ticker}</h2>
                          <p className="text-foreground/50 text-xs">${activeCrypto.price?.toLocaleString() || "0"}</p>
                        </div>
                      </div>

                      {/* Signal Badge */}
                      <div
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${activeCrypto.signal === "Comprar" ? "bg-emerald-500/20 border border-emerald-500/40" : "bg-rose-500/20 border border-rose-500/40"}`}
                      >
                        <span
                          className={`text-base font-bold ${activeCrypto.signal === "Comprar" ? "text-emerald-400" : "text-rose-400"}`}
                        >
                          {getTranslatedDecision(activeCrypto.signal!)}
                        </span>
                        <svg
                          className={`w-4 h-4 ${activeCrypto.signal === "Comprar" ? "text-emerald-400" : "text-rose-400"}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={3}
                        >
                          {activeCrypto.signal === "Comprar" ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          )}
                        </svg>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:flex lg:items-center gap-2 lg:gap-4">
                      <div className="bg-white/[0.03] rounded-xl p-2 lg:px-4 lg:py-2 border border-white/[0.06]">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-md bg-amber-500/20 flex items-center justify-center">
                            <svg
                              className="w-3 h-3 text-amber-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                            >
                              <circle cx="12" cy="12" r="10" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-foreground/40 text-[9px] uppercase tracking-wider">
                              {t("results.entry")}
                            </p>
                            <p className="text-base font-bold text-amber-400">{entryTime}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/[0.03] rounded-xl p-2 lg:px-4 lg:py-2 border border-white/[0.06]">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-md bg-primary/20 flex items-center justify-center">
                            <svg
                              className="w-3 h-3 text-primary"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-foreground/40 text-[9px] uppercase tracking-wider">
                              {t("results.timeframe")}
                            </p>
                            <p className="text-base font-bold text-primary">{timeframe}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-3 lg:gap-4 text-xs lg:text-sm">
                      <div className="flex items-center gap-1.5 text-foreground/50">
                        <svg
                          className="w-3.5 h-3.5 text-sky-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                        </svg>
                        <span>{t("results.expires")}</span>
                        <span
                          className={`font-bold ${remainingSeconds && remainingSeconds <= 30 ? "text-rose-400" : "text-sky-400"}`}
                        >
                          {remainingSeconds && remainingSeconds > 0
                            ? formatCountdown(remainingSeconds)
                            : t("results.expired")}
                        </span>
                      </div>
                      <span className="text-foreground/20">|</span>
                      <span className="text-foreground/50">
                        {t("results.payout")} <span className="font-bold text-emerald-400">92%</span>
                      </span>
                      <span className="text-foreground/20">|</span>
                      <span className="text-foreground/50">
                        {t("results.confidence")} <span className="font-bold text-primary">89%</span>
                      </span>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {/* iframe section */}
          <div className="rounded-xl overflow-hidden border border-white/[0.06] bg-card/30 backdrop-blur-md">
            <div className="px-4 py-2.5 border-b border-white/[0.06] flex items-center gap-2.5">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <div className="flex-1 mx-4">
                <div className="max-w-md mx-auto px-3 py-1 rounded-md bg-white/[0.03] text-foreground/40 text-xs text-center truncate">
                  app.b2xfinance.com/traderoom
                </div>
              </div>
              {/* Fullscreen button */}
              <button
                onClick={() => setIsFullscreen(true)}
                className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-foreground/50 hover:text-foreground/80"
                title="Tela cheia"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                  <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                  <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                  <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                </svg>
              </button>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <iframe
              src={brokerUrl}
              className="w-full h-[700px] lg:h-[600px] scrollbar-none"
              title="Corretora B2X Finance"
              allowFullScreen
              allow="clipboard-write"
              scrolling="no"
              style={{ overflow: "hidden" }}
              ref={iframeRef}
              onLoad={() => setIsLoading(false)}
            />
          </div>

          {/* The following section is the updated part */}
          <div className="rounded-2xl backdrop-blur-xl bg-white/[0.03] border border-white/[0.06] p-4 md:p-5">
            <h3 className="text-foreground font-semibold text-base flex items-center gap-2 mb-4">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              {t("results.otherPredictions")}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {otherCryptos.map((crypto) => {
                const unlockTimeRemaining = unlockCountdowns[crypto.ticker] || 0
                const blockTimeRemaining = blockCountdowns[crypto.ticker] || 0
                const isLockedByUnlock = unlockTimeRemaining > 0
                const isBlockedByGrab = blockTimeRemaining > 0
                const isBlocked = isLockedByUnlock || isBlockedByGrab
                const displayTime = isLockedByUnlock ? unlockTimeRemaining : blockTimeRemaining
                const isUsed = usedPredictions.has(crypto.ticker)

                return (
                  <button
                    key={crypto.ticker}
                    onClick={() => {
                      if (isUsed) {
                        handleUsedPredictionClick(crypto.ticker)
                      } else if (!isBlocked) {
                        setSelectedCrypto(crypto)
                      }
                    }}
                    disabled={isBlocked && !isUsed}
                    className={`group relative p-4 rounded-xl bg-gradient-to-br from-white/[0.04] to-transparent border transition-all duration-300 text-left overflow-hidden ${
                      isBlocked && !isUsed
                        ? "border-white/[0.03] opacity-60 cursor-not-allowed"
                        : isUsed
                          ? "border-white/[0.03] opacity-50 cursor-pointer hover:opacity-60"
                          : "border-white/[0.06] hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                    }`}
                  >
                    {isUsed && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-xl">
                        <div className="flex items-center gap-2 text-foreground/70">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm font-medium">
                            {language === "pt" ? "Analisado" : language === "es" ? "Analizado" : "Analyzed"}
                          </span>
                        </div>
                      </div>
                    )}

                    {isBlocked && !isUsed && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-xl">
                        <div className="flex items-center gap-2 text-foreground/80 mb-1">
                          <Lock className="w-4 h-4" />
                          <span className="text-sm font-medium">{t("results.locked")}</span>
                        </div>
                        <div className="mt-2 text-2xl font-bold text-primary tabular-nums">
                          {Math.floor(displayTime / 60)}:{(displayTime % 60).toString().padStart(2, "0")}
                        </div>
                        <span className="text-xs text-foreground/50 mt-1">
                          {isLockedByUnlock ? t("results.unlocking") : t("results.wait")}
                        </span>
                      </div>
                    )}

                    {/* Background glow effect */}
                    <div
                      className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${crypto.signal === "Comprar" ? "bg-gradient-to-br from-emerald-500/10 to-transparent" : "bg-gradient-to-br from-rose-500/10 to-transparent"}`}
                    />

                    {/* Signal indicator bar */}
                    <div
                      className={`absolute top-0 left-0 right-0 h-0.5 ${crypto.signal === "Comprar" ? "bg-gradient-to-r from-emerald-500 to-emerald-400" : "bg-gradient-to-r from-rose-500 to-rose-400"}`}
                    />

                    <div className="relative">
                      {/* Header with crypto info */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <CryptoIcon ticker={crypto.ticker} size="sm" />
                            <div
                              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${crypto.signal === "Comprar" ? "bg-emerald-500" : "bg-rose-500"}`}
                            />
                          </div>
                          <div>
                            <p className="text-foreground font-semibold text-sm">{crypto.ticker.split("/")[0]}</p>
                            <p className="text-foreground/40 text-xs">{crypto.ticker}</p>
                          </div>
                        </div>

                        {/* Signal badge */}
                        <div
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                            crypto.signal === "Comprar"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-rose-500/20 text-rose-400"
                          }`}
                        >
                          {crypto.signal === "Comprar" ? (
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              strokeWidth={2.5}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                            </svg>
                          ) : (
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              strokeWidth={2.5}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          )}
                          {getTranslatedDecision(crypto.signal!)}
                        </div>
                      </div>

                      {/* Stats grid */}
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.05]">
                        <div className="text-center">
                          <p className="text-foreground/40 text-[10px] uppercase tracking-wider mb-0.5">Payout</p>
                          <p className="text-emerald-400 font-bold text-sm">{crypto.payout}%</p>
                        </div>
                        <div className="text-center border-x border-white/[0.05]">
                          <p className="text-foreground/40 text-[10px] uppercase tracking-wider mb-0.5">
                            {t("results.prob")}
                          </p>
                          <p className="text-cyan-400 font-bold text-sm">{crypto.probability}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-foreground/40 text-[10px] uppercase tracking-wider mb-0.5">Time</p>
                          <p className="text-foreground font-bold text-sm">M{crypto.recommendedTime}</p>
                        </div>
                      </div>

                      {/* Hover indicator */}
                      <div className="flex items-center justify-center gap-1 mt-3 text-foreground/30 group-hover:text-primary transition-colors text-xs">
                        <span>{t("results.viewDetails")}</span>
                        <svg
                          className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer showFlagMarquee={false} />

      {/* Modal de detalhes */}
      {selectedCrypto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCrypto(null)}
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

          <div
            className="relative w-full max-w-sm rounded-2xl overflow-hidden backdrop-blur-2xl bg-gradient-to-b from-[#0d1117]/95 to-[#0a0f1a]/95 border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glow effect no topo */}
            <div
              className={`absolute top-0 left-0 right-0 h-24 pointer-events-none ${selectedCrypto.signal === "Comprar" ? "bg-gradient-to-b from-emerald-500/20 to-transparent" : "bg-gradient-to-b from-rose-500/20 to-transparent"}`}
            />

            {/* Header */}
            <div className="relative px-5 pt-5 pb-3">
              <button
                onClick={() => setSelectedCrypto(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <svg
                  className="w-4 h-4 text-foreground/50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex items-center gap-3">
                <div
                  className={`relative p-2 rounded-xl ${selectedCrypto.signal === "Comprar" ? "bg-emerald-500/10" : "bg-rose-500/10"}`}
                >
                  <CryptoIcon ticker={selectedCrypto.ticker} size="md" />
                  <div
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center ${selectedCrypto.signal === "Comprar" ? "bg-emerald-500" : "bg-rose-500"}`}
                  >
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={3}
                    >
                      {selectedCrypto.signal === "Comprar" ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      )}
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{selectedCrypto.ticker}</h3>
                  <p className="text-foreground/50 text-sm">${selectedCrypto.price.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Signal Badge */}
            <div className="relative px-5 pb-3">
              <div
                className={`p-3 rounded-xl ${selectedCrypto.signal === "Comprar" ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-rose-500/10 border border-rose-500/30"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedCrypto.signal === "Comprar" ? "bg-emerald-500/20" : "bg-rose-500/20"}`}
                    >
                      <svg
                        className={`w-6 h-6 ${selectedCrypto.signal === "Comprar" ? "text-emerald-400" : "text-rose-400"}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                      >
                        {selectedCrypto.signal === "Comprar" ? (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        )}
                      </svg>
                    </div>
                    <div>
                      <p className="text-foreground/40 text-[10px] uppercase tracking-wider">{t("results.signal")}</p>
                      <p
                        className={`text-xl font-bold ${selectedCrypto.signal === "Comprar" ? "text-emerald-400" : "text-rose-400"}`}
                      >
                        {getTranslatedDecision(selectedCrypto.signal!)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-foreground/40 text-[10px] uppercase tracking-wider">{t("results.timeframe")}</p>
                    <p className="text-lg font-bold text-cyan-400">M{selectedCrypto.recommendedTime}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="px-5 pb-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-center">
                  <p className="text-foreground/40 text-[9px] uppercase tracking-wider mb-0.5">{t("results.payout")}</p>
                  <p className="text-lg font-bold text-emerald-400">{selectedCrypto.payout}%</p>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-center">
                  <p className="text-foreground/40 text-[9px] uppercase tracking-wider mb-0.5">{t("results.prob")}</p>
                  <p className="text-lg font-bold text-cyan-400">{selectedCrypto.probability}%</p>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-center">
                  <p className="text-foreground/40 text-[9px] uppercase tracking-wider mb-0.5">{t("results.volat")}</p>
                  <p className="text-lg font-bold text-amber-400">{selectedCrypto.volatility}%</p>
                </div>
              </div>
            </div>

            <div className="px-5 pb-5">
              <button
                onClick={() => handleGrabOpportunity(selectedCrypto)}
                className={`w-full py-3 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
                  selectedCrypto.signal === "Comprar"
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 shadow-lg shadow-emerald-500/25"
                    : "bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 shadow-lg shadow-rose-500/25"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {t("results.grabOpportunity")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
