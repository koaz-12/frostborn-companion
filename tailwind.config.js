/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nordic: {
          bg: '#0a0e17',
          surface: '#111827',
          card: '#162032',
          border: '#1f2d47',
          gold: '#d4a853',
          'gold-light': '#f3cb75',
          'gold-dark': '#a37c2c',
          ice: '#60a5fa',
          'ice-light': '#93c5fd',
          emerald: '#34d399',
          blood: '#f87171',
          text: '#f3f4f6',
          muted: '#9ca3af',
        }
      },
      fontFamily: {
        runic: ['Cinzel', 'Trajan Pro', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
