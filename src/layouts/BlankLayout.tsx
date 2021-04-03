import React from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';

const Layout: React.FC = ({ children }) => (
  <ConfigProvider locale={zhCN}>{children}</ConfigProvider>
);

export default Layout;
