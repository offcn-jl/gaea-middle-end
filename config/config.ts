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
          component: '../layouts/BasicLayout',
          routes: [
            {
              path: '/system-manage',
              name: '系统管理',
              icon: 'deploymentUnit',
              authority: [
                'admin',
                '/system-manage/config-manage',
                '/system-manage/roles-and-users-manage',
              ], // 下级菜单权限的集合
              routes: [
                {
                  path: '/system-manage/config-manage',
                  name: '配置管理',
                  authority: ['admin', '/system-manage/config-manage'],
                  component: 'system-manage/config-manage',
                },
                {
                  path: '/system-manage/roles-and-users-manage',
                  name: '角色与用户管理',
                  authority: ['admin', '/system-manage/roles-and-users-manage'],
                  component: 'system-manage/roles-and-users-manage',
                },
              ],
            },
            {
              path: '/personal-suffix',
              name: '个人后缀',
              icon: 'tag',
              authority: [
                'admin',
                '/personal-suffix/crm-organizational-structure-manage',
                '/personal-suffix/suffix-manage',
                '/personal-suffix/single-sign-on-module/module-manage',
                '/personal-suffix/single-sign-on-module/session-manage',
                '/personal-suffix/advertising-materials-manage',
                '/personal-suffix/white-book/create-personal-qrcode',
                '/personal-suffix/white-book/crm-push/task-management',
                '/personal-suffix/white-book/crm-push/log-management',
              ],
              routes: [
                {
                  path: '/personal-suffix/crm-organizational-structure-manage',
                  name: 'CRM 组织架构管理',
                  authority: ['admin', '/personal-suffix/crm-organizational-structure-manage'],
                },
                {
                  path: '/personal-suffix/suffix-manage',
                  name: '后缀管理',
                  authority: ['admin', '/personal-suffix/suffix-manage'],
                },
                {
                  path: '/personal-suffix/single-sign-on-module',
                  name: '单点登陆模块',
                  authority: [
                    'admin',
                    '/personal-suffix/single-sign-on-module/module-manage',
                    '/personal-suffix/single-sign-on-module/session-manage',
                  ],
                  routes: [
                    {
                      path: '/personal-suffix/single-sign-on-module/module-manage',
                      name: '模块管理',
                      authority: ['admin', '/personal-suffix/single-sign-on-module/module-manage'],
                    },
                    {
                      path: '/personal-suffix/single-sign-on-module/session-manage',
                      name: '会话管理',
                      authority: ['admin', '/personal-suffix/single-sign-on-module/session-manage'],
                    },
                  ],
                },
                {
                  path: '/personal-suffix/advertising-materials-manage',
                  name: '宣传物料管理',
                  authority: ['admin', '/personal-suffix/advertising-materials-manage'],
                },
                {
                  path: '/personal-suffix/white-book',
                  name: '白皮书',
                  authority: [
                    'admin',
                    '/personal-suffix/white-book/create-personal-qrcode',
                    '/personal-suffix/white-book/crm-push/task-management',
                    '/personal-suffix/white-book/crm-push/log-management',
                  ],
                  routes: [
                    {
                      path: '/personal-suffix/white-book/create-personal-qrcode',
                      name: '个人后缀小程序码生成',
                      authority: ['admin', '/personal-suffix/white-book/create-personal-qrcode'],
                    },
                    {
                      path: '/personal-suffix/white-book/crm-push',
                      name: 'CRM 推送',
                      authority: [
                        'admin',
                        '/personal-suffix/white-book/crm-push/task-management',
                        '/personal-suffix/white-book/crm-push/log-management',
                      ],
                      routes: [
                        {
                          path: '/personal-suffix/white-book/crm-push/task-manage',
                          name: '任务管理',
                          authority: ['admin', '/personal-suffix/white-book/crm-push/task-manage'],
                        },
                        {
                          path: '/personal-suffix/white-book/crm-push/log-manage',
                          name: '日志管理',
                          authority: ['admin', '/personal-suffix/white-book/crm-push/log-manage'],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              path: '/tools',
              name: '工具',
              icon: 'tool',
              authority: ['admin', '/tools/url-shortener'],
              routes: [
                {
                  path: '/tools/url-shortener',
                  name: '短链生成器',
                  authority: ['admin', '/tools/url-shortener'],
                  component: 'tools/url-shortener',
                },
              ],
            },
            {
              path: '/mini-program',
              name: '小程序',
              icon: 'wechat',
              authority: ['admin', '/mini-program/photo-processing'],
              routes: [
                {
                  path: '/mini-program/photo-processing',
                  name: '中公证件照',
                  authority: ['admin', '/mini-program/photo-processing'],
                  component: 'mini-program/photo-processing',
                },
              ],
            },
          ],
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
  publicPath: '/release/',
  define: {
    GAEA_API_BASE: 'https://api.offcn.ltd/release/manages', // 接口基本路径
    GAEA_LOCAL_STORAGE_SESSION_KEY: 'gaea-session', // 保存会话 ( Session ) 的本地存储 ( LocalStorage ) 名称 ( Key )
    // GAEA_API_BASE: REACT_APP_ENV === "release" ? "https://api.offcn.ltd/release/manages" : REACT_APP_ENV === "test" ? "https://api.offcn.ltd/test/manages" : "http://localhost:8080/test/manages",
  },
});
