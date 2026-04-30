/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'clay-pink': '#FFD1E3',
        'clay-blue': '#B7E5FF',
        'clay-purple': '#E5D1FF',
        'clay-mint': '#D1FFEF',
        'clay-gray': '#F2F6F9',
      },
      borderRadius: {
        '4xl': '30px',
        '5xl': '45px',
      },
      boxShadow: {
        'clay-outset': '8px 8px 16px rgba(163, 177, 198, 0.6), -8px -8px 16px rgba(255, 255, 255, 0.8)',
        'clay-inset': 'inset 4px 4px 10px rgba(163, 177, 198, 0.5), inset -4px -4px 10px rgba(255, 255, 255, 0.8)',
        'clay-active': 'inset 8px 8px 16px rgba(163, 177, 198, 0.6), inset -8px -8px 16px rgba(255, 255, 255, 0.8)',
      }
    },
  },
  plugins: [],
}
