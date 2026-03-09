// vitest.config.ts
import { defineConfig } from "vitest/config";
import { alias } from "./alias.config";

export default defineConfig({
  test: {
    include: ["src/__test__/**/*.test.[jt]s"],
    setupFiles: ["src/vitest-db-setup.ts"],
    globals: true,
    environment: "node",
  },
  resolve: {
    alias,
  },
});
