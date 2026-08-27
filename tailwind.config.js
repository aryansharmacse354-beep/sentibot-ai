/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#0f172a',
          darkBg: '#090d16',
          card: '#1e293b',
          border: '#334155',
          teal: '#0ea5e9',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
        },
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite ease-in-out',
        'wave-bar': 'waveBar 1.2s infinite ease-in-out',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.05)' },
        },
        waveBar: {
          '0%, 100%': { height: '8px' },
          '50%': { height: '36px' },
        },
      },
    },
  },
  plugins: [],
};
