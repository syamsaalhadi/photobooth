'use client'

import { useRef, useState, useEffect } from 'react'

const THEMES = [
  {
    id: 'none',
    label: '✨ Normal',
    filter: 'none',
    draw: () => { },
  },
  {
    id: 'kawaii',
    label: '🌸 Kawaii',
    filter: 'brightness(1.1) saturate(1.4)',
    draw: (ctx, w, h) => {
      // Pipi merah kawaii
      ctx.globalAlpha = 0.35
      ctx.fillStyle = '#ff9eb5'
      ctx.beginPath(); ctx.ellipse(w * 0.18, h * 0.62, 38, 22, 0, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.ellipse(w * 0.82, h * 0.62, 38, 22, 0, 0, Math.PI * 2); ctx.fill()
      ctx.globalAlpha = 1

      // Bintang kecil
      const stars = [[0.1, 0.1], [0.88, 0.08], [0.05, 0.35], [0.93, 0.3], [0.5, 0.05]]
      ctx.fillStyle = '#ffcc00'
      stars.forEach(([x, y]) => {
        ctx.font = `${Math.random() * 10 + 14}px serif`
        ctx.fillText('⭐', x * w - 10, y * h)
      })

      // Bunga di sudut
      ctx.font = '28px serif'
      ctx.fillText('🌸', 8, 36)
      ctx.fillText('🌸', w - 42, 36)
      ctx.fillText('💕', w / 2 - 14, 34)
      ctx.fillText('🌸', 8, h - 10)
      ctx.fillText('🌸', w - 42, h - 10)

      // Border pink
      ctx.strokeStyle = '#ff9eb5'
      ctx.lineWidth = 8
      ctx.strokeRect(4, 4, w - 8, h - 8)
    }
  },
  {
    id: 'cat',
    label: '🐱 Cat',
    filter: 'none',
    draw: (ctx, w, h) => {
      const cx = w / 2

      // Telinga kucing
      ctx.fillStyle = '#f4a0c0'
      // kiri
      ctx.beginPath()
      ctx.moveTo(cx - 110, 60)
      ctx.lineTo(cx - 150, 0)
      ctx.lineTo(cx - 60, 20)
      ctx.closePath(); ctx.fill()
      // kanan
      ctx.beginPath()
      ctx.moveTo(cx + 110, 60)
      ctx.lineTo(cx + 150, 0)
      ctx.lineTo(cx + 60, 20)
      ctx.closePath(); ctx.fill()

      // Inner telinga
      ctx.fillStyle = '#ffcce0'
      ctx.beginPath()
      ctx.moveTo(cx - 105, 52)
      ctx.lineTo(cx - 138, 8)
      ctx.lineTo(cx - 68, 26)
      ctx.closePath(); ctx.fill()
      ctx.beginPath()
      ctx.moveTo(cx + 105, 52)
      ctx.lineTo(cx + 138, 8)
      ctx.lineTo(cx + 68, 26)
      ctx.closePath(); ctx.fill()

      // Kumis kiri
      ctx.strokeStyle = '#555'
      ctx.lineWidth = 1.5
      ctx.globalAlpha = 0.6
      const whiskerY = h * 0.72
        ;[[-1, 0], [-1, 0.02], [-1, -0.02]].forEach(([dir, angle]) => {
          ctx.beginPath()
          ctx.moveTo(cx - 30, whiskerY)
          ctx.lineTo(cx - 30 + dir * 90, whiskerY + angle * h)
          ctx.stroke()
        })
        // Kumis kanan
        ;[[1, 0], [1, 0.02], [1, -0.02]].forEach(([dir, angle]) => {
          ctx.beginPath()
          ctx.moveTo(cx + 30, whiskerY)
          ctx.lineTo(cx + 30 + dir * 90, whiskerY + angle * h)
          ctx.stroke()
        })
      ctx.globalAlpha = 1

      // Pipi merah
      ctx.globalAlpha = 0.3
      ctx.fillStyle = '#ff9eb5'
      ctx.beginPath(); ctx.ellipse(cx - 95, h * 0.68, 35, 20, 0, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.ellipse(cx + 95, h * 0.68, 35, 20, 0, 0, Math.PI * 2); ctx.fill()
      ctx.globalAlpha = 1

      // Hidung
      ctx.fillStyle = '#ff9eb5'
      ctx.beginPath()
      ctx.moveTo(cx, h * 0.72)
      ctx.lineTo(cx - 7, h * 0.72 - 8)
      ctx.lineTo(cx + 7, h * 0.72 - 8)
      ctx.closePath(); ctx.fill()

      // Emoji dekorasi
      ctx.font = '22px serif'
      ctx.fillText('🐾', 10, h - 12)
      ctx.fillText('🐾', w - 38, h - 12)
      ctx.fillText('🐟', w / 2 - 12, h - 12)

      // Border
      ctx.strokeStyle = '#f4a0c0'
      ctx.lineWidth = 8
      ctx.strokeRect(4, 4, w - 8, h - 8)
    }
  }
]

export default function PhotoBooth() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const [phase, setPhase] = useState('idle')
  const [photoUrl, setPhotoUrl] = useState(null)
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0])
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [logoClickCount, setLogoClickCount] = useState(0)
  const logoTimerRef = useRef(null)
  const animFrameRef = useRef(null)

  // Easter egg logo 5x
  const handleLogoClick = () => {
    const n = logoClickCount + 1
    setLogoClickCount(n)
    if (logoTimerRef.current) clearTimeout(logoTimerRef.current)
    logoTimerRef.current = setTimeout(() => setLogoClickCount(0), 2000)
    if (n >= 5) { setLogoClickCount(0); window.location.href = '/dashboard' }
  }

  // Live preview dengan overlay tema di canvas
  useEffect(() => {
    if (phase !== 'preview') return
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const draw = () => {
      const ctx = canvas.getContext('2d')
      canvas.width = 640
      canvas.height = 480
      // Mirror + filter
      ctx.save()
      ctx.translate(640, 0)
      ctx.scale(-1, 1)
      ctx.filter = selectedTheme.filter
      ctx.drawImage(video, 0, 0, 640, 480)
      ctx.restore()
      ctx.filter = 'none'
      // Overlay tema
      selectedTheme.draw(ctx, 640, 480)
      animFrameRef.current = requestAnimationFrame(draw)
    }

    animFrameRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [phase, selectedTheme])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false
      })
      streamRef.current = stream
      setPhase('preview')
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(console.error)
        }
      }, 100)
    } catch (err) {
      alert('Gagal mengakses kamera: ' + err.message)
    }
  }

  const takePhoto = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    // Stop live preview
    cancelAnimationFrame(animFrameRef.current)
    const url = canvas.toDataURL('image/jpeg', 0.92)
    setPhotoUrl(url)
    setPhase('result')
    uploadPhoto(url)
  }

  const uploadPhoto = async (dataUrl) => {
    setUploading(true)
    try {
      const blob = await (await fetch(dataUrl)).blob()
      const formData = new FormData()
      formData.append('photo', blob, 'photo.jpg')
      await fetch('/api/save-photo', { method: 'POST', body: formData })
      setUploaded(true)
    } catch (err) {
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  const downloadPhoto = () => {
    if (!photoUrl) return
    const a = document.createElement('a')
    a.href = photoUrl
    a.download = `photobooth_${Date.now()}.jpg`
    a.click()
  }

  const retake = () => {
    setPhotoUrl(null)
    setUploaded(false)
    setPhase('preview')
  }

  const stopCamera = () => {
    cancelAnimationFrame(animFrameRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    setPhase('idle')
    setPhotoUrl(null)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 flex flex-col items-center justify-center px-4 py-10">

      {/* Logo */}
      <div onClick={handleLogoClick} className="cursor-pointer select-none text-center mb-4">
        <div className="text-5xl">📸</div>
        <h1 className="text-3xl font-bold text-purple-700 mt-1">PhotoBooth</h1>
        <p className="text-purple-400 text-sm">Foto lucu, kenangan manis!</p>
      </div>

      {/* Notif transparan */}
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs px-4 py-2 rounded-full mb-6 text-center max-w-sm">
        Abadikan momenmu dengan photobooth lucu
      </div>

      {/* Idle */}
      {phase === 'idle' && (
        <div className="text-center">
          <p className="text-gray-500 mb-6">Aktifkan kamera untuk mulai foto!</p>
          <button
            onClick={startCamera}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-10 py-4 rounded-full text-lg shadow-lg transition"
          >
            📷 Aktifkan Kamera
          </button>
        </div>
      )}

      {/* Preview */}
      {phase === 'preview' && (
        <div className="flex flex-col items-center gap-4 w-full max-w-lg">

          {/* Canvas live preview */}
          <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-purple-200 w-full">
            <canvas ref={canvasRef} className="w-full" style={{ display: 'block' }} />
          </div>

          {/* Pilih tema */}
          <div className="flex gap-3 flex-wrap justify-center">
            {THEMES.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTheme(t)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition border-2 ${selectedTheme.id === t.id
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tombol */}
          <div className="flex gap-3 mt-2">
            <button
              onClick={takePhoto}
              className="bg-pink-500 hover:bg-pink-400 text-white font-bold px-10 py-4 rounded-full text-lg shadow-lg transition"
            >
              📸 Ambil Foto!
            </button>
            <button
              onClick={stopCamera}
              className="bg-gray-200 hover:bg-gray-300 text-gray-600 font-semibold px-5 py-4 rounded-full transition"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {phase === 'result' && photoUrl && (
        <div className="flex flex-col items-center gap-5 w-full max-w-lg">
          <p className="text-purple-700 font-bold text-xl">✨ Foto kamu siap!</p>

          <img
            src={photoUrl}
            className="w-full rounded-3xl shadow-2xl border-4 border-white"
          />

          <div className="text-xs text-gray-400">
            {uploading && '⏳ Menyimpan...'}
            {uploaded && !uploading && '✅ Tersimpan'}
          </div>

          <div className="flex gap-3 flex-wrap justify-center">
            <button
              onClick={downloadPhoto}
              className="bg-green-500 hover:bg-green-400 text-white font-bold px-8 py-3 rounded-full shadow-lg transition"
            >
              💾 Simpan Foto
            </button>
            <button
              onClick={retake}
              className="bg-purple-500 hover:bg-purple-400 text-white font-bold px-8 py-3 rounded-full shadow-lg transition"
            >
              🔄 Foto Lagi
            </button>
            <button
              onClick={stopCamera}
              className="bg-gray-200 hover:bg-gray-300 text-gray-600 font-semibold px-6 py-3 rounded-full transition"
            >
              ✕ Selesai
            </button>
          </div>
        </div>
      )}

      {/* Video hidden */}
      <video ref={videoRef} autoPlay playsInline muted className="hidden" />
    </main>
  )
}