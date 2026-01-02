"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type Language = "pt" | "en" | "es"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  isChanging: boolean // Added state to track language change animation
}

const translations: Record<Language, Record<string, string>> = {
  pt: {
    // Header
    "header.subtitle": "Inteligencia Artificial para Trading",

    // Dashboard
    "dashboard.signals": "Sinais disponiveis",
    "dashboard.opportunity": "Oportunidade",
    "dashboard.analyzed": "Analisado",
    "dashboard.tradersProfit": "traders lucraram",
    "dashboard.operationsNoGale": "Operações sem gale",
    "dashboard.consecutive": "seguidas",

    // Crypto names
    "crypto.bitcoin": "Bitcoin",
    "crypto.ethereum": "Ethereum",
    "crypto.xrp": "XRP",
    "crypto.solana": "Solana",

    // Trends
    "trend.high": "Alta",
    "trend.low": "Baixa",
    "trend.lateral": "Lateral",

    // Footer
    "footer.warning": "Aviso:",
    "footer.warningText": "Sinais da Evotrex funcionam exclusivamente na B2X Finance",
    "footer.rights": "Todos os direitos reservados",
    "footer.terms": "Termos de uso",
    "footer.privacy": "Politica de privacidade",
    "footer.support": "Suporte",
    "footer.profited": "lucrados por traders",
    "footer.noGaleProfit": "Operações sem gale gerou mais de $678 Mil em mais de 30 países pelo mundo",

    // Banner
    "banner.placeholder": "Banner",

    // Analysis View
    "analysis.back": "Voltar",
    "analysis.instructions": "Instruções",
    "analysis.step1": "Faça login na corretora abaixo",
    "analysis.step2": "Navegue até o par",
    "analysis.step3": "Clique em Verificar quando estiver pronto",
    "analysis.verify": "Verificar",
    "analysis.verifying": "Verificando sessao",
    "analysis.analyze": "Analisar Grafico",
    "analysis.analyzing": "Analisando",
    "analysis.connecting": "Conectando com a IA",
    "analysis.scanning": "Escaneando padroes do grafico",
    "analysis.trends": "Analisando tendencias",
    "analysis.calculating": "Calculando probabilidades",
    "analysis.generating": "Gerando sinal",
    "analysis.scanningChart": "Escaneando gráfico",
    "analysis.completed": "concluido",
    "analysis.loginError": "Login necessário",
    "analysis.loginErrorDesc":
      "Você precisa fazer login na corretora antes de verificar Faça o login no iframe acima e tente novamente",
    "analysis.tryAgain": "Tentar novamente",
    "analysis.loggedIn": "Estou logado na corretora",
    "analysis.notLoggedIn": "Marque após fazer login",
    "analysis.loginRequired": "Confirme que está logado antes de verificar",
    "analysis.openSignal": "Abrir Sinal",

    // Results View
    "results.newAnalysis": "Nova analise",
    "results.signal": "Sinal",
    "results.buy": "Comprar",
    "results.sell": "Vender",
    "results.time": "Tempo",
    "results.min": "min",
    "results.payout": "Payout",
    "results.confidence": "Confianca",
    "results.otherPredictions": "Outras previsões",
    "results.prob": "Prob",
    "results.volat": "Volat",
    "results.motivationalCopy":
      "É exatamente nesses sinais que a Evotrex constrói resultados consistentes todos os dias",
    "results.entryTime": "Entrada",
    "results.expiration": "Expira em",
    "results.expired": "Expirado",
    "results.timeframe": "Timeframe",
    "results.hideSignal": "Ocultar",
    "results.showSignal": "Mostrar",
    "results.entry": "Entrada",
    "results.expires": "Expira em",
    "results.expiresIn": "Expira em",
    "results.grabOpportunity": "Pegar Oportunidade",
    "results.viewDetails": "Ver Detalhes",
    "results.locked": "Bloqueado",
    "results.wait": "Aguarde...",
    "results.unlocking": "Liberando...",
    "results.grabbingOpportunity": "Pegando oportunidade...",

    // Re-analysis Popup
    "popup.analyzing": "Analisando mercado",
    "popup.searching": "Buscando novas oportunidades",
    "popup.noOpportunity": "Sem oportunidades",
    "popup.noOpportunityText": "Não há novas oportunidades para",
    "popup.noOpportunityText2": "no momento Aguarde a próxima análise dos pares",
    "popup.understood": "Entendi",
    "popup.opportunityFound": "Oportunidade encontrada",
    "popup.opportunityText": "AI identificou uma oportunidade única de lucro para",
    "popup.analyzeNow": "Analisar agora",

    // Language selector
    "language.select": "Idioma",
  },
  en: {
    // Header
    "header.subtitle": "Artificial Intelligence for Trading",

    // Dashboard
    "dashboard.signals": "Available Signals",
    "dashboard.opportunity": "Opportunity",
    "dashboard.analyzed": "Analyzed",
    "dashboard.tradersProfit": "traders profited",
    "dashboard.operationsNoGale": "No-gale operations",
    "dashboard.consecutive": "consecutive",

    // Crypto names
    "crypto.bitcoin": "Bitcoin",
    "crypto.ethereum": "Ethereum",
    "crypto.xrp": "XRP",
    "crypto.solana": "Solana",

    // Trends
    "trend.high": "High",
    "trend.low": "Low",
    "trend.lateral": "Lateral",

    // Footer
    "footer.warning": "Warning",
    "footer.warningText": "Evotrex signals work exclusively on B2X Finance",
    "footer.rights": "All rights reserved",
    "footer.terms": "Terms of use",
    "footer.privacy": "Privacy policy",
    "footer.support": "Support",
    "footer.profited": "profited by traders",
    "footer.noGaleProfit": "No-gale operations generated over $678K in more than 30 countries worldwide",

    // Banner
    "banner.placeholder": "Banner",

    // Analysis View
    "analysis.back": "Back",
    "analysis.instructions": "Instructions",
    "analysis.step1": "Log in to the broker below",
    "analysis.step2": "Navigate to the pair",
    "analysis.step3": "Click Verify when ready",
    "analysis.verify": "Verify",
    "analysis.verifying": "Verifying session",
    "analysis.analyze": "Analyze Chart",
    "analysis.analyzing": "Analyzing",
    "analysis.connecting": "Connecting to AI",
    "analysis.scanning": "Scanning chart patterns",
    "analysis.trends": "Analyzing trends",
    "analysis.calculating": "Calculating probabilities",
    "analysis.generating": "Generating signal",
    "analysis.scanningChart": "Scanning chart",
    "analysis.completed": "completed",
    "analysis.loginError": "Login required",
    "analysis.loginErrorDesc":
      "You need to log in to the broker before verifying Log in using the iframe above and try again",
    "analysis.tryAgain": "Try again",
    "analysis.loggedIn": "I'm logged into the broker",
    "analysis.notLoggedIn": "Check after logging in",
    "analysis.loginRequired": "Confirm you are logged in before verifying",
    "analysis.openSignal": "Open Signal",

    // Results View
    "results.newAnalysis": "New analysis",
    "results.signal": "Signal",
    "results.buy": "Buy",
    "results.sell": "Sell",
    "results.time": "Time",
    "results.min": "min",
    "results.payout": "Payout",
    "results.confidence": "Confidence",
    "results.otherPredictions": "Other predictions",
    "results.prob": "Prob",
    "results.volat": "Volat",
    "results.motivationalCopy": "It's exactly in these signals that Evotrex builds consistent results every day",
    "results.entryTime": "Entry",
    "results.expiration": "Expires in",
    "results.expired": "Expired",
    "results.timeframe": "Timeframe",
    "results.hideSignal": "Hide",
    "results.showSignal": "Show",
    "results.entry": "Entry",
    "results.expires": "Expires in",
    "results.expiresIn": "Expires in",
    "results.grabOpportunity": "Grab Opportunity",
    "results.viewDetails": "View Details",
    "results.locked": "Locked",
    "results.wait": "Wait...",
    "results.unlocking": "Unlocking...",
    "results.grabbingOpportunity": "Grabbing opportunity...",

    // Re-analysis Popup
    "popup.analyzing": "Analyzing market",
    "popup.searching": "Searching for new opportunities",
    "popup.noOpportunity": "No opportunities",
    "popup.noOpportunityText": "There are no new opportunities for",
    "popup.noOpportunityText2": "at the moment Wait for the next pair analysis",
    "popup.understood": "Got it",
    "popup.opportunityFound": "Opportunity found",
    "popup.opportunityText": "AI identified a unique profit opportunity for",
    "popup.analyzeNow": "Analyze now",

    // Language selector
    "language.select": "Language",
  },
  es: {
    // Header
    "header.subtitle": "Inteligencia Artificial para Trading",

    // Dashboard
    "dashboard.signals": "Señales disponibles",
    "dashboard.opportunity": "Oportunidad",
    "dashboard.analyzed": "Analizado",
    "dashboard.tradersProfit": "traders lucraron",
    "dashboard.operationsNoGale": "Operaciones sin gale",
    "dashboard.consecutive": "consecutivas",

    // Crypto names
    "crypto.bitcoin": "Bitcoin",
    "crypto.ethereum": "Ethereum",
    "crypto.xrp": "XRP",
    "crypto.solana": "Solana",

    // Trends
    "trend.high": "Alta",
    "trend.low": "Baja",
    "trend.lateral": "Lateral",

    // Footer
    "footer.warning": "Aviso",
    "footer.warningText": "Las señales de Evotrex funcionan exclusivamente en B2X Finance",
    "footer.rights": "Todos los derechos reservados",
    "footer.terms": "Términos de uso",
    "footer.privacy": "Política de privacidad",
    "footer.support": "Soporte",
    "footer.profited": "lucrados por traders",
    "footer.noGaleProfit": "Operaciones sin gale generó más de $678 Mil en más de 30 países en el mundo",

    // Banner
    "banner.placeholder": "Banner",

    // Analysis View
    "analysis.back": "Volver",
    "analysis.instructions": "Instrucciones",
    "analysis.step1": "Inicia sesión en el corredor a continuación",
    "analysis.step2": "Navega hasta el par",
    "analysis.step3": "Haz clic en Verificar cuando estés listo",
    "analysis.verify": "Verificar",
    "analysis.verifying": "Verificando sesión",
    "analysis.analyze": "Analizar Gráfico",
    "analysis.analyzing": "Analizando",
    "analysis.connecting": "Conectando con la IA",
    "analysis.scanning": "Escaneando patrones del gráfico",
    "analysis.trends": "Analizando tendencias",
    "analysis.calculating": "Calculando probabilidades",
    "analysis.generating": "Generando señal",
    "analysis.scanningChart": "Escaneando gráfico",
    "analysis.completed": "completado",
    "analysis.loginError": "Inicio de sesión requerido",
    "analysis.loginErrorDesc":
      "Debes iniciar sesión en el corredor antes de verificar Inicia sesión en el iframe de arriba e intenta de nuevo",
    "analysis.tryAgain": "Intentar de nuevo",
    "analysis.loggedIn": "Estoy conectado al corredor",
    "analysis.notLoggedIn": "Marcar después de iniciar sesión",
    "analysis.loginRequired": "Confirma que has iniciado sesión antes de verificar",
    "analysis.openSignal": "Abrir Señal",

    // Results View
    "results.newAnalysis": "Nuevo análisis",
    "results.signal": "Señal",
    "results.buy": "Comprar",
    "results.sell": "Vender",
    "results.time": "Tiempo",
    "results.min": "min",
    "results.payout": "Payout",
    "results.confidence": "Confianza",
    "results.otherPredictions": "Otras predicciones",
    "results.prob": "Prob",
    "results.volat": "Volat",
    "results.motivationalCopy":
      "Es exactamente en estas señales que Evotrex construye resultados consistentes todos los días",
    "results.entryTime": "Entrada",
    "results.expiration": "Expira en",
    "results.expired": "Expirado",
    "results.timeframe": "Timeframe",
    "results.hideSignal": "Ocultar",
    "results.showSignal": "Mostrar",
    "results.entry": "Entrada",
    "results.expires": "Expira en",
    "results.expiresIn": "Expira en",
    "results.grabOpportunity": "Tomar Oportunidad",
    "results.viewDetails": "Ver Detalles",
    "results.locked": "Bloqueado",
    "results.wait": "Espere...",
    "results.unlocking": "Desbloqueando...",
    "results.grabbingOpportunity": "Tomando oportunidad...",

    // Re-analysis Popup
    "popup.analyzing": "Analizando mercado",
    "popup.searching": "Buscando nuevas oportunidades",
    "popup.noOpportunity": "Sin oportunidades",
    "popup.noOpportunityText": "No hay nuevas oportunidades para",
    "popup.noOpportunityText2": "en este momento Espera el próximo análisis de pares",
    "popup.understood": "Entendido",
    "popup.opportunityFound": "¡Oportunidad encontrada!",
    "popup.opportunityText": "La IA identificó una oportunidad única de ganancia para",
    "popup.analyzeNow": "Analizar ahora",

    // Language selector
    "language.select": "Idioma",
  },
}

const LanguageContext = createContext<LanguageContextType>({
  language: "pt",
  setLanguage: () => {},
  t: (key: string) => translations.pt[key] || key,
  isChanging: false, // Added default value
})

const LANGUAGE_STORAGE_KEY = "evotrex_language"

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("pt")
  const [isChanging, setIsChanging] = useState(false) // Track animation state

  useEffect(() => {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null
    if (stored && ["pt", "en", "es"].includes(stored)) {
      setLanguageState(stored)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    if (lang === language) return
    setIsChanging(true)

    // Wait for scramble animation to complete before changing language
    setTimeout(() => {
      setLanguageState(lang)
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)

      // Keep isChanging true during unscramble
      setTimeout(() => {
        setIsChanging(false)
      }, 800)
    }, 600)
  }

  const t = (key: string): string => {
    return translations[language][key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isChanging }}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
