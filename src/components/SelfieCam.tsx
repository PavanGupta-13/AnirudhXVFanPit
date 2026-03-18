import React, { useState, useRef, useEffect, useCallback } from 'react'

type FilterMode = 0 | 1 | 2

const FILTER_NAMES = ['Purple Neon 💜', 'Grain Vignette 🎞️', 'Concert Night 🌃']

const FILTER_STYLES: React.CSSProperties[] = [
  // Filter 0: Purple-cyan gradient overlay
  {},
  // Filter 1: Grain + vignette
  { filter: 'contrast(1.05) brightness(0.9) saturate(0.8)' },
  // Filter 2: High-contrast concert night
  { filter: 'contrast(1.4) brightness(0.75) saturate(1.2) hue-rotate(10deg)' },
]

const OVERLAY_STYLES: React.CSSProperties[] = [
  // 0: purple-cyan gradient tint
  { background: 'linear-gradient(135deg, rgba(191,0,255,0.25) 0%, rgba(0,229,255,0.15) 100%)' },
  // 1: vignette
  { background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)' },
  // 2: dark overlay
  { background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.5) 100%)' },
]

const SelfieCam: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [streaming, setStreaming] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [filterMode, setFilterMode] = useState<FilterMode>(0)
  const [snapPreview, setSnapPreview] = useState<string | null>(null)
  const [showTooltip, setShowTooltip] = useState(false)
  const [shutter, setShutter] = useState(false)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setStreaming(true)
      setPermissionDenied(false)
      // Show privacy tooltip on first open
      const seen = localStorage.getItem('cam_tooltip_seen')
      if (!seen) {
        setShowTooltip(true)
        localStorage.setItem('cam_tooltip_seen', '1')
        setTimeout(() => setShowTooltip(false), 4000)
      }
    } catch {
      setPermissionDenied(true)
    }
  }, [])

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const takeSnap = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!video || !canvas || !container) return

    setShutter(true)
    setTimeout(() => setShutter(false), 200)

    const w = video.videoWidth  || container.offsetWidth
    const h = video.videoHeight || container.offsetHeight
    canvas.width  = w
    canvas.height = h

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Flip horizontally (front cam mirror)
    ctx.save()
    ctx.translate(w, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, w, h)
    ctx.restore()

    // Apply filter 1 (grain) via color adjustment
    if (filterMode === 1) {
      ctx.globalAlpha = 0.15
      // noise approximation via random dots
      for (let i = 0; i < w * h * 0.04; i++) {
        const x = Math.random() * w
        const y = Math.random() * h
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.3})`
        ctx.fillRect(x, y, 1, 1)
      }
      // vignette
      const vgr = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.8)
      vgr.addColorStop(0, 'rgba(0,0,0,0)')
      vgr.addColorStop(1, 'rgba(0,0,0,0.65)')
      ctx.globalAlpha = 1
      ctx.fillStyle = vgr
      ctx.fillRect(0, 0, w, h)
    }

    // Filter 0 overlay: purple-cyan
    if (filterMode === 0) {
      const gr = ctx.createLinearGradient(0, 0, w, h)
      gr.addColorStop(0, 'rgba(191,0,255,0.25)')
      gr.addColorStop(1, 'rgba(0,229,255,0.15)')
      ctx.globalAlpha = 1
      ctx.fillStyle = gr
      ctx.fillRect(0, 0, w, h)
    }

    // Filter 2: dark overlay
    if (filterMode === 2) {
      ctx.globalAlpha = 0.35
      ctx.fillStyle = 'rgba(0,0,0,1)'
      ctx.fillRect(0, 0, w, h)
      ctx.globalAlpha = 1
    }

    // ── Text overlays ──
    ctx.globalAlpha = 1

    // Top bar gradient
    const topGr = ctx.createLinearGradient(0, 0, 0, 70)
    topGr.addColorStop(0, 'rgba(0,0,0,0.7)')
    topGr.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = topGr
    ctx.fillRect(0, 0, w, 70)

    // Top text
    ctx.font = `bold ${Math.floor(w * 0.045)}px 'Space Grotesk', sans-serif`
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.shadowColor = '#bf00ff'
    ctx.shadowBlur = 15
    ctx.fillText('ROCKSTAR ANIRUDH XV · HYD', w / 2, 42)
    ctx.shadowBlur = 0

    // Bottom pill gradient
    const bottomGr = ctx.createLinearGradient(0, h - 70, 0, h)
    bottomGr.addColorStop(0, 'rgba(0,0,0,0)')
    bottomGr.addColorStop(1, 'rgba(0,0,0,0.7)')
    ctx.fillStyle = bottomGr
    ctx.fillRect(0, h - 70, w, 70)

    // Bottom pill
    const pillW = w * 0.55, pillH = 34, pillX = (w - pillW) / 2, pillY = h - 48
    const pgr = ctx.createLinearGradient(pillX, 0, pillX + pillW, 0)
    pgr.addColorStop(0, 'rgba(191,0,255,0.85)')
    pgr.addColorStop(1, 'rgba(0,102,255,0.85)')
    ctx.beginPath()
    ctx.roundRect(pillX, pillY, pillW, pillH, pillH / 2)
    ctx.fillStyle = pgr
    ctx.fill()
    ctx.font = `600 ${Math.floor(w * 0.03)}px 'Space Grotesk', sans-serif`
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.fillText('15 Years With You', w / 2, pillY + pillH * 0.68)

    setSnapPreview(canvas.toDataURL('image/jpeg', 0.92))
  }, [filterMode])

  const canShare = typeof navigator.share === 'function'

  // Convert data URL → Blob → Object URL for reliable mobile save
  const dataUrlToBlob = (dataUrl: string): Blob => {
    const [header, base64] = dataUrl.split(',')
    const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg'
    const bytes = atob(base64)
    const arr = new Uint8Array(bytes.length)
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
    return new Blob([arr], { type: mime })
  }

  const downloadSnap = () => {
    if (!snapPreview) return
    const blob = dataUrlToBlob(snapPreview)
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `anirudh-xv-${Date.now()}.jpg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 3000)
  }

  const shareSnap = async () => {
    if (!snapPreview) return
    try {
      const blob = dataUrlToBlob(snapPreview)
      const file = new File([blob], `anirudh-xv-${Date.now()}.jpg`, { type: 'image/jpeg' })
      await navigator.share({
        title: 'Rockstar Anirudh XV – Hyderabad 🎵',
        text: '15 Years With You · Captured at Gachibowli!',
        files: [file],
      })
    } catch {
      // Fallback to download if share fails or cancelled
      downloadSnap()
    }
  }

  if (!streaming) {
    return (
      <section id="camera" className="min-h-screen flex flex-col items-center justify-center px-4 pb-28">
        <div className="glass-card p-8 text-center max-w-sm w-full animate-bounce-in">
          <div className="text-6xl mb-4">📸</div>
          <h2 className="font-display font-extrabold text-2xl text-white mb-2">AR Selfie Filter</h2>
          <p className="text-white/50 text-sm font-body mb-6">
            Capture your concert moment with neon filters and overlays — processed 100% on your device.
          </p>
          {permissionDenied ? (
            <div className="text-red-400 text-sm font-body mb-4 p-3 rounded-xl bg-red-400/10 border border-red-400/20">
              Camera access denied. Please allow camera in your browser settings and try again.
            </div>
          ) : null}
          <button onClick={startCamera} className="btn-primary w-full text-white font-display font-bold py-4 text-base">
            📷 Open Selfie Cam
          </button>
          <p className="text-xs text-white/25 font-body mt-4">
            Photos are processed locally; nothing is uploaded.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section id="camera" className="relative min-h-screen pb-28 overflow-hidden bg-black">
      {/* Privacy tooltip */}
      {showTooltip && (
        <div className="absolute top-4 left-4 right-4 z-50 animate-slide-up">
          <div className="glass-card px-4 py-3 border border-neon-cyan/30 text-sm font-body text-white/80">
            🔒 Your camera feed stays on-device. Nothing is recorded or uploaded.
          </div>
        </div>
      )}

      {/* Camera view */}
      <div
        ref={containerRef}
        className="relative w-full camera-container"
        style={{ height: 'calc(100dvh - 120px)', overflow: 'hidden' }}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)', ...FILTER_STYLES[filterMode] }}
          playsInline
          muted
        />

        {/* Colour overlay */}
        <div className="absolute inset-0 pointer-events-none" style={OVERLAY_STYLES[filterMode]} />

        {/* Top neon text overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-center pointer-events-none">
          <div
            className="font-display font-extrabold text-white text-center text-sm sm:text-base tracking-widest uppercase"
            style={{ textShadow: '0 0 20px rgba(191,0,255,0.9), 0 0 40px rgba(0,229,255,0.5)' }}
          >
            ROCKSTAR ANIRUDH XV · HYD
          </div>
        </div>

        {/* Animated music notes edges */}
        <div className="absolute left-3 top-1/4 pointer-events-none animate-music-note opacity-50 text-neon-purple text-2xl">♪</div>
        <div className="absolute right-3 top-1/3 pointer-events-none animate-music-note opacity-50 text-neon-cyan text-xl" style={{ animationDelay: '1s' }}>♫</div>
        <div className="absolute left-5 bottom-1/3 pointer-events-none animate-music-note opacity-40 text-neon-blue text-3xl" style={{ animationDelay: '2s' }}>♩</div>
        <div className="absolute right-4 bottom-1/4 pointer-events-none animate-music-note opacity-40 text-neon-purple text-2xl" style={{ animationDelay: '0.5s' }}>♬</div>

        {/* Equalizer bars – bottom edges */}
        <div className="absolute bottom-16 left-4 flex items-end gap-0.5 pointer-events-none opacity-70">
          {[8,14,10,18,12,16,9,13,11].map((h, i) => (
            <div key={i} className="equalizer-bar" style={{ height: h, animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
        <div className="absolute bottom-16 right-4 flex items-end gap-0.5 pointer-events-none opacity-70">
          {[11,13,9,16,12,18,10,14,8].map((h, i) => (
            <div key={i} className="equalizer-bar" style={{ height: h, animationDelay: `${i * 0.1 + 0.5}s` }} />
          ))}
        </div>

        {/* Bottom pill */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
          <div
            className="px-5 py-2 rounded-full font-display font-bold text-white text-sm tracking-wider"
            style={{ background: 'linear-gradient(135deg, rgba(191,0,255,0.85), rgba(0,102,255,0.85))' }}
          >
            15 Years With You
          </div>
        </div>

        {/* Shutter flash */}
        {shutter && (
          <div className="absolute inset-0 bg-white pointer-events-none" style={{ animation: 'fadeIn 0.05s ease, fadeIn 0.15s ease 0.05s reverse forwards' }} />
        )}
      </div>

      {/* Controls */}
      <div
        className="absolute bottom-0 left-0 right-0 px-4 py-4"
        style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)' }}
      >
        <div className="flex items-center justify-between gap-4">
          {/* Filter selector */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {FILTER_NAMES.map((name, i) => (
              <button
                key={i}
                onClick={() => setFilterMode(i as FilterMode)}
                className={`shrink-0 text-xs font-display font-semibold px-3 py-1.5 rounded-full transition-all active:scale-90 ${
                  filterMode === i
                    ? 'text-white'
                    : 'bg-white/5 text-white/40 border border-white/10'
                }`}
                style={filterMode === i ? {
                  background: 'linear-gradient(135deg, #bf00ff, #0066ff)',
                  boxShadow: '0 0 15px rgba(191,0,255,0.4)',
                } : {}}
              >
                {name}
              </button>
            ))}
          </div>

          {/* Shutter button */}
          <button
            onClick={takeSnap}
            className="shrink-0 w-16 h-16 rounded-full border-4 border-white flex items-center justify-center active:scale-90 transition-all"
            style={{ boxShadow: '0 0 20px rgba(191,0,255,0.6), 0 0 40px rgba(0,229,255,0.3)' }}
          >
            <div className="w-12 h-12 rounded-full bg-white" />
          </button>
        </div>
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Snap preview modal */}
      {snapPreview && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 snap-preview"
          onClick={() => setSnapPreview(null)}
        >
          <div
            className="glass-card p-4 w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4 sm:hidden" />

            <img src={snapPreview} alt="Selfie preview" className="w-full rounded-2xl mb-3 shadow-neon-purple" />

            <p className="text-[11px] text-white/30 font-body text-center mb-4">
              🔒 Processed on your device · Not uploaded anywhere
            </p>

            {/* Primary actions */}
            <div className="flex gap-3 mb-3">
              {canShare ? (
                <button
                  onClick={shareSnap}
                  className="btn-primary flex-1 text-white font-display font-bold py-3.5 text-sm"
                >
                  📤 Share
                </button>
              ) : null}
              <button
                onClick={downloadSnap}
                className={`font-display font-bold py-3.5 text-sm text-white transition-all active:scale-95 rounded-full ${canShare ? 'btn-neon flex-1' : 'btn-primary flex-1'}`}
              >
                ⬇️ Save to Device
              </button>
            </div>

            <button
              onClick={() => setSnapPreview(null)}
              className="w-full py-3 text-white/40 font-display text-sm hover:text-white/60 transition-colors"
            >
              Retake Photo
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

export default SelfieCam
