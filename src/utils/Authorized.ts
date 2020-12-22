import RenderAuthorize from '@/components/Authorized';
import { getDvaApp } from 'umi';

// 从 DVA 的 store 中获取用户当前的授权
// https://umijs.org/plugins/plugin-dva#umi-接口
// https://github.com/sanmaopep/sanmaopep.github.io/issues/1
// https://stackoverflow.com/questions/63073047/how-to-access-dva-store-in-umi-application
// https://juejin.cn/post/6844903971245539342

const getPermissions = () => {
  // eslint-disable-next-line no-underscore-dangle
  return getDvaApp()._store.getState().authentication.userInfo.permissions;
};

const getAuthority = () => {
  return typeof getDvaApp === 'function' && getDvaApp() && getPermissions() ? getPermissions() : [];
};

/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable import/no-mutable-exports */
let Authorized = RenderAuthorize(getAuthority());

// Reload the rights component
const reloadAuthorized = (): void => {
  Authorized = RenderAuthorize(getAuthority());
};

/**
 * hard code
 * block need it。
 */
window.reloadAuthorized = reloadAuthorized;

export { reloadAuthorized };
export default Authorized;
