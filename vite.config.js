import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/

export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://longnguyents-001-site1.jtempurl.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
