import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import './Admin.css'

export default function Admin() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.is_admin) { navigate('/'); return }
    fetchStats()
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

  if (!user?.is_admin) return null
  if (loading) return <div className="admin-loading">Loading dashboard…</div>

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
        {['overview','users','transactions','downloads'].map(t => (
          <button key={t} className={`admin-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
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
              <thead><tr><th>Email</th><th>Package</th><th>Units</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {(stats?.recent_transactions || []).map(tx => (
                  <tr key={tx.id}>
                    <td>{tx.email}</td>
                    <td>{tx.package_id}</td>
                    <td>{tx.units}</td>
                    <td>₦{(tx.amount_naira || 0).toLocaleString()}</td>
                    <td><span className={`badge ${tx.status === 'success' ? 'green' : 'yellow'}`}>{tx.status}</span></td>
                    <td>{new Date(tx.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {!stats?.recent_transactions?.length && <tr><td colSpan={6} className="empty">No transactions yet</td></tr>}
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

function StatCard({ icon, label, value, color }) {
  return (
    <div className="stat-card" style={{ borderColor: color + '40' }}>
      <div className="stat-icon" style={{ color }}>{icon}</div>
      <div className="stat-value" style={{ color }}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}
