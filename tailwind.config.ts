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
          red: "var(--brand-red)",
          "red-dark": "var(--brand-red-dark)",
          "red-soft": "var(--brand-red-soft)",
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
      // Surfaces follow the admin panels: faint edge, soft shadow tinted to the ink hue.
      // shadow-xs / shadow-2xs were used across the site but are Tailwind v4 names that v3
      // never generated, so those cards had no elevation at all until now.
      boxShadow: {
        "2xs": "0 1px 2px rgba(28, 22, 22, 0.05)",
        xs: "0 1px 2px rgba(28, 22, 22, 0.04), 0 12px 28px -20px rgba(28, 22, 22, 0.28)",
        card: "0 1px 2px rgba(28, 22, 22, 0.04), 0 14px 32px -22px rgba(28, 22, 22, 0.3)",
        nav: "0 1px 0 rgba(16, 24, 40, 0.06)",
        glass: "0 8px 28px rgba(16, 24, 40, 0.06)",
      },
      borderRadius: {
        card: "18px",
        pill: "10px",
        // Softer containers, as on the admin panels (Tailwind's default is 1rem)
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
