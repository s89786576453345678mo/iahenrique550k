"use client"

import { useRef } from "react"
import { useLanguage } from "@/lib/i18n"

// Latin America + Europe flags
const FLAGS = [
  "🇧🇷", // Brazil
  "🇦🇷", // Argentina
  "🇲🇽", // Mexico
  "🇨🇴", // Colombia
  "🇨🇱", // Chile
  "🇵🇪", // Peru
  "🇻🇪", // Venezuela
  "🇪🇨", // Ecuador
  "🇧🇴", // Bolivia
  "🇵🇾", // Paraguay
  "🇺🇾", // Uruguay
  "🇨🇷", // Costa Rica
  "🇵🇦", // Panama
  "🇬🇹", // Guatemala
  "🇭🇳", // Honduras
  "🇸🇻", // El Salvador
  "🇳🇮", // Nicaragua
  "🇩🇴", // Dominican Republic
  "🇨🇺", // Cuba
  // Europe
  "🇵🇹", // Portugal
  "🇪🇸", // Spain
  "🇫🇷", // France
  "🇩🇪", // Germany
  "🇮🇹", // Italy
  "🇬🇧", // United Kingdom
  "🇳🇱", // Netherlands
  "🇧🇪", // Belgium
  "🇨🇭", // Switzerland
  "🇦🇹", // Austria
  "🇵🇱", // Poland
  "🇸🇪", // Sweden
  "🇳🇴", // Norway
  "🇩🇰", // Denmark
  "🇫🇮", // Finland
  "🇮🇪", // Ireland
  "🇬🇷", // Greece
  "🇷🇴", // Romania
  "🇭🇺", // Hungary
  "🇨🇿", // Czech Republic
]

export function FlagMarquee() {
  const { t, language } = useLanguage()
  const scrollRef = useRef<HTMLDivElement>(null)

  const renderHighlightedText = () => {
    if (language === "pt") {
      return (
        <>
          Operações sem gale gerou mais de <span className="text-emerald-400 font-bold">$750k  </span> em mais de{" "}
          <span className="text-cyan-400 font-bold">30 países</span> pelo mundo
        </>
      )
    } else if (language === "en") {
      return (
        <>
          No-gale operations generated over <span className="text-emerald-400 font-bold">$678K</span> in more than{" "}
          <span className="text-cyan-400 font-bold">30 countries</span> worldwide
        </>
      )
    } else {
      return (
        <>
          Operaciones sin gale generó más de <span className="text-emerald-400 font-bold">$678 Mil</span> en más de{" "}
          <span className="text-cyan-400 font-bold">30 países</span> en el mundo
        </>
      )
    }
  }

  return (
    <div className="flex flex-col items-center gap-2 py-4">
      <p className="text-xs text-muted-foreground tracking-wide text-center px-4">{renderHighlightedText()}</p>

      <div className="relative w-full max-w-xs overflow-hidden">
        {/* Gradient masks for smooth edges */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* Scrolling flags container */}
        <div
          ref={scrollRef}
          className="flex gap-3 animate-marquee"
          style={{
            width: "max-content",
          }}
        >
          {/* First set of flags */}
          {FLAGS.map((flag, index) => (
            <span key={`flag-1-${index}`} className="text-lg select-none" style={{ lineHeight: 1 }}>
              {flag}
            </span>
          ))}
          {/* Duplicate set for seamless loop */}
          {FLAGS.map((flag, index) => (
            <span key={`flag-2-${index}`} className="text-lg select-none" style={{ lineHeight: 1 }}>
              {flag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
