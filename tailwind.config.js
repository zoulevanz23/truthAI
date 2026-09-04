/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        },
        blue: {
          600: '#2563EB',
          700: '#1D4ED8',
        },
        red: {
          500: '#EF4444',
          600: '#DC2626',
        },
        green: {
          600: '#059669',
        },
        amber: {
          500: '#F59E0B',
          600: '#D97706',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      spacing: {
        '4': '1rem',
        '6': '1.5rem',
        '8': '2rem',
        '12': '3rem',
        '16': '4rem',
        '24': '6rem',
        '32': '8rem',
        '48': '12rem',
        '64': '16rem',
        '72': '18rem',
        '88': '22rem',
        '96': '24rem',
      },
      borderRadius: {
        '4': '4px',
        '6': '6px',
        '8': '8px',
        '12': '12px',
        '16': '16px',
      },
    },
  },
  plugins: [],
}

