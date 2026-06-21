import { useRef } from 'react'
import './PassportForm.css'

const FIELDS = [
  { key: 'surname', label: 'Surname', placeholder: 'SMITH' },
  { key: 'givenName', label: 'Given Name', placeholder: 'JOHN' },
  { key: 'passportNo', label: 'Passport No.', placeholder: 'AB1234567' },
  { key: 'type', label: 'Type', placeholder: 'P' },
  { key: 'country', label: 'Country Name', placeholder: 'JAPAN' },
  { key: 'countryCode', label: 'Country Code (3-letter)', placeholder: 'JPN' },
  { key: 'nationality', label: 'Nationality', placeholder: 'JPN' },
  { key: 'dateOfBirth', label: 'Date of Birth', placeholder: '25 MAY 1998' },
  { key: 'sex', label: 'Sex', placeholder: 'M / F / X' },
  { key: 'registeredDomicile', label: 'Registered Domicile', placeholder: 'TOKYO/JPN' },
  { key: 'dateOfIssue', label: 'Date of Issue', placeholder: '01 JAN 2024' },
  { key: 'dateOfExpiry', label: 'Date of Expiry', placeholder: '01 JAN 2034' },
  { key: 'authority', label: 'Authority', placeholder: 'MINISTRY OF\nFOREIGN AFFAIRS', multiline: true },
]

export default function PassportForm({ data, onChange }) {
  const photoRef = useRef()
  const emblemRef = useRef()
  const cornerRef = useRef()

  const handleField = (key, value) => {
    onChange({ ...data, [key]: value })
  }

  const handleImage = (key, file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => onChange({ ...data, [key]: e.target.result })
    reader.readAsDataURL(file)
  }

  const clearImage = (key) => {
    onChange({ ...data, [key]: null })
  }

  return (
    <div className="passport-form">
      <div className="form-section-title">Passport Details</div>

      {FIELDS.map(({ key, label, placeholder, multiline }) => (
        <div className="form-group" key={key}>
          <label>{label}</label>
          {multiline ? (
            <textarea
              value={data[key] || ''}
              onChange={(e) => handleField(key, e.target.value)}
              placeholder={placeholder}
              rows={2}
            />
          ) : (
            <input
              type="text"
              value={data[key] || ''}
              onChange={(e) => handleField(key, e.target.value)}
              placeholder={placeholder}
            />
          )}
        </div>
      ))}

      <div className="form-section-title" style={{ marginTop: 20 }}>Images</div>

      <div className="form-group">
        <label>Passport Photo</label>
        <div className="image-upload-row">
          <div
            className="image-preview-box"
            onClick={() => photoRef.current.click()}
            style={data.photo ? { backgroundImage: `url(${data.photo})` } : {}}
          >
            {!data.photo && <span>+ Photo</span>}
          </div>
          {data.photo && (
            <button className="clear-btn" onClick={() => clearImage('photo')}>✕ Remove</button>
          )}
        </div>
        <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={(e) => handleImage('photo', e.target.files[0])} />
      </div>

      <div className="form-group">
        <label>Center Emblem / Seal</label>
        <div className="image-upload-row">
          <div
            className="image-preview-box small"
            onClick={() => emblemRef.current.click()}
            style={data.emblem ? { backgroundImage: `url(${data.emblem})` } : {}}
          >
            {!data.emblem && <span>+ Emblem</span>}
          </div>
          {data.emblem && (
            <button className="clear-btn" onClick={() => clearImage('emblem')}>✕ Remove</button>
          )}
        </div>
        <input ref={emblemRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={(e) => handleImage('emblem', e.target.files[0])} />
      </div>

      <div className="form-group">
        <label>Corner Emblem (top-left &amp; top-right)</label>
        <div className="image-upload-row">
          <div
            className="image-preview-box small"
            onClick={() => cornerRef.current.click()}
            style={data.cornerEmblem ? { backgroundImage: `url(${data.cornerEmblem})` } : {}}
          >
            {!data.cornerEmblem && <span>+ Corner</span>}
          </div>
          {data.cornerEmblem && (
            <button className="clear-btn" onClick={() => clearImage('cornerEmblem')}>✕ Remove</button>
          )}
        </div>
        <input ref={cornerRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={(e) => handleImage('cornerEmblem', e.target.files[0])} />
      </div>

      <div style={{ height: 20 }} />
    </div>
  )
}
