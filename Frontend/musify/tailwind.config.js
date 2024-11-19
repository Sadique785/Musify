/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'c-white': '#FFFFFF',
        'c-red-light': '#9C5E5E',
        'c-red': '#BF7474',
        'c-grey': '#7F7F7F',
        'c-black': '#130808',
        'c-dark-red': '#380E0D',
        'c-dark-red2': '#440C0C',
      },
      fontFamily: {
        mulish: ['Mulish', 'sans-serif'],
      },
      animation: {
        gradient: 'gradient 15s ease infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-hidden': {
          '-ms-overflow-style': 'none', /* IE and Edge */
          'scrollbar-width': 'none', /* Firefox */
        },
        '.scrollbar-hidden::-webkit-scrollbar': {
          display: 'none', /* Chrome, Safari */
        },
      });
    },
  ],
}
