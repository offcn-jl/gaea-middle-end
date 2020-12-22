import { Popover, Tag } from 'antd';
import type { Settings as ProSettings } from '@ant-design/pro-layout';
import { QuestionCircleOutlined, DingdingOutlined } from '@ant-design/icons';
import React from 'react';
import type { ConnectProps } from 'umi';
import { connect } from 'umi';
import type { ConnectState } from '@/models/connect';
import Avatar from './AvatarDropdown';
import styles from './index.less';
import dingTalk from '@/assets/dingtalk.jpg';

export type GlobalHeaderRightProps = {
  theme?: ProSettings['navTheme'] | 'realDark';
} & Partial<ConnectProps> &
  Partial<ProSettings>;

const ENVTagColor = {
  dev: 'orange',
  test: 'blue',
};

const GlobalHeaderRight: React.SFC<GlobalHeaderRightProps> = (props) => {
  const { theme, layout } = props;
  let className = styles.right;

  if (theme === 'dark' && layout === 'top') {
    className = `${styles.right}  ${styles.dark}`;
  }

  return (
    <div className={className}>
      <Popover
        placement="bottomRight"
        title={
          <>
            问题反馈 ( <DingdingOutlined style={{ color: '#00A0E9', paddingTop: 5 }} /> 钉钉扫码或{' '}
            <a
              target="_blank"
              href="https://qr.dingtalk.com/action/joingroup?code=v1,k1,WCjT3iyeh9YgjEvNAS4oISO7yDE71vWsgHMHECmM3M0=&_dt_no_comment=1&origin=11"
              rel="noopener noreferrer"
              className={styles.action}
            >
              {' '}
              点击链接{' '}
            </a>{' '}
            加群 )
          </>
        }
        content={<img style={{ width: 300 }} src={dingTalk} alt="钉钉群" />}
      >
        <QuestionCircleOutlined className={styles.action} />
      </Popover>
      <Avatar />
      {REACT_APP_ENV && (
        <span>
          <Tag color={ENVTagColor[REACT_APP_ENV]}>
            {REACT_APP_ENV === 'test' ? '测试环境' : '开发环境'}
          </Tag>
        </span>
      )}
    </div>
  );
};

export default connect(({ settings }: ConnectState) => ({
  theme: settings.navTheme,
  layout: settings.layout,
}))(GlobalHeaderRight);
