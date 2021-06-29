import React, { useRef, useState } from 'react';
import type { Dispatch } from 'umi';
import { connect } from 'umi';
import { Tooltip, message, Form, Switch } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { ModalForm } from '@ant-design/pro-form';
import type { ProFieldFCMode } from '@ant-design/pro-field';
import Field from '@ant-design/pro-field';
import moment from 'moment';
import 'moment/locale/zh-cn';
import type { Config } from './data';

// 页面参数
type Props = {
  dispatch: Dispatch;
};

// 页面
const Page: React.FC<Props> = (props) => {
  const { dispatch } = props;

  // 表格控制
  const proTableRef = useRef<ActionType>();

  // 表单控制
  const [formVisible, setFormVisible] = useState<boolean>(false); // 表单是否显示
  const [formMode, setFormMode] = useState<ProFieldFCMode>('read'); // 表单模式
  const [formInstance] = Form.useForm();

  // 定义表头
  const columns: ProColumns<Config>[] = [
    {
      title: 'ID',
      dataIndex: 'ID',
      width: 50,
      align: 'center',
    },
    {
      title: '创建时间',
      width: 100,
      align: 'center',
      dataIndex: 'CreatedAt',
      render: (_, record) => {
        moment.locale('zh-cn');
        return (
          <Tooltip
            title={
              <>
                {record.CreatedAt}
                <br />
                {moment(record.CreatedAt).format('LLLL')}
              </>
            }
          >
            {moment(record.CreatedAt).fromNow()}
          </Tooltip>
        );
      },
    },
    {
      title: '禁用调试模式',
      width: 105,
      align: 'center',
      dataIndex: 'DisableDebug',
      valueEnum: {
        true: { text: '是', status: 'Error' },
        false: { text: '否', status: 'Success' },
      },
    },
    {
      title: '管理平台接口跨域白名单',
      dataIndex: 'CORSRuleServices',
      ellipsis: true,
    },
    {
      title: '服务接口跨域白名单',
      dataIndex: 'CORSRuleManages',
      ellipsis: true,
    },
    {
      title: '活动接口跨域白名单',
      dataIndex: 'CORSRuleEvents',
      ellipsis: true,
    },
    {
      title: '操 作',
      width: 100,
      align: 'center',
      key: 'option',
      valueType: 'option',
      render: (text, record) => {
        return [
          <a
            key="detail"
            onClick={() => {
              formInstance.setFieldsValue(record);
              setFormMode('read');
              setFormVisible(true);
            }}
          >
            详情
          </a>,
          <a
            key="fork"
            onClick={() => {
              formInstance.setFieldsValue(record);
              setFormMode('edit');
              setFormVisible(true);
            }}
          >
            复用
          </a>,
        ];
      },
    },
  ];

  return (
    // 列表
    <PageContainer
      content={<b style={{ color: 'red' }}>严禁在系统繁忙时修改配置！</b>}
      extraContent={
        <b>
          系统繁忙时，有可能会拉起多个 Pod 。此时更新配置，会出现只有一个 Pod 更新到最新配置，其余
          Pod 无法获取最新配置的问题！
        </b>
      }
    >
      <ProTable<Config>
        actionRef={proTableRef}
        headerTitle="配置记录"
        search={false}
        bordered
        rowKey="ID"
        columns={columns}
        pagination={{ showQuickJumper: true }}
        request={(params) =>
          dispatch({ type: 'systemManageConfigManage/getPaginationData', payload: params })
        }
      />
      {/* 添加 / 修改 的 Modal 表单 ( Modal Form ) */}
      <ModalForm
        form={formInstance}
        title={formMode === 'edit' ? '复用配置' : '配置详情'}
        visible={formVisible}
        validateMessages={{
          required: '必填内容',
        }}
        submitter={
          formMode !== 'edit'
            ? {
                // 在查看配置详情时, 隐藏掉无用的取消按钮
                resetButtonProps: {
                  style: {
                    display: 'none',
                  },
                },
              }
            : {}
        }
        modalProps={{
          onCancel: () => setFormVisible(false),
          maskClosable: false,
        }}
        onFinish={async (values) => {
          // 查看详情模式, 直接关闭弹窗
          if (formMode !== 'edit') {
            // 隐藏弹窗
            setFormVisible(false);
            return true;
          }
          // 提交新配置
          if (await dispatch({ type: 'systemManageConfigManage/updateConfig', payload: values })) {
            message.success('提交成功');
            // 刷新配置记录表格
            if (proTableRef.current) {
              proTableRef.current.reload();
            }
            // 隐藏弹窗
            setFormVisible(false);
            return true;
          }
          return false;
        }}
      >
        <Form.Item name="DisableDebug" label={<b>禁用调试模式</b>} valuePropName="checked">
          <Switch disabled={formMode !== 'edit'} />
        </Form.Item>

        <Form.Item label={<b>跨域检查规则</b>}>
          <Form.Item
            name="CORSRuleServices"
            label="内部服务路由组 ( Service ) "
            tooltip="填写域名, 不同域名使用英文逗号 ( , ) 分隔, 规则开头增加逗号可以允许不配置 CORS 头的请求通行 ( 一般是通过后端或调试工具发起的请求会存在此情况 )"
            rules={[{ required: true }]}
          >
            <Field valueType="textarea" mode={formMode} />
          </Form.Item>
          <Form.Item
            name="CORSRuleManages"
            label="管理平台路由组 ( Manages ) "
            tooltip="填写域名, 不同域名使用英文逗号 ( , ) 分隔, 规则开头增加逗号可以允许不配置 CORS 头的请求通行 ( 一般是通过后端或调试工具发起的请求会存在此情况 )"
            rules={[{ required: true }]}
          >
            <Field valueType="textarea" mode={formMode} />
          </Form.Item>
          <Form.Item
            name="CORSRuleEvents"
            label="活动 ( 外部服务 ) 路由组 ( Events ) "
            tooltip="填写域名, 不同域名使用英文逗号 ( , ) 分隔, 规则开头增加逗号可以允许不配置 CORS 头的请求通行 ( 一般是通过后端或调试工具发起的请求会存在此情况 )"
            rules={[{ required: true }]}
          >
            <Field valueType="textarea" mode={formMode} />
          </Form.Item>
        </Form.Item>

        <Form.Item label={<b>中公教育内部平台相关配置</b>}>
          <Form.Item label={<b>短信平台</b>}>
            <Form.Item name="OffcnSmsURL" label="接口地址" rules={[{ required: true }]}>
              <Field valueType="text" mode={formMode} />
            </Form.Item>
            <Form.Item name="OffcnSmsUserName" label="用户名" rules={[{ required: true }]}>
              <Field valueType="text" mode={formMode} />
            </Form.Item>
            <Form.Item name="OffcnSmsPassword" label="密码" rules={[{ required: true }]}>
              <Field valueType="password" mode={formMode} />
            </Form.Item>
            <Form.Item name="OffcnSmsTjCode" label="发送方识别码" rules={[{ required: true }]}>
              <Field valueType="text" mode={formMode} />
            </Form.Item>
          </Form.Item>
          <Form.Item label={<b>口令码平台</b>}>
            <Form.Item name="OffcnMisURL" label="接口地址" rules={[{ required: true }]}>
              <Field valueType="text" mode={formMode} />
            </Form.Item>
            <Form.Item name="OffcnMisAppID" label="应用 ID" rules={[{ required: true }]}>
              <Field valueType="text" mode={formMode} />
            </Form.Item>
            <Form.Item name="OffcnMisToken" label="令牌" rules={[{ required: true }]}>
              <Field valueType="password" mode={formMode} />
            </Form.Item>
            <Form.Item name="OffcnMisCode" label="签名密钥" rules={[{ required: true }]}>
              <Field valueType="text" mode={formMode} />
            </Form.Item>
          </Form.Item>
          <Form.Item label={<b>OCC 平台</b>}>
            <Form.Item name="OffcnOCCKey" label="签名密钥" rules={[{ required: true }]}>
              <Field valueType="text" mode={formMode} />
            </Form.Item>
          </Form.Item>
        </Form.Item>

        <Form.Item label={<b>腾讯云相关配置</b>}>
          <Form.Item name="TencentCloudAPISecretID" label="令牌" rules={[{ required: true }]}>
            <Field valueType="text" mode={formMode} />
          </Form.Item>
          <Form.Item name="TencentCloudAPISecretKey" label="密钥" rules={[{ required: true }]}>
            <Field valueType="password" mode={formMode} />
          </Form.Item>
          <Form.Item
            name="TencentCloudSmsSdkAppId"
            label="短信应用 ID"
            rules={[{ required: true }]}
          >
            <Field valueType="text" mode={formMode} />
          </Form.Item>
        </Form.Item>

        <Form.Item label={<b>内部服务 ( Service ) 相关配置</b>}>
          <Form.Item name="ServicesAccessToken" label="接口访问令牌" rules={[{ required: true }]}>
            <Field valueType="text" mode={formMode} />
          </Form.Item>
        </Form.Item>

        <Form.Item label={<b>RSA 密钥对</b>}>
          <Form.Item name="RSAPublicKey" label="RSA 公钥" rules={[{ required: true }]}>
            <Field valueType="textarea" mode={formMode} />
          </Form.Item>
          <Form.Item
            name="RSAPrivateKey"
            label="RSA 私钥"
            rules={[{ required: true }]}
            tooltip="重要提示: 修改私钥会导致所有的用户 ( 包括管理员 ) 密码失效！"
          >
            <Field valueType="textarea" mode={formMode} />
          </Form.Item>
        </Form.Item>
      </ModalForm>
    </PageContainer>
  );
};

export default connect()(Page);
