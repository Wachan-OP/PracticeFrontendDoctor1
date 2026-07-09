import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tailwindcss(),   // Tailwind v4 Vite plugin — replaces postcss entirely
    react(),         // @vitejs/plugin-react v6 — uses Oxc, no Babel
  ],
  resolve: {
    alias: { "@": "/src" },
  },
  server: {
    port: 3000,
    open: true,
  },
});
