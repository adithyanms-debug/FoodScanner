/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8F9FA',
        accent: '#6C63FF',
        success: '#4CAF50',
        warning: '#FF9800',
        danger: '#E53935',
        gray: {
          100: '#F8F9FA',
          200: '#EBEBEB',
          300: '#BEBEBE',
          400: '#9E9E9E',
          500: '#757575',
          600: '#616161',
          700: '#424242',
          800: '#212121',
          900: '#111111'
        }
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'clay-outer': '8px 8px 20px #BEBEBE, -8px -8px 20px #EBEBEB',
        'clay-inner': 'inset 8px 8px 20px #BEBEBE, inset -8px -8px 20px #EBEBEB',
        'clay-card': '8px 8px 20px #BEBEBE, -8px -8px 20px #EBEBEB',
        'clay-button': '5px 5px 10px #BEBEBE, -5px -5px 10px #EBEBEB',
        'clay-button-active': 'inset 5px 5px 10px #BEBEBE, inset -5px -5px 10px #EBEBEB',
      },
      borderRadius: {
        'clay-card': '24px',
        'clay-button': '16px',
        'clay-input': '12px',
      },
      animation: {
        'laser-scan': 'scan 2s infinite linear',
        'pulse-scan': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(0%)' },
          '50%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0%)' },
        }
      }
    },
  },
  plugins: [],
}
