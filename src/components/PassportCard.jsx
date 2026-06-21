import { forwardRef } from 'react'
import './PassportCard.css'

function generateMRZ(data) {
  const pad = (str, len, char = '<') => (str || '').replace(/\s/g, '<').toUpperCase().padEnd(len, char).slice(0, len)
  const surname = (data.surname || '').toUpperCase().replace(/\s/g, '<')
  const given = (data.givenName || '').toUpperCase().replace(/\s/g, '<')
  const names = `${surname}<<${given}`
  const line1 = `P<${pad(data.countryCode, 3)}${pad(names, 39)}`

  const passNum = pad(data.passportNo, 9)
  const country = pad(data.countryCode, 3)
  const dob = formatMRZDate(data.dateOfBirth)
  const sex = (data.sex || 'M').charAt(0).toUpperCase()
  const exp = formatMRZDate(data.dateOfExpiry)
  const line2 = `${passNum}${country}${dob}${sex}${exp}<<<<<<<<<<<<<<00`

  return { line1: line1.slice(0, 44), line2: line2.slice(0, 44) }
}

function formatMRZDate(dateStr) {
  const months = { JAN:'01',FEB:'02',MAR:'03',APR:'04',MAY:'05',JUN:'06',
                   JUL:'07',AUG:'08',SEP:'09',OCT:'10',NOV:'11',DEC:'12' }
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

const PassportCard = forwardRef(function PassportCard({ data }, ref) {
  const mrz = generateMRZ(data)

  return (
    <div className="passport-card" ref={ref}>
      <div className="pp-background" />
      <div className="pp-watermark" />

      <div className="pp-top-bar">
        <div className="pp-corner-emblem left">
          {data.cornerEmblem
            ? <img src={data.cornerEmblem} alt="emblem" />
            : <DefaultCornerEmblem />}
        </div>
        <div className="pp-top-center">
          <div className="pp-japanese-title">日本国</div>
          <div className="pp-country-name">{data.country || 'JAPAN'}</div>
          <div className="pp-passport-label">PASSPORT</div>
        </div>
        <div className="pp-corner-emblem right">
          {data.cornerEmblem
            ? <img src={data.cornerEmblem} alt="emblem" />
            : <DefaultCornerEmblem />}
        </div>
      </div>

      <div className="pp-header-labels">
        <div className="pp-label-group" style={{ marginLeft: 10 }}>
          <div className="pp-label-jp">型/Type</div>
        </div>
        <div className="pp-label-group">
          <div className="pp-label-jp">発行国/Issuing country</div>
        </div>
        <div className="pp-label-group" style={{ marginLeft: 'auto', marginRight: 10 }}>
          <div className="pp-label-jp">旅券番号/Passport No.</div>
        </div>
      </div>

      <div className="pp-header-values">
        <div className="pp-value-type">{data.type || 'P'}</div>
        <div className="pp-value-country-code">{data.countryCode || 'JPN'}</div>
        <div className="pp-value-passport-no">{data.passportNo || 'SK7788056'}</div>
      </div>

      <div className="pp-body">
        <div className="pp-photo-col">
          <div className="pp-photo-box">
            {data.photo
              ? <img src={data.photo} alt="passport photo" className="pp-photo-img" />
              : <div className="pp-photo-placeholder"><span>Photo</span></div>}
          </div>
          <div className="pp-photo-emblem">
            {data.emblem
              ? <img src={data.emblem} alt="emblem" />
              : <DefaultEmblem />}
          </div>
        </div>

        <div className="pp-info-col">
          <div className="pp-field">
            <div className="pp-field-label">姓/Surname</div>
            <div className="pp-field-value large">{data.surname || 'SURNAME'}</div>
          </div>
          <div className="pp-field">
            <div className="pp-field-label">名/Given name</div>
            <div className="pp-field-value large">{data.givenName || 'GIVEN NAME'}</div>
          </div>

          <div className="pp-row-fields">
            <div className="pp-field">
              <div className="pp-field-label">国　籍/Nationality</div>
              <div className="pp-field-value">{data.nationality || 'JPN'}</div>
            </div>
            <div className="pp-field">
              <div className="pp-field-label">生年月日/Date of birth</div>
              <div className="pp-field-value">{data.dateOfBirth || '01 JAN 1990'}</div>
            </div>
          </div>

          <div className="pp-row-fields">
            <div className="pp-field">
              <div className="pp-field-label">性別/Sex</div>
              <div className="pp-field-value">{data.sex || 'M'}</div>
            </div>
            <div className="pp-field">
              <div className="pp-field-label">本　籍/Registered Domicile</div>
              <div className="pp-field-value">{data.registeredDomicile || 'TOKYO/JPN'}</div>
            </div>
          </div>

          <div className="pp-row-fields">
            <div className="pp-field">
              <div className="pp-field-label">交付年月日/Date of issue</div>
              <div className="pp-field-value">{data.dateOfIssue || '01 JAN 2024'}</div>
            </div>
            <div className="pp-field">
              <div className="pp-field-label">所持人自署/Signature of bearer</div>
              <div className="pp-field-value signature-space" />
            </div>
          </div>

          <div className="pp-field">
            <div className="pp-field-label">有効期限満了日/Date of expiry</div>
            <div className="pp-field-value">{data.dateOfExpiry || '01 JAN 2034'}</div>
          </div>

          <div className="pp-field">
            <div className="pp-field-label">発行官庁/Authority</div>
            <div className="pp-field-value authority">
              {(data.authority || 'MINISTRY OF\nFOREIGN AFFAIRS').split('\n').map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="pp-mrz">
        <div className="pp-mrz-line">{mrz.line1}</div>
        <div className="pp-mrz-line">{mrz.line2}</div>
      </div>
    </div>
  )
})

function DefaultCornerEmblem() {
  return (
    <svg viewBox="0 0 60 60" width="50" height="50" fill="none">
      <circle cx="30" cy="30" r="28" fill="none" stroke="#b8860b" strokeWidth="2" />
      <circle cx="30" cy="30" r="22" fill="none" stroke="#b8860b" strokeWidth="1.5" />
      {[0,45,90,135,180,225,270,315].map((angle, i) => (
        <line key={i}
          x1={30 + 22 * Math.cos((angle * Math.PI) / 180)}
          y1={30 + 22 * Math.sin((angle * Math.PI) / 180)}
          x2={30 + 28 * Math.cos((angle * Math.PI) / 180)}
          y2={30 + 28 * Math.sin((angle * Math.PI) / 180)}
          stroke="#b8860b" strokeWidth="1.5"
        />
      ))}
      <circle cx="30" cy="30" r="10" fill="#b8860b" opacity="0.3" />
      <text x="30" y="34" textAnchor="middle" fontSize="10" fill="#8b6914" fontWeight="bold">✦</text>
    </svg>
  )
}

function DefaultEmblem() {
  return (
    <svg viewBox="0 0 80 80" width="52" height="52">
      <circle cx="40" cy="40" r="38" fill="none" stroke="#4a7c3f" strokeWidth="2" />
      <circle cx="40" cy="40" r="30" fill="#4a7c3f" opacity="0.15" />
      <circle cx="40" cy="40" r="20" fill="#4a7c3f" opacity="0.2" />
      {[0,72,144,216,288].map((angle, i) => (
        <ellipse key={i}
          cx={40 + 15 * Math.cos((angle * Math.PI) / 180)}
          cy={40 + 15 * Math.sin((angle * Math.PI) / 180)}
          rx="6" ry="10"
          fill="#4a7c3f" opacity="0.6"
          transform={`rotate(${angle}, ${40 + 15 * Math.cos((angle * Math.PI) / 180)}, ${40 + 15 * Math.sin((angle * Math.PI) / 180)})`}
        />
      ))}
      <circle cx="40" cy="40" r="8" fill="#4a7c3f" opacity="0.8" />
    </svg>
  )
}

export default PassportCard
