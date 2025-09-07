import { Company, Submission, User } from './mongodb'

const API_BASE_URL = 'http://localhost:3001/api'

// --- Company Profile Operations ---
export async function createCompany(companyData: Omit<Company, '_id' | 'createdAt' | 'updatedAt'>): Promise<Company | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/company`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(companyData),
    })

    if (!response.ok) {
      throw new Error('Failed to create company')
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating company:', error)
    throw error
  }
}

export async function getCompanyByUserId(userId: string): Promise<Company | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/company/${userId}`)
    
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error('Failed to fetch company')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching company by user ID:', error)
    throw error
  }
}

export async function updateCompany(companyId: string, updates: Partial<Company>): Promise<Company | null> {
  // This would need a separate API endpoint
  return null
}

// --- Chemical Submission Operations ---
export async function createSubmission(submissionData: Omit<Submission, '_id' | 'createdAt' | 'updatedAt'>): Promise<Submission | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData),
    })

    if (!response.ok) {
      throw new Error('Failed to create submission')
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating submission:', error)
    throw error
  }
}

export async function getSubmissionsByUserId(userId: string, filters: any = {}): Promise<Submission[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/submissions/${userId}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch submissions')
    }

    const submissions = await response.json()
    
    // Apply filters on the client side for now
    let filteredSubmissions = submissions

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom)
      filteredSubmissions = filteredSubmissions.filter((sub: Submission) => 
        new Date(sub.createdAt) >= fromDate
      )
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo)
      filteredSubmissions = filteredSubmissions.filter((sub: Submission) => 
        new Date(sub.createdAt) <= toDate
      )
    }
    if (filters.chemicalName) {
      filteredSubmissions = filteredSubmissions.filter((sub: Submission) => 
        sub.chemicalName.toLowerCase().includes(filters.chemicalName.toLowerCase())
      )
    }
    if (filters.status) {
      filteredSubmissions = filteredSubmissions.filter((sub: Submission) => 
        sub.status === filters.status
      )
    }

    return filteredSubmissions
  } catch (error) {
    console.error('Error fetching submissions by user ID:', error)
    throw error
  }
}

export async function getAllSubmissions(): Promise<Submission[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/submissions`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch submissions')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching all submissions:', error)
    throw error
  }
}

export async function getAllSubmissionsWithDetails(): Promise<(Submission & { user: User, company: Company })[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/submissions`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch submissions')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching all submissions with details:', error)
    throw error
  }
}

export async function updateSubmissionStatus(submissionId: string, newStatus: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    })

    if (!response.ok) {
      throw new Error('Failed to update submission status')
    }

    const data = await response.json()
    return data.success
  } catch (error) {
    console.error('Error updating submission status:', error)
    throw error
  }
}

export async function deleteSubmission(submissionId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Failed to delete submission')
    }

    const data = await response.json()
    return data.success
  } catch (error) {
    console.error('Error deleting submission:', error)
    throw error
  }
}

// --- Stats Operations ---
export async function getSubmissionStats(userId?: string): Promise<{ totalSubmissions: number, thisMonth: number, pending: number, approved: number, totalUsers: number, totalCompanies: number }> {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch stats')
    }

    const stats = await response.json()
    
    // For now, return basic stats. In a real app, you'd want more detailed stats
    return {
      totalSubmissions: stats.totalSubmissions,
      thisMonth: 0, // Would need separate endpoint
      pending: 0, // Would need separate endpoint
      approved: 0, // Would need separate endpoint
      totalUsers: stats.totalUsers,
      totalCompanies: stats.totalCompanies
    }
  } catch (error) {
    console.error('Error fetching submission stats:', error)
    throw error
  }
}

export async function getUserAndCompanyCounts(): Promise<{ totalUsers: number, totalCompanies: number }> {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch counts')
    }

    const stats = await response.json()
    return {
      totalUsers: stats.totalUsers,
      totalCompanies: stats.totalCompanies
    }
  } catch (error) {
    console.error('Error fetching user and company counts:', error)
    throw error
  }
}