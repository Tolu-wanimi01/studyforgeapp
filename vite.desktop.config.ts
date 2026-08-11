import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

// Standalone SPA build used to package StudyForge as a downloadable desktop app.
// It reuses the same planner components as the web app, without SSR.
export default defineConfig({
  base: "./",
  root: fileURLToPath(new URL("./desktop", import.meta.url)),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  build: {
    outDir: fileURLToPath(new URL("./dist-desktop", import.meta.url)),
    emptyOutDir: true,
  },
});
