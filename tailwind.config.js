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
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          800: '#166534',
          900: '#0B3D2E', // Deep Forest/Poultry Green
          950: '#05231a',
        },
        gold: {
          400: '#FACC15',
          500: '#EAB308',
          600: '#D97706',
          DEFAULT: '#D4AF37',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Playfair Display', 'serif'],
      }
    },
  },
  plugins: [],
}
