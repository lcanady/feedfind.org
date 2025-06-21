/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // FeedFind brand colors with accessibility in mind
        'trust-blue': '#2563EB',
        'success-green': '#059669',
        'warning-amber': '#D97706', 
        'alert-red': '#DC2626',
        // Neutral palette
        'text-primary': '#111827',
        'text-secondary': '#6B7280',
        'background': '#FFFFFF',
        'surface': '#F9FAFB',
        'border': '#E5E7EB',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Arial',
          'sans-serif',
        ],
      },
      fontSize: {
        // Ensure minimum 16px base for mobile accessibility
        base: ['16px', { lineHeight: '1.5' }],
      },
      spacing: {
        // Touch target minimum 44px for accessibility
        'touch': '44px',
      },
      animation: {
        // Respect prefers-reduced-motion
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
  ],
} 