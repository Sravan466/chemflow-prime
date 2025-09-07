import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { createCompany } from '../lib/data'
import { Building2, MapPin, Phone, Mail, User, FileText, Hash } from 'lucide-react'

export default function CompanyFormPage() {
  const { user, refreshUserData } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if user is admin and auto-create admin profile
  useEffect(() => {
    if (user && (user.email === 'admin@chemindia.com' || user.email === 'sravankumarreddy466a@gmail.com')) {
      // Check if admin profile already exists
      checkAdminProfile()
    }
  }, [user])

  const checkAdminProfile = async () => {
    if (!user) return

    try {
      // For MongoDB, if user is admin, redirect directly
      if (user.role === 'admin') {
        navigate('/admin')
        return
      }
    } catch (error) {
      console.error('Error checking admin profile:', error)
    }
  }


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const companyData = {
      userId: user._id!,
      companyName: formData.get('company_name') as string,
      registrationNumber: formData.get('registration_number') as string,
      address: formData.get('address') as string,
      contactPerson: formData.get('contact_person') as string,
      contactPhone: formData.get('contact_phone') as string,
      officialEmail: formData.get('official_email') as string,
      industryType: formData.get('industry_type') as string,
      gstPan: formData.get('gst_pan') as string,
    }

    try {
      // Create company profile using MongoDB
      const companyResult = await createCompany(companyData)

      if (companyResult) {
        console.log('Company profile created successfully:', companyResult)
        // Show success message and redirect after a short delay
        setError(null)
        alert('Company profile created successfully! Redirecting to dashboard...')
        // Refresh user data to update company status
        await refreshUserData()
        // Use setTimeout to ensure the database transaction is complete
        setTimeout(() => {
          navigate('/', { replace: true })
        }, 1000)
      } else {
        setError('Failed to create company profile')
      }
    } catch (err: any) {
      console.error('Error creating company profile:', err)
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Show loading state for admin profile creation
  if (loading && (user?.email === 'admin@chemindia.com' || user?.email === 'sravankumarreddy466a@gmail.com')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up admin account...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Company Details
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please provide your company information to complete your registration
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Company Name */}
              <div className="sm:col-span-2">
                <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
                  Company Name *
                </label>
                <div className="mt-1 relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="company_name"
                    id="company_name"
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter company name"
                  />
                </div>
              </div>

              {/* Registration Number */}
              <div>
                <label htmlFor="registration_number" className="block text-sm font-medium text-gray-700">
                  Registration Number
                </label>
                <div className="mt-1 relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="registration_number"
                    id="registration_number"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Company registration number"
                  />
                </div>
              </div>

              {/* GST/PAN */}
              <div>
                <label htmlFor="gst_pan" className="block text-sm font-medium text-gray-700">
                  GST/PAN Number
                </label>
                <div className="mt-1 relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="gst_pan"
                    id="gst_pan"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="GST or PAN number"
                  />
                </div>
              </div>

              {/* Industry Type */}
              <div className="sm:col-span-2">
                <label htmlFor="industry_type" className="block text-sm font-medium text-gray-700">
                  Industry Type
                </label>
                <select
                  name="industry_type"
                  id="industry_type"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">Select industry type</option>
                  <option value="Chemical Manufacturing">Chemical Manufacturing</option>
                  <option value="Pharmaceutical">Pharmaceutical</option>
                  <option value="Petrochemical">Petrochemical</option>
                  <option value="Textile">Textile</option>
                  <option value="Food Processing">Food Processing</option>
                  <option value="Agriculture">Agriculture</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Company Address
                </label>
                <div className="mt-1 relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <textarea
                    name="address"
                    id="address"
                    rows={3}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter complete company address"
                  />
                </div>
              </div>

              {/* Contact Person */}
              <div>
                <label htmlFor="contact_person" className="block text-sm font-medium text-gray-700">
                  Contact Person *
                </label>
                <div className="mt-1 relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="contact_person"
                    id="contact_person"
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Contact person name"
                  />
                </div>
              </div>

              {/* Contact Phone */}
              <div>
                <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700">
                  Contact Phone
                </label>
                <div className="mt-1 relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    name="contact_phone"
                    id="contact_phone"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Phone number"
                  />
                </div>
              </div>

              {/* Official Email */}
              <div className="sm:col-span-2">
                <label htmlFor="official_email" className="block text-sm font-medium text-gray-700">
                  Official Email
                </label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="official_email"
                    id="official_email"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Company email address"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
                <div className="mt-2">
                  <button
                    onClick={() => window.location.href = '/'}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Try going to dashboard manually
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={async () => {
                    console.log('Debug: Checking if company profile exists...')
                    try {
                      const { getCompanyByUserId } = await import('../lib/data')
                      const company = await getCompanyByUserId(user?._id!)
                      console.log('Debug: Company profile check result:', company)
                    } catch (error) {
                      console.log('Debug: Company profile check error:', error)
                    }
                  }}
                  className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700"
                >
                  Debug: Check Company
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    console.log('Debug: Current user data:', user)
                  }}
                  className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700"
                >
                  Debug: Check User
                </button>
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Company Details'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
