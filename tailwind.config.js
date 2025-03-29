// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            fontSize: '1.0625rem',
            lineHeight: '1.75',
            letterSpacing: '-0.01em',
            fontWeight: '400',
            maxWidth: 'none',

            // Paragraph styles
            p: {
              marginBottom: '1.6875rem',
              letterSpacing: '-0.01em',
              fontSize: '1.0625rem',
              lineHeight: '1.75',
              textWrap: 'pretty',
              paddingLeft: '0',
              paddingRight: '0',
            },
            'p:last-child': {
              marginBottom: '0',
            },

            // Headings
            h1: {
              fontSize: '2rem',
              fontWeight: '700',
              letterSpacing: '-0.025em',
            },
            h2: {
              fontSize: '1.5rem',
              fontWeight: '600',
              letterSpacing: '-0.015em',
            },
            h3: {
              fontSize: '1.25rem',
              fontWeight: '600',
              letterSpacing: '-0.015em',
            },

            // Links
            a: {
              color: 'var(--tw-prose-body)',
              '@apply custom-link': {},
              '&:hover': {
                color: 'var(--tw-prose-links)',
              },
            },

            // Lists
            ul: {
              marginTop: '1.25em',
              marginBottom: '1.25em',
            },
            li: {
              marginTop: '0.5em',
              marginBottom: '0.5em',
            },

            // Inline code
            code: {
              fontWeight: '400',
              '&::before': {
                content: '"" !important', // Overwrite default backticks
              },
              '&::after': {
                content: '"" !important',
              },
            },

            // Code blocks
            pre: {
              backgroundColor: 'var(--tw-prose-pre-bg)',
              borderRadius: '0.375rem',
            },

            // Optional: also remove backticks for code blocks
            'pre code': {
              '&::before': {
                content: '"" !important',
              },
              '&::after': {
                content: '"" !important',
              },
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
