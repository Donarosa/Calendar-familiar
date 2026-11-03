/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        family: {
          blue: '#3B82F6',
          pink: '#EC4899',
          green: '#10B981',
          amber: '#F59E0B',
          purple: '#8B5CF6',
        }
      }
    },
  },
  plugins: [],
}
