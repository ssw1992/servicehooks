import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";


// https://vitejs.dev/config/
export default ({ mode }) => {
  // 是否构建库版本
  let build = {};
  const isNpm = mode === "npm";
  if (isNpm) {
    build = {
      outDir: "lib",
      sourcemap: true,
      lib: {
        entry: path.resolve(__dirname, `packages/index.ts`),
        name: 'index',
        fileName: format => `index.${format === 'iife' ? 'min' : format}.js`,
        formats: ['es', 'umd', 'iife']
      },
      rollupOptions: {
        external: ["vue", "svg"],
      },
    };
  }
  return defineConfig({
    publicDir: isNpm ? false : "public",
    plugins: [vue()],
    resolve: {
      alias: {
        "@packages": path.resolve(__dirname, "packages"),
      },
    },
    build,
  });
};


