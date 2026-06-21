import { useRef } from 'react'
import './PassportForm.css'

const BASE_FIELDS = [
  { key: 'surname',           label: 'Surname',                  placeholder: 'SMITH' },
  { key: 'givenName',         label: 'Given Name',               placeholder: 'JOHN' },
  { key: 'passportNo',        label: 'Passport No.',             placeholder: 'AB1234567' },
  { key: 'type',              label: 'Type',                     placeholder: 'P' },
  { key: 'nationality',       label: 'Nationality',              placeholder: 'JPN' },
  { key: 'dateOfBirth',       label: 'Date of Birth',            placeholder: '25 MAY 1998' },
  { key: 'sex',               label: 'Sex',                      placeholder: 'M / F / X' },
  { key: 'registeredDomicile',label: 'Place of Birth / Domicile',placeholder: 'TOKYO/JPN' },
  { key: 'dateOfIssue',       label: 'Date of Issue',            placeholder: '01 JAN 2024' },
  { key: 'dateOfExpiry',      label: 'Date of Expiry',           placeholder: '01 JAN 2034' },
  { key: 'authority',         label: 'Authority',                placeholder: 'MINISTRY OF FOREIGN AFFAIRS', multiline: true },
]

const EXTRA_FIELDS = {
  indonesia: [
    { key: 'height',       label: 'Height',            placeholder: '175 cm' },
    { key: 'nationalIdNo', label: 'NIK / National ID', placeholder: '317106 290666 001' },
    { key: 'issuingOffice',label: 'Issuing Office',    placeholder: 'Tanjung Perak' },
  ],
  france: [
    { key: 'height',   label: 'Height / Taille',      placeholder: '1,85 m' },
    { key: 'eyeColor', label: 'Eye Colour / Couleur des yeux', placeholder: 'MARRON' },
    { key: 'residence',label: 'Residence / Domicile', placeholder: '21 NEWTON ROAD' },
  ],
  germany: [
    { key: 'birthName', label: 'Birth Name / Geburtsname', placeholder: 'HEINKEL' },
  ],
  brazil: [
    { key: 'filiation1', label: 'Parent 1 / Filiação 1', placeholder: 'MARCOS JOSÉ DOS SANTOS' },
    { key: 'filiation2', label: 'Parent 2 / Filiação 2', placeholder: 'AMANDA FARIAS DOS SANTOS' },
    { key: 'personalNo', label: 'Personal No. / Identidade', placeholder: '123456789' },
  ],
  algeria: [
    { key: 'personalNo',      label: 'Personal No. / N° Personnel', placeholder: '20989019200006009' },
    { key: 'surnameArabic',   label: 'Surname (Arabic / اللقب)',     placeholder: 'سليماني' },
    { key: 'givenNameArabic', label: 'Given Name (Arabic / الاسم)', placeholder: 'عبد الله' },
  ],
}

export default function PassportForm({ data, onChange, watermarkImage, onWatermarkChange, template }) {
  const photoRef     = useRef()
  const emblemRef    = useRef()
  const cornerRef    = useRef()
  const watermarkRef = useRef()

  const layout = template?.layout || 'default'
  const extraFields = EXTRA_FIELDS[layout] || []

  const handleField = (key, value) => onChange({ ...data, [key]: value })

  const handleImage = (key, file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => onChange({ ...data, [key]: e.target.result })
    reader.readAsDataURL(file)
  }

  const handleWatermarkFile = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => onWatermarkChange(e.target.result)
    reader.readAsDataURL(file)
  }

  const clearImage = (key) => onChange({ ...data, [key]: null })

  const renderField = ({ key, label, placeholder, multiline }) => (
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
  )

  return (
    <div className="passport-form">
      <div className="form-section-title">Passport Details</div>

      {BASE_FIELDS.map(renderField)}

      {extraFields.length > 0 && (
        <>
          <div className="form-section-title" style={{ marginTop: 16 }}>
            {template?.name} — Extra Fields
          </div>
          {extraFields.map(renderField)}
        </>
      )}

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
          {data.photo && <button className="clear-btn" onClick={() => clearImage('photo')}>✕ Remove</button>}
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
          {data.emblem && <button className="clear-btn" onClick={() => clearImage('emblem')}>✕ Remove</button>}
        </div>
        <input ref={emblemRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={(e) => handleImage('emblem', e.target.files[0])} />
      </div>

      <div className="form-group">
        <label>Corner Emblem (logo)</label>
        <div className="image-upload-row">
          <div
            className="image-preview-box small"
            onClick={() => cornerRef.current.click()}
            style={data.cornerEmblem ? { backgroundImage: `url(${data.cornerEmblem})` } : {}}
          >
            {!data.cornerEmblem && <span>+ Corner</span>}
          </div>
          {data.cornerEmblem && <button className="clear-btn" onClick={() => clearImage('cornerEmblem')}>✕ Remove</button>}
        </div>
        <input ref={cornerRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={(e) => handleImage('cornerEmblem', e.target.files[0])} />
      </div>

      <div className="form-group watermark-upload-group">
        <label>
          <span className="wm-label-badge">Watermark Image</span>
          <span className="wm-hint">Shown large &amp; faded across the center</span>
        </label>
        <div className="image-upload-row">
          <div
            className="image-preview-box wm-box"
            onClick={() => watermarkRef.current.click()}
            style={watermarkImage ? { backgroundImage: `url(${watermarkImage})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat' } : {}}
          >
            {!watermarkImage && (
              <div className="wm-placeholder">
                <span className="wm-icon">🖼</span>
                <span>Upload watermark</span>
                <span className="wm-sub">PNG with transparency works best</span>
              </div>
            )}
          </div>
          {watermarkImage && <button className="clear-btn" onClick={() => onWatermarkChange(null)}>✕ Remove</button>}
        </div>
        <input ref={watermarkRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={(e) => handleWatermarkFile(e.target.files[0])} />
      </div>

      <div style={{ height: 20 }} />
    </div>
  )
}
