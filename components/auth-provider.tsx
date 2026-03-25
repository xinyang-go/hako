"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react"
import type { UserWithoutPassword, UserUpdateData } from "@/types"

interface AuthContextType {
  user: UserWithoutPassword | null
  token: string | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (data: UserUpdateData) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserWithoutPassword | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem("auth-token")
    if (storedToken) {
      validateToken(storedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  const validateToken = async (authToken: string) => {
    try {
      const response = await fetch("/api/auth", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setToken(authToken)
      } else {
        localStorage.removeItem("auth-token")
      }
    } catch {
      localStorage.removeItem("auth-token")
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (username: string, password: string) => {
    const response = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Login failed")
    }

    const data = await response.json()
    setUser(data.user)
    setToken(data.token)
    localStorage.setItem("auth-token", data.token)
  }

  const logout = async () => {
    await fetch("/api/auth", { method: "DELETE" })
    setUser(null)
    setToken(null)
    localStorage.removeItem("auth-token")
    window.location.href = "/login"
  }

  const updateUser = async (data: UserUpdateData) => {
    if (!token) throw new Error("Not authenticated")

    const response = await fetch("/api/user", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Update failed")
    }

    const result = await response.json()
    setUser(result.user)
  }

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
