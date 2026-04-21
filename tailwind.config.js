/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0d1117',
        surface: '#161b22',
        surface2: '#1c2128',
        surface3: '#21262d',
        border: '#30363d',
        border2: '#444c56',
        muted: '#7d8590',
        green: '#3fb950',
        blue: '#58a6ff',
        orange: '#d29922',
        red: '#f85149',
        purple: '#bc8cff',
      },
      fontFamily: {
        mono: ['Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
