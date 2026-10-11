import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  { ignores: [".checks/**", "artifacts/**"] },
  // Three.js deliberately mutates cameras, materials and scene objects in its frame loop.
  { files: ["components/canvas/**/*.tsx"], rules: { "react-hooks/immutability": "off" } },
  // Node verification scripts use CommonJS so they can load the caller's Playwright installation.
  { files: ["docs/**/*.cjs"], rules: { "@typescript-eslint/no-require-imports": "off" } },
]);
