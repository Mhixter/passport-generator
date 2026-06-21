import { forwardRef } from 'react'
import './PassportCard.css'

function generateMRZ(data, template) {
  const pad = (str, len, char = '<') =>
    (str || '').replace(/\s/g, '<').toUpperCase().padEnd(len, char).slice(0, len)
  const surname = (data.surname || '').toUpperCase().replace(/\s/g, '<')
  const given = (data.givenName || '').toUpperCase().replace(/\s/g, '<')
  const names = `${surname}<<${given}`
  const code = (template?.countryCode || data.countryCode || 'XXX').slice(0, 3)
  const line1 = `P<${pad(code, 3)}${pad(names, 39)}`

  const passNum = pad(data.passportNo, 9)
  const dob = formatMRZDate(data.dateOfBirth)
  const sex = (data.sex || 'M').charAt(0).toUpperCase()
  const exp = formatMRZDate(data.dateOfExpiry)
  const line2 = `${passNum}${code}${dob}${sex}${exp}<<<<<<<<<<<<<<00`

  return { line1: line1.slice(0, 44), line2: line2.slice(0, 44) }
}

function formatMRZDate(dateStr) {
  const months = {
    JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06',
    JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12',
  }
  if (!dateStr) return '000000'
  const parts = dateStr.toUpperCase().trim().split(/\s+/)
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0')
    const month = months[parts[1]] || '00'
    const year = parts[2].slice(-2)
    return `${year}${month}${day}`
  }
  return '000000'
}

const PassportCard = forwardRef(function PassportCard({ data, template, watermarkImage }, ref) {
  const t = template || {}
  const mrz = generateMRZ(data, t)

  const accentColor = t.accentColor || '#b8860b'
  const headerTextColor = t.headerTextColor || '#1a1a1a'
  const borderColor = t.borderColor || 'rgba(180,150,80,0.35)'
  const mrzBg = t.mrzBg || 'rgba(0,0,0,0.04)'
  const mrzBorder = t.mrzBorder || 'rgba(0,0,0,0.15)'
  const cornerColor = t.cornerColor || accentColor

  return (
    <div
      className="passport-card"
      ref={ref}
      style={{ background: t.bgGradient || '#f5f0dc' }}
    >
      <div className="pp-watermark-pattern" style={{
        backgroundImage: `repeating-linear-gradient(45deg,transparent,transparent 18px,${t.watermarkColor || 'rgba(0,0,0,0.03)'} 18px,${t.watermarkColor || 'rgba(0,0,0,0.03)'} 19px),repeating-linear-gradient(-45deg,transparent,transparent 18px,${t.watermarkColor || 'rgba(0,0,0,0.03)'} 18px,${t.watermarkColor || 'rgba(0,0,0,0.03)'} 19px)`,
      }} />

      {watermarkImage && (
        <div className="pp-big-watermark-img">
          <img src={watermarkImage} alt="watermark" />
        </div>
      )}

      <div className="pp-top-bar" style={{ borderBottomColor: borderColor }}>
        <div className="pp-corner-emblem">
          {data.cornerEmblem
            ? <img src={data.cornerEmblem} alt="emblem" />
            : <DefaultCornerEmblem color={cornerColor} />}
        </div>

        <div className="pp-top-center">
          {t.titleLocal && (
            <div
              className="pp-local-title"
              style={{ color: headerTextColor, fontFamily: t.id === 'japan' ? "'Noto Sans JP', sans-serif" : 'inherit' }}
            >
              {t.titleLocal}
            </div>
          )}
          <div className="pp-country-name" style={{ color: headerTextColor }}>
            {t.countryName || data.country || 'COUNTRY'}
          </div>
          <div className="pp-passport-label" style={{ color: accentColor }}>
            {t.passportLabel || 'PASSPORT'}
          </div>
        </div>

        <div className="pp-corner-emblem">
          {data.cornerEmblem
            ? <img src={data.cornerEmblem} alt="emblem" />
            : <DefaultCornerEmblem color={cornerColor} />}
        </div>
      </div>

      <div className="pp-header-labels" style={{ borderBottomColor: borderColor }}>
        <div className="pp-label-col">
          <div className="pp-label-sm" style={{ color: accentColor }}>{t.typeLabel || 'Type'}</div>
          <div className="pp-val-sm" style={{ color: headerTextColor }}>{data.type || t.type || 'P'}</div>
        </div>
        <div className="pp-label-col">
          <div className="pp-label-sm" style={{ color: accentColor }}>{t.issuingLabel || 'Country'}</div>
          <div className="pp-val-sm" style={{ color: headerTextColor }}>{t.countryCode || data.countryCode || 'XXX'}</div>
        </div>
        <div className="pp-label-col" style={{ marginLeft: 'auto' }}>
          <div className="pp-label-sm" style={{ color: accentColor }}>{t.passNoLabel || 'Passport No.'}</div>
          <div className="pp-val-lg" style={{ color: headerTextColor }}>{data.passportNo || 'AB1234567'}</div>
        </div>
      </div>

      <div className="pp-body">
        <div className="pp-photo-col">
          <div className="pp-photo-box" style={{ borderColor }}>
            {data.photo
              ? <img src={data.photo} alt="passport photo" className="pp-photo-img" />
              : <div className="pp-photo-placeholder"><span>Photo</span></div>}
          </div>
          <div className="pp-photo-emblem">
            {data.emblem
              ? <img src={data.emblem} alt="emblem" />
              : <DefaultEmblem color={t.emblemColor || '#4a7c3f'} />}
          </div>
        </div>

        <div className="pp-info-col">
          <Field label={t.surnameLabel || 'Surname'} value={data.surname} large accentColor={accentColor} />
          <Field label={t.givenNameLabel || 'Given name'} value={data.givenName} large accentColor={accentColor} />

          <div className="pp-row-fields">
            <Field label={t.nationalityLabel || 'Nationality'} value={data.nationality || t.countryCode} accentColor={accentColor} />
            <Field label={t.dobLabel || 'Date of birth'} value={data.dateOfBirth} accentColor={accentColor} />
          </div>

          <div className="pp-row-fields">
            <Field label={t.sexLabel || 'Sex'} value={data.sex} accentColor={accentColor} />
            <Field label={t.domicileLabel || 'Domicile'} value={data.registeredDomicile} accentColor={accentColor} />
          </div>

          <div className="pp-row-fields">
            <Field label={t.issueLabel || 'Date of issue'} value={data.dateOfIssue} accentColor={accentColor} />
            <div className="pp-field">
              <div className="pp-field-label" style={{ color: accentColor }}>{t.signatureLabel || 'Signature'}</div>
              <div className="pp-field-value signature-space" style={{ borderBottomColor: accentColor }} />
            </div>
          </div>

          <Field label={t.expiryLabel || 'Date of expiry'} value={data.dateOfExpiry} accentColor={accentColor} />

          <div className="pp-field">
            <div className="pp-field-label" style={{ color: accentColor }}>{t.authorityLabel || 'Authority'}</div>
            <div className="pp-field-value authority">
              {(data.authority || 'MINISTRY OF\nFOREIGN AFFAIRS').split('\n').map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="pp-mrz" style={{ background: mrzBg, borderTopColor: mrzBorder }}>
        <div className="pp-mrz-line">{mrz.line1}</div>
        <div className="pp-mrz-line">{mrz.line2}</div>
      </div>
    </div>
  )
})

function Field({ label, value, large, accentColor }) {
  return (
    <div className="pp-field">
      <div className="pp-field-label" style={{ color: accentColor || '#666' }}>{label}</div>
      <div className={`pp-field-value${large ? ' large' : ''}`}>{value || '—'}</div>
    </div>
  )
}

function DefaultCornerEmblem({ color = '#b8860b' }) {
  return (
    <svg viewBox="0 0 60 60" width="50" height="50" fill="none">
      <circle cx="30" cy="30" r="27" fill="none" stroke={color} strokeWidth="2" />
      <circle cx="30" cy="30" r="20" fill="none" stroke={color} strokeWidth="1.2" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <line key={i}
          x1={30 + 20 * Math.cos((angle * Math.PI) / 180)}
          y1={30 + 20 * Math.sin((angle * Math.PI) / 180)}
          x2={30 + 27 * Math.cos((angle * Math.PI) / 180)}
          y2={30 + 27 * Math.sin((angle * Math.PI) / 180)}
          stroke={color} strokeWidth="1.5"
        />
      ))}
      <circle cx="30" cy="30" r="9" fill={color} opacity="0.25" />
      <circle cx="30" cy="30" r="4" fill={color} opacity="0.5" />
    </svg>
  )
}

function DefaultEmblem({ color = '#4a7c3f' }) {
  return (
    <svg viewBox="0 0 80 80" width="52" height="52">
      <circle cx="40" cy="40" r="37" fill="none" stroke={color} strokeWidth="2" />
      <circle cx="40" cy="40" r="29" fill={color} opacity="0.1" />
      <circle cx="40" cy="40" r="19" fill={color} opacity="0.15" />
      {[0, 72, 144, 216, 288].map((angle, i) => (
        <ellipse key={i}
          cx={40 + 14 * Math.cos((angle * Math.PI) / 180)}
          cy={40 + 14 * Math.sin((angle * Math.PI) / 180)}
          rx="5" ry="9"
          fill={color} opacity="0.55"
          transform={`rotate(${angle}, ${40 + 14 * Math.cos((angle * Math.PI) / 180)}, ${40 + 14 * Math.sin((angle * Math.PI) / 180)})`}
        />
      ))}
      <circle cx="40" cy="40" r="7" fill={color} opacity="0.8" />
    </svg>
  )
}

export default PassportCard
