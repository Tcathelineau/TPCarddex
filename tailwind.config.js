/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0d0d0f',
          secondary: '#141416',
          tertiary: '#1c1c1f',
          card: '#1e1e22',
          hover: '#252529',
        },
        border: {
          DEFAULT: '#2a2a2f',
          light: '#35353c',
        },
        accent: {
          DEFAULT: '#5865f2',
          hover: '#6b78f5',
          dim: 'rgba(88,101,242,0.15)',
        },
        text: {
          primary: '#e8e8ec',
          secondary: '#9898a8',
          muted: '#5a5a6a',
        },
        pokemon: {
          red: '#e74c3c',
          yellow: '#f1c40f',
          green: '#27ae60',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)',
        glow: '0 0 20px rgba(88,101,242,0.3)',
        'accent-sm': '0 0 8px rgba(88,101,242,0.4)',
      },
    },
  },
  plugins: [],
}
