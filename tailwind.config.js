/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          100: "#EEF2F5",
          200: "#DCE3E8",
          300: "#B9C3CC",
          600: "#4B5B6B",
          800: "#0F2A3F",
          900: "#0B1F2E",
        },
        cream: { 50: "#FFFCF6", 100: "#FBF6EA", 200: "#F3EAD3" },
        gold: { 400: "#F2B705", 500: "#D9A200", 700: "#7A5200" },
        teal: { 100: "#D8EFE9", 600: "#0E6B5C", 700: "#0A5347" },
        sky: { 500: "#0095D9", 700: "#0B6FA0" },
        danger: { 100: "#FDE7E4", 600: "#B42318" },
        warn: { 100: "#FEF3C7", 800: "#7A4B00" },
        success: { 600: "#0E6B5C" },
      },
      fontFamily: {
        sans: ["Inter", '"Noto Sans Urdu"', "system-ui", "sans-serif"],
        display: ["Fraunces", "Georgia", "serif"],
      },
      fontSize: {
        xs: ["0.75rem", "1rem"],
        sm: ["0.875rem", "1.25rem"],
        base: ["1rem", "1.5rem"],
        lg: ["1.125rem", "1.75rem"],
        xl: ["1.25rem", "1.75rem"],
        "2xl": ["1.5rem", "2rem"],
        "3xl": ["2rem", "2.5rem"],
        "4xl": ["2.5rem", "3rem"],
        "5xl": ["3.5rem", "3.75rem"],
      },
      boxShadow: {
        "sh-1": "0 1px 2px rgba(11,31,46,.06)",
        "sh-2": "0 4px 14px rgba(11,31,46,.08)",
        "sh-3": "0 12px 32px rgba(11,31,46,.14)",
      },
      maxWidth: { page: "1280px" },
      transitionDuration: { 150: "150ms", 250: "250ms", 300: "300ms" },
      keyframes: {
        shimmer: { "100%": { transform: "translateX(100%)" } },
        "sheet-up": { from: { transform: "translateY(100%)" }, to: { transform: "translateY(0)" } },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
      },
      animation: {
        "sheet-up": "sheet-up 250ms ease-out",
        "fade-in": "fade-in 150ms ease-out",
      },
    },
  },
  plugins: [],
};
