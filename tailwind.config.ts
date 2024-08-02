import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import {
  scopedPreflightStyles,
  isolateOutsideOfContainer,
} from "tailwindcss-scoped-preflight";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  plugins: [
    scopedPreflightStyles({
      isolationStrategy: isolateOutsideOfContainer(".no-tw"),
    }),
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", ...defaultTheme.fontFamily.sans],
      },
    },
  },
} satisfies Config;
