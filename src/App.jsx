import { useState, useRef, useCallback } from 'react'
import PassportForm from './components/PassportForm.jsx'
import PassportCard from './components/PassportCard.jsx'
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
  authority: 'MINISTRY OF\nFOREIGN AFFAIRS',
  passportNo: 'SK7788056',
  country: 'JAPAN',
  countryCode: 'JPN',
  type: 'P',
  photo: null,
  emblem: null,
  cornerEmblem: null,
}

export default function App() {
  const [data, setData] = useState(defaultData)
  const [templateId, setTemplateId] = useState('japan')
  const [watermarkImage, setWatermarkImage] = useState(null)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkProgress, setBulkProgress] = useState(0)
  const passportRef = useRef(null)

  const template = TEMPLATES[templateId]

  const getHtml2Canvas = useCallback(async () => {
    const { default: html2canvas } = await import('html2canvas')
    return html2canvas
  }, [])

  const handleDownload = async () => {
    const html2canvas = await getHtml2Canvas()
    const canvas = await html2canvas(passportRef.current, {
      scale: 3,
      useCORS: true,
      backgroundColor: null,
    })
    const link = document.createElement('a')
    link.download = `passport_${data.surname}_${data.passportNo}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const handleBulkDownload = async () => {
    setBulkLoading(true)
    setBulkProgress(0)
    const html2canvas = await getHtml2Canvas()

    for (let i = 0; i < 10; i++) {
      const pNo = randomPassportNo()
      setData(prev => ({ ...prev, passportNo: pNo }))
      await new Promise(r => setTimeout(r, 300))

      const canvas = await html2canvas(passportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      })
      const link = document.createElement('a')
      link.download = `passport_${data.surname}_${pNo}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      setBulkProgress(i + 1)
      await new Promise(r => setTimeout(r, 200))
    }
    setBulkLoading(false)
  }

  const handleTemplateChange = (id) => {
    const t = TEMPLATES[id]
    if (!t) return
    setTemplateId(id)
    setData(prev => ({
      ...prev,
      country: t.countryName,
      countryCode: t.countryCode,
      type: t.type || 'P',
    }))
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-icon">🛂</div>
          <div>
            <h1>Passport Generator</h1>
            <p>Create a custom passport card with 10 country templates</p>
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
            <PassportForm data={data} onChange={setData} watermarkImage={watermarkImage} onWatermarkChange={setWatermarkImage} />
          </aside>

          <section className="preview-panel">
            <div className="preview-header">
              <h2>Live Preview — <span style={{ color: template?.accentColor }}>{template?.flag} {template?.name}</span></h2>
              <div className="action-btns">
                <button className="download-btn" onClick={handleDownload}>
                  ⬇ Download PNG
                </button>
                <button
                  className="bulk-btn"
                  onClick={handleBulkDownload}
                  disabled={bulkLoading}
                >
                  {bulkLoading
                    ? `Generating ${bulkProgress}/10...`
                    : '🔀 Download 10 (Random Numbers)'}
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
              <PassportCard
                ref={passportRef}
                data={data}
                template={template}
                watermarkImage={watermarkImage}
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
