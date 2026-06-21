import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync } from 'fs'
import authRoutes from './routes/auth.js'
import unitsRoutes from './routes/units.js'
import paymentRoutes from './routes/payment.js'
import adminRoutes from './routes/admin.js'
import { findUser, createUser, setUserAdmin } from './db.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001
const isProd = process.env.NODE_ENV === 'production'

const DEFAULT_ADMIN_EMAIL = 'saidumuhammed664@gmail.com'
const DEFAULT_ADMIN_PASS = 'Mhixter664@gmail.com'

async function seedDefaultAdmin() {
  try {
    let admin = await findUser(DEFAULT_ADMIN_EMAIL)
    if (!admin) {
      const hashed = await bcrypt.hash(DEFAULT_ADMIN_PASS, 10)
      admin = await createUser({ email: DEFAULT_ADMIN_EMAIL, password: hashed })
      await setUserAdmin(DEFAULT_ADMIN_EMAIL, true)
      console.log(`Default admin created: ${DEFAULT_ADMIN_EMAIL}`)
    } else if (!admin.is_admin) {
      await setUserAdmin(DEFAULT_ADMIN_EMAIL, true)
      console.log(`Admin flag set for: ${DEFAULT_ADMIN_EMAIL}`)
    }

    const adminEmail = process.env.ADMIN_EMAIL
    if (adminEmail) {
      const envAdmin = await findUser(adminEmail)
      if (envAdmin && !envAdmin.is_admin) {
        await setUserAdmin(adminEmail, true)
        console.log(`Admin privileges granted to: ${adminEmail}`)
      }
    }
  } catch (err) {
    console.error('seedDefaultAdmin error:', err.message)
  }
}

app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.use('/api/auth', authRoutes)
app.use('/api/units', unitsRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/admin', adminRoutes)

if (isProd) {
  const distPath = join(__dirname, '..', 'dist')
  if (existsSync(distPath)) {
    app.use(express.static(distPath))
    app.get('/.*/', (req, res) => {
      res.sendFile(join(distPath, 'index.html'))
    })
  }
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} [${isProd ? 'production' : 'development'}]`)
  seedDefaultAdmin()
})
