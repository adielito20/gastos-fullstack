/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: '#0a0a0a',
          soft: '#1a1a1a',
          muted: '#2a2a2a',
        },
        paper: {
          DEFAULT: '#f8f6f1',
          soft: '#f0ede6',
          muted: '#e8e4dc',
        },
        accent: {
          green: '#00c896',
          yellow: '#f5b700',
          red: '#ff3b30',
          blue: '#0066ff',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shake': 'shake 0.5s ease-in-out',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-6px)' },
          '40%': { transform: 'translateX(6px)' },
          '60%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(4px)' },
        }
      }
    },
  },
  plugins: [],
}
