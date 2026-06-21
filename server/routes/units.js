import express from 'express'
import { authenticate } from './auth.js'
import { findUser, updateUserUnits, addDownload } from '../db.js'

const router = express.Router()

router.get('/balance', authenticate, (req, res) => {
  const user = findUser(req.user.email)
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json({ units: user.units })
})

router.post('/spend', authenticate, (req, res) => {
  const { amount, type } = req.body
  const user = findUser(req.user.email)
  if (!user) return res.status(404).json({ error: 'User not found' })
  if (user.units < amount) return res.status(402).json({ error: 'Insufficient units' })
  const newBalance = updateUserUnits(user.id, -amount)
  addDownload({ user_id: user.id, email: user.email, units_spent: amount, type })
  res.json({ units: newBalance, spent: amount })
})

export default router
