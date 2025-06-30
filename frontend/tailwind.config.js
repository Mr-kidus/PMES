import defaultTheme from "tailwindcss/defaultTheme";
import defaultColors from "tailwindcss/colors";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/index.css",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        // Include default Tailwind colors to keep them
        gray: defaultColors.gray,
        slate: defaultColors.slate,
        // Add your custom colors on top
        mintBlue: "#040613",
        mintOrange: "#F36F21",
        darkGrayBg: "#121212",
        darkGrayBorder: "#2c2c2c",
      },
    },
  },
  plugins: [],
};
