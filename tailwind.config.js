/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#4B2C6F',
          'purple-dark': '#362050',
          'purple-light': '#6B4C8F',
          gold: '#D4AF37',
          'gold-light': '#E8C962',
          'gold-dark': '#B8922A',
          white: '#FFFFFF',
          black: '#0A0708',
        },
        luxury: {
          black: '#0A0708',
          dark: '#1A1214',
          charcoal: '#2A2220',
          gray: '#3A3238',
          light: '#F5F3F1',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Cormorant Garamond', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(212, 168, 74, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(212, 168, 74, 0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        luxury: '0 24px 60px rgba(0, 0, 0, 0.4)',
        premium: '0 18px 45px rgba(214, 29, 125, 0.18)',
      },
    },
  },
  plugins: [],
}
