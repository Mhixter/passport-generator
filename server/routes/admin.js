import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { authenticate } from './auth.js'
import { getAdminStats, readDB, writeDB, updateUserUnits, addTransaction } from '../db.js'

const router = express.Router()
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BG_PATH = path.join(__dirname, '../template-backgrounds.json')

function readBG() {
  if (!fs.existsSync(BG_PATH)) return {}
  try { return JSON.parse(fs.readFileSync(BG_PATH, 'utf8')) } catch { return {} }
}
function writeBG(data) { fs.writeFileSync(BG_PATH, JSON.stringify(data, null, 2)) }

function adminOnly(req, res, next) {
  if (!req.user?.is_admin) return res.status(403).json({ error: 'Admin access required' })
  next()
}

router.get('/template-backgrounds', (req, res) => {
  res.json(readBG())
})

router.use(authenticate, adminOnly)

router.get('/stats', (req, res) => {
  const db = readDB()
  const stats = getAdminStats()
  res.json({
    total_users: db.users.length,
    total_transactions: db.transactions.length,
    total_downloads: db.downloads.length,
    total_revenue_naira: db.transactions.filter(t => t.status === 'success').reduce((sum, t) => sum + (t.amount_naira || 0), 0),
    recent_users: stats.users.slice(-10).reverse(),
    recent_transactions: stats.transactions.slice(-20).reverse(),
    recent_downloads: stats.downloads.slice(-20).reverse(),
    all_users: stats.users,
  })
})

router.post('/credit-units', (req, res) => {
  const { email, amount, reason } = req.body
  if (!email || !amount || isNaN(amount) || parseInt(amount) <= 0) {
    return res.status(400).json({ error: 'Valid email and positive amount required' })
  }
  const db = readDB()
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase())
  if (!user) return res.status(404).json({ error: 'User not found' })
  const units = parseInt(amount)
  user.units = (user.units || 0) + units
  writeDB(db)
  addTransaction({
    user_id: user.id,
    email: user.email,
    reference: `admin_credit_${Date.now()}`,
    package_id: 'admin_credit',
    units,
    amount_naira: 0,
    status: 'success',
    note: reason || 'Admin credit',
  })
  res.json({ success: true, new_balance: user.units, units_added: units })
})

router.post('/make-admin/:email', (req, res) => {
  const db = readDB()
  const user = db.users.find(u => u.email === req.params.email)
  if (!user) return res.status(404).json({ error: 'User not found' })
  user.is_admin = true
  writeDB(db)
  res.json({ success: true })
})

router.post('/template-backgrounds/:countryId', (req, res) => {
  const { countryId } = req.params
  const { image } = req.body
  if (!image) return res.status(400).json({ error: 'Image data required' })
  const bg = readBG()
  bg[countryId] = image
  writeBG(bg)
  res.json({ success: true })
})

router.delete('/template-backgrounds/:countryId', (req, res) => {
  const bg = readBG()
  delete bg[req.params.countryId]
  writeBG(bg)
  res.json({ success: true })
})

export default router
