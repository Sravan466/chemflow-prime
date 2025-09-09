import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAllSubmissionsWithDetails } from '../lib/data'
import { Submission, Company } from '../lib/mongodb'
import type { User } from '../lib/mongodb'
import { ArrowLeft, Building2, User as UserIcon, FlaskConical, Hash, Shield, Package, FileText } from 'lucide-react'

export default function SubmissionDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submission, setSubmission] = useState<(Submission & { user: User, company: Company }) | null>(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const all = await getAllSubmissionsWithDetails()
        const found = all.find(s => s._id === id)
        setSubmission(found || null)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading submission...</p>
        </div>
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Submission not found.</p>
          <button onClick={() => navigate(-1)} className="btn-secondary mt-4">Go Back</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Submission Details</h1>
            <p className="text-sm text-gray-500">ID: {submission._id}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Details */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Building2 className="h-5 w-5 text-gray-500 mr-2" />
                <h2 className="text-lg font-semibold">Company Details</h2>
              </div>
              <div className="text-sm text-gray-700">
                <div><span className="font-medium">Name:</span> {submission.company?.companyName || '-'}</div>
                <div><span className="font-medium">Address:</span> {submission.company?.address || '-'}</div>
                <div><span className="font-medium">Plant:</span> {submission.company?.industryType || '-'}</div>
              </div>
            </div>

            {/* Submitted By */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center mb-3">
                <UserIcon className="h-5 w-5 text-gray-500 mr-2" />
                <h2 className="text-lg font-semibold">Submitted By</h2>
              </div>
              <div className="text-sm text-gray-700">
                <div><span className="font-medium">User:</span> {submission.user?.name || '-'}</div>
                <div><span className="font-medium">Status:</span> {submission.status}</div>
                <div><span className="font-medium">Department:</span> {submission.department_role || '-'}</div>
              </div>
            </div>
          </div>

          {/* Chemical Inventory Details */}
          <div className="mt-6 border rounded-lg p-4">
            <div className="flex items-center mb-3">
              <FlaskConical className="h-5 w-5 text-gray-500 mr-2" />
              <h2 className="text-lg font-semibold">Chemical Inventory Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
              <div><span className="font-medium">Name:</span> {submission.chemicalName}</div>
              <div className="flex items-center"><Hash className="h-4 w-4 text-gray-400 mr-1" /><span className="font-medium">CAS:</span>&nbsp;{submission.casNumber || '-'}</div>
              <div className="flex items-center"><Shield className="h-4 w-4 text-gray-400 mr-1" /><span className="font-medium">Hazard:</span>&nbsp;{submission.hazardClass || '-'}</div>
              <div className="flex items-center"><Package className="h-4 w-4 text-gray-400 mr-1" /><span className="font-medium">Qty:</span>&nbsp;{submission.quantity && submission.unit ? `${submission.quantity} ${submission.unit}` : '-'}</div>
              <div><span className="font-medium">Purity:</span> {submission.purity || '-'}</div>
              <div className="flex items-center"><FileText className="h-4 w-4 text-gray-400 mr-1" /><span className="font-medium">MSDS:</span>&nbsp;<span className="text-blue-600">N/A</span></div>
            </div>
          </div>

          {/* Department Details */}
          <div className="mt-6 border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3">Department Details</h2>
            {submission.department_role === 'administrative' && (
              <div className="text-sm text-gray-700">
                <div><span className="font-medium">Operation Details:</span> {submission.operation_details || '-'}</div>
              </div>
            )}
            {submission.department_role === 'sales' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div><span className="font-medium">Sales Type:</span> {submission.sales_type || '-'}</div>
                <div><span className="font-medium">Product:</span> {submission.sales_product || '-'}</div>
                <div><span className="font-medium">Quantity:</span> {submission.sales_quantity && submission.sales_unit ? `${submission.sales_quantity} ${submission.sales_unit}` : '-'}</div>
                <div><span className="font-medium">Customer:</span> {submission.sales_customer || '-'}</div>
              </div>
            )}
            {submission.department_role === 'purchase' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div><span className="font-medium">Purchase Type:</span> {submission.purchase_type || '-'}</div>
                <div><span className="font-medium">Product:</span> {submission.purchase_product || '-'}</div>
                <div><span className="font-medium">Quantity:</span> {submission.purchase_quantity && submission.purchase_unit ? `${submission.purchase_quantity} ${submission.purchase_unit}` : '-'}</div>
                <div><span className="font-medium">Supplier:</span> {submission.purchase_supplier || '-'}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


