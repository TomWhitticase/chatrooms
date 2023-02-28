/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/typography"),
    // @ts-ignore
    function ({ addVariant }) {
      addVariant("child", "& > *");
      addVariant("child-hover", "& > *:hover");
      addVariant(
        "mobile-only",
        "@media screen and (max-width: theme('screens.md'))"
      );
      addVariant(
        "desktop-only",
        "@media screen and (min-width: theme('screens.md'))"
      );
    },
  ],
};
