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
          primary: "#d97706", // Rich amber/golden
          secondary: "#059669", // Emerald green (sophisticated)
          accent: "#dc2626", // Deep red accent
          neutral: "#1f2937",
          "base-100": "#0f172a", // Deep navy background
          "base-200": "#1e293b", // Slate cards background
          "base-300": "#334155", // Borders/dividers
          info: "#0ea5e9", // Sky blue
          success: "#10b981", // Emerald green
          warning: "#f59e0b", // Amber
          error: "#ef4444", // Red
        },
        light: {
          primary: "#d97706", // Rich amber/golden
          secondary: "#059669", // Emerald green (sophisticated)
          accent: "#dc2626", // Deep red accent
          neutral: "#f8fafc",
          "base-100": "#ffffff", // Pure white background
          "base-200": "#f9fafb", // Very light gray cards
          "base-300": "#e5e7eb", // Light gray borders
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
