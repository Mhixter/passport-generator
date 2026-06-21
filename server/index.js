import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import unitsRoutes from './routes/units.js'
import paymentRoutes from './routes/payment.js'
import adminRoutes from './routes/admin.js'
import { readDB, writeDB } from './db.js'

const app = express()
const PORT = 3001

function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) return
  const db = readDB()
  const user = db.users.find(u => u.email.toLowerCase() === adminEmail.toLowerCase())
  if (user && !user.is_admin) {
    user.is_admin = true
    writeDB(db)
    console.log(`Admin privileges granted to: ${adminEmail}`)
  }
}

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/units', unitsRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/admin', adminRoutes)

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running on port ${PORT}`)
  seedAdmin()
})
