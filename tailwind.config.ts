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
        primary: '#22577A',
        background: '#C7F9CC',
        surface: '#80ED99',
        accent: '#38A3A5',
        highlight: '#22577A',
        navy: {
          900: '#22577A',
          800: '#2D6B8A',
        },
        teal: {
          600: '#38A3A5',
          700: '#2E8B8D',
          800: '#257375',
        },
        ice: {
          100: '#C7F9CC',
          200: '#80ED99',
          300: '#57CC99',
        },
        brand: {
          navy: '#22577A',
          teal: '#38A3A5',
          tealHover: '#2E8B8D',
          ice: '#80ED99',
          light: '#C7F9CC',
        },
      },
    },
  },
  plugins: [],
};
export default config;
