import type { Config } from "tailwindcss";
import type { PluginUtils } from "tailwindcss/types/config";
import defaultTheme from "tailwindcss/defaultTheme";
import {
  scopedPreflightStyles,
  isolateOutsideOfContainer,
} from "tailwindcss-scoped-preflight";

export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
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
      typography: ({ theme }: PluginUtils) => ({
        basic: {
          css: {
            "--tw-prose-body": theme("colors.stone[950]"),
            "--tw-prose-headings": theme("colors.stone[950]"),
            "--tw-prose-lead": theme("colors.stone[950]"),
            "--tw-prose-links": theme("colors.emerald[600]"),
            "--tw-prose-bold": theme("colors.stone[950]"),
            "--tw-prose-counters": theme("colors.stone[950]"),
            "--tw-prose-bullets": theme("colors.stone[950]"),
            "--tw-prose-hr": theme("colors.stone[950]"),
            "--tw-prose-quotes": theme("colors.stone[950]"),
            "--tw-prose-quote-borders": theme("colors.stone[950]"),
            "--tw-prose-captions": theme("colors.stone[950]"),
            "--tw-prose-code": theme("colors.stone[950]"),
            "--tw-prose-pre-code": theme("colors.stone[950]"),
            "--tw-prose-pre-bg": theme("colors.stone[950]"),
            "--tw-prose-th-borders": theme("colors.stone[950]"),
            "--tw-prose-td-borders": theme("colors.stone[950]"),
            "--tw-prose-invert-body": theme("colors.white"),
            "--tw-prose-invert-headings": theme("colors.white"),
            "--tw-prose-invert-lead": theme("colors.white"),
            "--tw-prose-invert-links": theme("colors.emerald[600]"),
            "--tw-prose-invert-bold": theme("colors.white"),
            "--tw-prose-invert-counters": theme("colors.white"),
            "--tw-prose-invert-bullets": theme("colors.white"),
            "--tw-prose-invert-hr": theme("colors.white"),
            "--tw-prose-invert-quotes": theme("colors.white"),
            "--tw-prose-invert-quote-borders": theme("colors.white"),
            "--tw-prose-invert-captions": theme("colors.white"),
            "--tw-prose-invert-code": theme("colors.white"),
            "--tw-prose-invert-pre-code": theme("colors.white"),
            "--tw-prose-invert-pre-bg": theme("colors.white"),
            "--tw-prose-invert-th-borders": theme("colors.white"),
            "--tw-prose-invert-td-borders": theme("colors.white"),
          },
        },
      }),
    },
  },
} satisfies Config;
