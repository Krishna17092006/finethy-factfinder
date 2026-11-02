import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

/**
 * FINETHY design tokens (light theme only; dark mode was removed by the owner).
 * Text colours are chosen for WCAG AA contrast on white and on `page`.
 */
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#2f5aa8", // primary interactive (6.7:1 with white text)
          "blue-dark": "#23467f", // hover / pressed
          "blue-light": "#eaf0fa", // selected backgrounds
          orange: "#f08a0c", // brand accent: progress, highlights (not for text)
          "orange-deep": "#b45f06", // main call-to-action background (4.6:1 with white)
          "orange-light": "#fff4e6",
          cyan: "#00bbee", // decorative only
          "cyan-dark": "#00799c", // cyan for text/icons (5:1)
          "cyan-light": "#e6f7fd",
          darkText: "#1b2433", // headings, key figures
          bodyText: "#4a5263", // paragraphs (7.8:1)
          mutedText: "#5b6272", // hints, labels (6.1:1)
          muted: "#8a91a0", // decorative lines/icons only
          border: "#dfe4ec",
          page: "#f4f6fa",
          card: "#ffffff",
          white: "#ffffff",
          footerBg: "#1b2433",
        },
        health: {
          red: "#b91c1c",
          "red-bg": "#fef2f2",
          "red-line": "#fecaca",
          yellow: "#a16207",
          "yellow-bg": "#fefce8",
          "yellow-line": "#fde68a",
          green: "#15803d",
          "green-bg": "#f0fdf4",
          "green-line": "#bbf7d0",
        },
        // shadcn/ui compatible tokens
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
      },
      fontFamily: {
        sans: ["var(--font-anek)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
export default config;
