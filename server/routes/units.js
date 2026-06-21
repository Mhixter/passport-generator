import express from 'express'
import { authenticate } from './auth.js'
import { findUser, updateUserUnits, addDownload } from '../db.js'

const router = express.Router()

router.get('/balance', authenticate, async (req, res) => {
  try {
    const user = await findUser(req.user.email)
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ units: user.units })
  } catch (err) {
    console.error('Balance error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/spend', authenticate, async (req, res) => {
  try {
    const { amount, type } = req.body
    const user = await findUser(req.user.email)
    if (!user) return res.status(404).json({ error: 'User not found' })
    if (user.units < amount) return res.status(402).json({ error: 'Insufficient units' })
    const newBalance = await updateUserUnits(user.id, -amount)
    await addDownload({ user_id: user.id, email: user.email, units_spent: amount, type })
    res.json({ units: newBalance, spent: amount })
  } catch (err) {
    console.error('Spend error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
