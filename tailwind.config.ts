import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        cormorant: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans: ['var(--font-montserrat)', 'system-ui', 'sans-serif'],
        heebo: ['Heebo', 'var(--font-montserrat)', 'sans-serif'],
      },
      colors: {
        gold: {
          DEFAULT: '#c9a84c',
          light:   '#e8d5a3',
          dark:    '#9a7d35',
        },
        cream: '#faf8f5',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
