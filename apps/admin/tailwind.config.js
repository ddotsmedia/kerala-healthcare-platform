/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Teal primary (task spec #0d9488). `brand` kept as the alias used across the app.
        brand: { DEFAULT: '#0d9488', dark: '#0f766e', light: '#5eead4' },
        teal: { DEFAULT: '#0d9488', 600: '#0d9488', 700: '#0f766e' },
        // Dark slate sidebar (#0f172a) + surfaces.
        sidebar: { DEFAULT: '#0f172a', hover: '#1e293b', active: '#134e4a', border: '#1e293b' },
        // Theme-aware surfaces via CSS variables (see globals.css).
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--surface-2) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        'ink-soft': 'rgb(var(--ink-soft) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)'
      },
      transitionProperty: { width: 'width', spacing: 'margin, padding' }
    }
  },
  plugins: []
};
