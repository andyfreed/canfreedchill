/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          black: '#0B0B1E',
          darker: '#151528',
          dark: '#1E1E3F',
          primary: '#00FFAA',
          secondary: '#FF00FF',
          accent: '#00AAFF',
          text: '#E0E0FF',
        },
      },
      boxShadow: {
        neon: '0 0 5px theme(colors.cyber.primary), 0 0 20px theme(colors.cyber.primary)',
        'neon-strong': '0 0 10px theme(colors.cyber.primary), 0 0 40px theme(colors.cyber.primary)',
      },
    },
  },
  plugins: [],
};