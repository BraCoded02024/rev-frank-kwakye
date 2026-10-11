// Standalone Node tests have no Next bundler. Keep application imports guarded;
// only this test runner replaces the bundler marker, without mocking auth.
import { registerHooks } from "node:module";
registerHooks({ resolve(specifier, context, nextResolve) {
  if (specifier === "server-only") return { url: new URL("./server-only-empty.cjs", import.meta.url).href, shortCircuit: true };
  return nextResolve(specifier, context);
} });
