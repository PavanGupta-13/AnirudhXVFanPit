/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        neon: {
          purple: '#bf00ff',
          cyan: '#00e5ff',
          blue: '#0066ff',
          pink: '#ff0080',
          yellow: '#ffee00',
        },
        glass: {
          bg: 'rgba(15, 15, 26, 0.7)',
          border: 'rgba(255, 255, 255, 0.08)',
          highlight: 'rgba(255, 255, 255, 0.12)',
        },
        dark: {
          900: '#0a0a14',
          800: '#0f0f1a',
          700: '#14142a',
          600: '#1a1a3a',
        }
      },
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'gradient-shift': 'gradientShift 6s ease infinite',
        'gradient-fast': 'gradientShift 2s ease infinite',
        'pulse-neon': 'pulseNeon 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'equalizer': 'equalizer 0.8s ease-in-out infinite alternate',
        'confetti-fall': 'confettiFall 3s ease-in forwards',
        'slide-up': 'slideUp 0.5s ease forwards',
        'fade-in': 'fadeIn 0.6s ease forwards',
        'bounce-in': 'bounceIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'ripple': 'ripple 0.6s ease-out forwards',
        'whoosh': 'whoosh 0.5s ease-out forwards',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'music-note': 'musicNote 2s ease-in-out infinite',
      },
      keyframes: {
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        pulseNeon: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(0.98)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        equalizer: {
          '0%': { height: '4px' },
          '100%': { height: '20px' },
        },
        confettiFall: {
          '0%': { transform: 'translateY(-20px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '0.5' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        whoosh: {
          '0%': { transform: 'translateX(0) scale(1)', opacity: '1' },
          '50%': { transform: 'translateX(20px) scale(0.9)', opacity: '0.5' },
          '100%': { transform: 'translateX(0) scale(1)', opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(191, 0, 255, 0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(191, 0, 255, 0.8), 0 0 60px rgba(0, 229, 255, 0.4)' },
        },
        musicNote: {
          '0%, 100%': { transform: 'translateY(0) rotate(-5deg)', opacity: '0.6' },
          '50%': { transform: 'translateY(-15px) rotate(5deg)', opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
        glass: '18px',
      },
      boxShadow: {
        'neon-purple': '0 0 20px rgba(191, 0, 255, 0.6), 0 0 40px rgba(191, 0, 255, 0.2)',
        'neon-cyan': '0 0 20px rgba(0, 229, 255, 0.6), 0 0 40px rgba(0, 229, 255, 0.2)',
        'neon-blue': '0 0 20px rgba(0, 102, 255, 0.6)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'card-hover': '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 30px rgba(191, 0, 255, 0.15)',
      },
    },
  },
  plugins: [],
}
