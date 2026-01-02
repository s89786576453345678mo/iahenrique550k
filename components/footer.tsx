"use client"

import { useLanguage } from "@/lib/i18n"
import { LanguageSelector } from "./language-selector"
import { MatrixText } from "./matrix-text"
import { FlagMarquee } from "./flag-marquee"

interface FooterProps {
  showFlagMarquee?: boolean
}

export function Footer({ showFlagMarquee = true }: FooterProps) {
  const currentYear = new Date().getFullYear()
  const { t } = useLanguage()

  return (
    <footer className="mt-auto">
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12 py-8">
        <div className="flex justify-center mb-6">
          <LanguageSelector />
        </div>

        {showFlagMarquee && <FlagMarquee />}

        <div className="mb-4 py-2.5 flex items-start md:items-center gap-3">
          <span className="w-5 h-5 min-w-5 min-h-5 shrink-0 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">
            !
          </span>
          <p className="text-xs text-muted-foreground">
            <span className="text-primary font-medium">
              <MatrixText delay={700}>{t("footer.warning")}</MatrixText>
            </span>{" "}
            <MatrixText delay={750}>{t("footer.warningText")}</MatrixText>
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <img src="/evo-logo.png" alt="EvoTrex" className="h-4 w-auto object-contain" />
            <span className="text-glass-border">|</span>
            <span>
              {currentYear} <MatrixText delay={800}>{t("footer.rights")}</MatrixText>
            </span>
          </div>

          <div className="flex items-center flex-wrap justify-center gap-4 md:gap-6">
            <span className="hover:text-primary transition-colors cursor-pointer">
              <MatrixText delay={850}>{t("footer.terms")}</MatrixText>
            </span>
            <span className="hover:text-primary transition-colors cursor-pointer">
              <MatrixText delay={900}>{t("footer.privacy")}</MatrixText>
            </span>
            <span className="hover:text-primary transition-colors cursor-pointer">
              <MatrixText delay={950}>{t("footer.support")}</MatrixText>
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
