import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#07090e",
          card: "#0f1523",
          border: "#1e293b",
          hover: "#172033",
        },
        neon: {
          cyan: "#00f0ff",
          blue: "#3b82f6",
          purple: "#8b5cf6",
          pink: "#ec4899",
        },
      },
      fontFamily: {
        sans: ["var(--font-cairo)", "system-ui", "sans-serif"],
      },
      animation: {
        "glow-slow": "glow 4s ease-in-out infinite alternate",
        "float": "float 6s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 15px rgba(139, 92, 246, 0.3), 0 0 30px rgba(6, 182, 212, 0.2)" },
          "100%": { boxShadow: "0 0 25px rgba(139, 92, 246, 0.6), 0 0 50px rgba(6, 182, 212, 0.4)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseGlow: {
          "0%": { opacity: "0.6", transform: "scale(1)" },
          "100%": { opacity: "1", transform: "scale(1.03)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
