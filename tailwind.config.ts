import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        heading: ['Sora', 'Manrope', 'system-ui', 'sans-serif'],
      },
      colors: {
        'shop-primary': 'var(--shop-primary)',
        'shop-bg': 'var(--shop-bg)',
        'shop-surface': 'var(--shop-surface)',
        'shop-text': 'var(--shop-text)',
        'shop-muted': 'var(--shop-muted)',
      },
      boxShadow: {
        float: '0 18px 44px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
