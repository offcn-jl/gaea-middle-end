import React from 'react';
import { Result, Button } from 'antd';
import { Link } from 'umi';
import type { IAuthorityType } from './CheckPermissions';
import check from './CheckPermissions';
import type AuthorizedRoute from './AuthorizedRoute';
import type Secured from './Secured';

type AuthorizedProps = {
  authority: IAuthorityType;
  noMatch?: React.ReactNode;
};

type IAuthorizedType = React.FunctionComponent<AuthorizedProps> & {
  Secured: typeof Secured;
  check: typeof check;
  AuthorizedRoute: typeof AuthorizedRoute;
};

const Authorized: React.FunctionComponent<AuthorizedProps> = ({
  children,
  authority,
  noMatch = (
    <Result
      status={403}
      title="403"
      subTitle="抱歉, 您没有取得访问本页面的授权."
      extra={
        <Button type="primary">
          <Link to="/">返回首页</Link>
        </Button>
      }
    />
  ),
}) => {
  const childrenRender: React.ReactNode = typeof children === 'undefined' ? null : children;
  const dom = check(authority, childrenRender, noMatch);
  return <>{dom}</>;
};

export default Authorized as IAuthorizedType;
