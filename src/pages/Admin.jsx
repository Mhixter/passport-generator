import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import { TEMPLATES } from '../templates.js'
import './Admin.css'

const TEMPLATE_LIST = Object.values(TEMPLATES)

export default function Admin() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [backgrounds, setBackgrounds] = useState({})

  useEffect(() => {
    if (!user?.is_admin) { navigate('/'); return }
    fetchStats()
    fetchBackgrounds()
  }, [user])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('pp_token')
      const r = await fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
      const data = await r.json()
      setStats(data)
    } catch {}
    setLoading(false)
  }

  const fetchBackgrounds = async () => {
    const r = await fetch('/api/admin/template-backgrounds')
    if (r.ok) setBackgrounds(await r.json())
  }

  if (!user?.is_admin) return null
  if (loading) return <div className="admin-loading">Loading dashboard…</div>

  const tabs = ['overview', 'users', 'credit', 'templates', 'transactions', 'downloads']

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="admin-header-left">
          <span className="admin-logo">🛂</span>
          <div>
            <h1>Admin Dashboard</h1>
            <p>PassportGen Management</p>
          </div>
        </div>
        <div className="admin-header-right">
          <span className="admin-email">{user.email}</span>
          <button className="admin-btn-sm" onClick={() => navigate('/')}>← App</button>
          <button className="admin-btn-sm danger" onClick={logout}>Logout</button>
        </div>
      </header>

      <div className="admin-tabs">
        {tabs.map(t => (
          <button key={t} className={`admin-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'credit' ? '💳 Credit Units' : t === 'templates' ? '🖼 Backgrounds' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
        <button className="admin-tab refresh" onClick={fetchStats}>↻ Refresh</button>
      </div>

      <div className="admin-body">
        {tab === 'overview' && (
          <div>
            <div className="stat-grid">
              <StatCard icon="👥" label="Total Users" value={stats?.total_users || 0} color="#3b82f6" />
              <StatCard icon="💳" label="Transactions" value={stats?.total_transactions || 0} color="#8b5cf6" />
              <StatCard icon="⬇" label="Downloads" value={stats?.total_downloads || 0} color="#10b981" />
              <StatCard icon="💰" label="Revenue" value={`₦${(stats?.total_revenue_naira || 0).toLocaleString()}`} color="#f59e0b" />
            </div>
            <div className="admin-section">
              <h3>Recent Users</h3>
              <table className="admin-table">
                <thead><tr><th>Email</th><th>Units</th><th>Admin</th><th>Joined</th></tr></thead>
                <tbody>
                  {(stats?.recent_users || []).map(u => (
                    <tr key={u.id}>
                      <td>{u.email}</td>
                      <td><span className="badge blue">{u.units}</span></td>
                      <td>{u.is_admin ? <span className="badge green">Admin</span> : '—'}</td>
                      <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {!stats?.recent_users?.length && <tr><td colSpan={4} className="empty">No users yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'credit' && (
          <CreditUnitsPanel users={stats?.all_users || []} onSuccess={fetchStats} />
        )}

        {tab === 'templates' && (
          <TemplateBackgroundsPanel
            backgrounds={backgrounds}
            onUpdate={fetchBackgrounds}
          />
        )}

        {tab === 'users' && (
          <div className="admin-section">
            <h3>All Users ({stats?.all_users?.length || 0})</h3>
            <table className="admin-table">
              <thead><tr><th>ID</th><th>Email</th><th>Units</th><th>Admin</th><th>Joined</th></tr></thead>
              <tbody>
                {(stats?.all_users || []).map(u => (
                  <tr key={u.id}>
                    <td><code>{u.id.slice(0,12)}…</code></td>
                    <td>{u.email}</td>
                    <td><span className="badge blue">{u.units}</span></td>
                    <td>{u.is_admin ? <span className="badge green">Admin</span> : '—'}</td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {!stats?.all_users?.length && <tr><td colSpan={5} className="empty">No users yet</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'transactions' && (
          <div className="admin-section">
            <h3>Recent Transactions</h3>
            <table className="admin-table">
              <thead><tr><th>Email</th><th>Package</th><th>Units</th><th>Amount</th><th>Status</th><th>Note</th><th>Date</th></tr></thead>
              <tbody>
                {(stats?.recent_transactions || []).map(tx => (
                  <tr key={tx.id}>
                    <td>{tx.email}</td>
                    <td>{tx.package_id}</td>
                    <td>{tx.units}</td>
                    <td>{tx.amount_naira ? `₦${tx.amount_naira.toLocaleString()}` : <span className="badge green">Free</span>}</td>
                    <td><span className={`badge ${tx.status === 'success' ? 'green' : 'yellow'}`}>{tx.status}</span></td>
                    <td>{tx.note || '—'}</td>
                    <td>{new Date(tx.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {!stats?.recent_transactions?.length && <tr><td colSpan={7} className="empty">No transactions yet</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'downloads' && (
          <div className="admin-section">
            <h3>Recent Downloads</h3>
            <table className="admin-table">
              <thead><tr><th>Email</th><th>Type</th><th>Units Spent</th><th>Date</th></tr></thead>
              <tbody>
                {(stats?.recent_downloads || []).map(dl => (
                  <tr key={dl.id}>
                    <td>{dl.email}</td>
                    <td><span className="badge blue">{dl.type}</span></td>
                    <td>{dl.units_spent}</td>
                    <td>{new Date(dl.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {!stats?.recent_downloads?.length && <tr><td colSpan={4} className="empty">No downloads yet</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function CreditUnitsPanel({ users, onSuccess }) {
  const [email, setEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [suggestions, setSuggestions] = useState([])

  const handleEmailChange = (val) => {
    setEmail(val)
    setResult(null)
    if (val.length >= 2) {
      setSuggestions(users.filter(u => u.email.toLowerCase().includes(val.toLowerCase())).slice(0, 5))
    } else {
      setSuggestions([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const token = localStorage.getItem('pp_token')
      const r = await fetch('/api/admin/credit-units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email, amount: parseInt(amount), reason }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error)
      setResult({ success: true, msg: `✅ Credited ${amount} units to ${email}. New balance: ${data.new_balance} units.` })
      setEmail(''); setAmount(''); setReason('')
      onSuccess()
    } catch (err) {
      setResult({ success: false, msg: `❌ ${err.message}` })
    }
    setLoading(false)
  }

  return (
    <div className="credit-panel">
      <div className="credit-card">
        <h3>💳 Credit Units to User</h3>
        <p className="credit-desc">Manually add units to any user's account. This is free and recorded in transactions.</p>

        {result && (
          <div className={`credit-result ${result.success ? 'success' : 'error'}`}>
            {result.msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="credit-form">
          <div className="credit-field" style={{ position: 'relative' }}>
            <label>User Email</label>
            <input
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={e => handleEmailChange(e.target.value)}
              required
            />
            {suggestions.length > 0 && (
              <div className="autocomplete">
                {suggestions.map(u => (
                  <div key={u.id} className="autocomplete-item" onClick={() => { setEmail(u.email); setSuggestions([]) }}>
                    <span>{u.email}</span>
                    <span className="badge blue">{u.units} units</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="credit-field">
            <label>Units to Credit</label>
            <input
              type="number"
              placeholder="e.g. 10"
              min="1"
              max="10000"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="credit-field">
            <label>Reason <span className="optional">(optional)</span></label>
            <input
              type="text"
              placeholder="e.g. Compensation, Promo, Manual top-up…"
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
          </div>

          <button type="submit" className="credit-btn" disabled={loading}>
            {loading ? 'Crediting…' : `Credit ${amount || '?'} Units`}
          </button>
        </form>
      </div>

      <div className="credit-users-preview">
        <h4>All Users (click to select)</h4>
        <div className="users-scroll">
          {users.map(u => (
            <div key={u.id} className="user-row-mini" onClick={() => setEmail(u.email)}>
              <span className="user-email-mini">{u.email}</span>
              <span className="badge blue">{u.units} units</span>
            </div>
          ))}
          {!users.length && <p className="empty-mini">No users yet</p>}
        </div>
      </div>
    </div>
  )
}

function TemplateBackgroundsPanel({ backgrounds, onUpdate }) {
  const [uploading, setUploading] = useState({})
  const [removing, setRemoving] = useState({})
  const [notice, setNotice] = useState('')
  const fileRefs = useRef({})

  const handleUpload = async (countryId, file) => {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setNotice('Image too large — max 5 MB')
      setTimeout(() => setNotice(''), 3000)
      return
    }
    setUploading(p => ({ ...p, [countryId]: true }))
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const token = localStorage.getItem('pp_token')
        const r = await fetch(`/api/admin/template-backgrounds/${countryId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ image: ev.target.result }),
        })
        if (r.ok) { onUpdate(); setNotice(`✅ Background set for ${countryId}`) }
        else setNotice('Upload failed')
      } catch { setNotice('Upload failed') }
      setUploading(p => ({ ...p, [countryId]: false }))
      setTimeout(() => setNotice(''), 3000)
    }
    reader.readAsDataURL(file)
  }

  const handleRemove = async (countryId) => {
    setRemoving(p => ({ ...p, [countryId]: true }))
    try {
      const token = localStorage.getItem('pp_token')
      await fetch(`/api/admin/template-backgrounds/${countryId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      onUpdate()
      setNotice(`🗑 Background removed for ${countryId}`)
      setTimeout(() => setNotice(''), 3000)
    } catch {}
    setRemoving(p => ({ ...p, [countryId]: false }))
  }

  return (
    <div className="admin-section">
      <h3>🖼 Passport Template Backgrounds</h3>
      <p className="bg-desc">
        Upload a custom background image for each country. The image will appear behind the passport content.
        Recommended: high-resolution (at least 900×600px), subtle textures or patterns work best.
      </p>

      {notice && <div className="bg-notice">{notice}</div>}

      <div className="bg-grid">
        {TEMPLATE_LIST.map(t => {
          const hasBg = !!backgrounds[t.id]
          return (
            <div key={t.id} className={`bg-card ${hasBg ? 'has-bg' : ''}`}>
              <div className="bg-preview" style={{
                background: hasBg ? `url(${backgrounds[t.id]}) center/cover` : t.bgColor,
                backgroundImage: hasBg ? `url(${backgrounds[t.id]})` : t.bgPattern,
              }}>
                <div className="bg-flag">{t.flag}</div>
                {hasBg && <div className="bg-active-tag">Custom BG</div>}
              </div>
              <div className="bg-info">
                <div className="bg-name">{t.name}</div>
                <div className="bg-actions">
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    ref={el => fileRefs.current[t.id] = el}
                    onChange={e => handleUpload(t.id, e.target.files[0])}
                  />
                  <button
                    className="bg-upload-btn"
                    onClick={() => fileRefs.current[t.id]?.click()}
                    disabled={uploading[t.id]}
                  >
                    {uploading[t.id] ? '…' : hasBg ? '↑ Replace' : '↑ Upload'}
                  </button>
                  {hasBg && (
                    <button
                      className="bg-remove-btn"
                      onClick={() => handleRemove(t.id)}
                      disabled={removing[t.id]}
                    >
                      {removing[t.id] ? '…' : '✕ Remove'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="stat-card" style={{ borderColor: color + '40' }}>
      <div className="stat-icon" style={{ color }}>{icon}</div>
      <div className="stat-value" style={{ color }}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}
