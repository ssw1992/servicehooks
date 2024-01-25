import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import { name } from "./package.json";
import fs from "fs";

// 读取packages目录下的所有文件夹名字
const packagesDir = path.resolve(__dirname, "packages");
const packageFolders = fs
  .readdirSync(packagesDir)
  .filter((file) => fs.statSync(path.join(packagesDir, file)).isDirectory())
  .filter((folderName) => !folderName.startsWith("__"));

// 输出或使用这些文件夹名字
console.log(packageFolders);

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
        entry: packageFolders.reduce((r, folderName) => {
          r[folderName] = path.resolve(__dirname, `packages/${folderName}/index.ts`)
          return r
        },{}),
        name,
        fileName: (format, fileName, c) => `${fileName}.${format}.js`,
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
