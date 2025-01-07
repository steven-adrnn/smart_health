import type { Config } from "tailwindcss"



const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Palette Modern Green
        primary: {
          DEFAULT: "#2ecc71",
          foreground: "#ffffff",
          50: "#e8f5e9",
          100: "#c8e6c9",
          200: "#a5d6a7",
          300: "#81c784",
          400: "#66bb6a",
          500: "#2ecc71",
          600: "#27ae60",
          700: "#1e8e4f",
          800: "#166a3b",
          900: "#0e4d2a"
        },
        secondary: {
          DEFAULT: "#34495e",
          foreground: "#ffffff",
        },
        background: "#f4f6f7",
        foreground: "#2c3e50",
        card: {
          DEFAULT: "#ffffff",
          foreground: "#2c3e50",
        },
        muted: {
          DEFAULT: "#f1f5f9",
          foreground: "#64748b",
        },
        border: "transparent", // Warna border default
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "subtle-bounce": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "subtle-bounce": "subtle-bounce 1s ease-in-out infinite",
      },
      boxShadow: {
        "soft-green": "0 10px 25px rgba(46, 204, 113, 0.2)",
        "card-hover": "0 15px 30px rgba(52, 73, 94, 0.1)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
	function({ addUtilities }: { addUtilities: (utilities: any) => void }) {
		addUtilities({
        ".glass-morphism": {
          "background": "rgba(255, 255, 255, 0.2)",
          "backdrop-filter": "blur(10px)",
          "border": "1px solid rgba(255, 255, 255, 0.125)",
        },
        ".transition-fast": {
          "transition": "all 0.2s ease-in-out",
        }
      })
    }
  ],
}

export default config