import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ProtectedRoute } from './ProtectedRoute'
import LoginPage from '../pages/LoginPage'
import CompanyFormPage from '../pages/CompanyFormPage'
import DashboardPage from '../pages/DashboardPage'
import DataEntryPage from '../pages/DataEntryPage'
import ProfilePage from '../pages/ProfilePage'
import AdminDashboardPage from '../pages/AdminDashboardPage'
import NotFoundPage from '../pages/NotFoundPage'
import { useEffect, useState } from 'react'

export function AppRouter() {
  const { user, userProfile, loading, isAdmin, hasCompany } = useAuth()
  const [userHasCompany, setUserHasCompany] = useState<boolean | null>(null)

  // Check if user has company when user profile is loaded
  useEffect(() => {
    if (user && userProfile && !isAdmin()) {
      hasCompany().then(setUserHasCompany)
    } else if (isAdmin()) {
      setUserHasCompany(true) // Admins don't need company
    } else if (user && !userProfile) {
      // User is authenticated but has no profile - redirect to company form
      setUserHasCompany(false)
    }
  }, [user, userProfile, isAdmin, loading]) // Added loading to dependencies

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If not logged in, show login page
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  // If user is logged in but has no profile, redirect to company form
  if (user && !userProfile) {
    return (
      <Routes>
        <Route path="/company-form" element={<CompanyFormPage />} />
        <Route path="*" element={<Navigate to="/company-form" replace />} />
      </Routes>
    )
  }

  // If admin, redirect to admin dashboard
  if (isAdmin()) {
    return (
      <Routes>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    )
  }

  // For regular users, check if they have company details
  return (
    <Routes>
      <Route path="/company-form" element={<CompanyFormPage />} />
      <Route path="/" element={
        <ProtectedRoute>
          {userHasCompany ? <DashboardPage /> : <Navigate to="/company-form" replace />}
        </ProtectedRoute>
      } />
      <Route path="/submit" element={
        <ProtectedRoute>
          {userHasCompany ? <DataEntryPage /> : <Navigate to="/company-form" replace />}
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
