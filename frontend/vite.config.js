import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1000, // in kB
    rollupOptions: {
      external: ['express', 'fs', 'path', 'url', 'events', 'http']
    }
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
