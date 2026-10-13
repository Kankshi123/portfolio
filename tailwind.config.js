/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: { paper: '#FFFFFF', linen: '#F7F6F4', ink: '#1A1A1A', body: '#3A3A3A', muted: '#8A8A8A', line: '#E6E4E1' },
      fontFamily: { display: ['Bodoni Moda', 'serif'], body: ['Cormorant Garamond', 'serif'], sans: ['Jost', 'sans-serif'] },
      spacing: { 'section': 'clamp(5rem, 10vw, 11.25rem)' },
      transitionTimingFunction: { editorial: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    },
  },
  plugins: [],
}
