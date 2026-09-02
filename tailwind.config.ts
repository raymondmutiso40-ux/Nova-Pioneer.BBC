import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0b1e3d",
          light: "#12294f",
          dark: "#081530",
        },
        gold: {
          DEFAULT: "#d4a83f",
          light: "#e6c467",
          dark: "#b8902f",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
