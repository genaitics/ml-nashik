/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#fbf9f5',
          surface: '#ffffff',
          dim: '#dbdad6',
          container: '#efeeea',
          low: '#f5f3ef',
          high: '#eae8e4',
          highest: '#e4e2de',
        },
        ink: {
          DEFAULT: '#181f21',
          light: '#2d3436',
          muted: '#434749',
          pencil: '#747879',
        },
        highlighter: {
          DEFAULT: '#f2e580',
          hover: '#e8da64',
          soft: '#fef08a',
        },
        sage: {
          DEFAULT: '#d1fae5',
          dark: '#14392b',
          deep: '#002317',
          border: '#a8cfbc',
        },
        sticky: {
          yellow: '#fef9c3',
          border: '#fde047',
        }
      },
      fontFamily: {
        serif: ['Literata', 'Georgia', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'paper-sm': '0 1px 3px rgba(24, 31, 33, 0.05)',
        'paper-md': '0 4px 12px rgba(24, 31, 33, 0.08)',
        'paper-lg': '0 10px 25px rgba(24, 31, 33, 0.1)',
        'sticky': '2px 4px 12px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}
