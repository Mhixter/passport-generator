import { forwardRef } from 'react'
import CountryLogo from './CountryLogo.jsx'
import './PassportCard.css'

function generateMRZ(data, template) {
  const pad = (str, len, char = '<') =>
    (str || '').replace(/[^A-Z0-9]/gi, c => /[a-z]/i.test(c) ? c : '<').toUpperCase().padEnd(len, char).slice(0, len)
  const surname = (data.surname || '').toUpperCase().replace(/\s/g, '<')
  const given = (data.givenName || '').toUpperCase().replace(/\s/g, '<')
  const code = (template?.countryCode || 'XXX').slice(0, 3)
  const line1 = `P<${code}${pad(surname + '<<' + given, 39)}`
  const passNum = pad(data.passportNo, 9)
  const dob = formatMRZDate(data.dateOfBirth)
  const sex = (data.sex || 'M').charAt(0).toUpperCase()
  const exp = formatMRZDate(data.dateOfExpiry)
  const line2 = `${passNum}${code}${dob}${sex}${exp}<<<<<<<<<<<<<<00`
  return { line1: line1.slice(0, 44), line2: line2.slice(0, 44) }
}

function formatMRZDate(dateStr) {
  const months = { JAN:'01',FEB:'02',MAR:'03',APR:'04',MAY:'05',JUN:'06',JUL:'07',AUG:'08',SEP:'09',OCT:'10',NOV:'11',DEC:'12' }
  if (!dateStr) return '000000'
  const parts = dateStr.toUpperCase().trim().split(/\s+/)
  if (parts.length === 3) return `${parts[2].slice(-2)}${months[parts[1]] || '00'}${parts[0].padStart(2,'0')}`
  return '000000'
}

const PassportCard = forwardRef(function PassportCard({ data, template, watermarkImage, customBg }, ref) {
  const t = template || {}
  const mrz = generateMRZ(data, t)
  const accent = t.accentColor || '#b8860b'
  const headerText = t.headerTextColor || '#1a1a1a'
  const border = t.borderColor || 'rgba(180,150,80,0.35)'
  const mrzBg = t.mrzBg || 'rgba(0,0,0,0.04)'
  const mrzBdr = t.mrzBorder || 'rgba(0,0,0,0.15)'
  const cornerColor = t.cornerColor || accent
  const logoAlign = t.logoAlign || 'split'

  const renderLogo = () => {
    if (data.cornerEmblem) return <img src={data.cornerEmblem} alt="" style={{ width:'100%', height:'100%', objectFit:'contain' }} />
    return <CountryLogo countryId={t.id} color={cornerColor} size={46} />
  }

  const renderSeal = () => {
    if (data.emblem) return <img src={data.emblem} alt="seal" style={{ width:'100%', height:'100%', objectFit:'contain' }} />
    return <CountryLogo countryId={t.id} color={t.emblemColor || t.accentColor || '#4a7c3f'} size={52} />
  }

  const sealPos = t.sealPosition || { bottom: true, right: false }

  return (
    <div className="passport-card" ref={ref} style={{ background: t.bgColor || '#f5f0dc' }}>
      {customBg
        ? <div className="pp-custom-bg" style={{ backgroundImage: `url(${customBg})` }} />
        : <div className="pp-bg-pattern" style={{ backgroundImage: t.bgPattern }} />
      }
      <div className="pp-bg-overlay" style={{ background: customBg
        ? `linear-gradient(135deg, ${t.bgColor || '#f5f0dc'}b0 0%, ${t.bgColor || '#f5f0dc'}70 100%)`
        : `linear-gradient(135deg, ${t.bgColor || '#f5f0dc'}cc 0%, ${t.bgColor || '#f5f0dc'}88 100%)`
      }} />

      {watermarkImage && (
        <div className="pp-watermark-img">
          <img src={watermarkImage} alt="watermark" />
        </div>
      )}

      <div className="pp-top-bar" style={{ borderBottomColor: border }}>
        {(logoAlign === 'split' || logoAlign === 'left') && (
          <div className="pp-logo-box">{renderLogo()}</div>
        )}

        <div className={`pp-top-center ${logoAlign === 'left' ? 'align-left' : logoAlign === 'right' ? 'align-right' : ''}`}>
          {t.titleLocal && (
            <div className="pp-title-local" style={{ color: headerText, fontFamily: t.id === 'japan' ? "'Noto Sans JP',sans-serif" : 'inherit' }}>
              {t.titleLocal.split('\n').map((l, i) => <div key={i}>{l}</div>)}
            </div>
          )}
          <div className="pp-country-name" style={{ color: headerText }}>{t.countryName || data.country}</div>
          <div className="pp-passport-label" style={{ color: accent }}>{t.passportLabel || 'PASSPORT'}</div>
        </div>

        {(logoAlign === 'split' || logoAlign === 'right') && (
          <div className="pp-logo-box">{renderLogo()}</div>
        )}
        {logoAlign === 'center' && (
          <div className="pp-logo-box pp-logo-center">{renderLogo()}</div>
        )}
      </div>

      <div className="pp-id-bar" style={{ borderBottomColor: border }}>
        <div className="pp-id-col">
          <div className="pp-id-label" style={{ color: accent }}>{t.typeLabel || 'Type'}</div>
          <div className="pp-id-val" style={{ color: headerText }}>{data.type || 'P'}</div>
        </div>
        <div className="pp-id-col">
          <div className="pp-id-label" style={{ color: accent }}>{t.issuingLabel || 'Country'}</div>
          <div className="pp-id-val" style={{ color: headerText }}>{t.countryCode || data.countryCode || 'XXX'}</div>
        </div>
        <div className="pp-id-col" style={{ marginLeft: 'auto' }}>
          <div className="pp-id-label" style={{ color: accent }}>{t.passNoLabel || 'Passport No.'}</div>
          <div className="pp-id-val large" style={{ color: headerText }}>{data.passportNo || 'AB1234567'}</div>
        </div>
      </div>

      <div className="pp-body">
        <div className="pp-photo-col">
          <div className="pp-photo-box" style={{ borderColor: border }}>
            {data.photo
              ? <img src={data.photo} alt="photo" className="pp-photo-img" />
              : <div className="pp-photo-ph"><span>Photo</span></div>}
          </div>
          <div className={`pp-seal-wrap ${sealPos.bottom ? 'seal-bottom' : 'seal-top'} ${sealPos.right ? 'seal-right' : ''}`}>
            <div className="pp-seal-box">{renderSeal()}</div>
          </div>
        </div>

        <div className="pp-info-col">
          <Field label={t.surnameLabel || 'Surname'} value={data.surname} large ac={accent} />
          <Field label={t.givenNameLabel || 'Given name'} value={data.givenName} large ac={accent} />
          <div className="pp-row">
            <Field label={t.nationalityLabel || 'Nationality'} value={data.nationality || t.countryCode} ac={accent} />
            <Field label={t.dobLabel || 'Date of birth'} value={data.dateOfBirth} ac={accent} />
          </div>
          <div className="pp-row">
            <Field label={t.sexLabel || 'Sex'} value={data.sex} ac={accent} />
            <Field label={t.domicileLabel || 'Domicile'} value={data.registeredDomicile} ac={accent} />
          </div>
          <div className="pp-row">
            <Field label={t.issueLabel || 'Date of issue'} value={data.dateOfIssue} ac={accent} />
            <div className="pp-field">
              <div className="pp-fl" style={{ color: accent }}>{t.signatureLabel || 'Signature'}</div>
              <div className="pp-sig-line" style={{ borderBottomColor: accent }} />
            </div>
          </div>
          <Field label={t.expiryLabel || 'Date of expiry'} value={data.dateOfExpiry} ac={accent} />
          <div className="pp-field">
            <div className="pp-fl" style={{ color: accent }}>{t.authorityLabel || 'Authority'}</div>
            <div className="pp-fv authority">
              {(data.authority || '').split('\n').map((l, i) => <div key={i}>{l}</div>)}
            </div>
          </div>
        </div>
      </div>

      <div className="pp-mrz" style={{ background: mrzBg, borderTopColor: mrzBdr }}>
        <div className="pp-mrz-line">{mrz.line1}</div>
        <div className="pp-mrz-line">{mrz.line2}</div>
      </div>
    </div>
  )
})

function Field({ label, value, large, ac }) {
  return (
    <div className="pp-field">
      <div className="pp-fl" style={{ color: ac || '#666' }}>{label}</div>
      <div className={`pp-fv${large ? ' large' : ''}`}>{value || '—'}</div>
    </div>
  )
}

export default PassportCard
