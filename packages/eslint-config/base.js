import js from "@eslint/js";
import prettier from "eslint-config-prettier/flat";
import turboConfig from "eslint-config-turbo/flat";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export const baseConfig = defineConfig([
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...turboConfig,
  prettier,
  globalIgnores(["coverage/**", "dist/**"]),
]);
