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
        'psf-green-900': '#003F2D',
        'psf-green-800': '#064A34',
        'psf-green-700': '#0D5A3D',
        'psf-lime-300': '#EFF48A',
        'psf-cream-100': '#F4F0E4',
        'psf-cream-200': '#E9E2D2',
        'psf-black-green': '#06150F',
        'psf-pink': '#F04C8B',
        'psf-sky': '#B7DDE7',
        'psf-orange': '#EF8738',
        'psf-gold': '#F3C452',
        'psf-sage': '#8CA36A',
      },
      fontFamily: {
        display: ['Anton', 'Impact', 'Arial Black', 'sans-serif'],
        heading: ['Helvetica Neue Condensed Black', 'Arial Narrow', 'Arial Black', 'sans-serif'],
        body: ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        none: '0px',
        sm: '0px',
        DEFAULT: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
        '3xl': '0px',
        full: '0px',
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
