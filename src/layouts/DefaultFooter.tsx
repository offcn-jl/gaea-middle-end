import React from 'react';
import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-layout';

export default (
  <DefaultFooter
    copyright={`${new Date().getFullYear()} 第三代哈士齐营销平台`}
    links={[
      {
        key: '中公教育 · 吉林分部',
        title: '中公教育 · 吉林分部',
        href: 'http://jl.offcn.com/',
        blankTarget: true,
      },
      {
        key: 'Github',
        title: <GithubOutlined />,
        href: 'https://github.com/offcn-jl',
        blankTarget: true,
      },
      {
        key: '吉ICP备19002052号',
        title: '吉ICP备19002052号',
        href: 'http://beian.miit.gov.cn/',
        blankTarget: true,
      },
    ]}
  />
);
