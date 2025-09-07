import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '../lib/mongodb'
import { authService } from '../lib/auth'
import { getCompanyByUserId } from '../lib/data'

interface AuthContextType {
  user: User | null
  userProfile: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
  isAdmin: () => boolean
  hasCompany: () => Promise<boolean>
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session in localStorage
    const savedUser = localStorage.getItem('chemflow_user')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        setUserProfile(userData)
        console.log('Restored user from localStorage:', userData)
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('chemflow_user')
      }
    }
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      console.log('Attempting to sign in user:', email)
      
      const { user: authenticatedUser, error } = await authService.signIn(email, password)
      
      if (authenticatedUser && !error) {
        setUser(authenticatedUser)
        setUserProfile(authenticatedUser)
        
        // Save to localStorage
        localStorage.setItem('chemflow_user', JSON.stringify(authenticatedUser))
        
        console.log('Sign in successful:', authenticatedUser)
        return { error: null }
      } else {
        console.log('Sign in failed:', error)
        return { error: { message: error || 'Invalid email or password' } }
      }
    } catch (error) {
      console.error('Sign in error:', error)
      return { error: { message: 'An error occurred during sign in' } }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true)
      console.log('Attempting to sign up user:', email)
      
      const { user: newUser, error } = await authService.signUp(email, password, fullName)
      
      if (newUser && !error) {
        setUser(newUser)
        setUserProfile(newUser)
        
        // Save to localStorage
        localStorage.setItem('chemflow_user', JSON.stringify(newUser))
        
        console.log('Sign up successful:', newUser)
        return { error: null }
      } else {
        return { error: { message: error || 'Failed to create user' } }
      }
    } catch (error: any) {
      console.error('Sign up error:', error)
      return { error: { message: error.message || 'An error occurred during sign up' } }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setUser(null)
      setUserProfile(null)
      localStorage.removeItem('chemflow_user')
      console.log('User signed out successfully')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await authService.resetPassword(email)
      return { error: error ? { message: error } : null }
    } catch (error: any) {
      return { error: { message: error.message || 'Password reset failed' } }
    }
  }

  const isAdmin = (): boolean => {
    return user?.role === 'admin'
  }

  const hasCompany = async (): Promise<boolean> => {
    if (!user) return false

    try {
      const company = await getCompanyByUserId(user._id!)
      return !!company
    } catch (error) {
      console.error('Error checking company:', error)
      return false
    }
  }

  const refreshUserData = async (): Promise<void> => {
    // This function can be called to refresh user data after company creation
    // For now, it just triggers a re-render by updating the loading state briefly
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 100)
  }

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    isAdmin,
    hasCompany,
    refreshUserData
  }

  return (
    <AuthContext.Provider value={value}>
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