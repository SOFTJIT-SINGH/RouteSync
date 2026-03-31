/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,ts,tsx}', './components/**/*.{js,ts,tsx}', './screens/**/*.{js,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        'rs-green': '#30AF5B',
        'rs-bg': '#F0F9F0',
        'rs-dark': '#292C27',
        'rs-gray': '#7B7B7B',
      },
      borderRadius: {
        '5xl': '40px',
      },
      // Add blur intensity variants if needed
      backdropBlur: {
        xs: 2,
        sm: 4,
        md: 8,
        lg: 12,
        xl: 20,
      },
    },
  },
  plugins: [],
};