/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,js,svelte,ts}",
    "./src/**/*.svelte",
    "./index.html",
  ],
  safelist: [
    // DaisyUI theme classes
    "bg-primary",
    "text-primary-content",
    "bg-secondary",
    "text-secondary-content",
    "bg-accent",
    "text-accent-content",
    "bg-neutral",
    "text-neutral-content",
    "bg-info",
    "text-info-content",
    "bg-success",
    "text-success-content",
    "bg-warning",
    "text-warning-content",
    "bg-error",
    "text-error-content",
    // Base colors
    "bg-base-100",
    "bg-base-200",
    "bg-base-300",
    "text-base-content",
    // Custom opacity classes
    "bg-base-200-80",
    "bg-base-200-90",
    "bg-base-300-50",
    "border-base-300-50",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "0.5rem",
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        DEFAULT:
          "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        // Glassy shadows
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        "glass-sm": "0 4px 16px 0 rgba(31, 38, 135, 0.25)",
        "glass-lg": "0 16px 64px 0 rgba(31, 38, 135, 0.45)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [require("daisyui")],

  daisyui: {
    themes: [
      {
        nextprime: {
          "color-scheme": "dark",
          default: true,
          prefersdark: true,

          /* Color palette mapping */
          "base-100": "hsl(30, 11%, 4%)" /* black background */,
          "base-200": "hsl(199, 27%, 18%)" /* gunmetal mid-layer */,
          "base-300": "hsl(33, 20%, 31%)" /* walnut brown surface */,
          "base-content": "hsl(31, 33%, 88%)" /* almond text */,

          primary: "hsl(32, 33%, 67%)" /* khaki */,
          "primary-content": "hsl(30, 11%, 4%)" /* text on primary */,

          secondary: "hsl(33, 20%, 31%)" /* walnut brown */,
          "secondary-content": "hsl(31, 33%, 88%)" /* almond */,

          accent: "hsl(31, 33%, 88%)" /* almond */,
          "accent-content": "hsl(30, 11%, 4%)" /* dark text */,

          neutral: "hsl(199, 27%, 18%)" /* gunmetal */,
          "neutral-content": "hsl(31, 33%, 88%)" /* almond */,

          /* Semantic colors */
          info: "hsl(210, 100%, 65%)",
          "info-content": "hsl(220, 100%, 15%)",

          success: "hsl(140, 50%, 50%)",
          "success-content": "hsl(140, 100%, 10%)",

          warning: "hsl(45, 100%, 60%)",
          "warning-content": "hsl(30, 100%, 10%)",

          error: "hsl(0, 75%, 60%)",
          "error-content": "hsl(0, 100%, 15%)",

          /* Rounded UI */
          "--rounded-box": "1rem",
          "--rounded-btn": "0.5rem",
          "--rounded-badge": "0.5rem",
          "--animation-btn": "0.25s",
          "--animation-input": "0.2s",
          "--btn-text-case": "uppercase",
          "--btn-focus-scale": "0.95",
          "--border-btn": "2px",
          "--tab-border": "2px",
          "--tab-radius": "0.5rem",
        },
      },
    ],
  },
};
