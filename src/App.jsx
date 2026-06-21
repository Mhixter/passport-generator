import { useState, useRef, useCallback, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import PassportForm from './components/PassportForm.jsx'
import PassportCard from './components/PassportCard.jsx'
import BuyUnitsModal from './components/BuyUnitsModal.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Admin from './pages/Admin.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import { TEMPLATES, randomPassportNo } from './templates.js'
import './App.css'

const TEMPLATE_LIST = Object.values(TEMPLATES)

const defaultData = {
  surname: 'SOMTING',
  givenName: 'KILEIE',
  nationality: 'JPN',
  dateOfBirth: '25 MAY 1998',
  sex: 'M',
  registeredDomicile: 'KANAGAWA/JPN',
  dateOfIssue: '25 MAY 2026',
  dateOfExpiry: '25 MAY 2031',
  authority: 'MINISTRY OF FOREIGN AFFAIRS',
  passportNo: 'SK7788056',
  country: 'JAPAN',
  countryCode: 'JPN',
  type: 'P',
  photo: null,
  emblem: null,
  cornerEmblem: null,
  height: '',
  eyeColor: '',
  residence: '',
  nationalIdNo: '',
  issuingOffice: '',
  filiation1: '',
  filiation2: '',
  personalNo: '',
  birthName: '',
  surnameArabic: '',
  givenNameArabic: '',
  signature: null,
}

function Generator() {
  const { user, logout, spendUnits, refreshUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [data, setData] = useState(defaultData)
  const [templateId, setTemplateId] = useState('japan')
  const [watermarkImage, setWatermarkImage] = useState(null)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkProgress, setBulkProgress] = useState(0)
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [toast, setToast] = useState(null)
  const [templateBGs, setTemplateBGs] = useState({})
  const passportRef = useRef(null)
  const template = TEMPLATES[templateId]

  useEffect(() => {
    fetch('/api/admin/template-backgrounds')
      .then(r => r.ok ? r.json() : {})
      .then(d => setTemplateBGs(d))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('payment') === 'success') {
      refreshUser()
      showToast('✅ Payment successful! Units added to your account.', 'success')
      navigate('/', { replace: true })
    } else if (params.get('payment') === 'failed') {
      showToast('❌ Payment failed or cancelled.', 'error')
      navigate('/', { replace: true })
    }
  }, [location.search])

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  const getHtml2Canvas = useCallback(async () => {
    const { default: h2c } = await import('html2canvas')
    return h2c
  }, [])

  const handleDownload = async () => {
    if (user.units < 1) { setShowBuyModal(true); return }
    try {
      await spendUnits(1, 'single')
      const html2canvas = await getHtml2Canvas()
      const canvas = await html2canvas(passportRef.current, { scale: 3, useCORS: true, backgroundColor: null })
      const link = document.createElement('a')
      link.download = `passport_${data.surname}_${data.passportNo}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      showToast('✅ Passport downloaded!', 'success')
    } catch (err) {
      showToast(err.message || 'Download failed', 'error')
      if (err.message?.includes('Insufficient')) setShowBuyModal(true)
    }
  }

  const handleBulkDownload = async () => {
    if (user.units < 10) { setShowBuyModal(true); return }
    try {
      await spendUnits(10, 'bulk-10')
      setBulkLoading(true)
      setBulkProgress(0)
      const html2canvas = await getHtml2Canvas()
      for (let i = 0; i < 10; i++) {
        const pNo = randomPassportNo()
        setData(prev => ({ ...prev, passportNo: pNo }))
        await new Promise(r => setTimeout(r, 300))
        const canvas = await html2canvas(passportRef.current, { scale: 2, useCORS: true, backgroundColor: null })
        const link = document.createElement('a')
        link.download = `passport_${data.surname}_${pNo}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
        setBulkProgress(i + 1)
        await new Promise(r => setTimeout(r, 200))
      }
      setBulkLoading(false)
      showToast('✅ 10 passports downloaded!', 'success')
    } catch (err) {
      setBulkLoading(false)
      showToast(err.message || 'Bulk download failed', 'error')
      if (err.message?.includes('Insufficient')) setShowBuyModal(true)
    }
  }

  const handleTemplateChange = (id) => {
    const t = TEMPLATES[id]
    if (!t) return
    setTemplateId(id)
    setData(prev => ({ ...prev, country: t.countryName, countryCode: t.countryCode, type: t.type || 'P' }))
  }

  return (
    <div className="app">
      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
      )}

      {showBuyModal && <BuyUnitsModal onClose={() => setShowBuyModal(false)} />}

      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-icon">🛂</div>
            <div>
              <h1>Passport Generator</h1>
              <p>10 country templates</p>
            </div>
          </div>
          <div className="header-right">
            <div className="unit-badge" onClick={() => setShowBuyModal(true)} title="Buy more units">
              <span className="unit-count">{user?.units ?? 0}</span>
              <span className="unit-label">units</span>
              <span className="unit-plus">+</span>
            </div>
            <span className="header-email">{user?.email}</span>
            <button className="logout-btn" onClick={logout}>Logout</button>
          </div>
        </div>
      </header>

      <div className="template-bar">
        {TEMPLATE_LIST.map(t => (
          <button
            key={t.id}
            className={`template-btn ${templateId === t.id ? 'active' : ''}`}
            onClick={() => handleTemplateChange(t.id)}
            style={templateId === t.id ? { borderColor: t.accentColor, color: t.accentColor, background: t.accentLight } : {}}
          >
            <span className="tmpl-flag">{t.flag}</span>
            <span className="tmpl-name">{t.name}</span>
          </button>
        ))}
      </div>

      <main className="app-main">
        <div className="layout">
          <aside className="form-panel">
            <PassportForm data={data} onChange={setData} watermarkImage={watermarkImage} onWatermarkChange={setWatermarkImage} template={template} />
          </aside>

          <section className="preview-panel">
            <div className="preview-header">
              <h2>Live Preview — <span style={{ color: template?.accentColor }}>{template?.flag} {template?.name}</span></h2>
              <div className="action-btns">
                <button className="download-btn" onClick={handleDownload}>
                  ⬇ Download <span className="cost-badge">1 unit</span>
                </button>
                <button className="bulk-btn" onClick={handleBulkDownload} disabled={bulkLoading}>
                  {bulkLoading ? `Generating ${bulkProgress}/10…` : <span>🔀 Download 10 <span className="cost-badge">10 units</span></span>}
                </button>
                <button className="buy-units-btn" onClick={() => setShowBuyModal(true)}>
                  💳 Buy Units
                </button>
              </div>
            </div>

            {bulkLoading && (
              <div className="progress-bar-wrap">
                <div className="progress-bar" style={{ width: `${(bulkProgress / 10) * 100}%` }} />
                <span className="progress-label">{bulkProgress} / 10 done</span>
              </div>
            )}

            <div className="preview-wrapper">
              <PassportCard ref={passportRef} data={data} template={template} watermarkImage={watermarkImage} customBg={templateBGs[templateId] || null} />
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="app-loading">Loading…</div>
  if (!user) return <Navigate to="/signup" replace />
  return children
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="app-loading">Loading…</div>
  if (!user?.is_admin) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="/" element={<ProtectedRoute><Generator /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
