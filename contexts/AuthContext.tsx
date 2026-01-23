"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { userService, type User } from '@/lib/data/user-service'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (pinCode: string) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('auth_user')
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('auth_user')
      }
    }
    setLoading(false)
  }, [])

  const signIn = async (pinCode: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinCode }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Invalid email or PIN code')
      }

      const verifiedUser = await response.json()
      
      // Store user in localStorage and cookie
      const userToStore = {
        id: verifiedUser.id,
        email: verifiedUser.email,
        name: verifiedUser.name,
        role: verifiedUser.role,
      }
      localStorage.setItem('auth_user', JSON.stringify(userToStore))
      
      // Set cookie for middleware
      document.cookie = `auth_user=${JSON.stringify(userToStore)}; path=/; max-age=86400`
      
      setUser(verifiedUser)
      router.push('/')
      router.refresh()
    } catch (error: any) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      localStorage.removeItem('auth_user')
      setUser(null)
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  const refreshUser = async () => {
    if (!user) return
    try {
      const updatedUser = await userService.getById(user.id)
      if (updatedUser) {
        const userToStore = {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
        }
        localStorage.setItem('auth_user', JSON.stringify(userToStore))
        setUser(updatedUser)
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
