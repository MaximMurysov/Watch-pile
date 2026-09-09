import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  // IPv6-loopback на dev-машине недоступен: без явного host vite
  // слушает только [::1] и браузер получает ERR_CONNECTION_REFUSED.
  server: { host: "127.0.0.1", port: 5173, strictPort: true },
});
