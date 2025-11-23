import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    // Bütün ehtimalları əhatə edirik:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    
    // Əgər qovluqlar birbaşa kökdədirsə:
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0F172A",
        foreground: "#ffffff",
      },
    },
  },
  plugins: [],
};
export default config;