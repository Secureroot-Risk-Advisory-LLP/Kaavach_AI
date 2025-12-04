import { fontFamily } from "tailwindcss/defaultTheme"

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Space Grotesk", "Inter", ...fontFamily.sans],
        mono: ["JetBrains Mono", ...fontFamily.mono],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        "glass-primary": "hsla(var(--glass-primary) / 0.85)",
        "glass-muted": "hsla(var(--glass-muted) / 0.7)",
        "glass-border": "hsla(var(--glass-border) / 0.25)",
        "cyber-primary": "hsl(var(--cyber-primary))",
        "cyber-secondary": "hsl(var(--cyber-secondary))",
        "cyber-accent": "hsl(var(--cyber-accent))",
        "cyber-danger": "hsl(var(--cyber-danger))",
        "cyber-success": "hsl(var(--cyber-success))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
      },
      borderRadius: {
        xl: "var(--radius-xl)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        "neon-card":
          "0 20px 60px rgba(3, 230, 255, 0.12), inset 0 0 0 1px rgba(255,255,255,0.05)",
        "neon-ring": "0 0 25px rgba(0, 255, 245, 0.35)",
      },
      backgroundImage: {
        "cyber-grid":
          "linear-gradient(135deg, rgba(0,255,240,0.12) 0%, rgba(15,23,42,0.9) 60%), url('/grid.svg')",
        "glass-radial":
          "radial-gradient(circle at top left, rgba(56,189,248,0.35), transparent 45%), radial-gradient(circle at bottom right, rgba(139,92,246,0.25), transparent 40%)",
      },
      keyframes: {
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 25px rgba(14,165,233,0.45)" },
          "50%": { boxShadow: "0 0 40px rgba(14,165,233,0.7)" },
        },
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "float-slow": "float-slow 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2.8s ease-in-out infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

