import React, { useEffect, useRef, useState } from 'react';
import type { Dispatch } from 'umi';
import { connect } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, Form, message, Popover, Switch, Tooltip, Modal } from 'antd';
import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { ModalForm } from '@ant-design/pro-form';
import type { ProFieldFCMode } from '@ant-design/pro-field';
import Field from '@ant-design/pro-field';
import moment from 'moment';
import 'moment/locale/zh-cn';
import { create, update } from './services';
import type { PhotoProcessing } from './data';

type Props = {
  dispatch: Dispatch;
};

const Page: React.FC<Props> = (props) => {
  const { dispatch } = props;

  // 表单 控制
  const [formVisible, setFormVisible] = useState<boolean>(false); // 表单是否显示
  const [formMode, setFormMode] = useState<ProFieldFCMode>('read'); // 表单模式
  const [formInstance] = Form.useForm(); // 表单实例
  const [formTitle, setFormTitle] = useState<string>('详情'); // 表单标题

  // 计算表单的标题
  useEffect(() => {
    if (formInstance.getFieldValue('ID')) {
      if (formMode === 'edit') {
        setFormTitle(`修改证件照小程序 ${formInstance.getFieldValue('Name')} 的信息`);
      } else {
        setFormTitle(`证件照小程序 ${formInstance.getFieldValue('Name')} 的详情`);
      }
    } else if (formMode === 'edit') {
      setFormTitle('新建证件照小程序');
    } else {
      setFormTitle('证件照小程序详情');
    }
  }, [formVisible]);

  // 表格 控制 引用信息
  const proTableRef = useRef<ActionType>();

  // 表格 表头
  const columns: ProColumns<PhotoProcessing>[] = [
    {
      title: 'ID',
      dataIndex: 'ID',
      width: 50,
      align: 'center',
      valueType: 'digit',
    },
    {
      title: '热门',
      tip: '设为热门后，将会在首页展示',
      align: 'center',
      dataIndex: 'Hot',
      valueEnum: {
        true: { text: '是', status: 'Success' },
        false: { text: '否', status: 'Error' },
      },
    },
    {
      title: '项目',
      dataIndex: 'Project',
      align: 'center',
      ellipsis: true,
      valueType: 'select',
      valueEnum: {
        通用尺寸: { text: '通用尺寸' },
        公务员: { text: '公务员' },
        事业单位: { text: '事业单位' },
        教师资格证: { text: '教师资格证' },
        特岗教师: { text: '特岗教师' },
        其他考试: { text: '其他考试' },
      },
    },
    {
      title: '名称',
      dataIndex: 'Name',
      align: 'center',
      ellipsis: true,
    },
    {
      title: '表单 ID',
      tip: 'CRM 活动表单 ID',
      dataIndex: 'CRMEventFormID',
      align: 'center',
      width: 100,
    },
    {
      title: '表单 SID',
      tip: 'CRM 活动表单 SID',
      dataIndex: 'CRMEventFormSID',
      align: 'center',
      width: 310,
    },
    {
      title: '尺寸',
      tip: '宽*高，单位为毫米',
      dataIndex: 'Millimeter',
      align: 'center',
      ellipsis: true,
      search: false,
      renderText: (_, record) => `${record.MillimeterWidth}*${record.MillimeterHeight}mm`,
    },
    {
      title: '分辨率',
      tip: '宽*高，单位为像素',
      dataIndex: 'Pixel',
      align: 'center',
      ellipsis: true,
      search: false,
      renderText: (_, record) => `${record.PixelWidth}*${record.PixelHeight}px`,
    },

    {
      title: '下线时间',
      align: 'center',
      dataIndex: 'DeletedAt',
      render: (_, record) => {
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
      title: '操 作',
      width: 140,
      align: 'center',
      key: 'option',
      valueType: 'option',
      render: (text, record) => {
        return [
          <a
            key="detail"
            onClick={() => {
              Modal.info({
                title: `证件照小程序 ${record.Name} 的调用参数`,
                content: (
                  <div>
                    <p>小程序名称: 中公考试助手</p>
                    <p>原始 ID ( data-mp-username ): gh_146c7fa5a832</p>
                    <p>APPID ( data-mp-appid ): wx5e256375813b119f</p>
                    <p>页面路径 ( data-page ): pages/photo-processing/detail/index*{record.ID}</p>
                    <p>
                      带后缀页面路径: pages/photo-processing/detail/index?scene=后缀*{record.ID}
                    </p>
                  </div>
                ),
              });
            }}
          >
            调用
          </a>,
          <a
            key="detail"
            onClick={() => {
              const currentRecord = { ...record }; // 是用 const 创建新对象时，会创建原有对象的只读引用，此时修改对象会出现修改原对象的问题，通过解构对象再进行赋值的操作解决这个问题
              currentRecord.BackgroundColors = JSON.parse(currentRecord.BackgroundColors);
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
                const currentRecord = { ...record }; // 是用 const 创建新对象时，会创建原有对象的只读引用，此时修改对象会出现修改原对象的问题，通过解构对象再进行赋值的操作解决这个问题
                currentRecord.BackgroundColors = JSON.parse(currentRecord.BackgroundColors);
                formInstance.setFieldsValue(currentRecord);
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
      content="中公证件照 ( 照片处理 )"
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
            <QuestionCircleOutlined />
          </Popover>
        </>
      }
    >
      <ProTable<PhotoProcessing>
        actionRef={proTableRef}
        headerTitle="配置列表"
        bordered // 显示边框
        rowKey="ID"
        columns={columns} // 列定义 ( 定义每一列的内容、类型等 )
        pagination={{ showQuickJumper: true }} // 分页配置 ( 显示快速跳转: 真 )
        request={(params) =>
          dispatch({ type: 'miniProgramPhotoProcessing/getPaginationData', payload: params })
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
            新建
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
          const currentValues = {
            ID: values.ID,
            Name: values.Name,
            Project: values.Project,
            CRMEventFormID: values.CRMEventFormID,
            CRMEventFormSID: values.CRMEventFormSID,
            MillimeterHeight: values.MillimeterHeight,
            MillimeterWidth: values.MillimeterWidth,
            PixelWidth: values.PixelWidth,
            PixelHeight: values.PixelHeight,
            BackgroundColors: JSON.stringify(values.BackgroundColors), // 底色列表需要序列化为 JSON 字符串
            Description: values.Description,
            Hot: values.Hot,
            DeletedAt: values.DeletedAt ? new Date(values.DeletedAt) : null, // 下线时间需要反序列化为时间对象
          } as PhotoProcessing;
          // 提交 修改信息操作 / 新建操作
          if (formInstance.getFieldValue('ID')) {
            // 表单中配置了 ID , 可以视为配置了数据, 进而视为进行修改操作
            // 修改
            update(currentValues).then((res) => {
              if (res.Message !== 'Success') {
                return false;
              }
              message.success('修改成功');
              // 刷新配置记录表格
              if (proTableRef.current) {
                proTableRef.current.reload();
              }
              // 隐藏弹窗
              setFormVisible(false);
              return true;
            });
          } else {
            // 新增
            create(currentValues).then((res) => {
              if (res.Message !== 'Success') {
                return false;
              }
              message.success('新建成功');
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
          <Form.Item name="Hot" label="设为热门" valuePropName="checked">
            <Switch disabled={formMode !== 'edit'} />
          </Form.Item>
          <Form.Item name="Project" label="项目" rules={[{ required: true }]}>
            <Field
              mode={formMode}
              valueEnum={{
                通用尺寸: { text: '通用尺寸' },
                公务员: { text: '公务员' },
                事业单位: { text: '事业单位' },
                教师资格证: { text: '教师资格证' },
                特岗教师: { text: '特岗教师' },
                其他考试: { text: '其他考试' },
              }}
            />
          </Form.Item>
          <Form.Item name="Name" label="名称" rules={[{ required: true }]}>
            <Field valueType="text" mode={formMode} />
          </Form.Item>
          <Form.Item name="CRMEventFormID" label="CRM 表单 ID" rules={[{ required: true }]}>
            <Field valueType="digit" mode={formMode} />
          </Form.Item>
          <Form.Item
            name="CRMEventFormSID"
            label="CRM 表单 SID"
            rules={[
              { required: true },
              { pattern: /^\w{32}$/, message: 'CRM 活动表单 SID 格式不正确' },
            ]}
          >
            <Field valueType="text" mode={formMode} />
          </Form.Item>

          <Form.Item name="MillimeterWidth" label="尺寸 - 宽度" rules={[{ required: true }]}>
            <Field valueType="digit" mode={formMode} />
          </Form.Item>
          <Form.Item name="MillimeterHeight" label="尺寸 - 高度" rules={[{ required: true }]}>
            <Field valueType="digit" mode={formMode} />
          </Form.Item>
          <Form.Item name="PixelWidth" label="分辨率 - 宽度" rules={[{ required: true }]}>
            <Field valueType="digit" mode={formMode} />
          </Form.Item>
          <Form.Item name="PixelHeight" label="分辨率 - 高度" rules={[{ required: true }]}>
            <Field valueType="digit" mode={formMode} />
          </Form.Item>
          <Form.Item name="BackgroundColors" label="照片底色" rules={[{ required: true }]}>
            <Field
              mode={formMode}
              valueType="checkbox"
              valueEnum={{
                white: {
                  text: (
                    <span key="white" style={{ color: 'white', textShadow: 'black 0 0 3px' }}>
                      白色
                    </span>
                  ),
                },
                lightblue: {
                  text: (
                    <span key="lightblue" style={{ color: '#8EC5E9' }}>
                      淡蓝色
                    </span>
                  ),
                },
                blue: {
                  text: (
                    <span key="blue" style={{ color: '#1A8AE4' }}>
                      蓝色
                    </span>
                  ),
                },
                red: {
                  text: (
                    <span key="red" style={{ color: '#C40C20' }}>
                      红色
                    </span>
                  ),
                },
                gray: {
                  text: (
                    <span key="gray" style={{ color: '#818892' }}>
                      灰色
                    </span>
                  ),
                },
              }}
            />
          </Form.Item>
          <Form.Item name="Description" label="备注">
            <Field valueType="textarea" mode={formMode} />
          </Form.Item>
          <Form.Item name="DeletedAt" label="下线时间">
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
