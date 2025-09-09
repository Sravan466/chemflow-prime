import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Submission, Company } from '../lib/mongodb'
import { getSubmissionsByUserId, getCompanyByUserId } from '../lib/data'
import { 
  BarChart3, 
  FileText, 
  Plus, 
  Download, 
  Filter,
  Calendar,
  Clock,
  User,
  LogOut,
  Settings,
  Building2
} from 'lucide-react'
import { format, startOfMonth, endOfMonth } from 'date-fns'

export default function DashboardPage() {
  const { user, userProfile, signOut } = useAuth()
  const navigate = useNavigate()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    thisMonth: 0,
    pending: 0,
    approved: 0
  })
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    chemicalName: '',
    status: '',
    department: ''
  })

  useEffect(() => {
    if (user) {
      fetchData()
    } else {
      setLoading(false)
    }

    // Fallback timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('Dashboard: Loading timeout - setting loading to false')
      setLoading(false)
    }, 5000)

    return () => clearTimeout(timeout)
  }, [user, filters])

  const fetchData = async () => {
    try {
      // Fetch company profile
      const companyData = await getCompanyByUserId(user?._id!)
      setCompany(companyData)

      // Fetch user's submissions
      const userSubmissions = await getSubmissionsByUserId(user?._id!)
      
      // Apply filters
      let filteredSubmissions = userSubmissions

      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom)
        filteredSubmissions = filteredSubmissions.filter(sub => 
          new Date(sub.createdAt) >= fromDate
        )
      }
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo)
        filteredSubmissions = filteredSubmissions.filter(sub => 
          new Date(sub.createdAt) <= toDate
        )
      }
      if (filters.chemicalName) {
        filteredSubmissions = filteredSubmissions.filter(sub => 
          sub.chemicalName.toLowerCase().includes(filters.chemicalName.toLowerCase())
        )
      }
      if (filters.status) {
        filteredSubmissions = filteredSubmissions.filter(sub => 
          sub.status === filters.status
        )
      }
      if (filters.department) {
        filteredSubmissions = filteredSubmissions.filter((sub: any) => 
          sub.department_role === filters.department
        )
      }

      setSubmissions(filteredSubmissions)

      // Calculate stats
      const now = new Date()
      const startOfThisMonth = startOfMonth(now)
      const endOfThisMonth = endOfMonth(now)

      const thisMonthSubmissions = userSubmissions.filter(sub => {
        const submissionDate = new Date(sub.createdAt)
        return submissionDate >= startOfThisMonth && submissionDate <= endOfThisMonth
      })

      setStats({
        totalSubmissions: userSubmissions.length,
        thisMonth: thisMonthSubmissions.length,
        pending: userSubmissions.filter(s => s.status === 'submitted').length,
        approved: userSubmissions.filter(s => s.status === 'approved').length
      })

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    if (submissions.length === 0) return

    const headers = [
      'Chemical Name',
      'CAS Number',
      'Quantity',
      'Unit',
      'Purity',
      'Hazard Class',
      'Status',
      'Submitted Date'
    ]

    const csvContent = [
      headers.join(','),
      ...submissions.map(sub => [
        `"${sub.chemicalName}"`,
        `"${sub.casNumber || ''}"`,
        sub.quantity || '',
        `"${sub.unit || ''}"`,
        `"${sub.purity || ''}"`,
        `"${sub.hazardClass || ''}"`,
        `"${sub.status}"`,
        format(new Date(sub.createdAt), 'yyyy-MM-dd')
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chemical-submissions-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const resetFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      chemicalName: '',
      status: '',
      department: ''
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Drug Reporting System</h1>
                <p className="text-sm text-gray-500">User Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>Welcome, {userProfile?.name || user?.email}</span>
                {company && (
                  <span className="text-gray-400">•</span>
                )}
                {company && (
                  <span className="text-gray-500">{company.companyName}</span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate('/submit')}
                  className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Submission
                </button>
                
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Profile
                </button>
                
                <button
                  onClick={signOut}
                  className="flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
              <p className="mt-2 text-gray-600">
                Manage your chemical inventory submissions
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={exportToCSV}
                disabled={submissions.length === 0}
                className="btn-secondary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSubmissions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">{stats.thisMonth}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <BarChart3 className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center mb-6">
            <Filter className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="form-label">From Date</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">To Date</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">Chemical Name</label>
            <input
              type="text"
              value={filters.chemicalName}
              onChange={(e) => setFilters({...filters, chemicalName: e.target.value})}
              className="form-input"
              placeholder="Search chemicals..."
            />
          </div>
          <div>
            <label className="form-label">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="form-input"
            >
              <option value="">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="reviewed">Reviewed</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="form-label">Department</label>
            <select
              value={filters.department}
              onChange={(e) => setFilters({...filters, department: e.target.value})}
              className="form-input"
            >
              <option value="">All</option>
              <option value="administrative">Administrative</option>
              <option value="sales">Sales</option>
              <option value="purchase">Purchase</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="btn-secondary w-full"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Submissions</h3>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Showing {submissions.length} submissions
              </span>
            </div>
          </div>

          {submissions.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <FileText className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No submissions found</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                {Object.values(filters).some(f => f) 
                  ? 'Try adjusting your filters or create a new submission.'
                  : 'Get started by creating your first chemical submission.'
                }
              </p>
              <button
                onClick={() => navigate('/submit')}
                className="btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Submission
              </button>
            </div>
          ) : (
            <div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Chemical
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      CAS Number
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Submitted
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {submissions.map((submission) => (
                    <tr key={submission._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {submission.chemicalName}
                        </div>
                        {submission.hazardClass && (
                          <div className="text-sm text-gray-500">
                            {submission.hazardClass}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {submission.casNumber || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(submission as any).department_role ? ((submission as any).department_role as string).charAt(0).toUpperCase() + ((submission as any).department_role as string).slice(1) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {submission.quantity && submission.unit 
                          ? `${submission.quantity} ${submission.unit}`
                          : '-'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                          submission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          submission.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {submission.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(submission.createdAt), 'MMM dd, yyyy')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
