import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import eslintReact from "@eslint-react/eslint-plugin";
import eslintJs from "@eslint/js";

export default defineConfig([
    {
        ignores: [
            "build/**",
            "dist/**",
            "eslint.config.ts",
            "prettier.config.mjs",
            "stylelint.config.mjs",
            "rsbuild.config.ts",
            "rstest.config.ts",
            "rstest.setup.ts",
        ],
    },
    {
        files: ["src/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}", "scripts/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
        plugins: { eslintJs },
        extends: [
            eslintJs.configs.recommended,
            tseslint.configs.recommended,
            eslintReact.configs["recommended-typescript"],
        ],

        languageOptions: {
            globals: { ...globals.browser, process: "readonly" },
            parser: tseslint.parser,
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },

        rules: {
            "@typescript-eslint/no-unused-vars": "warn",
            "@eslint-react/no-missing-key": "warn",
            "no-useless-assignment": "warn",
        },
    },
]);
