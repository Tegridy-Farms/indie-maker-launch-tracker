import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4F46E5",
          hover: "#4338CA",
        },
        status: {
          idea: "#6B7280",
          "in-progress": "#3B82F6",
          launched: "#10B981",
          shelved: "#F59E0B",
        },
        accent: "#8B5CF6",
        error: "#EF4444",
        success: "#10B981",
        warning: "#F59E0B",
        "bg-app": "#F9FAFB",
        surface: "#FFFFFF",
        "border-default": "#E5E7EB",
        "text-primary": "#111827",
        "text-secondary": "#6B7280",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "JetBrains Mono", "monospace"],
      },
      fontSize: {
        "body": ["14px", { lineHeight: "1.5" }],
        "caption": ["12px", { lineHeight: "1.4" }],
        "button": ["14px", { lineHeight: "1" }],
        "label": ["12px", { lineHeight: "1.3" }],
      },
      borderRadius: {
        "badge": "9999px",
        "card": "12px",
        "drawer": "16px",
        "dialog": "12px",
        "dropdown": "8px",
        "chip": "6px",
        "input": "8px",
      },
      spacing: {
        "page-max": "1024px",
      },
      animation: {
        shimmer: "shimmer 1.5s infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200px 0" },
          "100%": { backgroundPosition: "calc(200px + 100%) 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
