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
        navy: {
          900: '#022B3A',
          800: '#063A4E',
        },
        teal: {
          600: '#1F7A8C',
          700: '#175F6D',
          800: '#124853',
        },
        ice: {
          100: '#E1E5F2',
          200: '#BFDBF7',
          300: '#A4CEF4',
        },
        brand: {
          navy: '#022B3A',
          teal: '#1F7A8C',
          tealHover: '#175F6D',
          ice: '#BFDBF7',
          light: '#E1E5F2',
        },
      },
    },
  },
  plugins: [],
};
export default config;

