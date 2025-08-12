/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [require("daisyui"), require("@tailwindcss/forms")],
  daisyui: {
    themes: [
      {
        dark: {
          primary: "#f97316", // Sunset orange
          secondary: "#dc2626", // Sunset red
          accent: "#facc15", // Sunset yellow
          neutral: "#111827",
          "base-100": "#0f172a", // Dark navy background
          "base-200": "#1e293b", // Cards background
          "base-300": "#334155", // Borders/dividers
          info: "#0ea5e9", // Sky blue
          success: "#10b981", // Emerald green
          warning: "#f59e0b", // Amber
          error: "#ef4444", // Red
        },
        light: {
          primary: "#f97316", // Sunset orange
          secondary: "#dc2626", // Sunset red
          accent: "#facc15", // Sunset yellow
          neutral: "#f8fafc",
          "base-100": "#ffffff", // White background
          "base-200": "#fef3f2", // Light warm cards
          "base-300": "#fed7cc", // Light warm borders
          info: "#0ea5e9", // Sky blue
          success: "#10b981", // Emerald green
          warning: "#f59e0b", // Amber
          error: "#ef4444", // Red
        },
      },
    ],
    darkTheme: "dark",
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: true,
    themeRoot: ":root",
  },
};
