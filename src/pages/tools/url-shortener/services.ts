import type { PaginationRequestParams } from '@/utils/request';
import request from '@/utils/request';
import type { ShortLink } from '@/pages/tools/url-shortener/data';

// 创建短链接
export async function createShortLink(data: ShortLink) {
  return request('/tools/url-shortener/create', { method: 'POST', data });
}

// 修改短链接信息
export async function updateShortLink(data: ShortLink) {
  return request(`/tools/url-shortener/update`, { method: 'PUT', data });
}

// 分页获取短链接列表
export async function getPaginationList(params: PaginationRequestParams) {
  return request(
    `/tools/url-shortener/list/page/${params.current}/limit/${params.pageSize}${
      params.queryString ? `?${params.queryString}` : ''
    }`,
    { method: 'GET' },
  );
}
