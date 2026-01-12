import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://10.50.227.191:8087",
        changeOrigin: true,
      },
    },
  },
});
//test