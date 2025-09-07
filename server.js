// Simple Express server for MongoDB operations
import express from 'express'
import cors from 'cors'
import { MongoClient, ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://chemflow:chemflow123@cluster0.acphrt8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
const MONGODB_DB = process.env.MONGODB_DB || 'chemflow'

let client, db

async function connectToDatabase() {
  if (db) return { client, db }
  
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

// Auth endpoints
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body
    const { db } = await connectToDatabase()
    
    const user = await db.collection('users').findOne({ email })
    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    // Remove password before sending
    const { password: _, ...userWithoutPassword } = user
    res.json({ user: userWithoutPassword })
  } catch (error) {
    console.error('Sign in error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, fullName } = req.body
    const { db } = await connectToDatabase()
    
    const existingUser = await db.collection('users').findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' })
    }
    
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = {
      email,
      password: hashedPassword,
      name: fullName,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await db.collection('users').insertOne(newUser)
    const { password: _, ...userWithoutPassword } = newUser
    
    res.json({ user: { ...userWithoutPassword, _id: result.insertedId.toHexString() } })
  } catch (error) {
    console.error('Sign up error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Company endpoints
app.get('/api/company/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const { db } = await connectToDatabase()
    
    const company = await db.collection('companies').findOne({ userId })
    res.json(company)
  } catch (error) {
    console.error('Get company error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/company', async (req, res) => {
  try {
    const companyData = req.body
    const { db } = await connectToDatabase()
    
    const newCompany = {
      ...companyData,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await db.collection('companies').insertOne(newCompany)
    res.json({ ...newCompany, _id: result.insertedId.toHexString() })
  } catch (error) {
    console.error('Create company error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Submission endpoints
app.get('/api/submissions/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const { db } = await connectToDatabase()
    
    const submissions = await db.collection('submissions')
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray()
    
    res.json(submissions)
  } catch (error) {
    console.error('Get submissions error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/api/submissions', async (req, res) => {
  try {
    const { db } = await connectToDatabase()
    
    const submissions = await db.collection('submissions')
      .find({})
      .sort({ createdAt: -1 })
      .toArray()
    
    // Get user and company details for each submission
    const submissionsWithDetails = await Promise.all(
      submissions.map(async (submission) => {
        let user = null
        let company = null
        
        try {
          // Convert string IDs to ObjectId for MongoDB queries
          if (submission.userId) {
            user = await db.collection('users').findOne({ _id: new ObjectId(submission.userId) })
          }
          if (submission.companyId) {
            company = await db.collection('companies').findOne({ _id: new ObjectId(submission.companyId) })
          }
        } catch (error) {
          console.error('Error fetching user/company details:', error)
        }
        
        return {
          ...submission,
          user,
          company
        }
      })
    )
    
    res.json(submissionsWithDetails)
  } catch (error) {
    console.error('Get all submissions error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/submissions', async (req, res) => {
  try {
    const submissionData = req.body
    const { db } = await connectToDatabase()
    
    const newSubmission = {
      ...submissionData,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await db.collection('submissions').insertOne(newSubmission)
    res.json({ ...newSubmission, _id: result.insertedId.toHexString() })
  } catch (error) {
    console.error('Create submission error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.put('/api/submissions/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const { db } = await connectToDatabase()
    
    const result = await db.collection('submissions').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } }
    )
    
    res.json({ success: result.modifiedCount === 1 })
  } catch (error) {
    console.error('Update submission status error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.delete('/api/submissions/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { db } = await connectToDatabase()
    
    const result = await db.collection('submissions').deleteOne({ _id: new ObjectId(id) })
    res.json({ success: result.deletedCount === 1 })
  } catch (error) {
    console.error('Delete submission error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Stats endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const { db } = await connectToDatabase()
    
    const totalUsers = await db.collection('users').countDocuments({ role: 'user' })
    const totalCompanies = await db.collection('companies').countDocuments({})
    const totalSubmissions = await db.collection('submissions').countDocuments({})
    
    res.json({ totalUsers, totalCompanies, totalSubmissions })
  } catch (error) {
    console.error('Get stats error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
