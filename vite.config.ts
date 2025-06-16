import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MynaParserUnist',
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`
    },
    rollupOptions: {
      external: [
        'unist-builder',
        '@unist-util-visit',
        'unist-util-is',
        'unist-util-visit-parents'
      ],
      output: {
        globals: {
          'unist-builder': 'unistBuilder',
          '@unist-util-visit': 'unistUtilVisit',
          'unist-util-is': 'unistUtilIs',
          'unist-util-visit-parents': 'unistUtilVisitParents'
        }
      }
    }
  },
  plugins: [dts()]
}); 