// tailwind.config.js

// 1. Import the default theme for the fonts
import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // 2. Add your custom font back in (use the exact name you declare in your @font-face)
      fontFamily: {
        sans: ['MyCustom', 'Inter', ...defaultTheme.fontFamily.sans],
        tourney: ['Tourney', 'sans-serif']
      },

      // 3. Custom background image (public file paths should start with /)
      backgroundImage: {
        'signup-background': "url('/gym1-bg.jpg')",
        'login-background': "url('/gym1-bg.jpg')",
        'dashboard-background': "url('/dashboard-bg.jpg')",
        "gym-logo": "url('/gym-logo.jpg')",
      },

      // 3. Your complete color palette
      colors: {
        'gym': {
          100: '#E6F2FF',
          200: '#B3D9FF',
          300: '#80BFFF',
          400: '#4DA6FF',
          500: '#1A8CFF',
          600: '#0073E6',
          700: '#0059B3',
          800: '#004080',
          900: '#002A53'
        },
        'custom-blue': '#1a365d',
        'custom-red': '#E63946',
        '-bg': '#6A89A7',
        '-bg-darker': '#88BDF2',
        '-bg-darkest': '#384959'
      }
    },
  },
  plugins: [],
}
