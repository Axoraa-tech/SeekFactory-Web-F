import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "var(--brand-blue)",
          "blue-dark": "var(--brand-blue-dark)",
          "blue-soft": "var(--brand-blue-soft)",
          orange: "var(--brand-orange)",
          "orange-soft": "var(--brand-orange-soft)",
        },
        ink: {
          DEFAULT: "var(--ink)",
          muted: "var(--ink-muted)",
          faint: "var(--ink-faint)",
        },
        line: "var(--line)",
        canvas: "var(--canvas)",
        surface: "var(--surface)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 24, 40, 0.04), 0 4px 12px rgba(16, 24, 40, 0.04)",
        nav: "0 1px 0 rgba(16, 24, 40, 0.06)",
      },
      borderRadius: {
        card: "12px",
        pill: "10px",
      },
    },
  },
  plugins: [],
};

export default config;
