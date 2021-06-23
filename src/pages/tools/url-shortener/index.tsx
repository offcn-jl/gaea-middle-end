import React, { useEffect, useRef, useState } from 'react';
import type { Dispatch } from 'umi';
import { connect } from 'umi';

import { Button, Form, message, Popover, Tooltip } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';

import { PageContainer } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import { ModalForm } from '@ant-design/pro-form';
import type { ProFieldFCMode } from '@ant-design/pro-field';
import Field from '@ant-design/pro-field';

import moment from 'moment';
import 'moment/locale/zh-cn';

import { base62Encode } from '@/utils/utils';

import { createShortLink, updateShortLink } from './services';
import type { ShortLink } from '@/pages/tools/url-shortener/data';

type Props = {
  dispatch: Dispatch;
};

const Page: React.FC<Props> = (props) => {
  const { dispatch } = props;

  // 表单 控制
  const [formVisible, setFormVisible] = useState<boolean>(false); // 表单是否显示
  const [formMode, setFormMode] = useState<ProFieldFCMode>('read'); // 表单模式
  const [formInstance] = Form.useForm(); // 表单实例
  const [formTitle, setFormTitle] = useState<string>('短链接详情'); // 表单标题

  // 计算表单的标题
  useEffect(() => {
    if (formInstance.getFieldValue('ID')) {
      if (formMode === 'edit') {
        setFormTitle(
          `修改短链接 https://offcn.ltd/${base62Encode(formInstance.getFieldValue('ID'))} 的信息`,
        );
      } else {
        setFormTitle(
          `短链接 https://offcn.ltd/${base62Encode(formInstance.getFieldValue('ID'))} 的详情`,
        );
      }
    } else if (formMode === 'edit') {
      setFormTitle('新建短链接');
    } else {
      setFormTitle('短链接详情');
    }
  }, [formVisible]);

  // 表格 控制 引用信息
  const proTableRef = useRef<ActionType>();

  // 表格 表头
  const columns: ProColumns<ShortLink>[] = [
    {
      title: 'ID',
      dataIndex: 'ID',
      width: 50,
      align: 'center',
    },
    {
      title: '短链',
      dataIndex: 'IDBase62Encode',
      width: 200,
      align: 'center',
      ellipsis: true,
      copyable: true,
      renderText: (_, record) => `https://offcn.ltd/${base62Encode(record.ID)}`,
    },
    {
      title: '自定义短链',
      dataIndex: 'CustomID',
      width: 200,
      align: 'center',
      ellipsis: true,
      copyable: true,
      renderText: (_, record) => (record.CustomID ? `https://offcn.ltd/${record.CustomID}` : ''),
    },
    {
      title: '跳转链接',
      dataIndex: 'URL',
      align: 'center',
      ellipsis: true,
    },
    {
      title: '失效时间',
      align: 'center',
      dataIndex: 'DeletedAt',
      render: (_, record) => {
        moment.locale('zh-cn');
        return record.DeletedAt ? (
          <Tooltip
            title={
              <>
                {record.DeletedAt}
                <br />
                {moment(record.DeletedAt).format('LLLL')}
              </>
            }
          >
            {moment(record.DeletedAt).fromNow()}
          </Tooltip>
        ) : (
          '-'
        );
      },
      search: false,
    },
    {
      title: '创建时间',
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
      search: false,
    },
    {
      title: '创建角色',
      dataIndex: 'CreatedRole',
      align: 'center',
      ellipsis: true,
      search: false,
    },
    {
      title: '创建用户',
      dataIndex: 'CreatedUser',
      align: 'center',
      ellipsis: true,
    },
    {
      title: '最终修改时间',
      align: 'center',
      dataIndex: 'LastUpdatedAt',
      render: (_, record) => {
        moment.locale('zh-cn');
        return (
          <Tooltip
            title={
              <>
                {record.LastUpdatedAt}
                <br />
                {moment(record.LastUpdatedAt).format('LLLL')}
              </>
            }
          >
            {moment(record.LastUpdatedAt).fromNow()}
          </Tooltip>
        );
      },
      hideInTable: true,
      search: false,
    },
    {
      title: '最终修改角色',
      dataIndex: 'LastUpdatedRole',
      align: 'center',
      ellipsis: true,
      hideInTable: true,
      search: false,
    },
    {
      title: '最终修改用户',
      dataIndex: 'LastUpdatedUser',
      align: 'center',
      ellipsis: true,
      hideInTable: true,
      search: false,
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
              const currentRecord = { ...record }; // 是用 const 创建新对象时，会创建原有对象的只读引用，此时修改对象会出现修改原对象的问题，通过解构对象再进行赋值的操作解决这个问题
              currentRecord.IDBase62Encode = `https://offcn.ltd/${base62Encode(record.ID)}`;
              if (record.CustomID) currentRecord.CustomID = `https://offcn.ltd/${record.CustomID}`;
              formInstance.setFieldsValue(currentRecord);
              setFormMode('read');
              setFormVisible(true);
            }}
          >
            详情
          </a>,
          record.Operational && (
            <a
              key="edit"
              onClick={() => {
                formInstance.setFieldsValue(record);
                setFormMode('edit');
                setFormVisible(true);
              }}
            >
              修改
            </a>
          ),
        ];
      },
    },
  ];

  return (
    <PageContainer
      content="可将各种长链接转换为短链接。"
      extraContent={
        <>
          可在有限范围内操作资源。
          <Popover
            placement="bottomRight"
            content={
              <>
                范围：
                <br />
                &emsp;1.&ensp;您所属的角色创建的资源。
                <br />
                &emsp;2.&ensp;您所属角色的下级角色创建的资源。
              </>
            }
          >
            {' '}
            <QuestionCircleOutlined />
          </Popover>
        </>
      }
    >
      <ProTable<ShortLink>
        actionRef={proTableRef}
        headerTitle="短链接列表"
        bordered // 显示边框
        rowKey="ID"
        columns={columns} // 列定义 ( 定义每一列的内容、类型等 )
        pagination={{ showQuickJumper: true }} // 分页配置 ( 显示快速跳转: 真 )
        request={(params) =>
          dispatch({ type: 'toolsURLShortener/getPaginationData', payload: params })
        }
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            type="primary"
            size="small"
            onClick={() => {
              formInstance.resetFields(); // 重置表单, 否则会出现打开新建窗口时带入旧内容的问题
              setFormMode('edit');
              setFormVisible(true);
            }}
          >
            新建短链接
          </Button>,
        ]}
      />
      {/* 添加 / 修改 的 Modal 表单 ( Modal Form ) */}
      <ModalForm
        form={formInstance} // 配置表单实例
        title={formTitle} // 表单标题
        visible={formVisible} // 表单是否显示
        validateMessages={{ required: '必填内容' }}
        submitter={formMode !== 'edit' ? { resetButtonProps: { style: { display: 'none' } } } : {}} // 在查看配置详情时, 隐藏掉无用的取消按钮
        modalProps={{ onCancel: () => setFormVisible(false), maskClosable: false }}
        onFinish={async (values) => {
          // 查看详情模式, 直接关闭弹窗
          if (formMode !== 'edit') {
            // 隐藏弹窗
            setFormVisible(false);
            return true;
          }
          // 提交 修改信息操作 / 新建操作
          if (formInstance.getFieldValue('ID')) {
            // 表单中配置了 ID , 可以视为配置了数据, 进而视为进行修改操作
            // 修改短链接
            updateShortLink({
              ID: values.ID,
              URL: values.URL,
              CustomID: values.CustomID,
              DeletedAt: values.DeletedAt ? new Date(values.DeletedAt) : null,
            } as ShortLink).then((res) => {
              if (res.Message !== 'Success') {
                return false;
              }
              message.success('修改短链接信息成功');
              // 刷新配置记录表格
              if (proTableRef.current) {
                proTableRef.current.reload();
              }
              // 隐藏弹窗
              setFormVisible(false);
              return true;
            });
          } else {
            // 新增短链接
            createShortLink({
              URL: values.URL,
              CustomID: values.CustomID,
              DeletedAt: values.DeletedAt ? new Date(values.DeletedAt) : null,
            } as ShortLink).then((res) => {
              if (res.Message !== 'Success') {
                return false;
              }
              message.success('新建短链接成功');
              // 刷新配置记录表格
              if (proTableRef.current) {
                proTableRef.current.reload();
              }
              // 隐藏弹窗
              setFormVisible(false);
              return true;
            });
          }
          return false;
        }}
      >
        <Form.Item label={<b>基本信息</b>}>
          <Form.Item name="ID" label="ID" hidden={formMode === 'edit'}>
            <Field valueType="text" mode="read" />
          </Form.Item>
          <Form.Item name="IDBase62Encode" label="短链接" hidden={formMode === 'edit'}>
            <Field valueType="text" mode="read" />
          </Form.Item>

          <Form.Item name="CustomID" label="自定义短链">
            <Field valueType="text" mode={formMode} />
          </Form.Item>
          <Form.Item name="URL" label="跳转链接" rules={[{ required: true }]}>
            <Field valueType="text" mode={formMode} />
          </Form.Item>
          <Form.Item name="DeletedAt" label="失效时间">
            <Field valueType="dateTime" mode={formMode} />
          </Form.Item>
        </Form.Item>

        <Form.Item label={<b>创建情况</b>} hidden={!formInstance.getFieldValue('ID')}>
          <Form.Item name="CreatedAt" label="创建时间">
            <Field valueType="dateTime" mode="read" />
          </Form.Item>
          <Form.Item name="CreatedRole" label="创建角色">
            <Field valueType="text" mode="read" />
          </Form.Item>
          <Form.Item name="CreatedUser" label="创建用户">
            <Field valueType="text" mode="read" />
          </Form.Item>
        </Form.Item>

        <Form.Item label={<b>修改情况</b>} hidden={!formInstance.getFieldValue('ID')}>
          <Form.Item name="LastUpdatedAt" label="最终修改时间">
            <Field valueType="dateTime" mode="read" />
          </Form.Item>
          <Form.Item name="LastUpdatedRole" label="最终修改角色">
            <Field valueType="text" mode="read" />
          </Form.Item>
          <Form.Item name="LastUpdatedUser" label="最终修改用户">
            <Field valueType="text" mode="read" />
          </Form.Item>
        </Form.Item>
      </ModalForm>
    </PageContainer>
  );
};

export default connect()(Page);
