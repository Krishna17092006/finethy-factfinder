import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      ".tmp/**",
      "node_modules/**",
      "public/**",
      "docs/**",
      "test-results/**",
      "playwright-report/**",
      "next-env.d.ts",
      "prisma/seed-casestudy.js",
      "scripts/download-fonts.js",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // The finance engines and the PDF layout take the loosely-typed Prisma
    // submission (plus derived fields). Typing that shape fully is tracked as
    // follow-up work; everything else stays strict.
    files: ["src/lib/{analysis,report,sanity,pdf}.ts", "src/lib/pdf.tsx", "src/components/report/**", "src/__tests__/**"],
    rules: { "@typescript-eslint/no-explicit-any": "off" },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", caughtErrors: "none" }],
    },
  },
];

export default eslintConfig;
