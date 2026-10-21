/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        festive: {
          gold: "#FFD700",
          amber: "#FFBF00",
          saffron: "#FF9933",
          deepOrange: "#FF5722",
          maroon: "#800020",
          crimson: "#DC143C",
          nightBlue: "#0B1021",
          deepNavy: "#050814",
        }
      },
      animation: {
        'diya-glow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'sparkle': 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}
