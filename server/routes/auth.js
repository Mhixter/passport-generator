import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { findUser, createUser } from '../db.js'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'passport_gen_secret_2024'

router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })
    const existing = findUser(email)
    if (existing) return res.status(409).json({ error: 'Email already registered' })
    const hashed = await bcrypt.hash(password, 10)
    const user = createUser({ email, password: hashed })
    const token = jwt.sign({ id: user.id, email: user.email, is_admin: user.is_admin }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user.id, email: user.email, units: user.units, is_admin: user.is_admin } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
    const user = findUser(email)
    if (!user) return res.status(401).json({ error: 'Invalid email or password' })
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' })
    const token = jwt.sign({ id: user.id, email: user.email, is_admin: user.is_admin }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user.id, email: user.email, units: user.units, is_admin: user.is_admin } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

router.get('/me', authenticate, (req, res) => {
  const user = findUser(req.user.email)
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json({ id: user.id, email: user.email, units: user.units, is_admin: user.is_admin })
})

export function authenticate(req, res, next) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })
  try {
    req.user = jwt.verify(auth.slice(7), JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

export default router
