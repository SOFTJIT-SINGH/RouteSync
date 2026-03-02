/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        'rs-green': '#30AF5B',   // Primary Green
        'rs-bg': '#F0F9F0',      // Light Background Tint
        'rs-dark': '#292C27',    // Dark Text
        'rs-gray': '#7B7B7B',    // Muted Gray
      },
      borderRadius: {
        '5xl': '40px',           // The extra-rounded corners from the video
      },
    },
  },
  plugins: [],
};
