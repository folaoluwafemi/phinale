/** @type {import('tailwindcss').Config} */
export default {
  content: ['./newtab.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        body: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Spline Sans"', 'Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        canvas: '#fffaf0',
        surface: {
          soft: '#faf5e8',
          card: '#f5f0e0',
          strong: '#ebe6d6',
          dark: '#0a1a1a',
        },
        ink: '#0a0a0a',
        body: '#3a3a3a',
        muted: '#6a6a6a',
        hairline: '#e5e5e5',
        primary: '#0a0a0a',
        accent: '#ff4d8b',
        teal: '#1a3a3a',
        lavender: '#b8a4ed',
        peach: '#ffb084',
        ochre: '#e8b94a',
        mint: '#a4d4c5',
        coral: '#ff7759',
        coheregreen: '#003c33',
        actionblue: '#1863dc',
      },
      borderRadius: {
        clay: '20px',
        'clay-sm': '12px',
      },
      boxShadow: {
        clay: '0 2px 0 rgba(10,10,10,0.9), 0 12px 24px -12px rgba(10,10,10,0.25)',
        'clay-soft': '0 1px 0 rgba(10,10,10,0.08), 0 8px 20px -12px rgba(10,10,10,0.25)',
        'clay-inset': 'inset 0 2px 6px rgba(255,255,255,0.7), inset 0 -2px 4px rgba(10,10,10,0.06)',
      },
    },
  },
  plugins: [],
};
