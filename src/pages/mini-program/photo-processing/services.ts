import type { PaginationRequestParams } from '@/utils/request';
import request from '@/utils/request';
import type { PhotoProcessing } from './data';

// 创建短链接
export async function create(data: PhotoProcessing) {
  return request('/mini-program/photo-processing/create', { method: 'POST', data });
}

// 修改短链接信息
export async function update(data: PhotoProcessing) {
  return request(`/mini-program/photo-processing/update`, { method: 'PUT', data });
}

// 分页获取短链接列表
export async function getPaginationList(params: PaginationRequestParams) {
  return request(`/mini-program/photo-processing/list?${params.queryString}`, { method: 'GET' });
}
