import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/three') || id.includes('@react-three')) {
            return 'vendor-three';
          }
          if (id.includes('node_modules/react') || id.includes('node_modules/zustand')) {
            return 'vendor-react';
          }
        },
      },
    },
  },
  // @ts-ignore vitest config inline
  test: {
    include: ['src/__tests__/**/*.{test,spec}.ts', 'src/**/*.{test,spec}.ts'],
    exclude: ['e2e/**', 'node_modules/**'],
  },
});
