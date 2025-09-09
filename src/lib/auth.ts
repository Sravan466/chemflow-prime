import { User } from './mongodb'

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001'

export const authService = {
  async signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { user: null, error: data.error || 'Sign in failed' }
      }

      return { user: data.user, error: null }
    } catch (error: any) {
      console.error('Sign in error:', error)
      return { user: null, error: error.message || 'An unexpected error occurred during sign in' }
    }
  },

  async signUp(email: string, password: string, fullName: string): Promise<{ user: User | null; error: string | null }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, fullName }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { user: null, error: data.error || 'Sign up failed' }
      }

      return { user: data.user, error: null }
    } catch (error: any) {
      console.error('Sign up error:', error)
      return { user: null, error: error.message || 'An unexpected error occurred during sign up' }
    }
  },

  async getUserById(_id: string): Promise<User | null> {
    // This would need a separate API endpoint
    return null
  },

  async getUserByEmail(_email: string): Promise<User | null> {
    // This would need a separate API endpoint
    return null
  },

  async updateUserProfile(_id: string, _updates: Partial<User>): Promise<User | null> {
    // This would need a separate API endpoint
    return null
  },

  async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        return { error: data.error || 'Failed to request password reset' }
      }

      return { error: null }
    } catch (error: any) {
      console.error('Reset password error:', error)
      return { error: error.message || 'An unexpected error occurred' }
    }
  },
}