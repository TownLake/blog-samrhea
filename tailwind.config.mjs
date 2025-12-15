/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Consolas', 'monospace'],
      },
      colors: {
        midnight: {
          950: '#0a0a0a',
          900: '#111111',
          800: '#1a1a1a',
          700: '#262626',
          600: '#404040',
          500: '#525252',
          400: '#737373',
          300: '#a3a3a3',
          200: '#d4d4d4',
          100: '#ededed',
        },
        accent: {
          blue: '#3291FF',
          'blue-muted': '#5A7D9A',
          cyan: '#50E3C2',
          orange: '#F38020',
          red: '#C41E3A',
        }
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.midnight.300'),
            '--tw-prose-headings': theme('colors.midnight.100'),
            '--tw-prose-links': theme('colors.accent.blue'),
            '--tw-prose-bold': theme('colors.midnight.100'),
            '--tw-prose-counters': theme('colors.midnight.500'),
            '--tw-prose-bullets': theme('colors.midnight.600'),
            '--tw-prose-hr': theme('colors.midnight.800'),
            '--tw-prose-quotes': theme('colors.midnight.300'),
            '--tw-prose-quote-borders': theme('colors.midnight.700'),
            '--tw-prose-captions': theme('colors.midnight.500'),
            '--tw-prose-code': theme('colors.midnight.200'),
            '--tw-prose-pre-code': theme('colors.midnight.200'),
            '--tw-prose-pre-bg': theme('colors.midnight.900'),
            '--tw-prose-th-borders': theme('colors.midnight.700'),
            '--tw-prose-td-borders': theme('colors.midnight.800'),
            'code::before': { content: '""' },
            'code::after': { content: '""' },
            code: {
              color: theme('colors.pink.400'),
              backgroundColor: theme('colors.midnight.900'),
              borderRadius: '0.25rem',
              padding: '0.125rem 0.375rem',
              fontWeight: '400',
              fontSize: '0.875em',
            },
            a: {
              textDecoration: 'none',
              '&:hover': {
                color: theme('colors.white'),
              },
            },
            h1: { fontWeight: '600', letterSpacing: '-0.025em' },
            h2: { fontWeight: '600', letterSpacing: '-0.025em' },
            h3: { fontWeight: '600' },
            p: { lineHeight: '1.75' },
            li: { marginTop: '0.25em', marginBottom: '0.25em' },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
};