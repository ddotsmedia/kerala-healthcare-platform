/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        malayalam: ['var(--font-malayalam)', 'sans-serif']
      },
      colors: {
        brand: {
          DEFAULT: '#0b7d6e',
          dark: '#075c51'
        }
      }
    }
  },
  plugins: []
};
