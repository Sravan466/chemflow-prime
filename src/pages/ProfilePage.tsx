import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Company } from '../lib/mongodb'
import { getCompanyByUserId } from '../lib/data'
import { User, Building2, LogOut } from 'lucide-react'

export default function ProfilePage() {
  const { user, userProfile, signOut, isAdmin } = useAuth()
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && !isAdmin()) {
      fetchCompany()
    } else {
      setLoading(false)
    }
  }, [user, isAdmin])

  const fetchCompany = async () => {
    if (!user) return

    try {
      const companyData = await getCompanyByUserId(user._id!)
      setCompany(companyData)
    } catch (err) {
      console.error('Error fetching company:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
              <button
                onClick={handleSignOut}
                className="flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div>
                <div className="flex items-center mb-4">
                  <User className="h-5 w-5 text-gray-400 mr-2" />
                  <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-sm text-gray-900">{userProfile?.name || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{userProfile?.role || 'user'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Account Created</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Company Information (only for regular users) */}
              {!isAdmin() && (
                <div>
                  <div className="flex items-center mb-4">
                    <Building2 className="h-5 w-5 text-gray-400 mr-2" />
                    <h2 className="text-lg font-medium text-gray-900">Company Information</h2>
                  </div>
                  
                  {company ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Company Name</label>
                        <p className="mt-1 text-sm text-gray-900">{company.companyName}</p>
                      </div>
                      
                      {company.registrationNumber && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Registration Number</label>
                          <p className="mt-1 text-sm text-gray-900">{company.registrationNumber}</p>
                        </div>
                      )}
                      
                      {company.industryType && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Industry Type</label>
                          <p className="mt-1 text-sm text-gray-900">{company.industryType}</p>
                        </div>
                      )}
                      
                      {company.contactPerson && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                          <p className="mt-1 text-sm text-gray-900">{company.contactPerson}</p>
                        </div>
                      )}
                      
                      {company.contactPhone && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
                          <p className="mt-1 text-sm text-gray-900">{company.contactPhone}</p>
                        </div>
                      )}
                      
                      {company.officialEmail && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Official Email</label>
                          <p className="mt-1 text-sm text-gray-900">{company.officialEmail}</p>
                        </div>
                      )}
                      
                      {company.address && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Address</label>
                          <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">{company.address}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No company information</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Company details have not been provided yet.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
