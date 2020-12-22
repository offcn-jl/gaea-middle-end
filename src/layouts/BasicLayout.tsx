/**
 * Ant Design Pro v4 use `@ant-design/pro-layout` to handle Layout.
 * You can view component api by:
 * https://github.com/ant-design/ant-design-pro-layout
 */
import type {
  MenuDataItem,
  BasicLayoutProps as ProLayoutProps,
  Settings,
} from '@ant-design/pro-layout';
import ProLayout from '@ant-design/pro-layout';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Dispatch } from 'umi';
import { Link, connect, history } from 'umi';
import Authorized from '@/utils/Authorized';
import RightContent from '@/components/GlobalHeader/RightContent';
import type { ConnectState } from '@/models/connect';
import { getMatchMenu } from '@umijs/route-utils';
import logo from '@/assets/logo.svg';
import DefaultFooter from './DefaultFooter';
import { Input, message, Modal } from 'antd';
import { updateMisToken } from '@/services/authentication';
import { SafetyCertificateTwoTone } from '@ant-design/icons';

export type BasicLayoutProps = {
  breadcrumbNameMap: Record<string, MenuDataItem>;
  route: ProLayoutProps['route'] & {
    authority: string[];
  };
  settings: Settings;
  dispatch: Dispatch;
  misTokenIsExpired: boolean;
} & ProLayoutProps;

/**
 * use Authorized check all menu item
 */
const menuDataRender = (menuList: MenuDataItem[]): MenuDataItem[] =>
  menuList.map((item) => {
    const localItem = {
      ...item,
      children: item.children ? menuDataRender(item.children) : undefined,
    };
    return Authorized.check(item.authority, localItem, null) as MenuDataItem;
  });

const BasicLayout: React.FC<BasicLayoutProps> = (props) => {
  const {
    dispatch,
    children,
    settings,
    location = {
      pathname: '/',
    },
    misTokenIsExpired,
  } = props;

  const menuDataRef = useRef<MenuDataItem[]>([]);

  const [updatingMisToken, setUpdatingMisToken] = useState(false); // 正在更新 Mis 口令码

  useEffect(() => {
    if (dispatch) {
      dispatch({
        type: 'authentication/check',
      });
    }
  }, [location.pathname]);

  const authorized = useMemo(
    () =>
      getMatchMenu(location.pathname || '/', menuDataRef.current).pop() || {
        authority: undefined,
      },
    [location.pathname],
  );

  const doUpdateMisToken = async (misToken: string) => {
    // 提交口令码
    setUpdatingMisToken(true); // 启用提交状态
    const updateMisTokenResponse = await updateMisToken({ MisToken: misToken }); // 调用接口提交口令码
    setUpdatingMisToken(false); // 禁用提交状态
    if (updateMisTokenResponse.Message === 'Success') {
      message.success('更新口令码成功');
      dispatch({ type: 'authentication/updateMisTokenIsExpired', payload: false }); // 更新口令码过期状态为假
      dispatch({ type: 'authentication/check' }); // 重新获取用户信息并校验权限
    }
  };

  // 返回内容页面
  return (
    <>
      <ProLayout
        logo={logo}
        {...props}
        {...settings}
        onMenuHeaderClick={() => history.push('/')}
        menuItemRender={(menuItemProps, defaultDom) => {
          if (menuItemProps.isUrl || !menuItemProps.path) {
            return defaultDom;
          }
          return <Link to={menuItemProps.path}>{defaultDom}</Link>;
        }}
        breadcrumbRender={(routers = []) => [
          {
            path: '/',
            breadcrumbName: '首页',
          },
          ...routers,
        ]}
        itemRender={(route, params, routes, paths) => {
          const first = routes.indexOf(route) === 0;
          return first ? (
            <Link to={paths.join('/')}>{route.breadcrumbName}</Link>
          ) : (
            <span>{route.breadcrumbName}</span>
          );
        }}
        footerRender={() => DefaultFooter}
        menuDataRender={menuDataRender}
        rightContentRender={() => <RightContent />}
        postMenuData={(menuData) => {
          menuDataRef.current = menuData || [];
          return menuData || [];
        }}
      >
        <Authorized authority={authorized!.authority}>{children}</Authorized>
      </ProLayout>
      {/* 更新口令码弹窗 */}
      <Modal
        title={
          <>
            <SafetyCertificateTwoTone /> 口令码已过期
          </>
        }
        closable={false}
        destroyOnClose
        footer={null}
        visible={misTokenIsExpired}
      >
        <Input.Search
          enterButton={updatingMisToken ? false : '获取口令码'}
          loading={updatingMisToken}
          placeholder="请重新输入口令码"
          allowClear
          maxLength={32}
          disabled={updatingMisToken}
          onChange={async (e) => {
            if (e.target.value.length === 32) await doUpdateMisToken(e.target.value);
          }}
          onSearch={(v, e) => {
            if (e?.currentTarget.tagName === 'INPUT') return;
            window.open('http://mis.offcn.com/Tool/kouling/index');
            message.success('请在新打开的页面中获取口令码');
          }}
        />
      </Modal>
    </>
  );
};

export default connect(({ settings, authentication }: ConnectState) => ({
  settings,
  misTokenIsExpired: authentication.misTokenIsExpired,
}))(BasicLayout);
