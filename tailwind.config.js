/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        toss: {
          blue: '#3182F6',
          'blue-light': '#E8F3FF',
          'blue-dark': '#1B64DA',
          text: '#191F28',
          'text-secondary': '#4E5968',
          'text-muted': '#8B95A1',
          bg: '#FFFFFF',
          'bg-gray': '#F2F4F6',
          'bg-gray-subtle': '#F9FAFB',
          border: '#E5E8EB',
          red: '#F04452',
          'red-light': '#FEECEE',
        },
      },
      fontFamily: {
        sans: [
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Roboto',
          'Helvetica Neue',
          'Segoe UI',
          'Apple SD Gothic Neo',
          'Malgun Gothic',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
