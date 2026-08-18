/**
 * Petal Ledger v2 — Vite 配置 (CommonJS)
 */
const { defineConfig } = require('vite');
const react           = require('@vitejs/plugin-react');
const path            = require('path');

const SRC = path.resolve(__dirname, 'src');

module.exports = defineConfig({
  plugins: [react()],
  resolve: {
    // Vite 5 推荐的数组形式,对象形式在某些路径(中文/空格)下解析异常
    alias: [
      { find: '@',         replacement: SRC },
      { find: '@shared',   replacement: path.join(SRC, 'shared') },
      { find: '@context',  replacement: path.join(SRC, 'context') },
      { find: '@routes',   replacement: path.join(SRC, 'routes') },
      { find: '@pages',    replacement: path.join(SRC, 'pages') },
    ],
  },
  server: {
    port: 5173,
    host: '127.0.0.1',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
