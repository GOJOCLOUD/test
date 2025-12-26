/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'china-red': '#C8102E', // 人民日报红
        'china-red-dark': '#A00C24',
        'news-bg': '#F9F9F7',   // 极淡的新闻纸底色（米白）
        'ink': '#1A1A1A',       // 墨黑
        'sub-text': '#555555',
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', 'sans-serif'], // 黑体 - 用于标题
        serif: ['"Noto Serif SC"', 'serif'],     // 宋体 - 用于正文
      },
      backgroundImage: {
        'header-pattern': "repeating-linear-gradient(45deg, #C8102E 0, #C8102E 2px, transparent 0, transparent 50%)"
      },
      boxShadow: {
        'paper': '0 2px 10px rgba(0,0,0,0.05)',
      }
    },
  },
  plugins: [],
}