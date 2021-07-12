import type { PaginationResponseParams } from '@/utils/request';
import { getPaginationList } from './services';
import type { Effect } from '@@/plugin-dva/connect';
import { message } from 'antd';

export type ModelType = {
  namespace: string;
  state: unknown;
  effects: {
    getPaginationData: Effect;
  };
};

export default <ModelType>{
  namespace: 'miniProgramPhotoProcessing',
  state: {},
  effects: {
    // 获取分页数据
    *getPaginationData({ payload }) {
      const currentPayload = payload;

      // 初始化查询条件, 避免后续拼接时，将 undefined 拼接到字符串中
      currentPayload.queryString = `page=${payload.current}&limit=${payload.pageSize}&`;

      // 拼接查询条件
      if (payload.ID) currentPayload.queryString += `id=${payload.ID}&`; // ID
      if (payload.Name) currentPayload.queryString += `name=${payload.Name}&`; // Name
      if (payload.Project) currentPayload.queryString += `project=${payload.Project}&`; // Project
      if (payload.CRMEventFormID)
        currentPayload.queryString += `crm-event-form-id=${payload.CRMEventFormID}&`; // CRMEventFormID
      if (payload.CRMEventFormSID) {
        // CRMEventFormSID
        if (!/^\w{32}$/.test(payload.CRMEventFormSID)) {
          message.error('表单 SID 格式不正确');
          return Promise.reject();
        }
        currentPayload.queryString += `crm-event-form-sid=${payload.CRMEventFormSID}&`;
      }

      if (payload.Hot) currentPayload.queryString += `hot=${payload.Hot}&`; // Hot
      if (payload.CreatedUser) currentPayload.queryString += `created-user=${payload.CreatedUser}&`; // 创建用户 ( ID、工号、姓名 三个条件 三合一 )

      // 删除最后一个 & 字符
      currentPayload.queryString = currentPayload.queryString.substr(
        0,
        currentPayload.queryString.length - 1,
      );

      // 执行查询
      const responseData: PaginationResponseParams = yield getPaginationList(currentPayload);

      // 返回数据
      return Promise.resolve({ success: true, data: responseData.Data, total: responseData.Total });
    },
  },
};
