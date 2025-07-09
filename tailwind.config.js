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
      colors: {
        // DaisyUI color integration with opacity support
        primary: 'hsl(var(--p) / <alpha-value>)',
        'primary-content': 'hsl(var(--pc) / <alpha-value>)',
        secondary: 'hsl(var(--s) / <alpha-value>)',
        'secondary-content': 'hsl(var(--sc) / <alpha-value>)',
        accent: 'hsl(var(--a) / <alpha-value>)',
        'accent-content': 'hsl(var(--ac) / <alpha-value>)',
        neutral: 'hsl(var(--n) / <alpha-value>)',
        'neutral-content': 'hsl(var(--nc) / <alpha-value>)',
        'base-100': 'hsl(var(--b1) / <alpha-value>)',
        'base-200': 'hsl(var(--b2) / <alpha-value>)',
        'base-300': 'hsl(var(--b3) / <alpha-value>)',
        'base-content': 'hsl(var(--bc) / <alpha-value>)',
        info: 'hsl(var(--in) / <alpha-value>)',
        'info-content': 'hsl(var(--inc) / <alpha-value>)',
        success: 'hsl(var(--su) / <alpha-value>)',
        'success-content': 'hsl(var(--suc) / <alpha-value>)',
        warning: 'hsl(var(--wa) / <alpha-value>)',
        'warning-content': 'hsl(var(--wac) / <alpha-value>)',
        error: 'hsl(var(--er) / <alpha-value>)',
        'error-content': 'hsl(var(--erc) / <alpha-value>)',
      },
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
          "--b1": "30 11% 4%" /* base-100: black background */,
          "--b2": "199 27% 18%" /* base-200: gunmetal mid-layer */,
          "--b3": "33 20% 31%" /* base-300: walnut brown surface */,
          "--bc": "31 33% 88%" /* base-content: almond text */,

          "--p": "32 33% 67%" /* primary: khaki */,
          "--pc": "30 11% 4%" /* primary-content: text on primary */,

          "--s": "33 20% 31%" /* secondary: walnut brown */,
          "--sc": "31 33% 88%" /* secondary-content: almond */,

          "--a": "31 33% 88%" /* accent: almond */,
          "--ac": "30 11% 4%" /* accent-content: dark text */,

          "--n": "199 27% 18%" /* neutral: gunmetal */,
          "--nc": "31 33% 88%" /* neutral-content: almond */,

          /* Semantic colors */
          "--in": "210 100% 65%",
          "--inc": "220 100% 15%",

          "--su": "140 50% 50%",
          "--suc": "140 100% 10%",

          "--wa": "45 100% 60%",
          "--wac": "30 100% 10%",

          "--er": "0 75% 60%",
          "--erc": "0 100% 15%",

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
