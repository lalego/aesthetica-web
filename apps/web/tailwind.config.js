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
        // Fondos cálidos en lugar de blanco/gris: crema para las secciones
        // claras y arena para alternar.
        cream: {
          50:  '#fcfaf6',
          100: '#f7f1e8',
          200: '#efe5d6',
          300: '#e2d3bd',
        },
        // Marrón del pie, para las secciones oscuras.
        espresso: {
          700: '#3d2e24',
          800: '#2b2019',
          900: '#1c1410',
        },
      }
    },
  },
  plugins: [],
}