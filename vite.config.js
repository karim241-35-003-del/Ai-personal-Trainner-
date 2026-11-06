import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev server: http://localhost:5173
// When the real backend runs on port 8000, requests to /api are forwarded to it.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { "/api": { target: "http://localhost:8000", changeOrigin: true } },
  },
});
