import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Ardoise — matériau de couverture, sert de base neutre
        ardoise: {
          50: "#F3F5F7",
          100: "#E4E8EC",
          200: "#C7CFD8",
          300: "#A0AEBC",
          400: "#71879C",
          500: "#4A5A6A",
          600: "#374553",
          700: "#293440",
          800: "#1C242D",
          900: "#141A21",
          950: "#0D1116",
        },
        // Tuile — accent chaud, couleur des tuiles terre cuite
        tuile: {
          50: "#FDF3EE",
          100: "#FAE1D4",
          200: "#F3BDA0",
          300: "#E8946E",
          400: "#D3703F",
          500: "#C1502E",
          600: "#A33F23",
          700: "#82331E",
          800: "#652A1B",
          900: "#4F2317",
        },
        success: { 50: "#EBFAF2", 500: "#2F9E63", 600: "#25824F" },
        warning: { 50: "#FDF5E9", 500: "#E8A23D", 600: "#C6862A" },
        danger: { 50: "#FCECEC", 500: "#D64545", 600: "#B23434" },
        info: { 50: "#EBF4FA", 500: "#3E7CB1", 600: "#2F6595" },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(13,17,22,0.04), 0 8px 24px -8px rgba(13,17,22,0.10)",
        "card-hover": "0 4px 12px rgba(13,17,22,0.06), 0 16px 32px -12px rgba(13,17,22,0.16)",
        premium: "0 1px 0 rgba(255,255,255,0.5) inset, 0 1px 2px rgba(13,17,22,0.06)",
      },
      keyframes: {
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out",
        "slide-up": "slide-up 0.3s cubic-bezier(0.16,1,0.3,1)",
        "slide-in-right": "slide-in-right 0.3s cubic-bezier(0.16,1,0.3,1)",
        "scale-in": "scale-in 0.18s cubic-bezier(0.16,1,0.3,1)",
        shimmer: "shimmer 1.6s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
