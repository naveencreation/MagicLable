/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./script.js"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899', // Pink
          600: '#db2777',
          900: '#831843',
        },
        accent: {
          400: '#fbbf24', // Yellow/Gold
          500: '#f59e0b',
        }
      },
      backgroundImage: {
        'polka-dots': 'radial-gradient(#fce7f3 2.5px, transparent 2.5px)',
      }
    },
  },
  plugins: [],
}
