import type { Effect, Reducer } from 'umi';
import { history } from 'umi';
import { message } from 'antd';
import {
  getRsaPublicKey,
  login,
  logout,
  getUserBasicInfo,
  updateUserPassword,
} from '@/services/authentication';
import { reloadAuthorized } from '@/utils/Authorized';
// @ts-ignore
import { JSEncrypt } from 'jsencrypt';
import { getPageQuery } from '@/utils/utils';
import { stringify } from 'querystring';

let Encrypt: JSEncrypt;

// 登陆后的重定向, 如果参数中有重定向链接则重定向到参数中的链接, 否则重定向到首页
const redirectToPage = () => {
  if (window.location.href.indexOf('#/login') !== -1) {
    message.success('您已登陆！页面即将自动跳转！');
    const urlParams = new URL(window.location.href);
    const params = getPageQuery();
    let { redirect } = params as { redirect: string };
    if (redirect) {
      const redirectUrlParams = new URL(redirect);
      if (redirectUrlParams.origin === urlParams.origin) {
        redirect = redirect.substr(urlParams.origin.length);
        if (redirect.match(/^\/.*#/)) {
          redirect = redirect.substr(redirect.indexOf('#') + 1);
        }
      } else {
        window.location.href = redirect;
        return;
      }
    }
    history.replace(redirect || '/');
  }
};

// 跳转到登陆页
// 判断当前是否是登陆页, 如果不是登陆页就跳转到登陆页
const redirectToLogin = () => {
  if (window.location.href.indexOf('#/login') === -1) {
    message.error('会话无效, 请您重新登陆. 即将跳转到登陆页面!');
    history.replace({ pathname: '/login', search: stringify({ redirect: window.location.href }) });
  }
};

export type AuthenticationState = {
  responseMessage?: string; // 响应的信息
  userInfo?: {
    // 用户信息
    name: string; // 姓名
    role: string; // 角色
    permissions: string[]; // 权限集
  };
  misTokenIsExpired?: boolean; // Mis 口令码已经失效
};

export type ModelType = {
  namespace: string;
  state: AuthenticationState;
  effects: {
    check: Effect;
    login: Effect;
    logout: Effect;
    updatePassword: Effect;
    encryptPassword: Effect;
  };
  reducers: {
    changeResponseMessage: Reducer<AuthenticationState>;
    changeUserInfo: Reducer<AuthenticationState>;
    updateMisTokenIsExpired: Reducer<AuthenticationState>;
  };
};

const Authentication: ModelType = {
  namespace: 'authentication',

  // 定义 state 的初始值
  state: {},

  effects: {
    *check(_, { call, put }) {
      try {
        // 检查是否存在会话 UUID
        const session = JSON.parse(<string>localStorage.getItem(GAEA_LOCAL_STORAGE_SESSION_KEY));
        if (session) {
          // 存在
          // 判断是否配置过期时间并且没有超过过期时间
          if (session.ExpiredAt && new Date(session.ExpiredAt) < new Date()) {
            // 超过过期时间, 删除会话记录并阻止跳转
            localStorage.removeItem(GAEA_LOCAL_STORAGE_SESSION_KEY);
            // 跳转到登陆页
            redirectToLogin();
          } else {
            // 调用接口获取用户信息
            const response = yield call(getUserBasicInfo);

            // 判断会话是否有效
            if (response.Message === 'Success') {
              // 更新用户信息
              yield put({ type: 'changeUserInfo', payload: response });
              // 更新授权状态
              reloadAuthorized();
              // 跳转页面
              redirectToPage();
            } else if (response.Message !== 'Mis 口令码无效') {
              // 如果不是口令码失效, 则可以认为是会话失效
              message.error(response.Message);
              // 会话无效, 删除会话记录
              localStorage.removeItem(GAEA_LOCAL_STORAGE_SESSION_KEY);
              // 跳转到登陆页
              redirectToLogin();
            }
            // 如果是口令码失效则不进行任何操作
          }
        } else {
          // 不存在会话信息, 跳转到登陆页
          redirectToLogin();
        }
      } catch (e) {
        console.log(e);
        message.error(e.message);
        // 出现错误, 跳转到登陆页
        redirectToLogin();
      }
    },
    *login({ payload }, { call, put }) {
      // 检查是否存在加密工具 Encrypt
      if (!Encrypt) {
        // 不存在，初始化加密工具
        Encrypt = new JSEncrypt();
        // 从接口获取 RSA Public Key 并配置到加密工具中
        Encrypt.setPublicKey(yield call(getRsaPublicKey));
      }

      // 使用 RSA 加密密码
      const encryptedPayload = payload; // 禁止对函数参数再赋值, 所以拷贝一份 payload. ESLint: Assignment to property of function parameter 'payload'.(no-param-reassign)
      encryptedPayload.Password = Encrypt.encrypt(payload.Password);

      // 调用接口进行登陆
      const response = yield call(login, encryptedPayload);

      yield put({
        type: 'changeResponseMessage',
        payload: response,
      });

      // 判断是否登陆成功
      if (response.Message === 'Success') {
        // 登陆成功

        // 判断是否开启自动登陆
        if (payload.isAutoLogin) {
          // 自动登陆开启
          localStorage.setItem(
            GAEA_LOCAL_STORAGE_SESSION_KEY,
            JSON.stringify({ UUID: response.Data }),
          );
        } else {
          // 自动登陆禁用
          localStorage.setItem(
            GAEA_LOCAL_STORAGE_SESSION_KEY,
            JSON.stringify({
              UUID: response.Data,
              ExpiredAt: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
            }),
          );
        }

        // 跳转页面
        redirectToPage();
      }
    },
    *logout(_, { call }) {
      // 调用接口销毁会话
      const response = yield call(logout);

      if (response.Message === 'Success') {
        message.success('退出成功！页面即将自动跳转到登陆页！');

        // 删除本地存储中的会话 UUID
        localStorage.removeItem(GAEA_LOCAL_STORAGE_SESSION_KEY);

        // 跳转到登陆页面
        history.replace({
          pathname: '/login',
          search: stringify({ redirect: window.location.href }),
        });
      }
    },
    *updatePassword({ payload }, { call }) {
      // 检查是否存在加密工具 Encrypt
      if (!Encrypt) {
        // 不存在，初始化加密工具
        Encrypt = new JSEncrypt();
        // 从接口获取 RSA Public Key 并配置到加密工具中
        Encrypt.setPublicKey(yield call(getRsaPublicKey));
      }

      // 使用 RSA 加密新旧密码
      let { oldPassword, newPassword } = payload.values;
      oldPassword = Encrypt.encrypt(oldPassword);
      newPassword = Encrypt.encrypt(newPassword);

      // 调用接口进行修改
      const response = yield call(updateUserPassword, { oldPassword, newPassword });

      // 判断是否修改成功
      if (response.Message === 'Success') {
        // 修改成功
        message.success('修改成功!');
        payload.closeModal(); // 关闭 Modal
      }
    },
    *encryptPassword({ payload }, { call }) {
      // 检查是否存在加密工具 Encrypt
      if (!Encrypt) {
        // 不存在，初始化加密工具
        Encrypt = new JSEncrypt();
        // 从接口获取 RSA Public Key 并配置到加密工具中
        Encrypt.setPublicKey(yield call(getRsaPublicKey));
      }
      // 返回加密后的密码
      return Encrypt.encrypt(payload);
    },
  },

  reducers: {
    changeResponseMessage(state, { payload }) {
      return {
        ...state,
        responseMessage: payload.Message + (payload.Error ? ` [ ${payload.Error} ]` : ''),
      };
    },
    changeUserInfo(state, { payload }) {
      return {
        ...state,
        userInfo: {
          name: payload.Data.Name,
          role: payload.Data.Role,
          permissions: JSON.parse(payload.Data.Permissions),
        },
      };
    },
    updateMisTokenIsExpired(state, { payload }) {
      return {
        ...state,
        misTokenIsExpired: payload,
      };
    },
  },
};

export default Authentication;
