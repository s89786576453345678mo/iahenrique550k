"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Dashboard } from "@/components/dashboard"
import { AnalysisView } from "@/components/analysis-view"
import { ResultsView } from "@/components/results-view"
import { LoginPage } from "@/components/login-page"
import { useLanguage } from "@/lib/i18n"
import { useAuth } from "@/lib/auth-context"

export type CryptoTicker = "BTC/USDT" | "ETH/USDT" | "XRP/USDT" | "SOL/USDT"

export interface CryptoData {
  ticker: CryptoTicker
  price: number
  change: number
  sparkline: number[]
  volatility: number
  trend: "Alta" | "Baixa" | "Lateral"
  probability: number
  payout: number
  profitProjection: number
  isAnalyzed?: boolean
}

export type ViewState = "dashboard" | "analysis" | "results"

const ANALYZED_STORAGE_KEY = "evotrex_analyzed_cryptos"

interface AnalyzedCryptoStorage {
  tickers: CryptoTicker[]
  intervalSeed: number
}

function getIntervalSeed(): number {
  const now = new Date()
  const minutes = now.getMinutes()
  const hours = now.getHours()
  const day = now.getDate()
  const month = now.getMonth()
  const interval = Math.floor(minutes / 15)
  return day * 10000 + month * 1000 + hours * 100 + interval
}

function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
}

function generateOpportunityValue(random: () => number): number {
  const chance = random()

  if (chance < 0.8) {
    return 122 + random() * (334 - 122)
  } else if (chance < 0.9) {
    return 20 + random() * (122 - 20)
  } else {
    return 334 + random() * (1200 - 334)
  }
}

function getAnalyzedCryptos(currentSeed: number): CryptoTicker[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(ANALYZED_STORAGE_KEY)
    if (!stored) return []
    const data: AnalyzedCryptoStorage = JSON.parse(stored)
    if (data.intervalSeed !== currentSeed) {
      localStorage.removeItem(ANALYZED_STORAGE_KEY)
      return []
    }
    return data.tickers || []
  } catch {
    return []
  }
}

function saveAnalyzedCrypto(ticker: CryptoTicker, currentSeed: number): void {
  if (typeof window === "undefined") return
  try {
    const existing = getAnalyzedCryptos(currentSeed)
    if (!existing.includes(ticker)) {
      const newData: AnalyzedCryptoStorage = {
        tickers: [...existing, ticker],
        intervalSeed: currentSeed,
      }
      localStorage.setItem(ANALYZED_STORAGE_KEY, JSON.stringify(newData))
    }
  } catch {
    // Ignore storage errors
  }
}

export default function Home() {
  const { isAuthenticated } = useAuth()
  const [currentView, setCurrentView] = useState<ViewState>("dashboard")
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoTicker | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const [analysisResult, setAnalysisResult] = useState<{
    decision: "Comprar" | "Vender"
    time: 1 | 5 | 15
  } | null>(null)

  const [intervalSeed, setIntervalSeed] = useState(getIntervalSeed())
  const [competitorValues, setCompetitorValues] = useState<number[]>([0, 0, 0])
  const [nextUpdateIn, setNextUpdateIn] = useState<number>(5000)

  const [analyzedCryptos, setAnalyzedCryptos] = useState<CryptoTicker[]>([])

  const [reAnalysisPopup, setReAnalysisPopup] = useState<{
    isOpen: boolean
    ticker: CryptoTicker | null
    status: "analyzing" | "no-opportunity" | "opportunity-found"
  }>({
    isOpen: false,
    ticker: null,
    status: "analyzing",
  })

  const { t } = useLanguage()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" })
  }, [currentView])

  useEffect(() => {
    const stored = getAnalyzedCryptos(intervalSeed)
    setAnalyzedCryptos(stored)
  }, [intervalSeed])

  const opportunityData = useMemo(() => {
    const random = seededRandom(intervalSeed)

    const values = [
      generateOpportunityValue(random),
      generateOpportunityValue(random),
      generateOpportunityValue(random),
      generateOpportunityValue(random),
    ]

    const leaderIndex = random() < 0.25 ? 0 : random() < 0.5 ? 1 : random() < 0.75 ? 2 : 3

    const maxValue = Math.max(...values)
    values[leaderIndex] = maxValue + random() * 50

    return { values, leaderIndex }
  }, [intervalSeed])

  const baseCryptoData: CryptoData[] = useMemo(
    () => [
      {
        ticker: "BTC/USDT",
        price: 67842.5,
        change: 2.34,
        sparkline: [65000, 66200, 65800, 67100, 66900, 67500, 67842],
        volatility: 12.5,
        trend: "Alta",
        probability: 78,
        payout: 87,
        profitProjection: 0,
      },
      {
        ticker: "ETH/USDT",
        price: 3456.78,
        change: -1.12,
        sparkline: [3500, 3480, 3520, 3450, 3470, 3440, 3456],
        volatility: 15.2,
        trend: "Baixa",
        probability: 72,
        payout: 85,
        profitProjection: 0,
      },
      {
        ticker: "XRP/USDT",
        price: 0.5234,
        change: 5.67,
        sparkline: [0.48, 0.49, 0.5, 0.51, 0.5, 0.52, 0.52],
        volatility: 18.7,
        trend: "Alta",
        probability: 81,
        payout: 92,
        profitProjection: 0,
      },
      {
        ticker: "SOL/USDT",
        price: 142.89,
        change: 3.21,
        sparkline: [135, 138, 136, 140, 139, 141, 142],
        volatility: 22.1,
        trend: "Alta",
        probability: 75,
        payout: 89,
        profitProjection: 0,
      },
    ],
    [],
  )

  useEffect(() => {
    const updateCompetitorValues = () => {
      const newValues: number[] = []
      for (let i = 0; i < 3; i++) {
        const chance = Math.random()
        let value: number

        if (chance < 0.8) {
          value = 122 + Math.random() * (334 - 122)
        } else if (chance < 0.9) {
          value = 20 + Math.random() * (122 - 20)
        } else {
          value = 334 + Math.random() * (1200 - 334)
        }
        newValues.push(value)
      }
      setCompetitorValues(newValues)

      const nextInterval = 3000 + Math.random() * 4000
      setNextUpdateIn(nextInterval)
    }

    updateCompetitorValues()
  }, [intervalSeed])

  useEffect(() => {
    const scheduleNextUpdate = () => {
      const timeoutId = setTimeout(() => {
        const newValues: number[] = []
        for (let i = 0; i < 3; i++) {
          const chance = Math.random()
          let value: number

          if (chance < 0.8) {
            value = 122 + Math.random() * (334 - 122)
          } else if (chance < 0.9) {
            value = 20 + Math.random() * (122 - 20)
          } else {
            value = 334 + Math.random() * (1200 - 334)
          }
          newValues.push(value)
        }
        setCompetitorValues(newValues)

        const nextInterval = 3000 + Math.random() * 4000
        setNextUpdateIn(nextInterval)
      }, nextUpdateIn)

      return timeoutId
    }

    const timeoutId = scheduleNextUpdate()
    return () => clearTimeout(timeoutId)
  }, [nextUpdateIn, intervalSeed])

  const cryptoData = useMemo(() => {
    const { leaderIndex } = opportunityData
    const leaderValue = opportunityData.values[leaderIndex]

    const dataWithValues = baseCryptoData.map((crypto, index) => {
      const isAnalyzed = analyzedCryptos.includes(crypto.ticker)

      if (index === leaderIndex) {
        return { ...crypto, profitProjection: Math.round(leaderValue), isAnalyzed }
      } else {
        const competitorIndex = index < leaderIndex ? index : index - 1
        const competitorValue = competitorValues[competitorIndex] || opportunityData.values[index]
        return { ...crypto, profitProjection: Math.round(competitorValue), isAnalyzed }
      }
    })

    const analyzedList = dataWithValues.filter((c) => c.isAnalyzed)
    const nonAnalyzedList = dataWithValues.filter((c) => !c.isAnalyzed)

    const leader = nonAnalyzedList.find((_, idx) => {
      const originalIndex = baseCryptoData.findIndex((b) => b.ticker === nonAnalyzedList[idx]?.ticker)
      return originalIndex === leaderIndex && !analyzedCryptos.includes(baseCryptoData[leaderIndex].ticker)
    })

    const competitors = nonAnalyzedList
      .filter((c) => c !== leader)
      .sort((a, b) => b.profitProjection - a.profitProjection)

    const adjustedCompetitors = competitors.map((c) => ({
      ...c,
      profitProjection: leader ? Math.min(c.profitProjection, leader.profitProjection - 1) : c.profitProjection,
    }))

    const finalOrder = leader
      ? [leader, ...adjustedCompetitors, ...analyzedList]
      : [...adjustedCompetitors, ...analyzedList]

    return finalOrder
  }, [baseCryptoData, opportunityData, competitorValues, analyzedCryptos])

  useEffect(() => {
    setHighlightedIndex(0)
  }, [intervalSeed])

  const handleOperate = (ticker: CryptoTicker) => {
    if (analyzedCryptos.includes(ticker)) {
      setReAnalysisPopup({
        isOpen: true,
        ticker,
        status: "analyzing",
      })

      setTimeout(() => {
        const chance = Math.random()
        if (chance < 0.7) {
          setReAnalysisPopup((prev) => ({ ...prev, status: "no-opportunity" }))
        } else {
          setReAnalysisPopup((prev) => ({ ...prev, status: "opportunity-found" }))
        }
      }, 5000)
    } else {
      saveAnalyzedCrypto(ticker, intervalSeed)
      setAnalyzedCryptos((prev) => [...prev, ticker])
      setSelectedCrypto(ticker)
      setCurrentView("analysis")
    }
  }

  const handlePopupAction = () => {
    if (reAnalysisPopup.status === "opportunity-found" && reAnalysisPopup.ticker) {
      setSelectedCrypto(reAnalysisPopup.ticker)
      setCurrentView("analysis")
    }
    setReAnalysisPopup({ isOpen: false, ticker: null, status: "analyzing" })
  }

  const handleAnalysisComplete = () => {
    const times: (1 | 5 | 15)[] = [1, 5, 15]

    const decision: "Comprar" | "Vender" = Math.random() < 0.5 ? "Comprar" : "Vender"

    setAnalysisResult({
      decision,
      time: times[Math.floor(Math.random() * times.length)],
    })
    setCurrentView("results")
  }

  const handleNewAnalysis = () => {
    setCurrentView("dashboard")
    setSelectedCrypto(null)
    setAnalysisResult(null)
  }

  const handleRefreshSignals = useCallback(() => {
    const newSeed = getIntervalSeed()
    setIntervalSeed(newSeed)
    setAnalyzedCryptos([])
    localStorage.removeItem(ANALYZED_STORAGE_KEY)
  }, [])

  const selectedCryptoData = cryptoData.find((c) => c.ticker === selectedCrypto)

  const getCryptoName = (ticker: CryptoTicker) => {
    const nameKeys: Record<string, string> = {
      "BTC/USDT": "crypto.bitcoin",
      "ETH/USDT": "crypto.ethereum",
      "XRP/USDT": "crypto.xrp",
      "SOL/USDT": "crypto.solana",
    }
    return t(nameKeys[ticker] || "crypto.bitcoin")
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <>
      <div className="fixed inset-0 z-0">
        <iframe
          src="https://sunny-souffle-3d2bba.netlify.app"
          className="w-full h-[700px] md:h-full border-0 scale-110"
          style={{ pointerEvents: "none" }}
          title="Background"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <main className="relative z-10 min-h-screen">
        {currentView === "dashboard" && (
          <Dashboard
            cryptoData={cryptoData}
            highlightedIndex={highlightedIndex}
            onOperate={handleOperate}
            onRefreshSignals={handleRefreshSignals}
          />
        )}
        {currentView === "analysis" && selectedCrypto && (
          <AnalysisView
            ticker={selectedCrypto}
            onAnalysisComplete={handleAnalysisComplete}
            onBack={() => setCurrentView("dashboard")}
          />
        )}
        {currentView === "results" && selectedCryptoData && analysisResult && (
          <ResultsView
            cryptoData={selectedCryptoData}
            allCryptoData={cryptoData}
            decision={analysisResult.decision}
            recommendedTime={analysisResult.time}
            onNewAnalysis={handleNewAnalysis}
          />
        )}
      </main>

      {reAnalysisPopup.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => reAnalysisPopup.status !== "analyzing" && handlePopupAction()}
          />

          <div className="relative z-10 w-full max-w-sm mx-4">
            {reAnalysisPopup.status === "analyzing" && (
              <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl p-8 text-center shadow-2xl shadow-primary/20">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
                  <div className="absolute inset-2 rounded-full border-2 border-primary/50 animate-pulse" />
                  <div className="absolute inset-4 rounded-full border-2 border-transparent border-t-primary animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/50" />
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-2">{t("popup.analyzing")}</h3>
                <p className="text-primary font-medium text-xl mb-1">
                  {reAnalysisPopup.ticker && getCryptoName(reAnalysisPopup.ticker)}
                </p>
                <p className="text-muted-foreground text-sm">{t("popup.searching")}</p>

                <div className="mt-6 h-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-cyan animate-progress rounded-full" />
                </div>
              </div>
            )}

            {reAnalysisPopup.status === "no-opportunity" && (
              <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl p-8 text-center shadow-2xl">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-2">{t("popup.noOpportunity")}</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  {t("popup.noOpportunityText")}{" "}
                  <span className="text-foreground font-medium">
                    {reAnalysisPopup.ticker && getCryptoName(reAnalysisPopup.ticker)}
                  </span>{" "}
                  {t("popup.noOpportunityText2")}
                </p>

                <button
                  onClick={handlePopupAction}
                  className="w-full py-3 px-6 bg-muted hover:bg-muted/80 text-foreground font-medium rounded-xl transition-all duration-300"
                >
                  {t("popup.understood")}
                </button>
              </div>
            )}

            {reAnalysisPopup.status === "opportunity-found" && (
              <div className="bg-card/95 backdrop-blur-xl border border-primary/30 rounded-2xl p-8 text-center shadow-2xl shadow-primary/20">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center relative">
                  <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
                  <svg
                    className="w-10 h-10 text-primary relative z-10"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-2">{t("popup.opportunityFound")}</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  {t("popup.opportunityText")}{" "}
                  <span className="text-primary font-medium">
                    {reAnalysisPopup.ticker && getCryptoName(reAnalysisPopup.ticker)}
                  </span>
                  !
                </p>

                <button
                  onClick={handlePopupAction}
                  className="w-full py-3 px-6 bg-gradient-to-r from-primary to-cyan text-primary-foreground font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {t("popup.analyzeNow")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
