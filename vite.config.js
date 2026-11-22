import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build`       -> standard multi-file build in dist/ (Netlify)
// `npm run build:html`  -> one self-contained HTML file in release/ (open by double-click)
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), ...(mode === 'single' ? [viteSingleFile()] : [])],
  ...(mode === 'single' && { build: { outDir: 'release', emptyOutDir: true } }),
}));
