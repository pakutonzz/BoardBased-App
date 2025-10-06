// BoardBased Frontend/src/lib/config.ts

// src/lib/config.ts
export const API_BASE =
  import.meta.env.VITE_API_BASE ?? "/api";

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string;
  readonly VITE_SITE_URL?: string;
}
declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export const CONFIG = {
  API_BASE: import.meta.env.VITE_API_BASE || "/api",
  SITE_URL:
    import.meta.env.VITE_SITE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "http://127.0.0.1:8082"),
};

// ======================= Tailwind config =======================

import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

export const tailwindConfig = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      // map CSS variables (HSL) to usable Tailwind color names
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",

        popover: "hsl(var(--popover))",
        "popover-foreground": "hsl(var(--popover-foreground))",

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

        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        // BoardBased custom names used in your classes
        "bb-orange": "hsl(var(--bb-orange))",
        "bb-dark-bg": "hsl(var(--bb-dark-bg))",
        "bb-navbar-bg": "hsl(var(--bb-navbar-bg))",
        "bb-grey-300": "hsl(var(--bb-grey-300))",
        "bb-grey-600": "hsl(var(--bb-grey-600))",
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      fontFamily: {
        // global default
        sans: ['"Noto Sans Thai"', ...defaultTheme.fontFamily.sans],
        // alias for your logo usage: className="font-oleo"
        oleo: ['"Oleo Script"', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [], // add plugins if needed
} satisfies Config;
