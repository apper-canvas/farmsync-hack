/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2D5016',
        secondary: '#7CB342',
        accent: '#F57C00',
        surface: {
          50: '#FAFAF8',
          100: '#F5F5DC',
          200: '#E8E8D0',
          300: '#DDDDC0',
          400: '#D0D0A8',
          500: '#C3C390',
          600: '#B6B678',
          700: '#A9A960',
          800: '#9C9C48',
          900: '#8F8F30'
        },
        success: '#4CAF50',
        warning: '#FFA726',
        error: '#D32F2F',
        info: '#1976D2'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        heading: ['DM Sans', 'ui-sans-serif', 'system-ui']
      }
    },
  },
  plugins: [],
}