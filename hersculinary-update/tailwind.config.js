/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FFF8EA',
        creamDeep: '#F7ECD7',
        brandRed: '#C41E1E',
        brandRedDark: '#7A1010',
        brandGold: '#F0A500',
        brandGoldLight: '#FCC419',
        brandBrown: '#3B2417',
        brandGreen: '#3F7D20'
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)']
      },
      boxShadow: {
        card: '0 6px 20px -6px rgba(59,36,23,0.25)'
      }
    }
  },
  plugins: []
};
