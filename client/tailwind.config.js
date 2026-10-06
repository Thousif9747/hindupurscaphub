/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // fresh eco-green scale
        moss: {
          50: '#EEFBF3',
          100: '#D5F5E2',
          200: '#AEEBC7',
          300: '#79DBA5',
          400: '#40C581',
          500: '#1BAA64',
          600: '#0F8C51',
          700: '#0D7043',
          800: '#0C5937',
          900: '#09492E',
          950: '#04291A'
        },
        // charcoal / ink
        ink: {
          50: '#F4F6F5',
          100: '#E3E8E6',
          200: '#C9D2CE',
          300: '#A3B1AB',
          400: '#77877F',
          500: '#5B6B63',
          600: '#46534C',
          700: '#39433D',
          800: '#242C28',
          900: '#161C19',
          950: '#0C110F'
        },
        // amber / orange accent
        sun: {
          50: '#FFF8EB',
          100: '#FFEECB',
          200: '#FFDB92',
          300: '#FFC259',
          400: '#FFA72B',
          500: '#F9840B',
          600: '#DD6002',
          700: '#B74306',
          800: '#94350C',
          900: '#7A2D0D'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Bricolage Grotesque"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        soft: '0 6px 30px -12px rgba(12, 17, 15, 0.18)',
        lift: '0 18px 45px -20px rgba(12, 17, 15, 0.35)',
        glow: '0 0 0 1px rgba(27, 170, 100, 0.25), 0 12px 40px -18px rgba(27, 170, 100, 0.6)'
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' }
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        },
        pulseRing: {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '80%, 100%': { transform: 'scale(1.7)', opacity: '0' }
        }
      },
      animation: {
        shimmer: 'shimmer 1.4s infinite',
        floaty: 'floaty 5s ease-in-out infinite',
        marquee: 'marquee 32s linear infinite',
        pulseRing: 'pulseRing 2.4s cubic-bezier(0.2, 0.6, 0.4, 1) infinite'
      }
    }
  },
  plugins: []
};
