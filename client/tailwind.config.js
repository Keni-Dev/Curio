import forms from '@tailwindcss/forms'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary - Teal (from DESIGN_SYSTEM.md)
        primary: {
          DEFAULT: '#0F766E',
          light: '#13ECDA',
          dark: '#115E59',
          hover: '#0D5C56',
        },
        // Accent - Coral (from DESIGN_SYSTEM.md)
        accent: {
          DEFAULT: '#FF7F50',
          hover: '#ff6b3d',
        },
        // Semantic Colors (from DESIGN_SYSTEM.md)
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#F43F5E',
        info: '#3B82F6',
        // Background (from DESIGN_SYSTEM.md)
        background: {
          light: '#F6F8F8',
          dark: '#112120',
        },
        // Surface (from DESIGN_SYSTEM.md)
        surface: {
          light: '#FFFFFF',
          dark: '#1A2C2A',
          elevated: '#203c3a',
        },
        // Text (from DESIGN_SYSTEM.md)
        text: {
          primary: '#0E1B1A',
          secondary: '#64748B',
          muted: '#4c9a93',
          inverse: '#FFFFFF',
        },
        // Stock Status Colors (from DESIGN_SYSTEM.md)
        stock: {
          available: '#10B981',
          low: '#F59E0B',
          out: '#F43F5E',
        },
        // Map Markers (from DESIGN_SYSTEM.md)
        marker: {
          emerald: '#0F766E',
          amber: '#F59E0B',
          rose: '#F43F5E',
        },
      },
      fontFamily: {
        // From DESIGN_SYSTEM.md
        display: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Noto Sans', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
        // Aliases for easier use
        sans: ['Noto Sans', 'sans-serif'],
      },
      fontSize: {
        // From DESIGN_SYSTEM.md - matches type scale
        display: ['3rem', { lineHeight: '1.1', fontWeight: '800' }],
        h1: ['2rem', { lineHeight: '1.2', fontWeight: '700' }],
        h2: ['1.5rem', { lineHeight: '1.25', fontWeight: '700' }],
        h3: ['1.25rem', { lineHeight: '1.3', fontWeight: '700' }],
        h4: ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }],
        body: ['1rem', { lineHeight: '1.5', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        caption: ['0.75rem', { lineHeight: '1.4', fontWeight: '500' }],
      },
      spacing: {
        // Safe area for mobile (from DESIGN_SYSTEM.md)
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      borderRadius: {
        // From DESIGN_SYSTEM.md
        sm: '4px',
        DEFAULT: '8px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
        full: '9999px',
      },
      boxShadow: {
        // From DESIGN_SYSTEM.md
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        card: '0 2px 10px rgba(0, 0, 0, 0.03)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glow-primary': '0 0 15px rgba(19, 236, 218, 0.5)',
        'glow-accent': '0 0 15px rgba(251, 191, 36, 0.5)',
      },
      animation: {
        // From DESIGN_SYSTEM.md
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'float-slow': 'float 6s ease-in-out infinite',
        'float-medium': 'float 4s ease-in-out infinite',
        shimmer: 'shimmer 2s infinite',
      },
      keyframes: {
        // From DESIGN_SYSTEM.md
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(200%) skewX(-12deg)' },
        },
      },
    },
  },
  plugins: [forms],
}
