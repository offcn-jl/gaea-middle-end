import type { Effect } from 'umi';
import type { PaginationResponseParams } from '@/utils/request';
import { getPaginationData, updateConfig } from './service';

export type ModelType = {
  namespace: string;
  state: Record<string, unknown>;
  effects: {
    getPaginationData: Effect;
    updateConfig: Effect;
  };
};

const Model: ModelType = {
  namespace: 'systemManageConfigManage',
  state: {},
  effects: {
    // 获取分页数据
    *getPaginationData({ payload }) {
      const responseData: PaginationResponseParams = yield getPaginationData(payload);

      return Promise.resolve({
        data: responseData.Data,
        success: true,
        total: responseData.Total,
      });
    },
    // 提交新配置
    *updateConfig({ payload }) {
      const responseData = yield updateConfig(payload);
      return responseData.Message === 'Success';
    },
  },
};

export default Model;
