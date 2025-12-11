/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // <--- ADICIONE ISSO AQUI (IMPORTANTE)
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
