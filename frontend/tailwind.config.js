/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#003049',
        secondary: '#D62828',
        accent1: '#F77F00',
        accent2: '#FCBF49',
        bg: '#f8f9fa'
      }
    },
  },
  plugins: [],
}

