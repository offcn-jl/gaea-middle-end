/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import { extend } from 'umi-request';
import { message, notification } from 'antd';
import { history } from '@@/core/history';
import { stringify } from 'querystring';
import { notificationDescription } from './request-components';
import { getDvaApp } from '@@/plugin-dva/exports';

// 分页请求参数的类型
export type PaginationRequestParams = {
  pageSize?: number;
  current?: number;
  keyword?: string;
};

// 分页请求响应的类型
export type PaginationResponseParams = {
  Message: string;
  Data: any[];
  Total: number;
};

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

/**
 * 基础请求工具的异常处理程序
 */
// 获取响应的 body 的方法来自 https://github.com/umijs/umi-request/issues/107
const basicRequestErrorHandler = (error: { response: Response; data: any }): any => {
  const { response } = error;
  if (response && response.status) {
    const errorText = error.data.Message || codeMessage[response.status] || response.statusText;
    const { status, url } = response;
    notification.error({
      message: errorText,
      description: error.data.Error ? notificationDescription(status, url, error.data.Error) : null,
    });
  } else if (!response) {
    notification.error({
      message: '网络异常',
      description: '您的网络发生异常，无法连接服务器，请稍后再试',
    });
  }
  return error.data ? error.data : { Message: '您的网络发生异常，无法连接服务器，请稍后再试' };
};

/**
 * 配置request请求时的默认参数
 */
const basicRequest = extend({
  prefix: GAEA_API_BASE, // 前缀, 接口地址
  errorHandler: basicRequestErrorHandler, // 默认错误处理
  credentials: 'omit', // 默认请求是否带上cookie, omit 为从不携带
});

// 基础请求工具
export { basicRequest };

/**
 * 异常处理程序
 * 处理会话失效、Mis 口令码失效等问题
 */
// 获取响应的 body 的方法来自 https://github.com/umijs/umi-request/issues/107
const errorHandler = (error: { response: Response; data: any }): any => {
  const { response } = error;
  if (response && response.status) {
    if (error.data.Message && error.data.Message === '会话无效') {
      // 删除会话
      localStorage.removeItem(GAEA_LOCAL_STORAGE_SESSION_KEY);
      // 重定向到登陆页
      if (window.location.href.indexOf('#/login') === -1) {
        // 会话无效
        message.error('会话无效, 请您重新登陆. 即将跳转到登陆页面!');
        // 跳转页面
        history.replace({
          pathname: '/login',
          search: stringify({ redirect: window.location.href }),
        });
      }
    } else if (error.data.Message && error.data.Message === 'Mis 口令码无效') {
      // 口令码过期
      // eslint-disable-next-line no-underscore-dangle
      getDvaApp()._store.dispatch({
        type: 'authentication/updateMisTokenIsExpired',
        payload: true,
      }); // 更新口令码过期状态为真
    } else if (error.data.Message && error.data.Message === '没有接口访问权限') {
      // 没有访问权限
      message.error('没有进行此操作的权限');
      // 重定向到根目录
      history.replace({ pathname: '/' });
      // P.S. 切换路由操作会触发更新用户信息的操作, 所以无需在此处执行更新用户信息与权限集操作
    } else {
      // 其他错误
      const errorText = error.data.Message || codeMessage[response.status] || response.statusText;
      const { status, url } = response;
      notification.error({
        message: errorText,
        description: error.data.Error
          ? notificationDescription(status, url, error.data.Error)
          : null,
      });
    }
  } else if (!response) {
    // 没有响应
    notification.error({
      message: '网络异常',
      description: '您的网络发生异常，无法连接服务器，请稍后再试',
    });
  }
  return error.data;
};

// 带认证信息的 request 工具
const request = extend({
  prefix: GAEA_API_BASE, // 前缀, 接口地址
  errorHandler, // 默认错误处理
  credentials: 'omit', // 默认请求是否带上cookie, omit 为从不携带
});

// 检查鉴权信息, 检查通过则添加到请求头
request.use(async (ctx, next) => {
  // 检查是否存在会话 UUID
  if (localStorage.getItem(GAEA_LOCAL_STORAGE_SESSION_KEY)) {
    // 存在
    const session = JSON.parse(<string>localStorage.getItem(GAEA_LOCAL_STORAGE_SESSION_KEY));
    if (session.UUID && !session.ExpiredAt) {
      // 存在会话信息并且未配置过期时间, 会话有效, 将会话信息添加到请求头
      ctx.req.options.headers = { Authorization: `Gaea ${session.UUID}` };
    } else if (session.UUID && session.ExpiredAt && new Date(session.ExpiredAt) > new Date()) {
      // 存在会话信息并且配置的过期时间未达到, 会话有效, 将会话信息添加到请求头
      ctx.req.options.headers = { Authorization: `Gaea ${session.UUID}` };
    } else {
      // 会话无效, 删除会话信息
      localStorage.removeItem(GAEA_LOCAL_STORAGE_SESSION_KEY);
    }
  }
  await next();
});

export default request;
