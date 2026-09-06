import { defineConfig } from 'vitest/config';
import path from 'node:path';
export default defineConfig({
  test: { environment: 'node', include: ['tests/**/*.test.js'], pool: 'forks' },
  resolve: { alias: { '@': path.resolve(__dirname) } },
  esbuild: { loader: 'jsx', include: /\.js$/, exclude: [] },
});
