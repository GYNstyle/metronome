/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        ink: '#111827',
        mist: '#e5e7eb',
        glow: '#c7d2fe',
      },
      boxShadow: {
        card: '0 15px 35px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}
