/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          900: '#0C231E',
          800: '#102F28',
          700: '#173F35',
          600: '#1F5447',
          500: '#2A6F5E',
        },
        sage: {
          100: '#EAF0E9',
          200: '#DCE8D9',
          300: '#BFD4BD',
          400: '#A4C0A2',
          500: '#8FAE91',
          600: '#759477',
        },
        cream: {
          50: '#FCFBF7',
          100: '#F5F1E7',
          200: '#EAE3D2',
          300: '#DED4BD',
        },
        moss: {
          DEFAULT: '#777C76',
          dark: '#202B25',
          light: '#9DA29C',
        },
        nucleotide: {
          A: '#2A6F5E', // Adenine (Deep Sage / Green)
          C: '#428574', // Cytosine (Teal Green)
          G: '#A4C0A2', // Guanine (Soft Sage)
          T: '#D4A373', // Thymine (Warm Amber Sand)
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Manrope', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
