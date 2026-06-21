import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './AdminLogin.css'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || 'Login failed')
      if (!data.user?.is_admin) {
        throw new Error('Access denied — admin privileges required')
      }
      localStorage.setItem('pp_token', data.token)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-bg" />
      <div className="admin-login-card">
        <div className="admin-login-badge">ADMIN</div>
        <div className="admin-login-logo">🔐</div>
        <h1>Admin Portal</h1>
        <p className="admin-login-sub">PassportGen Administration</p>

        {error && <div className="admin-login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-login-field">
            <label>Admin Email</label>
            <input
              type="email"
              placeholder="admin@example.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
              autoComplete="username"
            />
          </div>

          <div className="admin-login-field">
            <label>Password</label>
            <div className="admin-pass-wrap">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Admin password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                autoComplete="current-password"
              />
              <button type="button" className="admin-eye-btn" onClick={() => setShowPass(v => !v)}>
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? 'Authenticating…' : 'Sign In to Admin'}
          </button>
        </form>

        <p className="admin-login-back">
          <button onClick={() => navigate('/')} className="admin-back-link">← Back to app</button>
        </p>
      </div>
    </div>
  )
}
