import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['"Barlow Condensed"', '"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        // Charcoal-leaning dark palette
        surface: {
          DEFAULT: '#0d0d0e',
          raised: '#161618',
          overlay: '#1f1f22',
        },
        // Electric lime — brand primary
        primary: {
          DEFAULT: '#c4ff00',
          hover: '#d6ff3d',
          muted: '#a3d600',
          foreground: '#0a0a0a',
        },
        // Legacy orange — still used in some places
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
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 1.6s ease-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
