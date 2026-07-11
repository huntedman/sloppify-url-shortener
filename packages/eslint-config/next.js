import prettier from "eslint-config-prettier/flat";
import turboConfig from "eslint-config-turbo/flat";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export const nextJsConfig = defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  ...turboConfig,
  prettier,
  globalIgnores([".next/**", "build/**", "next-env.d.ts", "out/**"]),
]);
