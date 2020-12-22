import request, { basicRequest } from '@/utils/request';

export type MisTokenParamsType = {
  MisToken: string;
};

export type LoginParamsType = {
  Username: string;
  Password: string;
} & MisTokenParamsType;

export type UpdateUserPasswordParamsType = {
  OldPassword: string;
  NewPassword: string;
};

// 获取 RSA 公钥
export async function getRsaPublicKey() {
  return basicRequest(`/system/authentication/rsa/public-key.pem`);
}

// 登陆
export async function login(params: LoginParamsType) {
  return basicRequest('/system/authentication/user/login', {
    method: 'POST',
    data: params,
  });
}

// 进行退出 ( 销毁会话 ) 操作
export async function logout() {
  return request('/system/authentication/session/delete', {
    method: 'DELETE',
  });
}

// 获取用户基本信息
export async function getUserBasicInfo() {
  return request('/system/authentication/user/info/basic', {
    method: 'GET',
  });
}

// 进行更新 Mis 口令码操作
export async function updateMisToken(params: MisTokenParamsType) {
  return request('/system/authentication/session/mis-token', {
    method: 'PUT',
    data: params,
  });
}

// 修改用户密码
export async function updateUserPassword(params: UpdateUserPasswordParamsType) {
  return request('/system/authentication/user/password', {
    method: 'PUT',
    data: params,
  });
}
