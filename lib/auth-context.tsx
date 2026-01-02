"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"

interface AuthContextType {
  isAuthenticated: boolean
  login: (email: string, password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Credenciais fixas
const VALID_EMAIL = "123456@gmail.com"
const VALID_PASSWORD = "123456"

const SESSION_TIMEOUT = 10 * 60 * 1000

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const logout = useCallback(() => {
    setIsAuthenticated(false)
    sessionStorage.removeItem("evotrex_auth")
    sessionStorage.removeItem("evotrex_auth_time")
  }, [])

  useEffect(() => {
    const authStatus = sessionStorage.getItem("evotrex_auth")
    const authTime = sessionStorage.getItem("evotrex_auth_time")

    if (authStatus === "true" && authTime) {
      const loginTime = Number.parseInt(authTime, 10)
      const now = Date.now()

      // Verificar se passou mais de 10 minutos
      if (now - loginTime < SESSION_TIMEOUT) {
        setIsAuthenticated(true)
      } else {
        // Sessão expirada
        logout()
      }
    }
    setIsLoading(false)
  }, [logout])

  useEffect(() => {
    if (!isAuthenticated) return

    const checkExpiration = () => {
      const authTime = sessionStorage.getItem("evotrex_auth_time")
      if (authTime) {
        const loginTime = Number.parseInt(authTime, 10)
        const now = Date.now()

        if (now - loginTime >= SESSION_TIMEOUT) {
          logout()
        }
      }
    }

    const interval = setInterval(checkExpiration, 30000) // Verifica a cada 30 segundos

    return () => clearInterval(interval)
  }, [isAuthenticated, logout])

  const login = (email: string, password: string): boolean => {
    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      setIsAuthenticated(true)
      sessionStorage.setItem("evotrex_auth", "true")
      sessionStorage.setItem("evotrex_auth_time", Date.now().toString())
      return true
    }
    return false
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return <AuthContext.Provider value={{ isAuthenticated, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
