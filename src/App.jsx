import { useState, useRef } from 'react'
import PassportForm from './components/PassportForm.jsx'
import PassportCard from './components/PassportCard.jsx'
import './App.css'

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
  const passportRef = useRef(null)

  const handleDownload = async () => {
    const { default: html2canvas } = await import('html2canvas')
    const canvas = await html2canvas(passportRef.current, {
      scale: 3,
      useCORS: true,
      backgroundColor: null,
    })
    const link = document.createElement('a')
    link.download = 'passport.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-icon">🛂</div>
          <div>
            <h1>Passport Generator</h1>
            <p>Create a custom passport card</p>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="layout">
          <aside className="form-panel">
            <PassportForm data={data} onChange={setData} />
          </aside>

          <section className="preview-panel">
            <div className="preview-header">
              <h2>Live Preview</h2>
              <button className="download-btn" onClick={handleDownload}>
                ⬇ Download PNG
              </button>
            </div>
            <div className="preview-wrapper">
              <PassportCard ref={passportRef} data={data} />
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
