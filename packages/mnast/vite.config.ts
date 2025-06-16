import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MynaParserUnist',
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
      formats: ['es', 'cjs']
    },
    outDir: 'dist',
    rollupOptions: {
      external: [
        'unist-builder',
        '@unist-util-visit',
        'unist-util-is'
      ],
      output: {
        globals: {
          'unist-builder': 'unistBuilder',
          '@unist-util-visit': 'unistUtilVisit',
          'unist-util-is': 'unistUtilIs'
        }
      }
    }
  },
  plugins: [dts({ outDir: 'dist', entryRoot: 'src' })]
}); 