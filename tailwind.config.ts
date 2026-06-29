import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
    './assets/**/*.css'
  ],
  theme: {
    extend: {
      colors: {
        diamond: {
          50:  '#f0faf4',
          100: '#d9f2e4',
          200: '#b4e5ca',
          300: '#7fd1aa',
          400: '#48b585',
          500: '#2a9d6e',  // vert diamant principal
          600: '#1e7d57',
          700: '#196445',
          800: '#164f38',
          900: '#12412e',
          950: '#0a2419',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    }
  },
  plugins: []
} satisfies Config
