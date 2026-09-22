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
        primary: '#1B4332',
        background: '#D8F3DC',
        surface: '#52B788',
        accent: '#40916C',
        highlight: '#74C69D',
        navy: {
          900: '#1B4332',
          800: '#52B788',
        },
        teal: {
          600: '#40916C',
          700: '#40916C',
          800: '#52B788',
        },
        ice: {
          100: '#D8F3DC',
          200: '#74C69D',
          300: '#52B788',
        },
        brand: {
          navy: '#1B4332',
          teal: '#40916C',
          tealHover: '#40916C',
          ice: '#74C69D',
          light: '#D8F3DC',
        },
        green: {
          50: '#D8F3DC',
          100: '#B7E4C7',
          200: '#95D5B2',
          300: '#74C69D',
          400: '#52B788',
          500: '#40916C',
          600: '#2D6A4F',
          700: '#1B4332',
          800: '#081C15',
        },
      },
    },
  },
  plugins: [],
};
export default config;
