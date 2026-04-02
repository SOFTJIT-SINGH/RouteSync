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
        // ─── Hilink Design System ───
        'hi-green': '#30AF5B',
        'hi-dark': '#292C27',
        'hi-bg': '#FAFAFA',
        'hi-orange': '#FF814C',
        'hi-blue': '#021639',
        'hi-yellow': '#FEC601',
        // Gray Scale
        'hi-gray-10': '#EEEEEE',
        'hi-gray-20': '#A2A2A2',
        'hi-gray-30': '#7B7B7B',
        'hi-gray-50': '#585858',
        'hi-gray-90': '#141414',
        // Legacy aliases (used across codebase)
        'rs-green': '#30AF5B',
        'rs-bg': '#FAFAFA',
        'rs-dark': '#292C27',
        'rs-gray': '#7B7B7B',
      },
      borderRadius: {
        '4xl': '32px',
        '5xl': '40px',
      },
    },
  },
  plugins: [],
};