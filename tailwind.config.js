/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#153F35',
          dark: '#102D27',
          light: '#1e594b',
          hover: '#0c231e',
        },
        sage: {
          DEFAULT: '#E6EEE7',
          light: '#f1f5f2',
          dark: '#ccdcd0',
        },
        offwhite: '#F7F7F2',
        charcoal: {
          DEFAULT: '#202724',
          muted: '#6D7771',
          light: '#424e47',
        },
        civic: {
          border: '#E1E5DF',
          amber: '#C98A25',
          error: '#B94343',
          info: '#3D6F9D',
          success: '#2E7D32',
        }
      },
      fontFamily: {
        display: ['Manrope', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(21, 63, 53, 0.05), 0 1px 2px -1px rgba(21, 63, 53, 0.03)',
        card: '0 2px 8px -2px rgba(21, 63, 53, 0.06), 0 1px 3px 0 rgba(21, 63, 53, 0.03)',
        elevated: '0 10px 25px -5px rgba(21, 63, 53, 0.08), 0 8px 10px -6px rgba(21, 63, 53, 0.04)',
        hover: '0 14px 28px -4px rgba(21, 63, 53, 0.12), 0 10px 12px -6px rgba(21, 63, 53, 0.06)',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
}
