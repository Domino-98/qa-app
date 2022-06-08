import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default ({ mode }) => {
  // Load app-level env vars to node-level env vars.

  return defineConfig({
    test: {
      globals: true,
      includeSource: ["src/**/*.{js,ts}"],
    },
    plugins: [vue()],
  });
};
