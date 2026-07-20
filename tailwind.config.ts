import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        autora: {
          burgundy: "#7A243A",
          burgundyDark: "#5C192B",
          sage: "#6E8B74",
          cream: "#F7F1EB",
          sand: "#EADFD3",
          ink: "#2D241F"
        }
      },
      boxShadow: {
        panel: "0 14px 32px rgba(45, 36, 31, 0.08)"
      },
      borderRadius: {
        xl2: "1.25rem"
      }
    }
  },
  plugins: []
};

export default config;
