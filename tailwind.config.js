/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1565C0',
          light: '#1E88E5',
          soft: '#42A5F5',
          pale: '#90CAF9',
          ghost: '#BBDEFB',
          mist: '#E3F2FD',
        },
        dark: '#1A1A1A',
        surface: '#FFFFFF',
        muted: '#6B7280',
        border: '#E5E7EB',
        bg: '#F9FAFB',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      },
      fontFamily: {
        sans: ['Inter', 'DM Sans', 'sans-serif'],
      },
      boxShadow: {
        standard: '0 2px 12px rgba(21, 101, 192, 0.08)',
      },
      borderRadius: {
        'input': '8px',
        'card': '16px',
      }
    },
  },
  plugins: [],
};

