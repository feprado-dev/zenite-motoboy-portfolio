import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Duas páginas: o site e a área do dono. Caminhos relativos à raiz do projeto,
// sem depender de __dirname/node:path (que exigiriam os tipos do Node no tsc).
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        admin: 'admin.html',
      },
    },
  },
});
