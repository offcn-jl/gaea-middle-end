import type { MenuDataItem } from '@ant-design/pro-layout';
import { getMenuData, getPageTitle } from '@ant-design/pro-layout';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import type { ConnectProps } from 'umi';
import { Link, connect } from 'umi';
import React from 'react';
import type { ConnectState } from '@/models/connect';
import logo from '@/assets/logo.svg';
import styles from './FrontendLayout.less';
import DefaultFooter from './DefaultFooter';
import { Tag } from 'antd';

const ENVTagColor = {
  dev: 'orange',
  test: 'blue',
};

export type FrontendLayoutProps = {
  breadcrumbNameMap: Record<string, MenuDataItem>;
} & Partial<ConnectProps>;

const FrontendLayout: React.FC<FrontendLayoutProps> = (props) => {
  const {
    route = {
      routes: [],
    },
  } = props;
  const { routes = [] } = route;
  const {
    children,
    location = {
      pathname: '',
    },
  } = props;
  const { breadcrumb } = getMenuData(routes);
  const title = getPageTitle({
    pathname: location.pathname,
    breadcrumb,
    ...props,
  });
  return (
    <HelmetProvider>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={title} />
      </Helmet>

      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.top}>
            <div className={styles.header}>
              <Link to="/">
                <img alt="logo" className={styles.logo} src={logo} />
                <span className={styles.title}>{title}</span>
              </Link>
            </div>
            <div className={styles.desc}>
              OFFCN Jilin · Project GAEA{' '}
              {REACT_APP_ENV && (
                <Tag color={ENVTagColor[REACT_APP_ENV]}>
                  {REACT_APP_ENV === 'test' ? '测试环境' : '开发环境'}
                </Tag>
              )}
            </div>
          </div>
          {children}
        </div>
        {DefaultFooter}
      </div>
    </HelmetProvider>
  );
};

export default connect(({ settings }: ConnectState) => ({ ...settings }))(FrontendLayout);
