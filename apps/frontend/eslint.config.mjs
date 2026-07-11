import { defineConfig } from "eslint/config";
import { nextJsConfig } from "@sloppify/eslint-config/next-js";

export default defineConfig([
  ...nextJsConfig,
  {
    settings: {
      next: {
        rootDir: import.meta.dirname,
      },
    },
  },
]);
