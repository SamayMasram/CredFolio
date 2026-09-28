import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#004b23',
        background: '#F4FCD9',
        surface: '#70e000',
        accent: '#008000',
        highlight: '#9ef01a',
        navy: {
          900: '#004b23',
          800: '#006400',
        },
        teal: {
          600: '#008000',
          700: '#007200',
          800: '#006400',
        },
        ice: {
          100: '#F4FCD9',
          200: '#ccff33',
          300: '#9ef01a',
        },
        brand: {
          navy: '#004b23',
          teal: '#008000',
          tealHover: '#007200',
          ice: '#9ef01a',
          light: '#F4FCD9',
        },
        green: {
          50: '#F4FCD9',
          100: '#E8F8D6',
          200: '#ccff33',
          300: '#9ef01a',
          400: '#70e000',
          500: '#38b000',
          600: '#008000',
          700: '#007200',
          800: '#006400',
          900: '#004b23',
        },
      },
    },
  },
  plugins: [],
};
export default config;
