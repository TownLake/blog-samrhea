/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'], 
      },
      colors: {
        midnight: {
          950: '#02040A', // Deep background
          900: '#0B0E14', // Card background
          800: '#151921', // Borders
          100: '#E0E6ED', // Primary Text
          200: '#C1C7D0', // Body text (Slightly dimmer than primary)
          300: '#A3AAB5', // Muted text
          400: '#949BA5', // Secondary Text
          500: '#6E7681', // Tertiary/Meta
        },
        accent: {
          blue: '#3291FF', // Cloudflare-ish blue
          'blue-muted': '#5A7D9A', // Ginor & Becker blue/grey
          cyan: '#50E3C2',
          orange: '#F38020', // Cloudflare orange
          red: '#C41E3A', // Softer DevFactory red
        }
      },
      // Typography customization to fix backticks and style code
      typography: (theme) => ({
        DEFAULT: {
          css: {
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            code: {
              color: theme('colors.pink.400'),
              backgroundColor: theme('colors.midnight.900'),
              borderRadius: '0.25rem',
              padding: '0.125rem 0.25rem',
              fontWeight: '400',
            },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
};