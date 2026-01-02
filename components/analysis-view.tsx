"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { CryptoTicker } from "@/app/page"
import { Footer } from "./footer"
import { useLanguage } from "@/lib/i18n"
import {
  ArrowLeftIcon,
  LoaderIcon,
  ShieldCheckIcon,
  XIcon,
  CheckCircleIcon,
  BarChartBigIcon as ChartBarIcon,
} from "lucide-react"

const CryptoIcon = ({ ticker, size = "sm" }: { ticker: string; size?: "sm" | "xs" }) => {
  const sizeClasses = {
    xs: "w-3.5 h-3.5",
    sm: "w-7 h-7",
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

interface AnalysisViewProps {
  crypto?: any
  ticker: CryptoTicker
  onComplete?: () => void
  onAnalysisComplete?: () => void
  onBack: () => void
}

export function AnalysisView({ crypto, ticker, onComplete, onAnalysisComplete, onBack }: AnalysisViewProps) {
  const { t } = useLanguage()
  const [state, setState] = useState<"idle" | "analyzing" | "complete" | "scanning">("idle")
  const [isConfirmedLoggedIn, setIsConfirmedLoggedIn] = useState(false)
  const [showLoginWarning, setShowLoginWarning] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const handleComplete = onAnalysisComplete || onComplete

  const handleVerify = () => {
    if (!isConfirmedLoggedIn) {
      setShowLoginWarning(true)
      setTimeout(() => setShowLoginWarning(false), 3000)
      return
    }
    setState("analyzing")
    setTimeout(() => {
      setState("complete")
    }, 4000)
  }

  const handleAnalyze = () => {
    setState("scanning")
    setTimeout(() => {
      if (handleComplete) {
        handleComplete()
      }
    }, 3500)
  }

  return (
    <div className="min-h-screen">
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black"
          >
            <div className="absolute top-4 left-4 z-10">
              <button
                onClick={() => setIsFullscreen(false)}
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md transition-colors text-white/90 text-sm font-medium"
              >
                ← Voltar
              </button>
            </div>
            <iframe
              src="https://app.b2xfinance.com/auth/login"
              className="w-full h-full scrollbar-none"
              title={`Corretora Fullscreen - ${ticker}`}
              allowFullScreen
              allow="clipboard-write"
              scrolling="no"
              style={{ overflow: "hidden" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <header className="px-4 md:px-8 lg:px-12 py-6 flex items-center justify-between border-b border-white/10 backdrop-blur-md bg-black/20">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200 group"
        >
          <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">{t("analysis.back")}</span>
        </button>
        <img src="/evo-logo.png" alt="EvoTrex" className="h-6 w-auto object-contain" />
        <div className="w-20" />
      </header>

      <main className="px-4 md:px-8 lg:px-12 py-8 max-w-5xl mx-auto">
        <div className="mb-6 p-5 rounded-2xl backdrop-blur-xl bg-white/[0.05] border border-white/[0.08] fade-in-up">
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full" />
            {t("analysis.instructions")}
          </h2>
          <ol className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-medium">
                1
              </span>
              {t("analysis.step1")}
            </li>
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-medium">
                2
              </span>
              {t("analysis.step2")}
              <span className="flex items-center gap-1.5 text-foreground font-medium ml-1">
                <CryptoIcon ticker={ticker} size="xs" />
                {ticker}
              </span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-medium">
                3
              </span>
              {t("analysis.step3")}
            </li>
          </ol>
        </div>

        <div className="relative mb-6 rounded-2xl overflow-hidden">
          <div className="rounded-2xl overflow-hidden backdrop-blur-xl bg-white/[0.03] border border-white/[0.06]">
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
            <div className="overflow-hidden">
              <iframe
                ref={iframeRef}
                src="https://app.b2xfinance.com/auth/login"
                className={`w-full h-[700px] lg:h-[600px] scrollbar-none overflow-hidden ${
                  state === "analyzing" || state === "scanning" ? "opacity-30 scale-[0.99]" : "opacity-100 scale-100"
                }`}
                style={{ transition: "all 0.5s", overflow: "hidden" }}
                title={`Corretora - ${ticker}`}
                allowFullScreen
                allow="clipboard-write"
                scrolling="no"
              />

              <AnimatePresence>
                {(state === "analyzing" || state === "scanning") && (
                  <>
                    <motion.div
                      className="absolute left-0 right-0 h-[2px] pointer-events-none"
                      initial={{ top: 0 }}
                      animate={{ top: ["0%", "100%", "0%"] }}
                      transition={{
                        duration: 3,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                      style={{
                        background:
                          state === "scanning"
                            ? "linear-gradient(90deg, transparent, rgb(34, 197, 94), transparent)"
                            : "linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)",
                        boxShadow:
                          state === "scanning"
                            ? "0 0 15px 2px rgba(34, 197, 94, 0.5)"
                            : "0 0 15px 2px hsl(var(--primary) / 0.5)",
                      }}
                    />

                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                      style={{
                        background: `linear-gradient(0deg, transparent 24%, ${state === "scanning" ? "rgba(34, 197, 94, 0.03)" : "rgba(59, 130, 246, 0.03)"} 25%, ${state === "scanning" ? "rgba(34, 197, 94, 0.03)" : "rgba(59, 130, 246, 0.03)"} 26%, transparent 27%, transparent 74%, ${state === "scanning" ? "rgba(34, 197, 94, 0.03)" : "rgba(59, 130, 246, 0.03)"} 75%, ${state === "scanning" ? "rgba(34, 197, 94, 0.03)" : "rgba(59, 130, 246, 0.03)"} 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, ${state === "scanning" ? "rgba(34, 197, 94, 0.03)" : "rgba(59, 130, 246, 0.03)"} 25%, ${state === "scanning" ? "rgba(34, 197, 94, 0.03)" : "rgba(59, 130, 246, 0.03)"} 26%, transparent 27%, transparent 74%, ${state === "scanning" ? "rgba(34, 197, 94, 0.03)" : "rgba(59, 130, 246, 0.03)"} 75%, ${state === "scanning" ? "rgba(34, 197, 94, 0.03)" : "rgba(59, 130, 246, 0.03)"} 76%, transparent 77%, transparent)`,
                        backgroundSize: "50px 50px",
                      }}
                    />

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto"
                    >
                      <div
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg bg-background/90 backdrop-blur-sm border ${state === "scanning" ? "border-emerald-500/30" : "border-primary/30"}`}
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          className={state === "scanning" ? "text-emerald-500 shrink-0" : "text-primary shrink-0"}
                        >
                          <LoaderIcon className="w-4 h-4" />
                        </motion.div>
                        <motion.span className="text-sm text-foreground whitespace-nowrap">
                          {state === "scanning" ? t("analysis.scanningChart") : t("analysis.analyzing")}
                        </motion.span>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          {state === "idle" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="flex items-center gap-3 p-3 rounded-xl backdrop-blur-xl bg-white/[0.03] border border-white/[0.08]">
                <button
                  onClick={() => setIsConfirmedLoggedIn(!isConfirmedLoggedIn)}
                  className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                    isConfirmedLoggedIn ? "bg-primary" : "bg-white/10 border border-white/20"
                  }`}
                >
                  <motion.div
                    className={`absolute top-1 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                      isConfirmedLoggedIn ? "bg-white" : "bg-white/60"
                    }`}
                    animate={{ left: isConfirmedLoggedIn ? "calc(100% - 24px)" : "4px" }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    {isConfirmedLoggedIn ? (
                      <CheckCircleIcon className="w-3 h-3 text-primary" />
                    ) : (
                      <ShieldCheckIcon className="w-3 h-3 text-muted-foreground" />
                    )}
                  </motion.div>
                </button>
                <span
                  className={`text-sm transition-colors ${isConfirmedLoggedIn ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {isConfirmedLoggedIn ? t("analysis.loggedIn") : t("analysis.notLoggedIn")}
                </span>
              </div>

              <AnimatePresence>
                {showLoginWarning && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm"
                  >
                    <XIcon className="w-4 h-4 shrink-0" />
                    <span>{t("analysis.loginRequired")}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {state === "idle" && (
              <motion.button
                key="verify"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(59, 130, 246, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                onClick={handleVerify}
                className="px-8 py-4 rounded-xl backdrop-blur-xl text-sm font-medium tracking-wide uppercase flex items-center gap-2 transition-all duration-200 bg-white/[0.05] text-foreground border border-white/[0.1] hover:bg-white/[0.1] hover:border-primary/50 cursor-pointer"
              >
                <ShieldCheckIcon className="w-5 h-5" />
                {t("analysis.verify")}
              </motion.button>
            )}

            {state === "analyzing" && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-3 px-8 py-4 rounded-xl bg-primary/20 border border-primary/30"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <LoaderIcon className="w-5 h-5 text-primary" />
                </motion.div>
                <span className="text-sm text-foreground font-medium">{t("analysis.analyzing")}</span>
              </motion.div>
            )}

            {state === "scanning" && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-3 px-8 py-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <LoaderIcon className="w-5 h-5 text-emerald-500" />
                </motion.div>
                <span className="text-sm text-foreground font-medium">{t("analysis.scanningChart")}</span>
              </motion.div>
            )}

            {state === "complete" && (
              <motion.button
                key="analyze"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  boxShadow: "0 0 40px rgba(56, 189, 248, 0.5), 0 0 80px rgba(56, 189, 248, 0.2)",
                }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 50px rgba(56, 189, 248, 0.6), 0 0 100px rgba(56, 189, 248, 0.3)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAnalyze}
                className="px-8 py-4 rounded-xl text-sm font-medium tracking-wide uppercase flex items-center gap-2 transition-all duration-200 hover:bg-teal-400 text-white border border-teal-400/50 hover:shadow-lg hover:shadow-teal-500/30 cursor-pointer bg-sky-400"
              >
                <ChartBarIcon className="w-5 h-5" />
                {t("analysis.analyze")}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer showFlagMarquee={true} />

      <style jsx global>{`
        @keyframes gradient-flow {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 100% 50%;
          }
        }
        
        .scrollbar-none {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
