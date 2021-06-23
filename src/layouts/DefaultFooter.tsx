import React from 'react';
import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-layout';

export default (
  <DefaultFooter
    copyright={`${new Date().getFullYear()} 中公教育 · 吉林`}
    links={[
      {
        key: '第三代哈士齐营销平台',
        title: '第三代哈士齐营销平台',
        href: 'https://github.com/offcn-jl/gaea-middle-end',
        blankTarget: true,
      },
      {
        key: 'Github',
        title: <GithubOutlined />,
        href: 'https://github.com/offcn-jl',
        blankTarget: true,
      },
      {
        key: '吉ICP备2021002246号',
        title: '吉ICP备2021002246号',
        href: 'https://beian.miit.gov.cn/',
        blankTarget: true,
      },
    ]}
  />
);
