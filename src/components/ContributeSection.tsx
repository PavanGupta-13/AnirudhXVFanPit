import React, { useEffect, useRef, useState, useCallback } from 'react'
import QRCode from 'qrcode'

const UPI_ID   = 'pavanguptak13@okicici'
const UPI_NAME = 'Anirudh XV Fan App'
const UPI_NOTE = 'Fan%20Contribution%20-%20Anirudh%20XV'

const AMOUNTS = [
  { label: '₹49',  value: 49  },
  { label: '₹99',  value: 99  },
  { label: '₹199', value: 199 },
  { label: 'Other', value: 0  },
]

function upiLink(app: 'generic' | 'gpay' | 'phonepe' | 'paytm', amount: number): string {
  const base = `pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&cu=INR&tn=${UPI_NOTE}${amount ? `&am=${amount}` : ''}`
  const schemes: Record<string, string> = {
    generic: `upi://pay?${base}`,
    gpay:    `tez://upi/pay?${base}`,
    phonepe: `phonepe://pay?${base}`,
    paytm:   `paytmmp://pay?${base}`,
  }
  return schemes[app]
}

// Payment app configs
const PAY_APPS = [
  {
    id: 'gpay' as const,
    name: 'GPay',
    color: '#1a73e8',
    icon: (
      <svg viewBox="0 0 48 48" className="w-6 h-6">
        <path fill="#4285F4" d="M43.6 20.1H24v7.5h11.2c-.5 2.6-2 4.8-4.3 6.3l6.8 5.3c4-3.7 6.3-9.2 6.3-15.8 0-1.1-.1-2.2-.4-3.3z"/>
        <path fill="#34A853" d="M24 44c5.6 0 10.3-1.9 13.7-5.1l-6.8-5.3c-1.9 1.3-4.3 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4l-7 5.4C9.1 40 16 44 24 44z"/>
        <path fill="#FBBC05" d="M12.6 27.2c-.4-1.2-.6-2.5-.6-3.8s.2-2.6.6-3.8l-7-5.4C4 16.7 3 20.2 3 24s1 7.3 2.6 10.6l7-5.4z"/>
        <path fill="#EA4335" d="M24 10.8c3 0 5.6 1 7.7 3l5.8-5.8C34.3 4.7 29.5 3 24 3 16 3 9.1 7 5.6 13.4l7 5.4C14.2 14.4 18.7 10.8 24 10.8z"/>
      </svg>
    ),
  },
  {
    id: 'phonepe' as const,
    name: 'PhonePe',
    color: '#5f259f',
    icon: (
      <svg viewBox="0 0 48 48" className="w-6 h-6">
        <rect width="48" height="48" rx="10" fill="#5f259f"/>
        <text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">Pe</text>
      </svg>
    ),
  },
  {
    id: 'paytm' as const,
    name: 'Paytm',
    color: '#00b9f1',
    icon: (
      <svg viewBox="0 0 48 48" className="w-6 h-6">
        <rect width="48" height="48" rx="10" fill="#00b9f1"/>
        <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">PAYTM</text>
      </svg>
    ),
  },
]

const ContributeSection: React.FC = () => {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const [selected, setSelected] = useState(99)
  const [custom, setCustom]     = useState('')
  const [copied, setCopied]     = useState(false)
  const [showCustom, setShowCustom] = useState(false)
  const [paying, setPaying]     = useState<string | null>(null)

  const finalAmount = showCustom ? (parseInt(custom) || 0) : selected

  // Generate QR code
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const upiData = upiLink('generic', finalAmount)
    QRCode.toCanvas(canvas, upiData, {
      width: 200,
      margin: 2,
      color: { dark: '#0f0f1a', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    }).catch(console.warn)
  }, [finalAmount])

  const copyUpiId = useCallback(async () => {
    await navigator.clipboard.writeText(UPI_ID).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }, [])

  const handlePay = (appId: string) => {
    setPaying(appId)
    const link = upiLink(appId as 'gpay' | 'phonepe' | 'paytm', finalAmount)
    window.location.href = link
    setTimeout(() => setPaying(null), 2000)
  }

  return (
    <section className="px-4 pt-4 pb-8">
      <div className="section-divider mb-10" />

      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">💜</div>
          <h2 className="font-display font-extrabold text-2xl text-white mb-2">Support This App</h2>
          <p className="text-white/50 text-sm font-body leading-relaxed">
            This is a free, fan-made companion with zero ads.<br />
            If it added to your concert experience, a small contribution keeps it alive!
          </p>
        </div>

        {/* What it goes towards */}
        <div className="glass-card p-4 mb-6">
          <p className="text-xs font-display font-semibold text-white/40 uppercase tracking-widest mb-3">Your contribution supports</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: '🌐', label: 'Hosting &\nDomain' },
              { icon: '🔥', label: 'Firebase\nDatabase' },
              { icon: '🛠️', label: 'Future\nUpdates' },
            ].map(({ icon, label }) => (
              <div key={label} className="text-center py-3 px-2 rounded-2xl" style={{ background: 'rgba(191,0,255,0.06)', border: '1px solid rgba(191,0,255,0.12)' }}>
                <div className="text-2xl mb-1">{icon}</div>
                <p className="text-[10px] font-display text-white/50 whitespace-pre-line leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Amount selector */}
        <div className="mb-5">
          <p className="text-xs font-display font-semibold text-white/40 uppercase tracking-widest mb-3">Choose amount</p>
          <div className="grid grid-cols-4 gap-2">
            {AMOUNTS.map(({ label, value }) => {
              const isOther   = value === 0
              const isActive  = isOther ? showCustom : (!showCustom && selected === value)
              return (
                <button
                  key={label}
                  onClick={() => {
                    if (isOther) { setShowCustom(true) }
                    else { setShowCustom(false); setSelected(value) }
                  }}
                  className="py-3 rounded-2xl font-display font-bold text-sm transition-all active:scale-95"
                  style={isActive ? {
                    background: 'linear-gradient(135deg, #bf00ff, #0066ff)',
                    boxShadow: '0 0 20px rgba(191,0,255,0.4)',
                    color: 'white',
                  } : {
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.6)',
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>

          {showCustom && (
            <div className="mt-3 relative animate-slide-up">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-display font-bold">₹</span>
              <input
                type="number"
                placeholder="Enter amount"
                value={custom}
                min={1}
                onChange={(e) => setCustom(e.target.value)}
                className="w-full pl-8 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-neon-purple text-sm font-body"
              />
            </div>
          )}
        </div>

        {/* QR Code */}
        <div className="glass-card p-5 mb-5 flex flex-col items-center">
          <p className="text-xs font-display font-semibold text-white/40 uppercase tracking-widest mb-4">
            Scan with any UPI app
            {finalAmount > 0 && <span className="ml-2 text-neon-purple">· ₹{finalAmount}</span>}
          </p>

          {/* Canvas QR */}
          <div className="rounded-2xl overflow-hidden p-2 mb-4" style={{ background: 'white' }}>
            <canvas ref={canvasRef} className="block" />
          </div>

          {/* UPI ID + copy */}
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-full w-full justify-between"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <span className="text-sm font-mono text-white/70">{UPI_ID}</span>
            <button
              onClick={copyUpiId}
              className="shrink-0 text-xs font-display font-semibold px-3 py-1 rounded-full transition-all active:scale-90"
              style={copied
                ? { background: 'rgba(74,222,128,0.2)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.4)' }
                : { background: 'rgba(191,0,255,0.15)', color: '#bf00ff', border: '1px solid rgba(191,0,255,0.3)' }
              }
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Payment app deep links */}
        <div className="mb-6">
          <p className="text-xs font-display font-semibold text-white/40 uppercase tracking-widest mb-3 text-center">
            Or open directly in
          </p>
          <div className="grid grid-cols-3 gap-3">
            {PAY_APPS.map((app) => (
              <button
                key={app.id}
                onClick={() => handlePay(app.id)}
                className="flex flex-col items-center gap-2 py-4 rounded-2xl transition-all active:scale-95"
                style={{
                  background: paying === app.id ? `${app.color}30` : 'rgba(255,255,255,0.04)',
                  border: paying === app.id ? `1px solid ${app.color}` : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {app.icon}
                <span className="text-xs font-display font-semibold text-white/70">{app.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-[11px] text-white/25 font-body text-center leading-relaxed">
          Payments go directly to the developer. No payment info is stored in this app.
          All UPI transactions are handled by your banking app.
        </p>
      </div>
    </section>
  )
}

export default ContributeSection
