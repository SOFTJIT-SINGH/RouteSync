/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,ts,tsx}', 
    './components/**/*.{js,ts,tsx}',
    './screens/**/*.{js,ts,tsx}',
    './navigation/**/*.{js,ts,tsx}',
  ],
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
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '20px',
      },
    },
  },
  plugins: [],
};