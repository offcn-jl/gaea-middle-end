import type { PaginationResponseParams } from '@/utils/request';
import { getPaginationList } from './services';
import { base62Decode } from '@/utils/utils';
import type { Effect } from '@@/plugin-dva/connect';

export type ModelType = {
  namespace: string;
  state: unknown;
  effects: {
    getPaginationData: Effect;
  };
};

export default <ModelType>{
  namespace: 'toolsURLShortener',
  state: {},
  effects: {
    // 获取分页数据
    *getPaginationData({ payload }) {
      const currentPayload = payload;

      // 初始化查询条件, 避免后续拼接时，将 undefined 拼接到字符串中
      currentPayload.queryString = '';
      // 拼接查询条件
      if (payload.ID) currentPayload.queryString += `id=${payload.ID}&`; // ID
      if (payload.IDBase62Encode)
        currentPayload.queryString += `id=${base62Decode(
          payload.IDBase62Encode.replace(/\s*/g, '')
            .split('#')[0]
            .split('?')[0]
            .replace('https://offcn.ltd/', ''),
        )}&`; // 短链接
      if (payload.CustomID)
        currentPayload.queryString += `custom-id=${payload.CustomID.replace(/\s*/g, '')
          .split('#')[0]
          .split('?')[0]
          .replace('https://offcn.ltd/', '')}&`; // 自定义 ID
      if (payload.URL) currentPayload.queryString += `url=${payload.URL}&`; // 链接
      if (payload.CreatedUser) currentPayload.queryString += `created-user=${payload.CreatedUser}&`; // 创建用户 ( ID、工号、姓名 三个条件 三合一 )
      // 删除最后一个 & 字符
      currentPayload.queryString = currentPayload.queryString.substr(
        0,
        currentPayload.queryString.length - 1,
      );

      // 执行查询
      const responseData: PaginationResponseParams = yield getPaginationList(currentPayload);

      // 返回数据
      return Promise.resolve({
        data: responseData.Data,
        success: true,
        total: responseData.Total,
      });
    },
  },
};
