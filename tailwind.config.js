/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        royal: {
          50: '#F2F6FE',
          100: '#E3EBFD',
          200: '#C9D8FA',
          300: '#A6BEF5',
          400: '#7C9CEF',
          500: '#5278E6',
          600: '#4169E1',
          700: '#2F52C4',
          800: '#26439E',
          900: '#1C3278',
          950: '#111F4D',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        royal: '0 20px 50px -20px rgba(65, 105, 225, 0.45)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        'pop-in': 'pop-in 0.3s ease-out both',
        float: 'float 8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
