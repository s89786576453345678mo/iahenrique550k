"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useSpring } from "framer-motion"
import type { CryptoData } from "@/app/page"
import { useLanguage } from "@/lib/i18n"
import { MatrixText } from "./matrix-text"

interface CryptoCardProps {
  data: CryptoData
  isHighlighted: boolean
  onOperate: () => void
  index: number
  matrixDelay?: number
  timerProgress?: number
}

export function CryptoCard({
  data,
  isHighlighted,
  onOperate,
  index,
  matrixDelay = 0,
  timerProgress = 1,
}: CryptoCardProps) {
  const [activeArrow, setActiveArrow] = useState(0)
  const [displayValue, setDisplayValue] = useState(data.profitProjection)
  const previousValue = useRef(data.profitProjection)
  const { t } = useLanguage()

  const isAnalyzed = data.isAnalyzed || false
  const isTopCrypto = index === 0 && !isAnalyzed

  const [tradersProfit, setTradersProfit] = useState(2354)
  const [operationsCount, setOperationsCount] = useState(9)
  const [targetProfit] = useState(() => Math.floor(Math.random() * (17973 - 2354) + 2354))
  const [targetOperations] = useState(() => Math.floor(Math.random() * (821 - 397) + 397))
  const prevTimerProgress = useRef(timerProgress)

  const springValue = useSpring(data.profitProjection, {
    stiffness: 100,
    damping: 30,
    mass: 1,
  })

  const valueDirection =
    data.profitProjection > previousValue.current
      ? "up"
      : data.profitProjection < previousValue.current
        ? "down"
        : "neutral"

  useEffect(() => {
    springValue.set(data.profitProjection)
  }, [data.profitProjection, springValue])

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      setDisplayValue(Math.round(latest))
    })
    return unsubscribe
  }, [springValue])

  useEffect(() => {
    previousValue.current = data.profitProjection
  }, [data.profitProjection])

  useEffect(() => {
    if (!isHighlighted || isAnalyzed) return

    const interval = setInterval(() => {
      setActiveArrow((prev) => (prev + 1) % 5)
    }, 300)

    return () => clearInterval(interval)
  }, [isHighlighted, isAnalyzed])

  useEffect(() => {
    if (!isTopCrypto) return

    if (timerProgress > 0.9 && prevTimerProgress.current < 0.1) {
      setTradersProfit(Math.floor(Math.random() * (3000 - 2354) + 2354))
      setOperationsCount(Math.floor(Math.random() * (15 - 9) + 9))
    }
    prevTimerProgress.current = timerProgress

    const cycleProgress = 1 - timerProgress

    if (cycleProgress < 0.133) {
      const earlyProgress = cycleProgress / 0.133
      const baseProfit = Math.floor(Math.random() * (3000 - 2354) + 2354)
      setTradersProfit(Math.floor(baseProfit + earlyProgress * 500))
    } else {
      const remainingProgress = (cycleProgress - 0.133) / (1 - 0.133)
      const baseProfit = 3500
      setTradersProfit(Math.floor(baseProfit + remainingProgress * (targetProfit - baseProfit)))
    }

    const baseOps = 12
    setOperationsCount(Math.floor(baseOps + cycleProgress * (targetOperations - baseOps)))
  }, [timerProgress, isTopCrypto, targetProfit, targetOperations])

  const getCryptoLogo = (ticker: string) => {
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
        className={`w-10 h-10 md:w-12 md:h-12 rounded-full object-cover transition-all duration-300 ${
          isAnalyzed ? "grayscale opacity-60" : ""
        }`}
      />
    )
  }

  const getCryptoName = (ticker: string) => {
    const nameKeys: Record<string, string> = {
      "BTC/USDT": "crypto.bitcoin",
      "ETH/USDT": "crypto.ethereum",
      "XRP/USDT": "crypto.xrp",
      "SOL/USDT": "crypto.solana",
    }
    return t(nameKeys[ticker] || "crypto.bitcoin")
  }

  return (
    <motion.button
      onClick={onOperate}
      whileHover={isAnalyzed ? { y: -1 } : { y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`
        relative w-full flex items-center gap-3 md:gap-5 p-4 md:p-6
        rounded-2xl transition-colors duration-300
        glass-card glass-card-hover
        group cursor-pointer overflow-hidden
        ${
          isAnalyzed
            ? "opacity-50 border-muted/30 hover:opacity-60"
            : isHighlighted
              ? "glow-highlight border-primary shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/10"
              : "hover:shadow-xl hover:shadow-primary/10"
        }
      `}
    >
      {!isAnalyzed && (
        <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}

      <div className={`flex-shrink-0 relative ${isHighlighted && !isAnalyzed ? "float" : ""}`}>
        <div
          className={`absolute inset-0 blur-xl transition-opacity duration-300 ${
            isAnalyzed ? "opacity-20 bg-muted" : isHighlighted ? "opacity-50 bg-primary/40" : "opacity-50 bg-primary/20"
          }`}
        />
        <div className="relative">{getCryptoLogo(data.ticker)}</div>
      </div>

      <div className="flex flex-col items-start min-w-[70px] lg:min-w-[80px]">
        <span
          className={`text-sm md:text-base font-semibold transition-colors duration-300 ${
            isAnalyzed ? "text-muted-foreground" : "text-foreground"
          }`}
        >
          <MatrixText delay={matrixDelay}>{getCryptoName(data.ticker)}</MatrixText>
        </span>
        <span className="text-[10px] md:text-xs text-muted-foreground font-mono">{data.ticker}</span>
      </div>

      {isTopCrypto && (
        <div className="hidden lg:flex flex-col items-start gap-0.5 ml-2">
          <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wider">
            +400 {t("dashboard.tradersProfit")}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold text-primary tabular-nums">+${tradersProfit.toLocaleString()}</span>
          </div>
        </div>
      )}

      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-0.5 sm:gap-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`text-xs sm:text-lg font-bold transition-all duration-200 ${
              isAnalyzed
                ? "text-muted-foreground/20"
                : isHighlighted
                  ? i <= activeArrow
                    ? "text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                    : "text-primary/20"
                  : "text-muted-foreground/40 group-hover:text-muted-foreground/60"
            }`}
          >
            {">"}
          </span>
        ))}
      </div>

      {isTopCrypto && (
        <div className="hidden lg:flex flex-col items-end gap-0.5 absolute right-36">
          <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wider">
            {t("dashboard.operationsNoGale")}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold text-emerald-500 tabular-nums">+{operationsCount}</span>
            <span className="text-xs text-muted-foreground">{t("dashboard.consecutive")}</span>
          </div>
        </div>
      )}

      <div className={`flex flex-col items-end flex-shrink-0 ml-auto`}>
        <motion.span
          key={data.profitProjection}
          initial={
            isAnalyzed
              ? {}
              : {
                  scale: 1.15,
                  color: valueDirection === "up" ? "#22c55e" : valueDirection === "down" ? "#ef4444" : undefined,
                }
          }
          animate={{
            scale: 1,
            color: isAnalyzed ? "#71717a" : isHighlighted ? undefined : "#22c55e",
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={`text-base md:text-xl font-bold tabular-nums ${
            isAnalyzed
              ? "text-muted-foreground"
              : isHighlighted
                ? "text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan"
                : ""
          }`}
        >
          +${displayValue}
        </motion.span>
        <span className="text-[9px] md:text-[10px] uppercase tracking-[0.1em] md:tracking-[0.15em] text-muted-foreground font-medium">
          <MatrixText delay={matrixDelay + 50}>
            {isAnalyzed ? t("dashboard.analyzed") : t("dashboard.opportunity")}
          </MatrixText>
        </span>
      </div>

      {isHighlighted && !isAnalyzed && (
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/30 rounded-full blur-2xl pointer-events-none" />
      )}
    </motion.button>
  )
}
