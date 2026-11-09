import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// One self-contained, minified ES module (React included) plus one stylesheet, written
// into the site's js/demos. The site lazy-loads it; nothing else on the page depends on it.
// A plain Rollup entry (not library mode, which keeps whitespace in ES output).
export default defineConfig({
  plugins: [react()],
  define: { 'process.env.NODE_ENV': '"production"' },
  build: {
    target: 'es2022',
    outDir: '../js/demos',
    emptyOutDir: true,
    cssCodeSplit: false,
    modulePreload: false,
    rollupOptions: {
      input: 'src/cutover-entry.tsx',
      preserveEntrySignatures: 'exports-only',
      output: { format: 'es', entryFileNames: 'cutover.js', assetFileNames: 'cutover[extname]' }
    }
  }
})
