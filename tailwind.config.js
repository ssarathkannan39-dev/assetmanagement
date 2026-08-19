/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0d1210',
        panel: '#141a17',
        panel2: '#1b2320',
        line: '#2a332e',
        accent: '#ff6a2b',
        accent2: '#ffb020',
        mint: '#5fead4',
        muted: '#8a9690',
      },
      fontFamily: {
        display: ['"Space Mono"', 'monospace'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        hard: '4px 4px 0 0 rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [],
};
