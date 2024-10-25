import { defineConfig } from 'tsup';

export default defineConfig({
  format: ['cjs', 'esm'],
  entry: ['packages/*.ts'],
  sourcemap: true,
  dts: true,
  clean: true,
  outDir: 'types',
});
