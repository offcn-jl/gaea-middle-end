import { defineConfig } from 'umi';

export default defineConfig({
  publicPath: '/test/',
  define: {
    GAEA_API_BASE: 'https://api.offcn.ltd/test/manages',
    GAEA_LOCAL_STORAGE_SESSION_KEY: 'gaea-session-test',
  },
});
