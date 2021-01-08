import type { PaginationRequestParams } from '@/utils/request';
import request from '@/utils/request';
import type { Config } from './data';

// 分页获取系统配置
export async function getPaginationData(params: PaginationRequestParams) {
  return request(
    `/system-manages/config-manages/list/page/${params.current}/limit/${params.pageSize}`,
    {
      method: 'GET',
    },
  );
}

// 提交新配置
export async function updateConfig(data: Config) {
  return request('/system-manages/config-manages/update', { method: 'POST', data });
}
