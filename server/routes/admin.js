import express from 'express'
import { authenticate } from './auth.js'
import { getAdminStats, readDB, writeDB } from '../db.js'

const router = express.Router()

function adminOnly(req, res, next) {
  if (!req.user?.is_admin) return res.status(403).json({ error: 'Admin access required' })
  next()
}

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

router.post('/make-admin/:email', (req, res) => {
  const db = readDB()
  const user = db.users.find(u => u.email === req.params.email)
  if (!user) return res.status(404).json({ error: 'User not found' })
  user.is_admin = true
  writeDB(db)
  res.json({ success: true })
})

export default router
