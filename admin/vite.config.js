import { defineConfig } from "vite";
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
    // https://vite.dev/config/
  plugins: [
    tailwindcss(),
  ],
  server: {port: 5174},
});
