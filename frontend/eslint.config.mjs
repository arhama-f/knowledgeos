import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import { defineConfig, globalIgnores } from "eslint/config";
import prettierConfig from "eslint-config-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// eslint-config-next still ships legacy-style configs (module.exports = { extends: [...] }),
// not native flat config — FlatCompat is the documented bridge for ESLint 9.
const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = defineConfig([
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  prettierConfig, // disables ESLint rules that'd conflict with Prettier's formatting
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
