import { forwardRef } from 'react'
import CountryLogo from './CountryLogo.jsx'
import './PassportCard.css'

function generateMRZ(data, template) {
  const pad = (str, len, char = '<') =>
    (str || '').replace(/[^A-Z0-9<]/gi, c => /[a-z]/i.test(c) ? c.toUpperCase() : '<').toUpperCase().padEnd(len, char).slice(0, len)
  const surname = (data.surname || '').toUpperCase().replace(/[\s]/g, '<')
  const given = (data.givenName || '').toUpperCase().replace(/[\s]/g, '<')
  const code = (template?.mrzCode || template?.countryCode || 'XXX').slice(0, 3)
  const line1 = `P<${code}${pad(surname + '<<' + given, 39)}`
  const passNum = pad(data.passportNo || 'AB1234567', 9)
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

function formatGermanDate(dateStr) {
  const months = { JAN:'01',FEB:'02',MAR:'03',APR:'04',MAY:'05',JUN:'06',JUL:'07',AUG:'08',SEP:'09',OCT:'10',NOV:'11',DEC:'12' }
  if (!dateStr) return ''
  const parts = dateStr.toUpperCase().trim().split(/\s+/)
  if (parts.length === 3) return `${parts[0].padStart(2,'0')}.${months[parts[1]] || '00'}.${parts[2]}`
  return dateStr
}

function Field({ label, value, large, ac }) {
  return (
    <div className="pp-field">
      <div className="pp-fl" style={{ color: ac || '#666' }}>{label}</div>
      <div className={`pp-fv${large ? ' large' : ''}`}>{value || '—'}</div>
    </div>
  )
}

function PhotoBox({ photo, photoStyle = {}, width = 148, height = 186, className = '' }) {
  const radius = photoStyle.radius || '2px'
  return (
    <div className={`pp-photo-box ${className}`} style={{ width, height, borderRadius: radius }}>
      {photo ? (
        <img src={photo} alt="photo" className="pp-photo-img" style={{ borderRadius: radius }} />
      ) : (
        <div className="pp-photo-ph" style={{
          background: photoStyle.bg || 'rgba(160,150,140,0.15)',
          borderRadius: radius,
          border: '1px dashed rgba(0,0,0,0.13)',
        }}>
          <span>Photo</span>
        </div>
      )}
    </div>
  )
}

function SmallPhotoBox({ photo, border, radius = '2px' }) {
  return (
    <div className="pp-photo-small" style={{ borderColor: border, borderRadius: radius }}>
      {photo
        ? <img src={photo} alt="photo" className="pp-photo-img" />
        : <div className="pp-photo-ph small"><span>Photo</span></div>}
    </div>
  )
}

function Logo({ t, data, size = 46, color }) {
  if (data?.cornerEmblem) return <img src={data.cornerEmblem} alt="" style={{ width: size, height: size, objectFit: 'contain' }} />
  return <CountryLogo countryId={t.id} color={color || t.cornerColor || t.accentColor} size={size} />
}

function Seal({ t, data, size = 52 }) {
  if (data?.emblem) return <img src={data.emblem} alt="seal" style={{ width: size, height: size, objectFit: 'contain' }} />
  return <CountryLogo countryId={t.id} color={t.emblemColor || t.accentColor} size={size} />
}

function SigDisplay({ data, accent, width = 110 }) {
  if (data.signature) {
    return (
      <div className="pp-sig-img-wrap">
        <img src={data.signature} alt="signature" className="pp-sig-img" />
      </div>
    )
  }
  return <div className="pp-sig-line" style={{ borderBottomColor: accent, width }} />
}

function MRZSection({ mrz, mrzBg, mrzBdr, mrzColor }) {
  return (
    <div className="pp-mrz" style={{ background: mrzBg, borderTopColor: mrzBdr }}>
      <div className="pp-mrz-line" style={{ color: mrzColor || '#111' }}>{mrz.line1}</div>
      <div className="pp-mrz-line" style={{ color: mrzColor || '#111' }}>{mrz.line2}</div>
    </div>
  )
}

function DefaultLayout({ data, t, mrz }) {
  const accent = t.accentColor || '#8b6914'
  const headerText = t.headerTextColor || '#1a1a1a'
  const border = t.borderColor || 'rgba(180,150,80,0.35)'
  const logoAlign = t.logoAlign || 'split'
  const sealPos = t.sealPosition || { bottom: true, right: false }
  const ps = t.photoStyle || {}

  return (
    <>
      <div className="pp-top-bar" style={{ borderBottomColor: border }}>
        {(logoAlign === 'split' || logoAlign === 'left') && (
          <div className="pp-logo-box"><Logo t={t} data={data} size={46} /></div>
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
          <div className="pp-logo-box"><Logo t={t} data={data} size={46} /></div>
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
          <PhotoBox photo={data.photo} photoStyle={ps} />
          <div className={`pp-seal-wrap ${sealPos.bottom ? 'seal-bottom' : 'seal-top'} ${sealPos.right ? 'seal-right' : ''}`}>
            <div className="pp-seal-box"><Seal t={t} data={data} /></div>
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
            <Field label={t.domicileLabel || 'Place of birth'} value={data.registeredDomicile} ac={accent} />
          </div>
          <div className="pp-row">
            <Field label={t.issueLabel || 'Date of issue'} value={data.dateOfIssue} ac={accent} />
            <div className="pp-field">
              <div className="pp-fl" style={{ color: accent }}>{t.signatureLabel || 'Signature'}</div>
              <SigDisplay data={data} accent={accent} />
            </div>
          </div>
          <Field label={t.expiryLabel || 'Date of expiry'} value={data.dateOfExpiry} ac={accent} />
          <div className="pp-field">
            <div className="pp-fl" style={{ color: accent }}>{t.authorityLabel || 'Authority'}</div>
            <div className="pp-fv authority">{(data.authority || '').split('\n').map((l, i) => <div key={i}>{l}</div>)}</div>
          </div>
        </div>
      </div>

      <MRZSection mrz={mrz} mrzBg={t.mrzBg} mrzBdr={t.mrzBorder} />
    </>
  )
}

function AustraliaLayout({ data, t, mrz }) {
  const accent = t.accentColor || '#006b7b'
  const border = t.borderColor || 'rgba(0,107,123,0.3)'
  const ps = t.photoStyle || {}

  return (
    <>
      <div className="pp-au-header" style={{ borderBottomColor: border }}>
        <div className="pp-au-titre" style={{ color: accent }}>
          <div className="pp-au-titre-main">TITRE DE VOYAGE</div>
          <div className="pp-au-titre-sub">TRAVEL DOCUMENT</div>
        </div>
        <div className="pp-au-center">
          <Logo t={t} data={data} size={40} />
          <div className="pp-au-country" style={{ color: accent }}>AUSTRALIA</div>
        </div>
        <div className="pp-au-docno" style={{ color: accent }}>
          <div className="pp-au-docno-label">DOCUMENT No.</div>
          <div className="pp-au-docno-val">{data.passportNo || 'AB1234567'}</div>
          <SmallPhotoBox photo={data.photo} border={accent} radius="2px" />
        </div>
      </div>

      <div className="pp-id-bar" style={{ borderBottomColor: border }}>
        <div className="pp-id-col">
          <div className="pp-id-label" style={{ color: accent }}>Type / Type</div>
          <div className="pp-id-val" style={{ color: '#111' }}>{data.type || 'P'}</div>
        </div>
        <div className="pp-id-col">
          <div className="pp-id-label" style={{ color: accent }}>Code of issuing State</div>
          <div className="pp-id-val" style={{ color: '#111' }}>AUS</div>
        </div>
      </div>

      <div className="pp-body">
        <div className="pp-photo-col">
          <PhotoBox photo={data.photo} photoStyle={ps} height={200} />
          <div className="pp-au-kangaroo">🦘🦘</div>
        </div>
        <div className="pp-info-col">
          <Field label="Name / Nom" value={`${data.givenName || ''} ${data.surname || ''}`.trim() || '—'} large ac={accent} />
          <Field label="Nationality / Nationalité" value={data.nationality || 'AUSTRALIAN'} ac={accent} />
          <div className="pp-row">
            <Field label="Date of birth / Date de naissance" value={data.dateOfBirth} ac={accent} />
            <Field label="Sex / Sexe" value={data.sex} ac={accent} />
          </div>
          <Field label="Place of birth / Lieu de naissance" value={data.registeredDomicile} ac={accent} />
          <div className="pp-row">
            <Field label="Date of issue / Date de délivrance" value={data.dateOfIssue} ac={accent} />
            <Field label="Date of expiry / Date d'expiration" value={data.dateOfExpiry} ac={accent} />
          </div>
          <Field label="Authority / Autorité" value={data.authority} ac={accent} />
          <div className="pp-field">
            <div className="pp-fl" style={{ color: accent }}>Holder's signature / Signature du titulaire</div>
            <SigDisplay data={data} accent={accent} width={140} />
          </div>
        </div>
      </div>

      <MRZSection mrz={mrz} mrzBg={t.mrzBg} mrzBdr={t.mrzBorder} />
    </>
  )
}

function IndonesiaLayout({ data, t, mrz }) {
  const blue = '#1a3a6e'
  const red = '#cc0001'
  const border = 'rgba(204,0,1,0.25)'
  const ps = t.photoStyle || {}

  return (
    <>
      <div className="pp-idn-header" style={{ background: blue }}>
        <div className="pp-idn-header-left">
          <div className="pp-idn-paspor">PASPOR</div>
          <div className="pp-idn-paspor-sub">PASSPORT · PASSEPORT · PASPOORT</div>
        </div>
        <div className="pp-idn-header-center">
          <div className="pp-idn-republic">REPUBLIK INDONESIA</div>
          <div className="pp-idn-republic-sub">REPUBLIC OF INDONESIA · RÉPUBLIQUE D'INDONÉSIE · REPUBLIEK INDONESIË</div>
        </div>
        <div className="pp-idn-header-right">
          <div className="pp-idn-flag">
            <div className="pp-idn-flag-red" />
            <div className="pp-idn-flag-white" />
          </div>
        </div>
      </div>

      <div className="pp-idn-type-bar" style={{ borderBottomColor: border }}>
        <div className="pp-id-col">
          <div className="pp-id-label" style={{ color: red }}>Jenis · Type</div>
          <div className="pp-id-val" style={{ color: '#111' }}>{data.type || 'P'}</div>
        </div>
        <div className="pp-id-col">
          <div className="pp-id-label" style={{ color: red }}>Kode · Code</div>
          <div className="pp-id-val" style={{ color: '#111' }}>IDN</div>
        </div>
        <div className="pp-id-col" style={{ marginLeft: 'auto' }}>
          <div className="pp-id-label" style={{ color: red }}>No. paspor · Passport no.</div>
          <div className="pp-id-val large" style={{ color: '#111' }}>{data.passportNo || 'AB1234567'}</div>
        </div>
      </div>

      <div className="pp-body pp-idn-body">
        <div className="pp-photo-col">
          <PhotoBox photo={data.photo} photoStyle={ps} height={210} />
          <div className="pp-idn-garuda"><Seal t={t} data={data} size={48} /></div>
        </div>
        <div className="pp-info-col">
          <div className="pp-idn-small-photo-row">
            <Field label="Nama lengkap · Full name" value={`${data.surname || ''} ${data.givenName || ''}`.trim() || '—'} large ac={red} />
            <SmallPhotoBox photo={data.photo} border={border} />
          </div>
          <div className="pp-row">
            <Field label="Kelamin · Sex" value={data.sex} ac={red} />
            <Field label="Kewarganegaraan · Nationality" value={data.nationality || 'Indonesia'} ac={red} />
          </div>
          <div className="pp-row">
            <Field label="Tinggi · Height" value={data.height || '—'} ac={red} />
            <Field label="Tempat lahir · Place of birth" value={data.registeredDomicile} ac={red} />
          </div>
          <div className="pp-row">
            <Field label="Tgl. lahir · Date of birth" value={data.dateOfBirth} ac={red} />
            <Field label="NIK · National ID No." value={data.nationalIdNo || '—'} ac={red} />
          </div>
          <Field label="Kantor penerbit · Issuing office" value={data.issuingOffice || data.authority} ac={red} />
          <div className="pp-row">
            <Field label="Tgl. terbit · Date of issue" value={data.dateOfIssue} ac={red} />
            <div className="pp-field">
              <div className="pp-fl" style={{ color: red }}>Tanda tangan · Holder's signature</div>
              <SigDisplay data={data} accent={red} />
            </div>
          </div>
          <Field label="Tgl. habis berlaku · Date of expiry" value={data.dateOfExpiry} ac={red} />
        </div>
      </div>

      <div className="pp-mrz pp-idn-mrz" style={{ background: 'rgba(244,169,32,0.15)', borderTopColor: '#f4a920' }}>
        <div className="pp-mrz-line" style={{ color: '#7a4800' }}>{mrz.line1}</div>
        <div className="pp-mrz-line" style={{ color: '#7a4800' }}>{mrz.line2}</div>
      </div>
    </>
  )
}

function GermanyLayout({ data, t, mrz }) {
  const black = '#111111'
  const red = '#dd0000'
  const gray = '#444'
  const border = 'rgba(0,0,0,0.15)'
  const ps = t.photoStyle || {}

  return (
    <>
      <div className="pp-de-stripe-top">
        {'BUNDESREPUBLIK DEUTSCHLAND · BUNDESREPUBLIK DEUTSCHLAND · BUNDESREPUBLIK DEUTSCHLAND · BUNDESREPUBLIK DEUTSCHLAND · '}
      </div>

      <div className="pp-de-header" style={{ borderBottomColor: border }}>
        <div className="pp-de-header-left">
          <Logo t={t} data={data} size={50} color={black} />
          <div className="pp-de-titles">
            <div className="pp-de-title1" style={{ color: black }}>{t.titleLocal}</div>
            <div className="pp-de-title2" style={{ color: gray }}>{t.titleSub}</div>
          </div>
        </div>
        <div className="pp-de-header-right">
          <div className="pp-de-reisepass" style={{ color: black }}>{t.passportLabel}</div>
          <div className="pp-de-passport-sub" style={{ color: gray }}>{t.passportSub}</div>
        </div>
      </div>

      <div className="pp-id-bar" style={{ borderBottomColor: border }}>
        <div className="pp-id-col">
          <div className="pp-id-label" style={{ color: gray }}>Typ / Type / Type</div>
          <div className="pp-id-val" style={{ color: black }}>{data.type || 'P'}</div>
        </div>
        <div className="pp-id-col">
          <div className="pp-id-label" style={{ color: gray }}>Kode / Code / Code</div>
          <div className="pp-id-val" style={{ color: black }}>D</div>
        </div>
        <div className="pp-id-col" style={{ marginLeft: 'auto' }}>
          <div className="pp-id-label" style={{ color: gray }}>Pass-Nr. / Passport No.</div>
          <div className="pp-id-val large" style={{ color: black }}>{data.passportNo || 'AB1234567'}</div>
        </div>
      </div>

      <div className="pp-body pp-de-body">
        <div className="pp-photo-col">
          <PhotoBox photo={data.photo} photoStyle={ps} height={220} />
        </div>
        <div className="pp-info-col pp-de-info">
          <div className="pp-de-field-num">
            <span className="pp-de-num" style={{ color: gray }}>1.</span>
            <div className="pp-de-field-group">
              <div className="pp-de-sub-row">
                <div>
                  <div className="pp-fl" style={{ color: gray }}>[a] Name / Surname / Nom</div>
                  <div className="pp-fv large">{data.surname || '—'}</div>
                </div>
                <div>
                  <div className="pp-fl" style={{ color: gray }}>[b] Geburtsname / Name at birth</div>
                  <div className="pp-fv">{data.birthName || '—'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pp-de-field-num">
            <span className="pp-de-num" style={{ color: gray }}>2.</span>
            <div>
              <div className="pp-fl" style={{ color: gray }}>Vornamen / Given names / Prénoms</div>
              <div className="pp-fv large">{data.givenName || '—'}</div>
            </div>
          </div>

          <div className="pp-de-row3">
            <div className="pp-de-field-num">
              <span className="pp-de-num" style={{ color: gray }}>3.</span>
              <div>
                <div className="pp-fl" style={{ color: gray }}>Geburtstag / Date of birth</div>
                <div className="pp-fv">{formatGermanDate(data.dateOfBirth)}</div>
              </div>
            </div>
            <div className="pp-de-field-num">
              <span className="pp-de-num" style={{ color: gray }}>4.</span>
              <div>
                <div className="pp-fl" style={{ color: gray }}>Geschlecht / Sex / Sexe</div>
                <div className="pp-fv">{data.sex || '—'}</div>
              </div>
            </div>
            <div className="pp-de-field-num" style={{ flex: 2 }}>
              <span className="pp-de-num" style={{ color: gray }}>5.</span>
              <div>
                <div className="pp-fl" style={{ color: gray }}>Staatsangehörigkeit / Nationality</div>
                <div className="pp-fv">{data.nationality || 'DEUTSCH'}</div>
              </div>
            </div>
            <div className="pp-de-badge" style={{ color: red, borderColor: red }}>D</div>
          </div>

          <div className="pp-de-field-num">
            <span className="pp-de-num" style={{ color: gray }}>6.</span>
            <div>
              <div className="pp-fl" style={{ color: gray }}>Geburtsort / Place of birth / Lieu de naissance</div>
              <div className="pp-fv">{data.registeredDomicile || '—'}</div>
            </div>
          </div>

          <div className="pp-de-row-dates">
            <div className="pp-de-field-num">
              <span className="pp-de-num" style={{ color: gray }}>7.</span>
              <div>
                <div className="pp-fl" style={{ color: gray }}>Ausstellungsdatum / Date of issue</div>
                <div className="pp-fv">{formatGermanDate(data.dateOfIssue)}</div>
              </div>
            </div>
            <div className="pp-de-field-num">
              <span className="pp-de-num" style={{ color: gray }}>8.</span>
              <div>
                <div className="pp-fl" style={{ color: gray }}>Gültig bis / Date of expiry</div>
                <div className="pp-fv">{formatGermanDate(data.dateOfExpiry)}</div>
              </div>
            </div>
            <div className="pp-de-field-num" style={{ flex: 2 }}>
              <span className="pp-de-num" style={{ color: gray }}>10.</span>
              <div>
                <div className="pp-fl" style={{ color: gray }}>Unterschrift des Inhabers / Signature</div>
                <SigDisplay data={data} accent={black} width={80} />
              </div>
            </div>
          </div>

          <div className="pp-de-field-num">
            <span className="pp-de-num" style={{ color: gray }}>9.</span>
            <div>
              <div className="pp-fl" style={{ color: gray }}>Behörde / Authority / Autorité</div>
              <div className="pp-fv">{data.authority || '—'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="pp-de-stripe-mrz">
        {'IN DEUTSCHLAND · IN GERMANY · EN ALLEMAGNE · IN DEUTSCHLAND · IN GERMANY · EN ALLEMAGNE · IN DEUTSCHLAND · '}
      </div>
      <MRZSection mrz={mrz} mrzBg={t.mrzBg} mrzBdr={t.mrzBorder} />
      <div className="pp-de-stripe-bottom">
        {'BUNDESREPUBLIK DEUTSCHLAND · BUNDESREPUBLIK DEUTSCHLAND · BUNDESREPUBLIK DEUTSCHLAND · BUNDESREPUBLIK DEUTSCHLAND · '}
      </div>
    </>
  )
}

function FranceLayout({ data, t, mrz }) {
  const blue = '#002395'
  const border = 'rgba(0,35,149,0.25)'
  const ps = t.photoStyle || {}

  return (
    <>
      <div className="pp-fr-header" style={{ borderBottomColor: border }}>
        <div className="pp-fr-header-left">
          <div className="pp-fr-passeport" style={{ color: blue }}>PASSEPORT</div>
          <div className="pp-fr-passport" style={{ color: blue }}>PASSPORT</div>
        </div>
        <div className="pp-fr-header-center">
          <div className="pp-fr-republic" style={{ color: blue }}>{t.titleLocal}</div>
        </div>
        <div className="pp-fr-badge" style={{ borderColor: blue, color: blue }}>
          <span className="pp-fr-rf">RF</span>
        </div>
      </div>

      <div className="pp-id-bar" style={{ borderBottomColor: border }}>
        <div className="pp-id-col">
          <div className="pp-id-label" style={{ color: blue }}>Type / Type</div>
          <div className="pp-id-val" style={{ color: '#111' }}>{data.type || 'P'}</div>
        </div>
        <div className="pp-id-col">
          <div className="pp-id-label" style={{ color: blue }}>Code du pays / Country code</div>
          <div className="pp-id-val" style={{ color: '#111' }}>FRA</div>
        </div>
        <div className="pp-id-col" style={{ marginLeft: 'auto' }}>
          <div className="pp-id-label" style={{ color: blue }}>Passeport n° / Passport no.</div>
          <div className="pp-id-val large" style={{ color: '#111' }}>{data.passportNo || 'AB1234567'}</div>
        </div>
      </div>

      <div className="pp-body">
        <div className="pp-photo-col">
          <PhotoBox photo={data.photo} photoStyle={ps} height={210} />
          <div className="pp-seal-wrap seal-bottom">
            <div className="pp-seal-box"><Seal t={t} data={data} size={44} /></div>
          </div>
        </div>
        <div className="pp-info-col">
          <div className="pp-fr-field-num">
            <span className="pp-fr-num" style={{ color: blue }}>①</span>
            <Field label="Nom / Surname" value={data.surname} large ac={blue} />
          </div>
          <div className="pp-fr-field-num">
            <span className="pp-fr-num" style={{ color: blue }}>②</span>
            <Field label="Prénoms / Given names" value={data.givenName} large ac={blue} />
          </div>
          <div className="pp-fr-field-num">
            <span className="pp-fr-num" style={{ color: blue }}>③</span>
            <Field label="Nationalité / Nationality" value={data.nationality || 'Française'} ac={blue} />
          </div>
          <div className="pp-fr-row3">
            <div className="pp-fr-field-num">
              <span className="pp-fr-num" style={{ color: blue }}>⑤</span>
              <Field label="Sexe / Sex" value={data.sex} ac={blue} />
            </div>
            <div className="pp-fr-field-num">
              <span className="pp-fr-num" style={{ color: blue }}>⑫</span>
              <Field label="Taille / Height" value={data.height || '—'} ac={blue} />
            </div>
            <div className="pp-fr-field-num">
              <span className="pp-fr-num" style={{ color: blue }}>⑬</span>
              <Field label="Couleur des yeux / Eye colour" value={data.eyeColor || '—'} ac={blue} />
            </div>
          </div>
          <div className="pp-fr-field-num">
            <span className="pp-fr-num" style={{ color: blue }}>④</span>
            <Field label="Date de naissance / Date of birth" value={data.dateOfBirth} ac={blue} />
          </div>
          <div className="pp-fr-field-num">
            <span className="pp-fr-num" style={{ color: blue }}>⑥</span>
            <Field label="Lieu de naissance / Place of birth" value={data.registeredDomicile} ac={blue} />
          </div>
          <div className="pp-fr-field-num">
            <span className="pp-fr-num" style={{ color: blue }}>⑦</span>
            <Field label="Date de délivrance / Date of issue" value={data.dateOfIssue} ac={blue} />
          </div>
          <div className="pp-fr-field-num">
            <span className="pp-fr-num" style={{ color: blue }}>⑨</span>
            <Field label="Autorité / Authority" value={data.authority} ac={blue} />
          </div>
          <div className="pp-fr-row-bot">
            <div className="pp-fr-field-num">
              <span className="pp-fr-num" style={{ color: blue }}>⑧</span>
              <Field label="Date d'expiration / Date of expiry" value={data.dateOfExpiry} ac={blue} />
            </div>
            <div className="pp-fr-field-num" style={{ flex: 2 }}>
              <span className="pp-fr-num" style={{ color: blue }}>⑪</span>
              <Field label="Domicile / Residence" value={data.residence || '—'} ac={blue} />
            </div>
          </div>
          <div className="pp-field" style={{ marginTop: 2 }}>
            <div className="pp-fl" style={{ color: blue }}>Signature du titulaire / Signature of bearer</div>
            <SigDisplay data={data} accent={blue} />
          </div>
        </div>
      </div>

      <MRZSection mrz={mrz} mrzBg={t.mrzBg} mrzBdr={t.mrzBorder} />
    </>
  )
}

function AlgeriaLayout({ data, t, mrz }) {
  const green = '#006233'
  const red = '#c8102e'
  const border = 'rgba(0,98,51,0.3)'
  const ps = t.photoStyle || {}

  return (
    <>
      <div className="pp-dz-header" style={{ borderBottomColor: border }}>
        <div className="pp-dz-header-left">
          <div className="pp-dz-passport-label" style={{ color: green }}>PASSPORT / PASSEPORT</div>
          <div className="pp-dz-arabic-sub" style={{ color: green }}>جواز السفر</div>
        </div>
        <div className="pp-dz-header-center">
          <Logo t={t} data={data} size={44} color={green} />
        </div>
        <div className="pp-dz-header-right">
          <div className="pp-dz-arabic-title" style={{ color: green }}>
            {t.titleLocal || 'الجمهورية الجزائرية الديمقراطية الشعبية'}
          </div>
          <div className="pp-dz-country" style={{ color: green }}>ALGÉRIE / ALGERIA</div>
        </div>
      </div>

      <div className="pp-id-bar" style={{ borderBottomColor: border }}>
        <div className="pp-id-col">
          <div className="pp-id-label" style={{ color: green }}>نوع / Type / Type</div>
          <div className="pp-id-val" style={{ color: '#111' }}>{data.type || 'P'}</div>
        </div>
        <div className="pp-id-col">
          <div className="pp-id-label" style={{ color: green }}>رمز / Code / Code</div>
          <div className="pp-id-val" style={{ color: '#111' }}>DZA</div>
        </div>
        <div className="pp-id-col" style={{ marginLeft: 'auto' }}>
          <div className="pp-id-label" style={{ color: green }}>رقم جواز السفر / N° Passeport / Passport No.</div>
          <div className="pp-id-val large" style={{ color: '#111' }}>{data.passportNo || 'AB1234567'}</div>
        </div>
      </div>

      <div className="pp-body">
        <div className="pp-photo-col">
          <div style={{ position: 'relative' }}>
            <PhotoBox photo={data.photo} photoStyle={ps} height={200} />
            <div className="pp-dz-star" style={{ color: red }}>★</div>
          </div>
          <div className="pp-dz-personal-no" style={{ borderColor: border }}>
            <div className="pp-fl" style={{ color: green, fontSize: 7 }}>الرقم الشخصي / N° Personnel / Personal No.</div>
            <div className="pp-fv" style={{ fontSize: 10 }}>{data.personalNo || '—'}</div>
          </div>
        </div>
        <div className="pp-info-col">
          <div className="pp-dz-field">
            <div className="pp-fl" style={{ color: green }}>اللقب / Nom / Surname</div>
            <div className="pp-dz-arabic-val">{data.surnameArabic || ''}</div>
            <div className="pp-fv large">{data.surname || '—'}</div>
          </div>
          <div className="pp-dz-field">
            <div className="pp-fl" style={{ color: green }}>الاسم / Prénom / Given name</div>
            <div className="pp-dz-arabic-val">{data.givenNameArabic || ''}</div>
            <div className="pp-fv large">{data.givenName || '—'}</div>
          </div>
          <div className="pp-row">
            <Field label="الجنسية / Nationalité / Nationality" value={data.nationality || 'ALGÉRIENNE'} ac={green} />
            <div className="pp-dz-side">
              <Field label="الجنس / Sexe / Sex" value={data.sex} ac={green} />
              <div className="pp-seal-box" style={{ marginTop: 4 }}><Seal t={t} data={data} size={40} /></div>
            </div>
          </div>
          <div className="pp-row">
            <Field label="مولود في / Date de naissance / Date of birth" value={data.dateOfBirth} ac={green} />
            <Field label="مصدر / Date de délivrance / Date of issue" value={data.dateOfIssue} ac={green} />
          </div>
          <div className="pp-row">
            <Field label="مكان الميلاد / Lieu de naissance / Place of birth" value={data.registeredDomicile} ac={green} />
            <Field label="تاريخ الانتهاء / Date d'expiration / Date of expiry" value={data.dateOfExpiry} ac={green} />
          </div>
          <div className="pp-row">
            <div className="pp-field">
              <div className="pp-fl" style={{ color: green }}>الإمضاء / Signature</div>
              <SigDisplay data={data} accent={green} width={100} />
            </div>
            <Field label="السلطة / Autorité / Authority" value={data.authority} ac={green} />
          </div>
        </div>
      </div>

      <MRZSection mrz={mrz} mrzBg={t.mrzBg} mrzBdr={t.mrzBorder} />
    </>
  )
}

function BrazilLayout({ data, t, mrz }) {
  const blue = '#002776'
  const green = '#009c3b'
  const border = 'rgba(0,156,59,0.28)'
  const ps = t.photoStyle || {}

  return (
    <>
      <div className="pp-br-header" style={{ borderBottomColor: border }}>
        <div className="pp-br-header-left">
          <div className="pp-br-passaporte" style={{ color: blue }}>PASSAPORTE</div>
          <div className="pp-br-passport" style={{ color: blue }}>PASSPORT</div>
        </div>
        <div className="pp-br-header-center">
          <div className="pp-br-republic" style={{ color: blue }}>{t.titleLocal}</div>
        </div>
        <div className="pp-br-header-right">
          <Logo t={t} data={data} size={44} color={green} />
        </div>
      </div>

      <div className="pp-id-bar" style={{ borderBottomColor: border }}>
        <div className="pp-id-col">
          <div className="pp-id-label" style={{ color: green }}>Tipo / Type</div>
          <div className="pp-id-val" style={{ color: blue }}>{data.type || 'P'}</div>
        </div>
        <div className="pp-id-col">
          <div className="pp-id-label" style={{ color: green }}>País Emissor / Issuing Country</div>
          <div className="pp-id-val" style={{ color: blue }}>BRA</div>
        </div>
        <div className="pp-id-col" style={{ marginLeft: 'auto' }}>
          <div className="pp-id-label" style={{ color: green }}>Passaporte N° / Passport No.</div>
          <div className="pp-id-val large" style={{ color: blue }}>{data.passportNo || 'AB1234567'}</div>
        </div>
      </div>

      <div className="pp-body">
        <div className="pp-photo-col">
          <PhotoBox photo={data.photo} photoStyle={ps} height={200} />
          <div className="pp-seal-wrap seal-bottom">
            <div className="pp-seal-box"><Seal t={t} data={data} size={46} /></div>
          </div>
        </div>
        <div className="pp-info-col pp-br-info">
          <Field label="Sobrenome / Surname" value={data.surname} large ac={green} />
          <Field label={t.givenNameLabel || 'Nome / Given names'} value={data.givenName} large ac={green} />
          <Field label="Nacionalidade / Nationality" value={data.nationality || 'BRASILEIRO(A)'} ac={green} />
          <div className="pp-row">
            <Field label="Data de Nascimento / Date of birth" value={data.dateOfBirth} ac={green} />
            <Field label="Identidade N° / Personal No." value={data.personalNo || '—'} ac={green} />
          </div>
          <div className="pp-row">
            <Field label="Sexo / Sex" value={data.sex} ac={green} />
            <Field label="Naturalidade / Place of birth" value={data.registeredDomicile} ac={green} />
          </div>
          <div className="pp-br-filiation" style={{ borderColor: border }}>
            <div className="pp-fl" style={{ color: green }}>Filiação / Filiation</div>
            <div className="pp-fv" style={{ fontSize: 11 }}>{data.filiation1 || '—'}</div>
            <div className="pp-fv" style={{ fontSize: 11 }}>{data.filiation2 || '—'}</div>
          </div>
          <div className="pp-row">
            <Field label="Data de Expedição / Date of issue" value={data.dateOfIssue} ac={green} />
            <Field label="Válido até / Date of expiry" value={data.dateOfExpiry} ac={green} />
          </div>
          <div className="pp-row">
            <Field label="Autoridade / Authority" value={data.authority} ac={green} />
            <div className="pp-field">
              <div className="pp-fl" style={{ color: green }}>Assinatura / Signature</div>
              <SigDisplay data={data} accent={green} />
            </div>
          </div>
        </div>
        <div className="pp-br-watermark-col" style={{ color: 'rgba(0,39,118,0.06)' }}>
          {Array(14).fill('BRASIL').map((w, i) => <div key={i}>{w}</div>)}
        </div>
      </div>

      <MRZSection mrz={mrz} mrzBg={t.mrzBg} mrzBdr={t.mrzBorder} />
    </>
  )
}

const PassportCard = forwardRef(function PassportCard({ data, template, watermarkImage, customBg }, ref) {
  const t = template || {}
  const mrz = generateMRZ(data, t)
  const layout = t.layout || 'default'
  const bgColor = t.bgColor || '#f5f0dc'

  const overlayGrad = customBg
    ? `linear-gradient(135deg, ${bgColor}b0 0%, ${bgColor}70 100%)`
    : `linear-gradient(135deg, ${bgColor}cc 0%, ${bgColor}88 100%)`

  const layoutProps = { data, t, mrz }

  return (
    <div className="passport-card" ref={ref} style={{ background: bgColor }}>
      {customBg
        ? <div className="pp-custom-bg" style={{ backgroundImage: `url(${customBg})` }} />
        : <div className="pp-bg-pattern" style={{ backgroundImage: t.bgPattern }} />
      }
      <div className="pp-bg-overlay" style={{ background: overlayGrad }} />
      {watermarkImage && (
        <div className="pp-watermark-img">
          <img src={watermarkImage} alt="watermark" />
        </div>
      )}

      {layout === 'default'   && <DefaultLayout   {...layoutProps} />}
      {layout === 'australia' && <AustraliaLayout {...layoutProps} />}
      {layout === 'indonesia' && <IndonesiaLayout {...layoutProps} />}
      {layout === 'germany'   && <GermanyLayout   {...layoutProps} />}
      {layout === 'france'    && <FranceLayout    {...layoutProps} />}
      {layout === 'algeria'   && <AlgeriaLayout   {...layoutProps} />}
      {layout === 'brazil'    && <BrazilLayout    {...layoutProps} />}
    </div>
  )
})

export default PassportCard
