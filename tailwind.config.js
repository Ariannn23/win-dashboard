/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 18px 45px rgba(80, 39, 12, 0.08)',
        premium: '0 24px 70px rgba(201, 74, 0, 0.14)',
      },
      colors: {
        win: {
          dark: '#C94A00',
          mid: '#E85D04',
          accent: '#FF7A1A',
          soft: '#FFE2CC',
          bg: '#FAF7F3',
          surface: '#FFFFFF',
          text: '#1F1F1F',
          muted: '#6B625C',
          line: '#EDE4DC',
          success: '#2FA66A',
          warning: '#D98A00',
          error: '#D64545',
          info: '#2F80ED',
          ink: '#1F1F1F',
          cyan: '#FF7A1A',
        },
      },
    },
  },
  plugins: [],
};
