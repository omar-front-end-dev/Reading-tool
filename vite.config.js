import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    sentryVitePlugin({
      org: "7p-vb",
      project: "javascript-react",
    }),
  ],

  resolve: {
    alias: {
      "@components": path.resolve(__dirname, "./src/Components"),
      // "../../../constants": path.resolve(__dirname, "./src/Constants"),
      // "@assets": path.resolve(__dirname, "./src/assets"),
      "@config": path.resolve(__dirname, "./src/Config"),
      "@": "/src",
    },
  },
});
