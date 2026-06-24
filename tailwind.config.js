/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      colors: {
        gold: {
          50:  '#fdfbf2',
          100: '#faf4dc',
          200: '#f2e4a8',
          300: '#e8cf6e',
          400: '#c9a84c',
          500: '#a8861e',
          600: '#7d6214',
          900: '#2e2006',
        },
      }
    },
  },
  plugins: [],
}