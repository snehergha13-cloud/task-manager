/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        accent: '#0a84ff',
      },
      borderRadius: {
        glass: '28px',
      },
    },
  },
  plugins: [],
};
