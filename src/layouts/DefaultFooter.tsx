import React from 'react';
import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-layout';

export default (
  <DefaultFooter
    copyright={`${new Date().getFullYear()} 第三代哈士齐营销平台`}
    links={[
      {
        key: 'OFFCN · Jilin',
        title: 'OFFCN · Jilin',
        href: 'http://jl.offcn.com/',
        blankTarget: true,
      },
      {
        key: 'github',
        title: <GithubOutlined />,
        href: 'https://github.com/offcn-jl',
        blankTarget: true,
      },
      {
        key: 'GAEA',
        title: 'GAEA',
        href: 'https://github.com/offcn-jl/gaea-front-end',
        blankTarget: true,
      },
    ]}
  />
);
