import { MongoClient, Db, Collection } from 'mongodb'

// MongoDB connection configuration
const MONGODB_URI = 'mongodb+srv://chemflow:chemflow123@cluster0.acphrt8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
const MONGODB_DB = 'chemflow'

let client: MongoClient
let db: Db

// Connect to MongoDB
export async function connectToDatabase() {
  if (db) {
    return { client, db }
  }

  try {
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    db = client.db(MONGODB_DB)
    
    console.log('Connected to MongoDB Atlas')
    return { client, db }
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
    throw error
  }
}

// Get database instance
export async function getDatabase(): Promise<Db> {
  if (!db) {
    await connectToDatabase()
  }
  return db
}

// Get collections
export async function getUsersCollection(): Promise<Collection> {
  const database = await getDatabase()
  return database.collection('users')
}

export async function getCompaniesCollection(): Promise<Collection> {
  const database = await getDatabase()
  return database.collection('companies')
}

export async function getSubmissionsCollection(): Promise<Collection> {
  const database = await getDatabase()
  return database.collection('submissions')
}

// Close connection
export async function closeConnection() {
  if (client) {
    await client.close()
    console.log('MongoDB connection closed')
  }
}

// MongoDB Document Types
export interface User {
  _id?: string
  email: string
  password: string
  name: string
  role: 'user' | 'admin'
  createdAt: Date
  updatedAt: Date
}

export interface Company {
  _id?: string
  userId: string
  companyName: string
  registrationNumber?: string
  address?: string
  contactPerson?: string
  contactPhone?: string
  officialEmail?: string
  industryType?: string
  gstPan?: string
  createdAt: Date
  updatedAt: Date
}

export interface Submission {
  _id?: string
  userId: string
  companyId: string
  chemicalName: string
  casNumber?: string
  quantity?: number
  unit?: string
  purity?: string
  hazardClass?: string
  usePurpose?: string
  storageConditions?: string
  inventoryDate?: Date
  status: 'submitted' | 'reviewed' | 'approved' | 'rejected'
  createdAt: Date
  updatedAt: Date
}
