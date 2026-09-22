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
        primary: '#134611',
        background: '#E8FCCF',
        surface: '#96E072',
        accent: '#3E8914',
        highlight: '#134611',
        navy: {
          900: '#134611',
          800: '#3E8914',
        },
        teal: {
          600: '#3E8914',
          700: '#3E8914',
          800: '#3E8914',
        },
        ice: {
          100: '#E8FCCF',
          200: '#96E072',
          300: '#3DA35D',
        },
        brand: {
          navy: '#134611',
          teal: '#3E8914',
          tealHover: '#3E8914',
          ice: '#96E072',
          light: '#E8FCCF',
        },
      },
    },
  },
  plugins: [],
};
export default config;
