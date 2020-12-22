// https://umijs.org/config/
import { defineConfig } from 'umi';
import defaultSettings from './defaultSettings';

export default defineConfig({
  hash: true,
  antd: {},
  dva: {
    hmr: true,
  },
  history: {
    type: 'hash',
  },
  dynamicImport: {
    loading: '@/components/PageLoading/index',
  },
  targets: {
    ie: 11,
  },
  // umi routes: https://umijs.org/docs/routing
  routes: [
    {
      path: '/',
      component: '../layouts/BlankLayout',
      routes: [
        // 登陆页
        {
          path: '/login',
          component: '../layouts/FrontendLayout',
          routes: [
            {
              path: '/login',
              component: 'login',
            },
          ],
        },
        {
          path: '/',
          component: '../layouts/BasicLayout',
          routes: [],
        },
      ],
    },
  ],
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    'primary-color': defaultSettings.primaryColor,
  },
  title: false,
  ignoreMomentLocale: true,
  manifest: {
    basePath: '/',
  },
  esbuild: {},
  define: {
    GAEA_API_BASE: 'https://api.gaea.jilinoffcn.com/release/manages', // 接口基本路径
    GAEA_LOCAL_STORAGE_SESSION_KEY: 'gaea-session', // 保存会话 ( Session ) 的本地存储 ( LocalStorage ) 名称 ( Key )
    // GAEA_API_BASE: REACT_APP_ENV === "release" ? "https://api.gaea.jilinoffcn.com/release/manages" : REACT_APP_ENV === "test" ? "https://api.gaea.jilinoffcn.com/test/manages" : "http://localhost:8080/test/manages",
  },
});
