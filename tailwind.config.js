/* eslint-env node */
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'nike-black': '#111111',
        'nike-gray': '#757575',
      },
      fontFamily: {
        'nike': ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

