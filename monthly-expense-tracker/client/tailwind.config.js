/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
      },
      animation: {
        'slide-in-right': 'slideInRight 0.3s ease-out forwards',
        'slide-out-right': 'slideOutRight 0.3s ease-in forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'fade-out': 'fadeOut 0.3s ease-in forwards',
      },
      keyframes: {
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
        slideOutRight: {
          '0%': { transform: 'translateX(0)', opacity: 1 },
          '100%': { transform: 'translateX(100%)', opacity: 0 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        fadeOut: {
          '0%': { opacity: 1 },
          '100%': { opacity: 0 },
        },
      },
    },
  },
  plugins: [],
}