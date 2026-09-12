/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1c1917",
        paper: "#f4efe6",
        cream: "#fbf7f0",
        terracotta: "#c45c26",
        forest: "#2f5d50",
        moss: "#4a7c6c",
      },
      fontFamily: {
        display: ['"Fraunces"', "Georgia", "serif"],
        sans: ['"Source Sans 3"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 18px 40px -24px rgba(28, 25, 23, 0.35)",
      },
    },
  },
  plugins: [],
};
