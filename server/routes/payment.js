import express from 'express'
import axios from 'axios'
import { authenticate } from './auth.js'
import { findUser, updateUserUnits, addTransaction, findTransaction, updateTransactionStatus } from '../db.js'

const router = express.Router()

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || ''
const BASE_URL = process.env.APP_URL || `https://${process.env.REPLIT_DEV_DOMAIN || 'localhost:5000'}`

export const PACKAGES = [
  { id: 'pack_10', units: 10, naira: 1000, label: '10 Units', desc: '10 downloads' },
  { id: 'pack_50', units: 50, naira: 5000, label: '50 Units', desc: '50 downloads', badge: 'Popular' },
  { id: 'pack_100', units: 100, naira: 9000, label: '100 Units', desc: '100 downloads (10% off)', badge: 'Best Value' },
]

router.get('/packages', (req, res) => {
  res.json({ packages: PACKAGES })
})

router.post('/initialize', authenticate, async (req, res) => {
  try {
    const { package_id } = req.body
    const pkg = PACKAGES.find(p => p.id === package_id)
    if (!pkg) return res.status(400).json({ error: 'Invalid package' })

    const user = await findUser(req.user.email)
    if (!user) return res.status(404).json({ error: 'User not found' })

    const reference = `ppg_${Date.now()}_${Math.random().toString(36).slice(2)}`

    if (!PAYSTACK_SECRET) {
      return res.status(503).json({ error: 'Payment gateway not configured. Please set PAYSTACK_SECRET_KEY.' })
    }

    const response = await axios.post('https://api.paystack.co/transaction/initialize', {
      email: user.email,
      amount: pkg.naira * 100,
      reference,
      callback_url: `${BASE_URL}/api/payment/callback`,
      metadata: {
        user_id: user.id,
        package_id: pkg.id,
        units: pkg.units,
        custom_fields: [
          { display_name: 'Package', variable_name: 'package', value: pkg.label },
          { display_name: 'Units', variable_name: 'units', value: pkg.units },
        ],
      },
    }, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
    })

    await addTransaction({
      user_id: user.id,
      email: user.email,
      package_id: pkg.id,
      units: pkg.units,
      amount_naira: pkg.naira,
      status: 'pending',
      type: `ppg_${reference}`,
    })

    res.json({ authorization_url: response.data.data.authorization_url, reference })
  } catch (err) {
    console.error('Payment init error:', err?.response?.data || err.message)
    res.status(500).json({ error: 'Payment initialization failed' })
  }
})

router.get('/callback', async (req, res) => {
  const { reference } = req.query
  if (!reference) return res.redirect('/?payment=failed')
  try {
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
    })
    const { status, metadata } = response.data.data
    if (status === 'success') {
      const { user_id, units } = metadata
      await updateUserUnits(user_id, parseInt(units))
      const tx = await findTransaction(`ppg_${reference}`)
      if (tx) await updateTransactionStatus(tx.id, 'success')
      res.redirect('/?payment=success')
    } else {
      res.redirect('/?payment=failed')
    }
  } catch (err) {
    console.error('Payment verify error:', err.message)
    res.redirect('/?payment=failed')
  }
})

router.post('/verify', authenticate, async (req, res) => {
  const { reference } = req.body
  if (!reference) return res.status(400).json({ error: 'Reference required' })
  try {
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
    })
    const { status, metadata } = response.data.data
    if (status === 'success') {
      const tx = await findTransaction(`ppg_${reference}`)
      if (tx && tx.status !== 'success') {
        await updateUserUnits(metadata.user_id, parseInt(metadata.units))
        await updateTransactionStatus(tx.id, 'success')
        res.json({ success: true, units_added: metadata.units })
      } else if (tx?.status === 'success') {
        res.json({ success: true, already_credited: true })
      } else {
        res.json({ success: false })
      }
    } else {
      res.json({ success: false, status })
    }
  } catch (err) {
    res.status(500).json({ error: 'Verification failed' })
  }
})

export default router
