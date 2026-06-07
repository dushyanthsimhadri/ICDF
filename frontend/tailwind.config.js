/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "var(--theme-bg-1)",
          card: "var(--theme-card-bg)",
          border: "var(--theme-border)",
          accent: "var(--theme-accent)",
          purple: "#8B5CF6",   // AI Purple
          green: "#10B981",    // Emerald
          rose: "#EF4444",     // Risk Rose
          amber: "#F59E0B",    // Warning Amber
          muted: "var(--theme-muted)"
        }
      },
      fontFamily: {
        sans: ["Outfit", "Inter", "sans-serif"],
        mono: ["Space Mono", "monospace"]
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
