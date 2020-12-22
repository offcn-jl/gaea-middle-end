import { LockTwoTone, SafetyCertificateTwoTone, UserOutlined } from '@ant-design/icons';
import { Alert, Checkbox, Form, Input, Button, Row, Col, message } from 'antd';
import React, { useEffect, useState } from 'react';
import type { Dispatch } from 'umi';
import { connect } from 'umi';
import type { AuthenticationState } from '@/models/authentication';
import styles from './style.less';
import type { LoginParamsType } from '@/services/authentication';

type LoginProps = {
  dispatch: Dispatch;
  authenticationState: AuthenticationState;
  submitting?: boolean;
};

const Login: React.FC<LoginProps> = (props) => {
  const { authenticationState = {}, submitting } = props;
  const { responseMessage } = authenticationState;
  const [autoLogin, setAutoLogin] = useState(false);

  const handleSubmit = (values: LoginParamsType, isAutoLogin: boolean) => {
    const { dispatch } = props;
    dispatch({
      type: 'authentication/login',
      payload: { ...values, isAutoLogin },
    });
  };

  useEffect(() => {
    const { dispatch } = props;
    dispatch({
      type: 'authentication/check',
    });
  }); // 传入 [] 作为 deps 使这个 Effect 仅仅在加载时执行一次, 避免成功登陆后重复弹窗的情况 # https://react.docschina.org/docs/hooks-effect.html#tip-optimizing-performance-by-skipping-effects

  return (
    <div className={styles.main}>
      <Form
        onFinish={(values) => {
          handleSubmit(values as LoginParamsType, autoLogin);
        }}
      >
        {responseMessage && responseMessage !== 'Success' && !submitting && (
          <Alert style={{ marginBottom: 24 }} message={responseMessage} type="error" showIcon />
        )}

        <Form.Item name="Username" rules={[{ required: true, message: '请输入工号！' }]}>
          <Input
            size="large"
            id="username"
            prefix={<UserOutlined style={{ color: '#1890ff' }} className={styles.prefixIcon} />}
            placeholder="工号 ( 老工号 )"
          />
        </Form.Item>

        <Form.Item name="Password" rules={[{ required: true, message: '请输入密码！' }]}>
          <Input.Password
            size="large"
            prefix={<LockTwoTone className={styles.prefixIcon} />}
            type="password"
            placeholder="密码"
          />
        </Form.Item>

        <Form.Item>
          <Row gutter={8}>
            <Col span={16}>
              <Form.Item name="MisToken" rules={[{ required: true, message: '请输入口令码！' }]}>
                <Input
                  size="large"
                  prefix={<SafetyCertificateTwoTone className={styles.prefixIcon} />}
                  placeholder="口令码"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Button
                className={styles.getMisToken}
                size="large"
                onClick={() => {
                  window.open('http://mis.offcn.com/Tool/kouling/index');
                  message.success('请在新打开的页面中获取口令码');
                }}
              >
                {' '}
                获取口令码{' '}
              </Button>
            </Col>
          </Row>
        </Form.Item>

        <Checkbox checked={autoLogin} onChange={(e) => setAutoLogin(e.target.checked)}>
          自动登录
        </Checkbox>
        <div
          style={{
            paddingLeft: 5,
            marginTop: 5,
            color: autoLogin ? 'red' : '',
            background: autoLogin ? '#fee' : '',
            border: autoLogin ? '1px solid red' : '',
            borderRadius: 5,
          }}
        >
          开启「自动登陆」后登陆状态将长期有效，直至主动点击系统右上角「退出登陆」按钮。
          <b>请确保仅在可信设备上勾选本选项</b>！
        </div>
        <div style={{ paddingLeft: 5 }}>
          未开启「自动登陆」时<b>登陆状态一天内有效</b>，直至主动点击系统右上角「退出登陆」按钮。
        </div>

        <Form.Item>
          <Button
            size="large"
            type="primary"
            className={styles.submit}
            htmlType="submit"
            loading={submitting}
          >
            登录
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default connect(
  ({
    authentication,
    loading,
  }: {
    authentication: AuthenticationState;
    loading: {
      effects: Record<string, boolean>;
    };
  }) => ({
    authenticationState: authentication,
    submitting: loading.effects['authentication/login'],
  }),
)(Login);
