import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { authenticate } from './auth.js'
import { getAdminStats, creditUserUnits, setUserAdmin, addTransaction, findUser } from '../db.js'

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

router.get('/stats', async (req, res) => {
  try {
    const stats = await getAdminStats()
    res.json({
      total_users: stats.users.length,
      total_transactions: stats.transactions.length,
      total_downloads: stats.downloads.length,
      total_revenue_naira: stats.transactions
        .filter(t => t.status === 'success')
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0),
      recent_users: stats.users.slice(0, 10),
      recent_transactions: stats.transactions.slice(0, 20),
      recent_downloads: stats.downloads.slice(0, 20),
      all_users: stats.users,
    })
  } catch (err) {
    console.error('Stats error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/credit-units', async (req, res) => {
  try {
    const { email, amount, reason } = req.body
    if (!email || !amount || isNaN(amount) || parseInt(amount) <= 0) {
      return res.status(400).json({ error: 'Valid email and positive amount required' })
    }
    const units = parseInt(amount)
    const user = await creditUserUnits(email, units)
    if (!user) return res.status(404).json({ error: 'User not found' })
    await addTransaction({
      user_id: user.id,
      email: user.email,
      package_id: 'admin_credit',
      units,
      amount_naira: 0,
      status: 'success',
      type: reason || 'Admin credit',
    })
    res.json({ success: true, new_balance: user.units, units_added: units })
  } catch (err) {
    console.error('Credit units error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/make-admin/:email', async (req, res) => {
  try {
    const user = await setUserAdmin(req.params.email, true)
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ success: true })
  } catch (err) {
    console.error('Make admin error:', err)
    res.status(500).json({ error: 'Server error' })
  }
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
