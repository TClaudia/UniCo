import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'bg-uc-red',
    'bg-uc-red-dark',
    'bg-uc-red-light',
    'bg-uc-green',
    'bg-uc-amber',
    'bg-uc-blue',
    'bg-uc-off-white',
    'bg-uc-gray-100',
    'text-uc-red',
    'text-uc-green',
    'text-uc-amber',
    'text-uc-blue',
    'border-uc-red',
    'border-uc-green',
    'border-uc-amber',
    'border-uc-blue',
    'shadow-card',
    'shadow-chat',
    'shadow-floating',
    'rounded-card',
    'rounded-btn',
    'rounded-pill',
    'animate-bounce',
    'animate-pulse',
    'from-uc-red',
    'to-uc-red-dark',
  ],
  theme: {
    extend: {
      colors: {
        'uc-red': '#E2001A',
        'uc-red-dark': '#B5001A',
        'uc-red-light': '#FF4D61',
        'uc-white': '#FFFFFF',
        'uc-off-white': '#F7F7F7',
        'uc-gray-100': '#F0F0F0',
        'uc-gray-400': '#ABABAB',
        'uc-gray-700': '#4A4A4A',
        'uc-black': '#1A1A1A',
        'uc-green': '#00A862',
        'uc-amber': '#F5A623',
        'uc-blue': '#0066CC',
      },
      fontFamily: {
        display: ['DM Sans', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        btn: '12px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 2px 16px rgba(0,0,0,0.08)',
        chat: '0 2px 8px rgba(0,0,0,0.06)',
        floating: '0 8px 32px rgba(0,0,0,0.12)',
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [],
}
export default config
