"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

interface SignalTimerProps {
  onTimerComplete: () => void
  onProgressChange?: (progress: number) => void // Add callback for progress
}

export function SignalTimer({ onTimerComplete, onProgressChange }: SignalTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0 })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const currentMinutes = now.getMinutes()
      const currentSeconds = now.getSeconds()

      // Calcular próximo intervalo de 15 minutos (0, 15, 30, 45)
      const nextInterval = Math.ceil((currentMinutes + 1) / 15) * 15
      const targetMinute = nextInterval >= 60 ? 0 : nextInterval

      let minutesLeft = targetMinute - currentMinutes - 1
      let secondsLeft = 60 - currentSeconds

      if (secondsLeft === 60) {
        secondsLeft = 0
        minutesLeft += 1
      }

      if (minutesLeft < 0) {
        minutesLeft = 14
      }

      return { minutes: minutesLeft, seconds: secondsLeft }
    }

    // Calcular tempo inicial
    setTimeLeft(calculateTimeLeft())

    const interval = setInterval(() => {
      const newTimeLeft = calculateTimeLeft()
      setTimeLeft(newTimeLeft)

      // Calcular progresso (0 a 1)
      const totalSeconds = newTimeLeft.minutes * 60 + newTimeLeft.seconds
      const progress = totalSeconds / (15 * 60)
      onProgressChange?.(progress)

      // Quando o timer zerar, chamar callback
      if (newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
        onTimerComplete()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [onTimerComplete, onProgressChange])

  const formatNumber = (num: number) => num.toString().padStart(2, "0")

  // Calcular progresso (0 a 1)
  const totalSeconds = timeLeft.minutes * 60 + timeLeft.seconds
  const progress = totalSeconds / (15 * 60)

  return (
    <div className="flex items-center gap-2">
      {/* Timer circular */}
      <div className="relative w-10 h-10">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          {/* Background circle */}
          <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted/20" />
          {/* Progress circle */}
          <circle
            cx="18"
            cy="18"
            r="15"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={`${progress * 94.2} 94.2`}
            className="transition-all duration-1000"
            style={{ filter: "drop-shadow(0 0 4px rgba(59, 130, 246, 0.5))" }}
          />
        </svg>
        <Clock className="absolute inset-0 m-auto w-4 h-4 text-primary" />
      </div>

      {/* Timer display */}
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold text-foreground tabular-nums">
          {formatNumber(timeLeft.minutes)}:{formatNumber(timeLeft.seconds)}
        </span>
      </div>
    </div>
  )
}
