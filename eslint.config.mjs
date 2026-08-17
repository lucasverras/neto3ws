import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Fora do lint: nada aqui é código-fonte. `public/acervo` tem ~1.400
    // derivativos gerados e `3ws-images` tem as 418 fotos originais —
    // percorrê-los fazia o eslint levar mais de dez minutos.
    "public/**",
    "3ws-images/**",
  ]),
]);

export default eslintConfig;
