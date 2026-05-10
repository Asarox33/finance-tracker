import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
    {
        name: "project/ignores",
        ignores: [
            ".next/",
            ".swc/",
            "node_modules/",
            "playwright-report/",
            "test-results/",
            "next-env.d.ts",
            "jest.config.js",
        ],
    },
    ...tseslint.configs.recommended,
    {
        name: "project/base",
        files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
        languageOptions: {
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
        },
    },
]);