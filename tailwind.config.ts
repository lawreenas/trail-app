import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#1c1c1e',
          raised: '#2c2c2e',
          overlay: '#3a3a3c',
        },
        accent: {
          DEFAULT: '#ff6b35',
          muted: '#cc5229',
        },
        difficulty: {
          easy: '#22c55e',
          moderate: '#f59e0b',
          hard: '#f97316',
          expert: '#ef4444',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
