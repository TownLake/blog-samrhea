/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'], // Use a clean font like Inter or Geist
      },
      colors: {
        midnight: {
          950: '#02040A', // Deep background
          900: '#0B0E14', // Card background
          800: '#151921', // Borders
          100: '#E0E6ED', // Primary Text
          400: '#949BA5', // Secondary Text
        },
        accent: {
          blue: '#3291FF', // Cloudflare-ish blue
          cyan: '#50E3C2',
        }
      }
    },
  },
  plugins: [require('@tailwindcss/typography')],
};