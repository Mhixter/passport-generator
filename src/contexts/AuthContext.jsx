import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('pp_token')
    if (token) {
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(u => { if (u) setUser(u) })
        .catch(() => {})
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = (token, userData) => {
    localStorage.setItem('pp_token', token)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('pp_token')
    setUser(null)
  }

  const refreshUser = async () => {
    const token = localStorage.getItem('pp_token')
    if (!token) return
    try {
      const r = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      if (r.ok) setUser(await r.json())
    } catch {}
  }

  const spendUnits = async (amount, type) => {
    const token = localStorage.getItem('pp_token')
    const r = await fetch('/api/units/spend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ amount, type }),
    })
    const data = await r.json()
    if (!r.ok) throw new Error(data.error || 'Insufficient units')
    setUser(prev => ({ ...prev, units: data.units }))
    return data
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, spendUnits }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
