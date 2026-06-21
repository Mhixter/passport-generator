import { useRef, useEffect } from 'react'
import './SignaturePad.css'

export default function SignaturePad({ value, onChange }) {
  const canvasRef = useRef()
  const drawing = useRef(false)
  const lastPos = useRef(null)
  const ctx = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const c = canvas.getContext('2d')
    ctx.current = c
    c.strokeStyle = '#111'
    c.lineWidth = 1.6
    c.lineCap = 'round'
    c.lineJoin = 'round'
    c.clearRect(0, 0, canvas.width, canvas.height)
    if (value) {
      const img = new Image()
      img.onload = () => c.drawImage(img, 0, 0)
      img.src = value
    }
  }, [])

  const getPos = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const touch = e.touches?.[0] || e
    return {
      x: (touch.clientX - rect.left) * (canvas.width / rect.width),
      y: (touch.clientY - rect.top) * (canvas.height / rect.height),
    }
  }

  const startDraw = (e) => {
    e.preventDefault()
    drawing.current = true
    lastPos.current = getPos(e)
  }

  const draw = (e) => {
    e.preventDefault()
    if (!drawing.current) return
    const pos = getPos(e)
    const c = ctx.current
    c.beginPath()
    c.moveTo(lastPos.current.x, lastPos.current.y)
    c.lineTo(pos.x, pos.y)
    c.stroke()
    lastPos.current = pos
  }

  const endDraw = (e) => {
    if (!drawing.current) return
    drawing.current = false
    lastPos.current = null
    onChange(canvasRef.current.toDataURL('image/png'))
  }

  const clearPad = () => {
    const canvas = canvasRef.current
    ctx.current.clearRect(0, 0, canvas.width, canvas.height)
    onChange(null)
  }

  return (
    <div className="sig-pad-wrap">
      <canvas
        ref={canvasRef}
        width={280}
        height={72}
        className="sig-pad-canvas"
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
      />
      <div className="sig-pad-footer">
        <span className="sig-pad-hint">✍ Draw your signature above</span>
        <button className="sig-clear-btn" onClick={clearPad} type="button">Clear</button>
      </div>
    </div>
  )
}
