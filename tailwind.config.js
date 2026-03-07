/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f7f3',
          100: '#d6ede0',
          200: '#aedbbe',
          300: '#7dc49b',
          400: '#52B788',  // Leaf Green (accent)
          500: '#2e9966',
          600: '#1B4332',  // Deep Forest Green (primary) — main brand
          700: '#143626',
          800: '#0e2419',
          900: '#07120d',
        },
        gold: {
          50:  '#fdf9ec',
          100: '#faf0cc',
          400: '#D4A017',  // Ghanaian Gold
          500: '#b8880f',
          600: '#9a700a',
        },
        rating: {
          green:  '#16a34a',
          yellow: '#ca8a04',
          red:    '#dc2626',
          blue:   '#2563eb',
          grey:   '#6b7280',
        },
      },
      backgroundColor: {
        page: '#F8FAF7',   // Cream White background
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
