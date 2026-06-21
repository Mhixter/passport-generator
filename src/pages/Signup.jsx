import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import './Auth.css'

export default function Signup() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) return setError('Passwords do not match')
    if (form.password.length < 6) return setError('Password must be at least 6 characters')
    setLoading(true)
    try {
      const r = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error)
      login(data.token, data.user)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🛂</div>
        <h1>Create Account</h1>
        <p className="auth-sub">Get 1 free download on sign up</p>

        <div className="free-badge">🎁 1 Free Download Included</div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <div className="pass-wrap">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="At least 6 characters"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
              <button type="button" className="eye-btn" onClick={() => setShowPass(v => !v)}>
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <div className="auth-field">
            <label>Confirm Password</label>
            <div className="pass-wrap">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repeat your password"
                value={form.confirm}
                onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                required
              />
              <button type="button" className="eye-btn" onClick={() => setShowConfirm(v => !v)}>
                {showConfirm ? '🙈' : '👁'}
              </button>
            </div>
            {form.confirm && form.password !== form.confirm && (
              <span className="field-err">Passwords do not match</span>
            )}
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
