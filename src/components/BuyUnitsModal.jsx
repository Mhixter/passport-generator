import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import './BuyUnitsModal.css'

export default function BuyUnitsModal({ onClose }) {
  const { user, refreshUser } = useAuth()
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    fetch('/api/payment/packages').then(r => r.json()).then(d => setPackages(d.packages || []))
  }, [])

  const handleBuy = async () => {
    if (!selected) return
    setLoading(true)
    setNotice('')
    try {
      const token = localStorage.getItem('pp_token')
      const r = await fetch('/api/payment/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ package_id: selected }),
      })
      const data = await r.json()
      if (!r.ok) {
        setNotice(data.error || 'Payment failed')
        setLoading(false)
        return
      }
      window.location.href = data.authorization_url
    } catch (err) {
      setNotice('Payment error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Buy Units</h2>
            <p>Current balance: <strong>{user?.units || 0} units</strong></p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="pricing-note">
          <span>📌</span> 1 unit = 1 download = ₦100 &nbsp;|&nbsp; Bulk of 10 = ₦1,000
        </div>

        {notice && <div className="modal-notice">{notice}</div>}

        <div className="packages-grid">
          {packages.map(pkg => (
            <div
              key={pkg.id}
              className={`pkg-card ${selected === pkg.id ? 'selected' : ''}`}
              onClick={() => setSelected(pkg.id)}
            >
              {pkg.badge && <div className="pkg-badge">{pkg.badge}</div>}
              <div className="pkg-units">{pkg.units}</div>
              <div className="pkg-label">units</div>
              <div className="pkg-price">₦{pkg.naira.toLocaleString()}</div>
              <div className="pkg-desc">{pkg.desc}</div>
            </div>
          ))}
        </div>

        <button
          className="pay-btn"
          onClick={handleBuy}
          disabled={!selected || loading}
        >
          {loading ? 'Redirecting to payment…' : selected ? `Pay ₦${packages.find(p => p.id === selected)?.naira?.toLocaleString() || ''}` : 'Select a package'}
        </button>

        <p className="payment-info">🔒 Secured by Paystack</p>
      </div>
    </div>
  )
}
