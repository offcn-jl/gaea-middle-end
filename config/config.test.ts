import { defineConfig } from 'umi';

export default defineConfig({
  publicPath: '/test/',
  define: {
    GAEA_API_BASE: 'https://api.gaea.jilinoffcn.com/test/manages',
    GAEA_LOCAL_STORAGE_SESSION_KEY: 'gaea-session-test',
  },
});
