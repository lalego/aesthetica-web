/** @type {import('tailwindcss').Config} */

// Paleta cálida (crema, taupe y marrón). `gold` y `neutral` se redefinen para
// que todos los componentes cambien sin tocar sus clases. Los tonos de texto
// (400 en adelante) son oscuros para que contrasten con el fondo crema.
const text = {
  50:  '#f6f2ea',
  100: '#efe7da',
  200: '#e2d8c8',
  300: '#c4b6a4',
  400: '#6e6358',
  500: '#574b3f',
  600: '#4a4038',
  700: '#3f3730',
  800: '#36302a',
  900: '#2a2520',
  950: '#1e1a16',
}

// `stone` se usa sobre todo en el pie oscuro: conserva tonos claros.
const warm = {
  50:  '#f6f2ea',
  100: '#efe7da',
  200: '#e2d8c8',
  300: '#cbbeab',
  400: '#a3968a',
  500: '#8a7e72',
  600: '#635a50',
  700: '#4c443c',
  800: '#36302a',
  900: '#2a2520',
  950: '#1e1a16',
}

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Palatino Linotype"', '"Book Antiqua"', 'Palatino', 'serif'],
        serif: ['"Palatino Linotype"', '"Book Antiqua"', 'Palatino', 'serif'],
        meta: ['Almarai', 'system-ui', 'sans-serif'],
      },
      colors: {
        white: '#f6f2ea',
        neutral: text,
        stone: warm,
        cream: text,
        gold: {
          50:  '#faf7f2',
          100: '#efe3d5',
          200: '#dccbb6',
          300: '#b9a48e',
          400: '#574b3f',
          500: '#4a3f35',
          600: '#36302a',
          900: '#2a2520',
        },
      },
    },
  },
  plugins: [],
}
