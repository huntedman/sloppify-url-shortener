import { defineConfig } from "eslint/config";
import { nextJsConfig } from "@sloppify/eslint-config/next-js";

export default defineConfig([
  ...nextJsConfig,
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    ignores: [
      "app/api/**/*.{js,mjs,cjs,ts,tsx}",
      "app/**/route.{js,mjs,cjs,ts,tsx}",
      "app/**/route.test.{js,mjs,cjs,ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@sloppify/domain-core", "@sloppify/domain-core/*"],
              message:
                "Import domain-core only from server route handlers and their adapters.",
            },
          ],
        },
      ],
    },
  },
  {
    settings: {
      next: {
        rootDir: import.meta.dirname,
      },
    },
  },
]);
