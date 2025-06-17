/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#2596be",    // Primary Blue
          dark: "#1c3b59",       // Dark Blue
          black: "#0e0e0e",      // Rich Black
          background: "#f5f7fa", // Soft Background
          yellow: "#fcd34d",     // CTA Yellow
        }
      },
      boxShadow: {
        soft: "0 2px 6px rgba(37, 150, 190, 0.08)",
        glow: "0 0 8px rgba(37, 150, 190, 0.2)",
      },
    },
  },
  plugins: [],
};
