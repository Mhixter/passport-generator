import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import authRoutes from './routes/auth.js'
import unitsRoutes from './routes/units.js'
import paymentRoutes from './routes/payment.js'
import adminRoutes from './routes/admin.js'
import { readDB, writeDB } from './db.js'

const app = express()
const PORT = 3001

const DEFAULT_ADMIN_EMAIL = 'saidumuhammed664@gmail.com'
const DEFAULT_ADMIN_PASS = 'Mhixter664@gmail.com'

async function seedDefaultAdmin() {
  const db = readDB()
  const exists = db.users.find(u => u.email.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase())
  if (!exists) {
    const hashed = await bcrypt.hash(DEFAULT_ADMIN_PASS, 10)
    db.users.push({
      id: `u_admin_${Date.now()}`,
      email: DEFAULT_ADMIN_EMAIL,
      password: hashed,
      units: 0,
      is_admin: true,
      created_at: new Date().toISOString(),
    })
    writeDB(db)
    console.log(`Default admin created: ${DEFAULT_ADMIN_EMAIL}`)
  } else if (!exists.is_admin) {
    exists.is_admin = true
    writeDB(db)
    console.log(`Admin flag set for: ${DEFAULT_ADMIN_EMAIL}`)
  }

  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail) {
    const envAdmin = db.users.find(u => u.email.toLowerCase() === adminEmail.toLowerCase())
    if (envAdmin && !envAdmin.is_admin) {
      envAdmin.is_admin = true
      writeDB(db)
      console.log(`Admin privileges granted to: ${adminEmail}`)
    }
  }
}

app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.use('/api/auth', authRoutes)
app.use('/api/units', unitsRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/admin', adminRoutes)

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running on port ${PORT}`)
  seedDefaultAdmin()
})
