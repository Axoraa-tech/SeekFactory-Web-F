import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/shared/mocks", "@/shared/mocks/*"],
              message:
                "Do not import mocks/fixtures in UI. Use getApi() from @/shared/api instead.",
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      "src/shared/api/**/*.{ts,tsx}",
      "src/shared/mocks/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": "off",
    },
  },
];

export default eslintConfig;
