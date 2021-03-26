import type { PaginationRequestParams } from '@/utils/request';
import request from '@/utils/request';
import type { Role, User } from './data';

type userPaginationRequestParams = {
  roleID: number;
} & PaginationRequestParams;

// 创建角色
export async function createRole(data: Role) {
  return request('/system-manages/roles-and-users-manages/roles/create', { method: 'POST', data });
}

// 获取当前用户所属角色及下属角色树
export async function getRoleTree() {
  return request('/system-manages/roles-and-users-manages/roles/tree', { method: 'GET' });
}

// 修改角色信息
export async function updateRoleInfo(data: Role) {
  return request(`/system-manages/roles-and-users-manages/roles/role/${data.ID}/update/info`, {
    method: 'PUT',
    data,
  });
}

// 修改角色的上级角色
export async function updateRoleSuperior(roleID: number, superiorRoleID: number) {
  return request(
    `/system-manages/roles-and-users-manages/roles/role/${roleID}/update/superior/${superiorRoleID}`,
    { method: 'PUT' },
  );
}

// 创建用户
export async function createUser(data: User) {
  return request('/system-manages/roles-and-users-manages/users/create', { method: 'POST', data });
}

// 分页获取用户列表
export async function getPaginationUserData(params: userPaginationRequestParams) {
  return request(
    `/system-manages/roles-and-users-manages/users/list/role/${params.roleID}/page/${params.current}/limit/${params.pageSize}`,
    { method: 'GET' },
  );
}

// 修改用户信息
export async function updateUserInfo(data: User) {
  return request(`/system-manages/roles-and-users-manages/users/user/${data.ID}/update/info`, {
    method: 'PUT',
    data,
  });
}

// 禁用用户
export async function disableUser(userID: number) {
  return request(`/system-manages/roles-and-users-manages/users/user/${userID}/disable`, {
    method: 'PUT',
  });
}

// 启用用户
export async function enableUser(userID: number) {
  return request(`/system-manages/roles-and-users-manages/users/user/${userID}/enable`, {
    method: 'PUT',
  });
}

// 搜索用户
export async function searchUser(data: { Type: string; Criteria: string }) {
  return request(
    `/system-manages/roles-and-users-manages/users/user/search/${data.Type}/${data.Criteria}`,
    { method: 'GET' },
  );
}
