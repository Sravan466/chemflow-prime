import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Submission, Company } from '../lib/mongodb'
import type { User } from '../lib/mongodb'
import { getAllSubmissionsWithDetails, getSubmissionStats, updateSubmissionStatus, deleteSubmission } from '../lib/data'
import { 
  BarChart3, 
  FileText, 
  Download, 
  Filter,
  Trash2,
  User as UserIcon,
  Building2,
  LogOut,
  Settings,
  Shield
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { format, startOfMonth, endOfMonth } from 'date-fns'

export default function AdminDashboardPage() {
  const { user, userProfile, signOut } = useAuth()
  const navigate = useNavigate()
  const [submissions, setSubmissions] = useState<(Submission & { 
    user: User, 
    company: Company 
  })[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    thisMonth: 0,
    pending: 0,
    approved: 0,
    totalUsers: 0,
    totalCompanies: 0
  })
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    chemicalName: '',
    status: '',
    userName: '',
    department: '',
    company: ''
  })

  useEffect(() => {
    if (user) {
      fetchData()
    } else {
      setLoading(false)
    }
  }, [user, filters])

  const fetchData = async () => {
    try {
      // Fetch all submissions with user and company info
      const allSubmissions = await getAllSubmissionsWithDetails()
      setSubmissions(allSubmissions)

      // Calculate stats
      const now = new Date()
      const startOfThisMonth = startOfMonth(now)
      const endOfThisMonth = endOfMonth(now)

      const thisMonthSubmissions = allSubmissions.filter(sub => {
        const submissionDate = new Date(sub.createdAt)
        return submissionDate >= startOfThisMonth && submissionDate <= endOfThisMonth
      })

      // Get user and company counts
      const stats = await getSubmissionStats()

      setStats({
        totalSubmissions: allSubmissions.length,
        thisMonth: thisMonthSubmissions.length,
        pending: allSubmissions.filter(s => s.status === 'submitted').length,
        approved: allSubmissions.filter(s => s.status === 'approved').length,
        totalUsers: stats.totalUsers,
        totalCompanies: stats.totalCompanies
      })

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (submissionId: string, newStatus: 'submitted' | 'reviewed' | 'approved' | 'rejected') => {
    try {
      await updateSubmissionStatus(submissionId, newStatus)
      // Refresh data
      fetchData()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleDeleteSubmission = async (submissionId: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return

    try {
      await deleteSubmission(submissionId)
      // Refresh data
      fetchData()
    } catch (error) {
      console.error('Error deleting submission:', error)
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
      'Submitted By',
      'Company',
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
        `"${sub.user?.name || 'Unknown'}"`,
        `"${sub.company?.companyName || 'Unknown'}"`,
        format(new Date(sub.createdAt), 'yyyy-MM-dd')
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `all-chemical-submissions-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const resetFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      chemicalName: '',
      status: '',
      userName: '',
      department: '',
      company: ''
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
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
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Drug Reporting System</h1>
                <p className="text-sm text-gray-500">Administrator Panel</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <UserIcon className="h-4 w-4" />
                <span>Welcome, {userProfile?.name || 'Admin'}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.location.href = '/profile'}
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
              <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
              <p className="mt-2 text-gray-600">
                System overview and submission management
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={exportToCSV}
                disabled={submissions.length === 0}
                className="btn-secondary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4 mr-2" />
                Export All CSV
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
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
                <BarChart3 className="h-6 w-6 text-green-600" />
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
                <FileText className="h-6 w-6 text-yellow-600" />
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

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-xl">
                <UserIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <Building2 className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Companies</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCompanies}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-4">
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
            <label className="form-label">User Name</label>
            <input
              type="text"
              value={filters.userName}
              onChange={(e) => setFilters({...filters, userName: e.target.value})}
              className="form-input"
              placeholder="Search users..."
            />
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
          <div>
            <label className="form-label">Company</label>
            <input
              type="text"
              value={filters.company}
              onChange={(e) => setFilters({...filters, company: e.target.value})}
              className="form-input"
              placeholder="Search company..."
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
              <h3 className="text-lg font-semibold text-gray-900">All Submissions</h3>
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
              <p className="text-gray-500 max-w-md mx-auto">
                {Object.values(filters).some(f => f) 
                  ? 'Try adjusting your filters to see more results.'
                  : 'No chemical submissions have been made yet. Users can submit their chemical inventory data through the system.'
                }
              </p>
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
                      Submitted By
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Company
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
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {submissions
                    // Department filter
                    .filter(sub => !filters.department || sub.department_role === filters.department)
                    // Company filter
                    .filter(sub => !filters.company || sub.company?.companyName?.toLowerCase().includes(filters.company.toLowerCase()))
                    // Date range filters
                    .filter(sub => !filters.dateFrom || new Date(sub.createdAt) >= new Date(filters.dateFrom))
                    .filter(sub => !filters.dateTo || new Date(sub.createdAt) <= new Date(filters.dateTo))
                    // Chemical name filter
                    .filter(sub => !filters.chemicalName || sub.chemicalName.toLowerCase().includes(filters.chemicalName.toLowerCase()))
                    // Status filter
                    .filter(sub => !filters.status || sub.status === filters.status)
                    // User name filter
                    .filter(sub => !filters.userName || (sub.user?.name || '').toLowerCase().includes(filters.userName.toLowerCase()))
                    .map((submission) => (
                    <tr
                      key={submission._id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/submissions/${submission._id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {submission.chemicalName}
                        </div>
                        {submission.casNumber && (
                          <div className="text-sm text-gray-500">
                            CAS: {submission.casNumber}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <UserIcon className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {submission.user?.name || 'Unknown User'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {submission.user?._id ? submission.user._id.substring(0, 8) + '...' : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="text-sm font-medium text-gray-900">
                            {submission.company?.companyName || 'No Company'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {submission.department_role ? submission.department_role.charAt(0).toUpperCase() + submission.department_role.slice(1) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {submission.quantity && submission.unit 
                          ? `${submission.quantity} ${submission.unit}`
                          : '-'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={submission.status}
                          onChange={(e) => handleStatusUpdate(submission._id!, e.target.value as 'submitted' | 'reviewed' | 'approved' | 'rejected')}
                          className={`text-xs font-semibold rounded-full px-3 py-1 border-0 cursor-pointer ${
                            submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                            submission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            submission.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          <option value="submitted">Submitted</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(submission.createdAt), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteSubmission(submission._id!) }}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete submission"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
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
