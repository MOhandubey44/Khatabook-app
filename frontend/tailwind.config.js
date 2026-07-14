/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#4640DE",
          dark: "#3730a3",
        },
        credit: "#16a34a",
        debit: "#dc2626",
      },
    },
  },
  plugins: [],
};
