/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0A1628',
        card: '#1A2A4A',
        'card-border': '#26385C',
        cyan: {
          DEFAULT: '#00D4FF',
        },
        teal: {
          DEFAULT: '#00E5A0',
        },
        hazard: '#FF3B5C',
        muted: '#8CA0C4',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
