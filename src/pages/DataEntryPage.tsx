import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Company } from '../lib/mongodb'
import { getCompanyByUserId, createSubmission } from '../lib/data'
import { 
  Save, 
  ArrowLeft, 
  FlaskConical, 
  Hash, 
  Package, 
  Shield, 
  Calendar,
  Building2
} from 'lucide-react'

export default function DataEntryPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [company, setCompany] = useState<Company | null>(null)

  const [formData, setFormData] = useState({
    chemicalName: '',
    casNumber: '',
    quantity: '',
    unit: '',
    purity: '',
    hazardClass: '',
    usePurpose: '',
    storageConditions: '',
    inventoryDate: '',
    // Department fields
    department_role: '', // administrative | sales | purchase
    operation_details: '',
    // Sales
    sales_type: '',
    sales_product: '',
    sales_quantity: '',
    sales_unit: '',
    sales_customer: '',
    // Purchases
    purchase_type: '',
    purchase_product: '',
    purchase_quantity: '',
    purchase_unit: '',
    purchase_supplier: ''
  })

  useEffect(() => {
    if (user) {
      fetchCompany()
    }
  }, [user])

  const fetchCompany = async () => {
    if (!user) return

    try {
      const companyData = await getCompanyByUserId(user._id!)
      if (!companyData) {
        setError('Company profile not found. Please complete your company setup first.')
      } else {
        setCompany(companyData)
      }
    } catch (err) {
      console.error('Error fetching company:', err)
      setError('Error loading company information.')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user || !company) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Conditional validation based on department
      if (!formData.department_role) {
        setError('Please select a Department')
        setLoading(false)
        return
      }
      if (formData.department_role === 'administrative') {
        if (!formData.operation_details) {
          setError('Please describe the administrative operation')
          setLoading(false)
          return
        }
      } else if (formData.department_role === 'sales') {
        if (!formData.sales_type || !formData.sales_product || !formData.sales_quantity || !formData.sales_unit || !formData.sales_customer) {
          setError('Please fill all Sales details')
          setLoading(false)
          return
        }
      } else if (formData.department_role === 'purchase') {
        if (!formData.purchase_type || !formData.purchase_product || !formData.purchase_quantity || !formData.purchase_unit || !formData.purchase_supplier) {
          setError('Please fill all Purchase details')
          setLoading(false)
          return
        }
      }

      const submissionData = {
        userId: user._id!,
        companyId: company._id!,
        chemicalName: formData.chemicalName,
        casNumber: formData.casNumber || undefined,
        quantity: formData.quantity ? parseFloat(formData.quantity) : undefined,
        unit: formData.unit || undefined,
        purity: formData.purity || undefined,
        hazardClass: formData.hazardClass || undefined,
        usePurpose: formData.usePurpose || undefined,
        storageConditions: formData.storageConditions || undefined,
        inventoryDate: formData.inventoryDate ? new Date(formData.inventoryDate) : undefined,
        // Department payload
        department_role: formData.department_role ? (formData.department_role as 'administrative' | 'sales' | 'purchase') : undefined,
        operation_details: formData.operation_details || undefined,
        sales_type: formData.sales_type || undefined,
        sales_product: formData.sales_product || undefined,
        sales_quantity: formData.sales_quantity ? parseFloat(formData.sales_quantity) : undefined,
        sales_unit: formData.sales_unit || undefined,
        sales_customer: formData.sales_customer || undefined,
        purchase_type: formData.purchase_type || undefined,
        purchase_product: formData.purchase_product || undefined,
        purchase_quantity: formData.purchase_quantity ? parseFloat(formData.purchase_quantity) : undefined,
        purchase_unit: formData.purchase_unit || undefined,
        purchase_supplier: formData.purchase_supplier || undefined,
        status: 'submitted' as const
      }

      const result = await createSubmission(submissionData)

      if (!result) {
        setError('Failed to create submission')
      } else {
        setSuccess('Chemical submission created successfully!')
        // Reset form
        setFormData({
          chemicalName: '',
          casNumber: '',
          quantity: '',
          unit: '',
          purity: '',
          hazardClass: '',
          usePurpose: '',
          storageConditions: '',
          inventoryDate: '',
          department_role: '',
          operation_details: '',
          sales_type: '',
          sales_product: '',
          sales_quantity: '',
          sales_unit: '',
          sales_customer: '',
          purchase_type: '',
          purchase_product: '',
          purchase_quantity: '',
          purchase_unit: '',
          purchase_supplier: ''
        })
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/')
        }, 2000)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Company Setup Required</h3>
          <p className="text-gray-500 mb-4">
            You need to complete your company profile before submitting chemicals.
          </p>
          <button
            onClick={() => navigate('/company-form')}
            className="btn-primary"
          >
            Complete Company Setup
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Chemical Submission</h1>
          <p className="mt-2 text-gray-600">
            Submit chemical inventory information for {company.companyName}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Chemical Name */}
              <div className="sm:col-span-2">
                <label htmlFor="chemicalName" className="block text-sm font-medium text-gray-700">
                  Chemical Name *
                </label>
                <div className="mt-1 relative">
                  <FlaskConical className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="chemicalName"
                    id="chemicalName"
                    required
                    value={formData.chemicalName}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter chemical name"
                  />
                </div>
              </div>

              {/* CAS Number */}
              <div>
                <label htmlFor="casNumber" className="block text-sm font-medium text-gray-700">
                  CAS Number
                </label>
                <div className="mt-1 relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="casNumber"
                    id="casNumber"
                    value={formData.casNumber}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 1310-73-2"
                  />
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <div className="mt-1 relative">
                  <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    name="quantity"
                    id="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter quantity"
                  />
                </div>
              </div>

              {/* Unit */}
              <div>
                <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                  Unit
                </label>
                <select
                  name="unit"
                  id="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">Select unit</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="g">Grams (g)</option>
                  <option value="L">Liters (L)</option>
                  <option value="mL">Milliliters (mL)</option>
                  <option value="ton">Tons</option>
                  <option value="lb">Pounds (lb)</option>
                  <option value="gal">Gallons</option>
                  <option value="pieces">Pieces</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Purity */}
              <div>
                <label htmlFor="purity" className="block text-sm font-medium text-gray-700">
                  Purity
                </label>
                <input
                  type="text"
                  name="purity"
                  id="purity"
                  value={formData.purity}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 99%, 95%"
                />
              </div>

              {/* Hazard Class */}
              <div>
                <label htmlFor="hazardClass" className="block text-sm font-medium text-gray-700">
                  Hazard Class
                </label>
                <div className="mt-1 relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    name="hazardClass"
                    id="hazardClass"
                    value={formData.hazardClass}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="">Select hazard class</option>
                    <option value="Flammable">Flammable</option>
                    <option value="Corrosive">Corrosive</option>
                    <option value="Toxic">Toxic</option>
                    <option value="Oxidizing">Oxidizing</option>
                    <option value="Explosive">Explosive</option>
                    <option value="Irritant">Irritant</option>
                    <option value="Carcinogenic">Carcinogenic</option>
                    <option value="Mutagenic">Mutagenic</option>
                    <option value="Reproductive Toxin">Reproductive Toxin</option>
                    <option value="Environmental Hazard">Environmental Hazard</option>
                    <option value="Non-hazardous">Non-hazardous</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Use Purpose */}
              <div className="sm:col-span-2">
                <label htmlFor="usePurpose" className="block text-sm font-medium text-gray-700">
                  Use/Purpose
                </label>
                <textarea
                  name="usePurpose"
                  id="usePurpose"
                  rows={3}
                  value={formData.usePurpose}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe the intended use or purpose of this chemical"
                />
              </div>

              {/* Storage Conditions */}
              <div className="sm:col-span-2">
                <label htmlFor="storageConditions" className="block text-sm font-medium text-gray-700">
                  Storage Conditions
                </label>
                <textarea
                  name="storageConditions"
                  id="storageConditions"
                  rows={3}
                  value={formData.storageConditions}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe storage conditions (temperature, humidity, special requirements)"
                />
              </div>

              {/* Inventory Date */}
              <div className="sm:col-span-2">
                <label htmlFor="inventoryDate" className="block text-sm font-medium text-gray-700">
                  Inventory Date
                </label>
                <div className="mt-1 relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    name="inventoryDate"
                    id="inventoryDate"
                    value={formData.inventoryDate}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Department Related Operations */}
            <div className="border-t pt-6 mt-6">
              

              {/* Department Selector */}
              <div className="sm:col-span-2 mb-4">
                <label htmlFor="department_role" className="block text-sm font-medium text-gray-700">Department *</label>
                <div className="mt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className={`flex items-center justify-center px-4 py-2 border rounded-md cursor-pointer ${formData.department_role === 'administrative' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700'}`}>
                      <input
                        type="radio"
                        name="department_role"
                        value="administrative"
                        checked={formData.department_role === 'administrative'}
                        onChange={handleInputChange}
                        className="hidden"
                      />
                      Administrative
                    </label>
                    <label className={`flex items-center justify-center px-4 py-2 border rounded-md cursor-pointer ${formData.department_role === 'sales' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700'}`}>
                      <input
                        type="radio"
                        name="department_role"
                        value="sales"
                        checked={formData.department_role === 'sales'}
                        onChange={handleInputChange}
                        className="hidden"
                      />
                      Sales
                    </label>
                    <label className={`flex items-center justify-center px-4 py-2 border rounded-md cursor-pointer ${formData.department_role === 'purchase' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700'}`}>
                      <input
                        type="radio"
                        name="department_role"
                        value="purchase"
                        checked={formData.department_role === 'purchase'}
                        onChange={handleInputChange}
                        className="hidden"
                      />
                      Purchases
                    </label>
                  </div>
                </div>
              </div>

              {/* Administrative Operation */}
              {formData.department_role === 'administrative' && (
                <div className="sm:col-span-2">
                  <label htmlFor="operation_details" className="block text-sm font-medium text-gray-700">
                    Administrative Operation Details *
                  </label>
                  <textarea
                    name="operation_details"
                    id="operation_details"
                    rows={3}
                    value={formData.operation_details}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., regulatory reporting, compliance check, data entry"
                  />
                </div>
              )}

              {/* Sales Details */}
              {formData.department_role === 'sales' && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="sales_type" className="block text-sm font-medium text-gray-700">Type of Sales *</label>
                    <select
                      name="sales_type"
                      id="sales_type"
                      value={formData.sales_type}
                      onChange={handleInputChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="">Select type</option>
                      <option value="domestic">Domestic</option>
                      <option value="export">Export</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="sales_product" className="block text-sm font-medium text-gray-700">Chemical/Product Name *</label>
                    <input
                      type="text"
                      name="sales_product"
                      id="sales_product"
                      value={formData.sales_product}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter product name"
                    />
                  </div>
                  <div>
                    <label htmlFor="sales_quantity" className="block text-sm font-medium text-gray-700">Quantity *</label>
                    <input
                      type="number"
                      step="0.01"
                      name="sales_quantity"
                      id="sales_quantity"
                      value={formData.sales_quantity}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter quantity"
                    />
                  </div>
                  <div>
                    <label htmlFor="sales_unit" className="block text-sm font-medium text-gray-700">Unit *</label>
                    <select
                      name="sales_unit"
                      id="sales_unit"
                      value={formData.sales_unit}
                      onChange={handleInputChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="">Select unit</option>
                      <option value="kg">Kilograms (kg)</option>
                      <option value="g">Grams (g)</option>
                      <option value="L">Liters (L)</option>
                      <option value="mL">Milliliters (mL)</option>
                      <option value="ton">Tons</option>
                      <option value="lb">Pounds (lb)</option>
                      <option value="gal">Gallons</option>
                      <option value="pieces">Pieces</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="sales_customer" className="block text-sm font-medium text-gray-700">Buyer/Customer Name *</label>
                    <input
                      type="text"
                      name="sales_customer"
                      id="sales_customer"
                      value={formData.sales_customer}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter customer name"
                    />
                  </div>
                </div>
              )}

              {/* Purchase Details */}
              {formData.department_role === 'purchase' && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="purchase_type" className="block text-sm font-medium text-gray-700">Type of Purchase *</label>
                    <select
                      name="purchase_type"
                      id="purchase_type"
                      value={formData.purchase_type}
                      onChange={handleInputChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="">Select type</option>
                      <option value="raw_material">Raw Material</option>
                      <option value="finished_chemical">Finished Chemical</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="purchase_supplier" className="block text-sm font-medium text-gray-700">Supplier Name *</label>
                    <input
                      type="text"
                      name="purchase_supplier"
                      id="purchase_supplier"
                      value={formData.purchase_supplier}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter supplier name"
                    />
                  </div>
                  <div>
                    <label htmlFor="purchase_quantity" className="block text sm font-medium text-gray-700">Quantity *</label>
                    <input
                      type="number"
                      step="0.01"
                      name="purchase_quantity"
                      id="purchase_quantity"
                      value={formData.purchase_quantity}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter quantity"
                    />
                  </div>
                  <div>
                    <label htmlFor="purchase_unit" className="block text-sm font-medium text-gray-700">Unit *</label>
                    <select
                      name="purchase_unit"
                      id="purchase_unit"
                      value={formData.purchase_unit}
                      onChange={handleInputChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="">Select unit</option>
                      <option value="kg">Kilograms (kg)</option>
                      <option value="g">Grams (g)</option>
                      <option value="L">Liters (L)</option>
                      <option value="mL">Milliliters (mL)</option>
                      <option value="ton">Tons</option>
                      <option value="lb">Pounds (lb)</option>
                      <option value="gal">Gallons</option>
                      <option value="pieces">Pieces</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="purchase_product" className="block text-sm font-medium text-gray-700">Chemical/Product Name *</label>
                    <input
                      type="text"
                      name="purchase_product"
                      id="purchase_product"
                      value={formData.purchase_product}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter product name"
                    />
                  </div>
                </div>
              )}
            </div>


            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                {success}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Submit Chemical
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}