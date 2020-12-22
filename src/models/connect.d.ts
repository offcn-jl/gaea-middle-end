import type { MenuDataItem, Settings as ProSettings } from '@ant-design/pro-layout';
import type { AuthenticationState } from '@/models/authentication';

export { GlobalModelState, UserModelState };

export type Loading = {
  global: boolean;
  effects: Record<string, boolean | undefined>;
  models: {
    setting?: boolean;
    authentication?: boolean;
  };
};

export type ConnectState = {
  loading: Loading;
  settings: ProSettings;
  authentication: AuthenticationState;
};

export type Route = {
  routes?: Route[];
} & MenuDataItem;
