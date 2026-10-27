import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // 站点用 Tailwind v4，复刻里也用它，才能把站点 JSX 上的 class 原样搬过来
  plugins: [react(), tailwindcss()],
  server: { port: 5173, host: true },
});
