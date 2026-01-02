"use client"

interface SparklineProps {
  data: number[]
  isPositive: boolean
  isHighlighted: boolean
}

export function Sparkline({ data, isPositive, isHighlighted }: SparklineProps) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = 100 - ((value - min) / range) * 100
      return `${x},${y}`
    })
    .join(" ")

  const strokeColor = isHighlighted ? "#FFD166" : isPositive ? "#4ade80" : "#f87171"

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
      <defs>
        <linearGradient
          id={`gradient-${isHighlighted ? "gold" : isPositive ? "green" : "red"}`}
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <polygon
        points={`0,100 ${points} 100,100`}
        fill={`url(#gradient-${isHighlighted ? "gold" : isPositive ? "green" : "red"})`}
      />

      {/* Line */}
      <polyline points={points} fill="none" stroke={strokeColor} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
