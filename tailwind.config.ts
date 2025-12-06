// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1e3a8a",   // azul
          light: "#3b82f6",
          dark: "#1d3557"
        },
        accent: {
          DEFAULT: "#facc15",   // amarelo
          soft: "#fef08a"
        }
      }
    }
  },
  plugins: []
};

export default config;
