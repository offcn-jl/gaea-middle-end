import React, { useEffect, useRef, useState } from 'react';
import type { Dispatch } from 'umi';
import { connect } from 'umi';

import type { EventDataNode } from 'rc-tree/lib/interface';

import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Empty,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Tooltip,
  Tree,
  TreeSelect,
} from 'antd';
import {
  CloseSquareOutlined,
  EditOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  SaveOutlined,
} from '@ant-design/icons';

import { PageContainer } from '@ant-design/pro-layout';
import { ModalForm } from '@ant-design/pro-form';

import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';

import type { ProFieldFCMode } from '@ant-design/pro-field';
import Field from '@ant-design/pro-field';

import moment from 'moment';
import 'moment/locale/zh-cn';

import { createUser, updateUserInfo, disableUser, enableUser } from './services';
import type { User } from './data';
import type { SystemManageRolesAndUsersManageState } from './model';

type Props = {
  dispatch: Dispatch;
  systemManageRolesAndUsersManageState: SystemManageRolesAndUsersManageState;
};

type TableListItem = {
  DeletedAt: string | null;
  ID: number;
  Username: string;
  Name: string;
};

const Page: React.FC<Props> = (props) => {
  const { systemManageRolesAndUsersManageState, dispatch } = props;
  const { role, myPermissionTree } = systemManageRolesAndUsersManageState;

  const [activeTabKey, setActiveTabKey] = useState<string>('detail'); // 右侧最外层卡片容器 ( 用户管理 / 权限管理 ) 选中的 key

  // 角色
  const [roleDetailPermissionsCheckedKeys, setRoleDetailPermissionsCheckedKeys] = useState<
    React.Key[]
  >(); // 角色详情卡片中, 权限树被选中的键值
  const [roleDetailRoleName, setRoleDetailRoleName] = useState<string>(); // 角色详情卡片中, 角色的名称
  const [roleDetailMode, setRoleDetailMode] = useState<ProFieldFCMode>('read'); // 角色详情卡片中, 输入框的模式
  const [roleAddModalVisible, setRoleAddModalVisible] = useState<boolean>(false); // 添加下级角色对话框, 是否显示
  const [roleAddName, setRoleAddName] = useState<string>(); // 添加下级角色对话框, 角色名称
  const [roleAddPermissionsCheckedKeys, setRoleAddPermissionsCheckedKeys] = useState<React.Key[]>(
    [],
  ); // 添加下级角色对话框, 角色权限
  const [roleAddModalConfirmLoading, setRoleAddConfirmLoading] = useState<boolean>(false); // 添加下级角色对话框, 确定按钮 loading

  // 用户
  const [userSearchType, setUserSearchType] = useState<string>('username'); // 用户搜索, 搜索类型
  const [userTablePaginationCurrent, setUserTablePaginationCurrent] = useState<number>(1); // 用户表格, 分页, 当前页数
  const [userTablePaginationPageSize, setUserTablePaginationPageSize] = useState<number>(20); // 用户表格, 分页, 每页个数

  // 表格控制
  const proTableRef = useRef<ActionType>();

  // 表单控制
  const [formInstance] = Form.useForm(); // 表单实例
  const [formMode, setFormMode] = useState<ProFieldFCMode>('read'); // 表单模式
  const [formVisible, setFormVisible] = useState<boolean>(false); // 表单是否显示
  const [formTitle, setFormTitle] = useState<string>('用户管理'); // 表单标题

  // 在初次加载页面时进行数据加载
  useEffect(() => {
    dispatch({ type: 'systemManageRolesAndUsersManage/roleReloadData' });
    setRoleDetailPermissionsCheckedKeys(
      role.selectedNode && JSON.parse(role.selectedNode.Permissions),
    ); // 重新配置角色详情中选中的权限, 避免切换页面导致选中的权限状态清空
  }, []);

  // 计算用户表单的标题
  useEffect(() => {
    if (formInstance.getFieldValue('ID')) {
      if (formMode === 'edit') {
        setFormTitle(`修改用户 ${formInstance.getFieldValue('ID')} 的信息`);
      } else {
        setFormTitle(`用户 ${formInstance.getFieldValue('ID')} 的详情`);
      }
    } else if (formMode === 'edit') {
      setFormTitle('新建用户');
    } else {
      setFormTitle('用户管理');
    }
  }, [formVisible]);

  // 角色卡片内容
  const roleCard = () => {
    // 数据加载完成并且有数据时, 显示角色树
    if (role.tree.length > 0) {
      return (
        <Tree
          draggable
          onDrop={(info) =>
            Modal.confirm({
              // @ts-ignore
              title: `是否将 ${info.dragNode.Name} 修改为 ${info.node.Name} 的下级角色 ?`,
              onOk() {
                return dispatch({
                  type: 'systemManageRolesAndUsersManage/roleUpdateSuperior',
                  payload: info,
                });
              },
            })
          } // 拖动修改角色归属功能
          showLine={{ showLeafIcon: false }}
          defaultExpandAll
          selectedKeys={role.selectedNode && [role.selectedNode.ID]}
          onSelect={(selected, info) => {
            dispatch({
              type: 'systemManageRolesAndUsersManage/role',
              payload: { selectedNode: info.node },
            });
            // 设置角色详情卡片中权限树被选中的键值为当前角色的权限数组
            const { Permissions } = info.node as EventDataNode & { Permissions: string }; // 拓展 info.node 的属性定义
            setRoleDetailPermissionsCheckedKeys(JSON.parse(Permissions)); // 设置角色权限选中状态
            setUserTablePaginationPageSize(20); // 重置用户列表步长, 如果不重置会保存之前切换的步长, 切换角色时可能出现越界
            setUserTablePaginationCurrent(1); // 重置用户列表页码, 如果不重置会保存之前切换的页码, 切换角色时可能出现越界
          }}
          treeData={role.tree}
        />
      );
    }
    // 数据加载完成并且无数据时, 显示空状态
    return <Empty />;
  };

  // 角色详情卡片内容
  const roleDetailCard = () => {
    // 已经选中了某个角色、当前用户所属角色权限树数据加载完成并且有数据时, 显示角色详情卡片
    if (role.selectedNode && myPermissionTree.length > 0) {
      // 显示当前角色详情 创建用户、创建时间等、并提供修改选项
      return (
        <>
          <Divider orientation="left">基本信息</Divider>
          <Descriptions column={1}>
            <Descriptions.Item label="角色 ID">
              <Field text={role.selectedNode.ID} valueType="digit" mode="read" />
            </Descriptions.Item>
            <Descriptions.Item label="角色名称">
              <Field
                text={role.selectedNode.Name}
                value={roleDetailRoleName}
                valueType="text"
                mode={roleDetailMode}
                onChange={(e) => setRoleDetailRoleName(e.target.value)}
              />
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              <Field
                text={moment(role.selectedNode.CreatedAt).valueOf()}
                valueType="fromNow"
                mode="read"
              />
            </Descriptions.Item>
            <Descriptions.Item label="创建用户">
              <Field text={role.selectedNode.CreatedUser} valueType="text" mode="read" />
            </Descriptions.Item>
            <Descriptions.Item label="最终修改时间">
              <Field
                text={moment(role.selectedNode.LastUpdatedAt).valueOf()}
                valueType="fromNow"
                mode="read"
              />
            </Descriptions.Item>
            <Descriptions.Item label="最终修改用户">
              <Field text={role.selectedNode.LastUpdatedUser} valueType="text" mode="read" />
            </Descriptions.Item>
          </Descriptions>
          <Divider orientation="left">权限</Divider>
          <Tree
            disabled={role.selectedNode.ID !== role.tree[0].key && roleDetailMode === 'read'}
            checkable={role.selectedNode.ID !== role.tree[0].key}
            checkedKeys={roleDetailPermissionsCheckedKeys}
            onCheck={(checkedKeys) =>
              setRoleDetailPermissionsCheckedKeys(checkedKeys as React.Key[])
            }
            defaultExpandAll
            selectable={false}
            showLine={{ showLeafIcon: false }}
            treeData={myPermissionTree}
          />
        </>
      );
    }
    // 数据加载完成并且无数据时, 显示空状态
    return <Empty />;
  };

  // 用户列表的表头定义
  const columns: ProColumns<TableListItem>[] = [
    {
      title: '用户 ID',
      dataIndex: 'ID',
      width: 70,
      align: 'center',
    },
    {
      title: '工号',
      dataIndex: 'Username',
      align: 'center',
    },
    {
      title: '姓名',
      dataIndex: 'Name',
      align: 'center',
    },
    {
      title: '操作',
      width: role.selectedNode && role.selectedNode.ID !== role.tree[0].key ? 140 : 60,
      align: 'center',
      key: 'option',
      valueType: 'option',
      render: (text, record) => [
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
        role.selectedNode && role.selectedNode.ID !== role.tree[0].key && (
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
        role.selectedNode &&
          role.selectedNode.ID !== role.tree[0].key &&
          (record.DeletedAt ? (
            <a
              key="enable"
              style={{ color: 'green' }}
              onClick={() => {
                Modal.confirm({
                  title: `确认启用 ${record.Name} ( 工号 : ${record.Username} ) ?`,
                  onOk() {
                    return enableUser(record.ID).then((res) => {
                      if (res.Message === 'Success') {
                        if (proTableRef.current) {
                          proTableRef.current.reload();
                        }
                      }
                    });
                  },
                });
              }}
            >
              启用
            </a>
          ) : (
            <a
              key="disable"
              style={{ color: 'red' }}
              onClick={() => {
                Modal.confirm({
                  title: `确认禁用 ${record.Name} ( 工号 : ${record.Username} ) ?`,
                  onOk() {
                    return disableUser(record.ID).then((res) => {
                      if (res.Message === 'Success') {
                        if (proTableRef.current) {
                          proTableRef.current.reload();
                        }
                      }
                    });
                  },
                });
              }}
            >
              禁用
            </a>
          )), // 禁用 / 启用 ( 使用颜色进行区分 )
      ],
    },
  ];

  // 用户管理卡片内容
  const userCard = () => {
    return (
      <ProTable<TableListItem>
        actionRef={proTableRef}
        headerTitle="用户列表"
        search={false}
        bordered
        rowKey="ID"
        columns={columns}
        params={
          role.selectedNode && {
            roleID: role.selectedNode.ID,
            current: userTablePaginationCurrent, // 使用这个参数设置页码, 搜索用户时需要使用
            pageSize: userTablePaginationPageSize, // 使用这个参数设置每页个数, 搜索用户时需要使用
          }
        }
        pagination={{
          showQuickJumper: true,
          current: userTablePaginationCurrent, // 使用这个参数设置页码, 搜索用户时需要使用
          pageSize: userTablePaginationPageSize, // 使用这个参数设置每页个数, 搜索用户时需要使用
          onChange: (page, pageSize) => {
            setUserTablePaginationCurrent(page);
            setUserTablePaginationPageSize(Number(pageSize));
          },
        }}
        request={(params) =>
          dispatch({
            type: 'systemManageRolesAndUsersManage/userGetPaginationData',
            payload: params,
          })
        }
        toolBarRender={() => [
          role.selectedNode && role.selectedNode.ID !== role.tree[0].key && (
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
              添加用户
            </Button>
          ),
        ]}
      />
    );
  };

  return (
    <PageContainer>
      <Row gutter={16}>
        <Col span={12}>
          <Card
            title="角色树"
            loading={role.loading}
            extra={
              <Tooltip
                style={{ display: 'inline-block' }}
                title="点击角色后可在右侧查看 / 修改角色，拖动角色可以修改角色上下属。特殊提示：您仅可查看您所属的角色信息，不可进行修改。"
                placement="topRight"
              >
                <QuestionCircleOutlined />
              </Tooltip>
            }
          >
            {roleCard()}
          </Card>
        </Col>
        <Col span={12}>
          <Card
            loading={role.loading} // 在左侧角色发生切换，右侧角色树数据没有加载完成时，显示 loading
            tabList={[
              { key: 'detail', tab: '角色详情' },
              { key: 'users-manage', tab: '用户管理' },
            ]}
            tabBarExtraContent={
              activeTabKey === 'users-manage'
                ? role.tree.length > 0 && (
                    <>
                      <Input.Search
                        style={{ maxWidth: 200, display: 'inline-block', marginRight: 5 }}
                        size="small"
                        enterButton
                        addonBefore={
                          <Select
                            value={userSearchType}
                            className="select-before"
                            onChange={(value) => setUserSearchType(value)}
                          >
                            <Select.Option value="id">用户 ID</Select.Option>
                            <Select.Option value="username">工号</Select.Option>
                            <Select.Option value="name">姓名</Select.Option>
                          </Select>
                        }
                        onSearch={async (value) => {
                          const rank = await dispatch({
                            type: 'systemManageRolesAndUsersManage/userSearch',
                            payload: { type: userSearchType, criteria: value },
                          });
                          if (rank) {
                            // 设置当前页数为用户所在页数
                            setUserTablePaginationCurrent(rank + 1);
                            // 设置每页个数为 1
                            setUserTablePaginationPageSize(1);
                          }
                        }}
                      />
                      <Tooltip
                        style={{ display: 'inline-block' }}
                        title="用户搜索范围: 您的角色及下属角色"
                        placement="topRight"
                      >
                        <QuestionCircleOutlined />
                      </Tooltip>
                    </>
                  )
                : role.selectedNode && (
                    <>
                      <Button
                        icon={<PlusOutlined />}
                        size="small"
                        type="primary"
                        style={{ marginRight: 5 }}
                        onClick={() => {
                          setRoleAddModalVisible(true);
                        }}
                      >
                        添加下级角色
                      </Button>
                      {role.selectedNode.ID !== role.tree[0].key && roleDetailMode === 'read' && (
                        <Button
                          icon={<EditOutlined />}
                          size="small"
                          type="primary"
                          onClick={() => {
                            setRoleDetailMode('edit');
                            setRoleDetailRoleName(role.selectedNode?.Name);
                          }}
                        >
                          修改角色
                        </Button>
                      )}
                      {/* 点击修改角色后, 下方内容变为可修改状态, 按钮变为保存。点击保存后, 提交数据 */}
                      {role.selectedNode.ID !== role.tree[0].key && roleDetailMode !== 'read' && (
                        <Button
                          icon={<SaveOutlined />}
                          size="small"
                          style={{ marginRight: 5 }}
                          onClick={() => {
                            Modal.confirm({
                              title: `确认修改角色 ${role.selectedNode?.Name} ( 角色 ID : ${role.selectedNode?.ID} ) ?`,
                              async onOk() {
                                if (
                                  await dispatch({
                                    type: 'systemManageRolesAndUsersManage/roleUpdate',
                                    payload: {
                                      ID: role.selectedNode?.ID,
                                      roleDetailRoleName,
                                      roleDetailPermissionsCheckedKeys,
                                    },
                                  })
                                ) {
                                  setRoleDetailMode('read');
                                  message.success('修改成功'); // 显示修改成功
                                }
                                setRoleAddConfirmLoading(false); // 关闭确定按钮 Loading 状态
                              },
                            });
                          }}
                        >
                          保存{' '}
                        </Button>
                      )}
                      {role.selectedNode.ID !== role.tree[0].key && roleDetailMode !== 'read' && (
                        <Button
                          icon={<CloseSquareOutlined />}
                          size="small"
                          type="primary"
                          onClick={() => {
                            setRoleDetailMode('read');
                            setRoleDetailPermissionsCheckedKeys(
                              role.selectedNode && JSON.parse(role.selectedNode.Permissions),
                            );
                          }}
                        >
                          取消
                        </Button>
                      )}
                    </>
                  )
            }
            onTabChange={(key) => setActiveTabKey(key)}
          >
            {activeTabKey === 'detail' ? roleDetailCard() : userCard()}
          </Card>
        </Col>
      </Row>

      {/* 添加下级角色对话框 */}
      <Modal
        title={`添加 ${role.selectedNode && role.selectedNode.Name} 的下级角色`}
        visible={roleAddModalVisible}
        onCancel={() => {
          setRoleAddModalVisible(false);
          setRoleAddName('');
          setRoleAddPermissionsCheckedKeys([]);
        }}
        confirmLoading={roleAddModalConfirmLoading}
        onOk={async () => {
          if (!roleAddName) {
            message.error('请填写角色名称');
            return;
          }
          if (!roleAddPermissionsCheckedKeys.length) {
            message.error('请选择角色权限');
            return;
          }
          setRoleAddConfirmLoading(true); // 打开确定按钮 Loading 状态
          if (
            await dispatch({
              type: 'systemManageRolesAndUsersManage/roleAdd',
              payload: {
                superiorID: role.selectedNode?.ID,
                roleAddName,
                roleAddPermissionsCheckedKeys,
              },
            })
          ) {
            // 添加成功
            setRoleAddModalVisible(false); // 关闭对话框
            setRoleAddName(''); // 清空已经填写的新角色名称
            setRoleAddPermissionsCheckedKeys([]); // 清空已经填写的新角色权限
          }
          setRoleAddConfirmLoading(false); // 关闭确定按钮 Loading 状态
        }}
      >
        <Input
          placeholder="请输入角色名称"
          prefix="名称："
          value={roleAddName}
          onChange={(e) => setRoleAddName(e.target.value)}
        />
        <Divider orientation="left">权限</Divider>
        <Tree
          checkable
          onCheck={(checkedKeys) => setRoleAddPermissionsCheckedKeys(checkedKeys as React.Key[])}
          checkedKeys={roleAddPermissionsCheckedKeys}
          defaultExpandAll
          selectable={false}
          showLine={{ showLeafIcon: false }}
          treeData={myPermissionTree}
        />
      </Modal>

      {/* 用户 添加、修改、查看详情 对话框 */}
      <ModalForm
        form={formInstance}
        title={formTitle}
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
          // 提交修改用户信息操作 / 新建用户操作
          if (formInstance.getFieldValue('ID')) {
            // 表单中配置了 ID , 可以视为配置了用户数据, 进而视为进行修改用户操作
            // 修改用户
            updateUserInfo({
              ID: values.ID,
              RoleID: values.RoleID,
              Username: values.Username,
              Name: values.Name,
              Password: values.Password
                ? await dispatch({
                    type: 'authentication/encryptPassword',
                    payload: values.Password,
                  })
                : '',
            } as User).then((res) => {
              if (res.Message !== 'Success') {
                return false;
              }
              message.success('修改用户信息成功');
              // 刷新配置记录表格
              if (proTableRef.current) {
                proTableRef.current.reload();
              }
              // 隐藏弹窗
              setFormVisible(false);
              return true;
            });
          } else {
            // 新增用户
            createUser({
              RoleID: values.RoleID,
              Username: values.Username,
              Name: values.Name,
              Password: values.Password
                ? await dispatch({
                    type: 'authentication/encryptPassword',
                    payload: values.Password,
                  })
                : '',
            } as User).then((res) => {
              if (res.Message !== 'Success') {
                return false;
              }
              message.success('新建用户成功');
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
        {
          // 仅在 用户 修改、查看详情 时 显示基本信息
          formInstance.getFieldValue('ID') && (
            <Form.Item label={<b>基本信息</b>}>
              <Form.Item name="ID" label="用户 ID">
                <Field valueType="text" mode="read" />
              </Form.Item>
              <Form.Item name="CreatedAt" label="创建时间">
                <Field valueType="dateTime" mode="read" />
              </Form.Item>
              <Form.Item name="CreatedUser" label="创建用户">
                <Field valueType="text" mode="read" />
              </Form.Item>
              <Form.Item name="LastUpdatedAt" label="最终修改时间">
                <Field valueType="dateTime" mode="read" />
              </Form.Item>
              <Form.Item name="LastUpdatedUser" label="最终修改用户">
                <Field valueType="text" mode="read" />
              </Form.Item>
              <Form.Item name="DeletedAt" label="禁用时间">
                <Field valueType="dateTime" mode="read" />
              </Form.Item>
              <Form.Item
                name="RoleIDForInfo"
                label="角色 ID"
                initialValue={role.selectedNode && role.selectedNode.ID}
              >
                <Field valueType="text" mode="read" />
              </Form.Item>
            </Form.Item>
          )
        }
        <Form.Item label={<b>用户信息</b>} rules={[{ required: true }]}>
          <Form.Item
            name="RoleID"
            label="角色"
            initialValue={role.selectedNode && role.selectedNode.ID}
          >
            <TreeSelect
              disabled={formMode === 'read'}
              style={{ width: '100%' }}
              treeData={role.tree}
              treeDefaultExpandAll
            />
          </Form.Item>
          <Form.Item name="Username" label="用户名" rules={[{ required: true }]}>
            <Field valueType="text" mode={formMode} />
          </Form.Item>
          <Form.Item name="Name" label="姓名" rules={[{ required: true }]}>
            <Field valueType="text" mode={formMode} />
          </Form.Item>
          {
            // 仅在 用户 修改、查看详情 时 显示密码输入框
            formMode === 'edit' && (
              <Form.Item
                name="Password"
                label="密码"
                tooltip={formInstance.getFieldValue('ID') ? '无需修改时留空即可' : ''}
                rules={formInstance.getFieldValue('ID') ? [] : [{ required: true }]}
              >
                <Field valueType="password" mode={formMode} />
              </Form.Item>
            )
          }
        </Form.Item>
      </ModalForm>
    </PageContainer>
  );
};

export default connect(
  ({
    systemManageRolesAndUsersManage,
  }: {
    systemManageRolesAndUsersManage: SystemManageRolesAndUsersManageState;
  }) => ({ systemManageRolesAndUsersManageState: systemManageRolesAndUsersManage }),
)(Page);
