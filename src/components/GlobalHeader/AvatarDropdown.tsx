import {
  LogoutOutlined,
  LockOutlined,
  LockTwoTone,
  EyeTwoTone,
  EyeInvisibleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Input, Menu, message, Modal, Spin, Form, Button } from 'antd';
import React, { useState } from 'react';
import type { ConnectProps, Dispatch } from 'umi';
import { connect } from 'umi';
import type { ConnectState } from '@/models/connect';
import type { AuthenticationState } from '@/models/authentication';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';

export type GlobalHeaderRightProps = {
  userInfo?: AuthenticationState['userInfo'];
} & Partial<ConnectProps>;

const UpdatePasswordModalContent: React.FC<{ closeModal: () => void; dispatch?: Dispatch }> = (
  props,
) => {
  const { closeModal, dispatch } = props; // 关闭 Modal 的函数, Dispatch
  const [submitting, setSubmitting] = useState(false); // 用来表示 loading 状态的变量

  const onFinish = async (values: { oldPassword: string; newPassword: string }) => {
    setSubmitting(true); // 打开提交状态
    const payload = { closeModal, values };
    if (dispatch) {
      await dispatch({
        type: 'authentication/updatePassword',
        payload,
      });
      setSubmitting(false); // 关闭提交状态
    } else {
      setSubmitting(false); // 关闭提交状态
      message.warn('修改失败, 请您稍候再试!');
    }
  };

  return (
    <Form name="register" onFinish={onFinish} scrollToFirstError>
      <Form.Item
        name="oldPassword"
        label="旧 密 码"
        rules={[{ required: true, message: '请输入您的旧密码!' }]}
        hasFeedback
      >
        <Input.Password
          iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
        />
      </Form.Item>

      <Form.Item
        name="newPassword"
        label="新 密 码"
        rules={[
          { required: true, message: '请输入您的新密码!' },
          { type: 'string', min: 8, message: '密码长度不足 8 位!' },
          { pattern: /[0-9]+/, message: '密码中应当包含数字!' },
          { pattern: /[a-z]+/, message: '密码中应当包含小写字母!' },
          { pattern: /[A-Z]+/, message: '密码中应当包含大写字母!' },
          { pattern: /[~!@#$%^&*?_-]+/, message: '密码中应当包含特殊符号，如 ~!@#$%^&*?_- !' },
        ]}
        hasFeedback
      >
        <Input.Password
          iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
        />
      </Form.Item>

      <Form.Item
        name="confirm"
        label="再次确认"
        dependencies={['newPassword']}
        hasFeedback
        rules={[
          { required: true, message: '请再次确认您的新密码!' },
          { type: 'string', min: 8, message: '密码长度不足 8 位!' },
          { pattern: /[0-9]+/, message: '密码中应当包含数字!' },
          { pattern: /[a-z]+/, message: '密码中应当包含小写字母!' },
          { pattern: /[A-Z]+/, message: '密码中应当包含大写字母!' },
          { pattern: /[~!@#$%^&*?_-]+/, message: '密码中应当包含特殊符号，如 ~!@#$%^&*?_- !' },
          ({ getFieldValue }) => ({
            validator(rule, value) {
              if (!value || getFieldValue('newPassword') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('您两次输入的密码不匹配!'));
            },
          }),
        ]}
      >
        <Input.Password
          iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          style={{ float: 'right' }}
          loading={submitting}
          disabled={submitting}
        >
          {' '}
          修改密码{' '}
        </Button>
        <Button
          style={{ float: 'right', marginRight: 10 }}
          onClick={() => {
            closeModal();
          }}
        >
          {' '}
          取消{' '}
        </Button>
      </Form.Item>
    </Form>
  );
};

class AvatarDropdown extends React.Component<GlobalHeaderRightProps> {
  onMenuClick = (event: {
    key: React.Key;
    keyPath: React.Key[];
    item: React.ReactInstance;
    domEvent: React.MouseEvent<HTMLElement>;
  }) => {
    const { dispatch } = this.props;
    const { key } = event;
    switch (key) {
      case 'updatePassword': // 修改用户密码
        // eslint-disable-next-line no-case-declarations
        const { confirm } = Modal;
        // eslint-disable-next-line no-case-declarations
        const modal = confirm({
          title: '修改密码', // 标题
          icon: <LockTwoTone />, // 图标
          content: (
            <UpdatePasswordModalContent
              dispatch={dispatch}
              closeModal={() => {
                modal.destroy();
              }}
            />
          ),
          okButtonProps: { style: { display: 'none' } }, // 隐藏确认按钮
          cancelButtonProps: { style: { display: 'none' } }, // 隐藏取消按钮
          className: styles.updatePasswordModal,
        });
        break;
      case 'logout': // 退出登陆
        if (dispatch) {
          dispatch({
            type: 'authentication/logout',
          });
        }
        break;
      default:
        message.warn('未知操作');
    }
  };

  render(): React.ReactNode {
    const {
      userInfo = {
        role: '',
        name: '',
      },
    } = this.props;

    const menuHeaderDropdown = (
      <Menu className={styles.menu} selectedKeys={[]} onClick={this.onMenuClick}>
        <Menu.Item key="updatePassword">
          <LockOutlined />
          修改密码
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="logout">
          <LogoutOutlined />
          退出登录
        </Menu.Item>
      </Menu>
    );

    return userInfo && userInfo.name ? (
      <HeaderDropdown overlay={menuHeaderDropdown}>
        <span className={`${styles.action} ${styles.account}`}>
          <Avatar size="small" className={styles.avatar} icon={<UserOutlined />} alt="avatar" />
          <span className={`${styles.name} anticon`}>
            [ {userInfo.role} ] {userInfo.name}
          </span>
        </span>
      </HeaderDropdown>
    ) : (
      <span className={`${styles.action} ${styles.account}`}>
        <Spin
          size="small"
          style={{
            marginLeft: 8,
            marginRight: 8,
          }}
        />
      </span>
    );
  }
}

export default connect(({ authentication }: ConnectState) => ({
  userInfo: authentication.userInfo,
}))(AvatarDropdown);
