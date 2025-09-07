import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useState, useEffect } from 'react'
import { getCompanyByUserId } from '../lib/data'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'user' | 'admin'
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, userProfile, loading, isAdmin } = useAuth()
  const [hasCompany, setHasCompany] = useState<boolean | null>(null)
  const [checkingCompany, setCheckingCompany] = useState(false)

  useEffect(() => {
    if (!user) {
      console.log('ProtectedRoute: No user found, setting hasCompany to null')
      setHasCompany(null)
      return
    }

    // If user is admin, they don't need a company profile
    if (isAdmin()) {
      console.log('ProtectedRoute: Admin user detected, skipping company check')
      setHasCompany(true)
      setCheckingCompany(false)
      return
    }

    // For regular users, actually check if they have a company profile
    checkCompanyProfile()
  }, [user, isAdmin])

  // Check company profile when component mounts
  useEffect(() => {
    if (user && !isAdmin()) {
      checkCompanyProfile()
    }
  }, [])

  const checkCompanyProfile = async () => {
    if (!user || isAdmin()) return

    setCheckingCompany(true)
    console.log('ProtectedRoute: Checking company profile for user:', user._id)
    
    try {
      const company = await getCompanyByUserId(user._id!)

      console.log('ProtectedRoute: Company profile query result:', company)

      if (company) {
        console.log('ProtectedRoute: Company profile found:', company)
        setHasCompany(true)
      } else {
        console.log('ProtectedRoute: No company profile found')
        setHasCompany(false)
      }
    } catch (err) {
      console.error('Error checking company profile:', err)
      setHasCompany(false)
    } finally {
      setCheckingCompany(false)
    }
  }

  if (loading || checkingCompany) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    console.log('ProtectedRoute: No user found, redirecting to login')
    return <Navigate to="/login" replace />
  }

  console.log('ProtectedRoute: User found:', user._id, 'UserProfile:', userProfile?._id, 'HasCompany:', hasCompany)

  if (!userProfile) {
    // User exists but no profile - allow access to dashboard for now
    console.log('ProtectedRoute: No user profile found, but allowing dashboard access')
  }

  // If user doesn't have a company profile and they're not admin and not already on the company form page, redirect them
  if (hasCompany === false && !isAdmin() && window.location.pathname !== '/company-form') {
    console.log('Regular user has no company profile, redirecting to company setup')
    return <Navigate to="/company-form" replace />
  }

  // If we're still checking company status, show loading
  if (hasCompany === null && !isAdmin()) {
    console.log('ProtectedRoute: Still checking company profile status...')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking company profile...</p>
        </div>
      </div>
    )
  }

  // Allow access to company form page
  if (window.location.pathname === '/company-form') {
    console.log('Allowing access to company form page')
    return <>{children}</>
  }

  // Check if user has required role
  if (requiredRole && userProfile) {
    if (requiredRole === 'admin' && userProfile.role !== 'admin') {
      return <Navigate to="/" replace />
    }
  }

  return <>{children}</>
}
