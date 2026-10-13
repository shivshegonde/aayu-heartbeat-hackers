/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        vitals: {
          base: 'var(--surface-base)',
          surface1: 'var(--surface-1)',
          surface2: 'var(--surface-2)',
          surface3: 'var(--surface-3)',
          border: 'var(--border-subtle)',
          highlight: 'var(--border-highlight)',
          ink: 'var(--text-primary)',
          muted: 'var(--text-secondary)',
          faint: 'var(--text-tertiary)',
        },
        pulse: {
          mint: 'var(--pulse-mint)',
          glow: 'var(--pulse-glow)',
          dark: 'var(--pulse-dark)',
        },
        signal: {
          red: 'var(--signal-red)',
          redGlow: 'var(--signal-red-glow)',
          amber: 'var(--signal-amber)',
          amberGlow: 'var(--signal-amber-glow)',
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Inter Tight"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        hindi: ['"Noto Sans Devanagari"', '"Inter Tight"', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
        input: '10px',
        chip: '999px',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ecg-draw': 'ecgDraw 2s linear infinite',
        'scan-beam': 'scanBeam 2s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.9' },
        },
        ecgDraw: {
          '0%': { strokeDashoffset: '400' },
          '100%': { strokeDashoffset: '0' },
        },
        scanBeam: {
          '0%': { transform: 'translateY(0%)' },
          '50%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0%)' },
        }
      }
    },
  },
  plugins: [],
}
