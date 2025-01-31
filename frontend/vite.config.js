import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Default Vite port
    proxy: {
      "/api": {
        target: "http://localhost:5452", // Local backend URL
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
  },
  base: "/", // Ensure correct base path
});
