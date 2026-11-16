import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/getStudent": "http://localhost:8081",
      "/addStudent": "http://localhost:8081",
      "/updateStudent": "http://localhost:8081",
      "/deleteStudent": "http://localhost:8081",
    },
  },
  build: {
    outDir: fileURLToPath(new URL("../src/main/resources/static", import.meta.url)),
    emptyOutDir: true,
  },
});
