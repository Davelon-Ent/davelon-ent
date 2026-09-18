import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bronze: {
          50: '#fcf9f5',
          100: '#f5ebe0',
          200: '#ebd4be',
          300: '#deb594',
          400: '#cf936b',
          500: '#b87333',
          600: '#9e6129',
          700: '#804d22',
          800: '#693f20',
          900: '#57351d',
          950: '#331d0e',
        },
      },
    },
  },
  plugins: [],
}

export default config