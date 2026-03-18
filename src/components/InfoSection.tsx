import React from 'react'

const INFO_ITEMS = [
  { icon: '📍', label: 'Venue', value: 'Gachibowli Outdoor Stadium, Hyderabad' },
  { icon: '📅', label: 'Date', value: 'March 21, 2026' },
  { icon: '🕕', label: 'Time', value: '6:00 pm – 10:00 pm IST' },
  { icon: '🎤', label: 'Artist', value: 'Anirudh Ravichander' },
  { icon: '🎉', label: 'Milestone', value: '15 Years in Music Industry' },
]

const InfoSection: React.FC = () => {
  return (
    <section className="px-4 pt-12 pb-36">
      <div className="section-divider mb-10" />

      <div className="max-w-lg mx-auto">
        <h2 className="font-display font-extrabold text-2xl text-white mb-2 text-center">Event Info</h2>
        <p className="text-white/40 text-sm font-body text-center mb-8">Everything you need to know</p>

        <div className="glass-card p-6 mb-6">
          <div className="space-y-4">
            {INFO_ITEMS.map(({ icon, label, value }) => (
              <div key={label} className="flex items-start gap-4">
                <span className="text-xl shrink-0">{icon}</span>
                <div>
                  <span className="text-xs text-white/40 font-display uppercase tracking-widest block mb-0.5">{label}</span>
                  <span className="text-sm font-display font-semibold text-white">{value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div
          className="glass-card p-4 border-yellow-400/20"
          style={{ borderColor: 'rgba(255,238,0,0.2)' }}
        >
          <p className="text-xs text-white/50 font-body text-center leading-relaxed">
            Built with ❤️ by fans, for fans.
          </p>
        </div>

        {/* Social links placeholder */}
        {/* <div className="text-center mt-8 space-y-2">
          <p className="text-xs text-white/30 font-display uppercase tracking-widest">Follow Anirudh</p>
          <div className="flex justify-center gap-4">
            {['Instagram', 'Twitter/X', 'YouTube'].map((platform) => (
              <span
                key={platform}
                className="text-xs font-display font-semibold px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/40"
              >
                {platform}
              </span>
            ))}
          </div>
        </div> */}

        {/* Footer */}
        <div className="text-center mt-10 pt-6 border-t border-white/5">
          <div
            className="text-lg font-display font-extrabold mb-1"
            style={{ background: 'linear-gradient(135deg, #bf00ff, #00e5ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            Rockstar Anirudh XV
          </div>
          <p className="text-white/25 text-xs font-body">Fan Companion · Hyderabad 2026</p>
          <div className="flex items-end justify-center gap-0.5 h-4 mt-3 opacity-30">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="equalizer-bar" style={{ height: `${6 + i * 2}px`, animationDelay: `${i * 0.12}s` }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default InfoSection
