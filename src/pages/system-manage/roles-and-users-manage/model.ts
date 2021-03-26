import type { Effect, Reducer } from 'umi';
import type { PaginationResponseParams } from '@/utils/request';
import type { PermissionNode, RoleTreeNode } from './data';
import {
  createRole,
  getPaginationUserData,
  getRoleTree,
  searchUser,
  updateRoleInfo,
  updateRoleSuperior,
} from './services';
import type { Role } from './data';

// 根据 ID 查找角色节点
const getRoleNodeByID = (roles: RoleTreeNode, id: number): RoleTreeNode | null => {
  if (roles.ID === id) {
    return roles;
  }
  if (roles.children && roles.children.length > 0) {
    for (let i = 0; i < roles.children.length; i += 1) {
      if (getRoleNodeByID(roles.children[i], id) !== null) {
        return getRoleNodeByID(roles.children[i], id);
      }
    }
  }
  return null;
};

// 工具函数 删除 角色权限 中 非叶子节点的权限
const roleGetLeafNodePermissions = (
  fullPermissionTree: PermissionNode[],
  checkedKeys: string[],
): string[] => {
  const leafNode = [];
  const isLeafNode = (currentPermissionTree: PermissionNode[], key: string): boolean => {
    for (let i = 0; i < currentPermissionTree.length; i += 1) {
      // 如果当前节点的 key 与目标 key 相等, 并且不存在子节点, 则返回真
      if (
        key === currentPermissionTree[i].key &&
        (!currentPermissionTree[i].children || currentPermissionTree[i].children?.length === 0)
      ) {
        return true;
      }
      // 判断返回值是否为真, 如果为真则返回真值, 如果为假则继续进行后续遍历
      // 直接 return isLeafNode 进行递归的话, 如果第一个 children 返回了假的话, 会直接返回假值, 跳过后续的判断, 造成无法返回除了第一个树之外的内容
      if (
        currentPermissionTree[i].children &&
        currentPermissionTree[i].children!.length > 0 &&
        isLeafNode(currentPermissionTree[i].children!, key)
      ) {
        return true;
      }
    }
    return false;
  };
  for (let i = 0; i < checkedKeys.length; i += 1) {
    if (isLeafNode(fullPermissionTree, checkedKeys[i])) {
      leafNode.push(checkedKeys[i]);
    }
  }
  return leafNode;
};

export type SystemManageRolesAndUsersManageState = {
  // 完整的权限树
  fullPermissionTree: PermissionNode[];
  // 当前用户的权限树
  myPermissionTree: PermissionNode[];
  // 角色
  role: {
    loading: boolean; // 是否正则加载
    tree: RoleTreeNode[]; // 角色树
    selectedNode?: RoleTreeNode; // 被选中节点
  };
};

export type ModelType = {
  namespace: string;
  state: SystemManageRolesAndUsersManageState;
  effects: {
    roleReloadData: Effect;
    roleUpdateSuperior: Effect;
    roleAdd: Effect;
    roleUpdate: Effect;
    userGetPaginationData: Effect;
    userSearch: Effect;
  };
  reducers: {
    role: Reducer<SystemManageRolesAndUsersManageState>;
    myPermissionTree: Reducer<SystemManageRolesAndUsersManageState>;
  };
};

const Model: ModelType = {
  namespace: 'systemManageRolesAndUsersManage',
  state: {
    fullPermissionTree: [
      {
        title: '系统管理',
        key: '/system-manage',
        children: [
          {
            title: '配置管理',
            key: '/system-manage/config-manage',
          },
          {
            title: '角色与用户管理',
            key: '/system-manage/roles-and-users-manage',
          },
        ],
      },
      {
        title: '个人后缀',
        key: '/personal-suffix',
        children: [
          {
            title: 'CRM 组织架构管理',
            key: '/personal-suffix/crm-organizational-structure-manage',
          },
          {
            title: '后缀管理',
            key: '/personal-suffix/suffix-manage',
          },
          {
            title: '单点登陆模块',
            key: '/personal-suffix/single-sign-on-module',
            children: [
              {
                title: '模块管理',
                key: '/personal-suffix/single-sign-on-module/module-manage',
              },
              {
                title: '会话管理',
                key: '/personal-suffix/single-sign-on-module/session-manage',
              },
            ],
          },
          {
            title: '宣传物料管理',
            key: '/personal-suffix/advertising-materials-manage',
          },
          {
            title: '白皮书',
            key: '/personal-suffix/white-book',
            children: [
              {
                title: '个人后缀小程序码生成',
                key: '/personal-suffix/white-book/create-personal-qrcode',
              },
              {
                title: 'CRM 推送',
                key: '/personal-suffix/white-book/crm-push',
                children: [
                  {
                    title: '任务管理',
                    key: '/personal-suffix/white-book/crm-push/task-manage',
                  },
                  {
                    title: '日志管理',
                    key: '/personal-suffix/white-book/crm-push/log-manage',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    myPermissionTree: [],
    role: {
      loading: true,
      tree: [],
    },
  },
  effects: {
    // 角色 重新获取角色数据
    *roleReloadData(_, { put, select }) {
      // 更新对象的键 将需要使用到的内容转换为小写
      const transformKeys = (role: RoleTreeNode) => {
        // eslint-disable-next-line no-param-reassign
        role.key = role.ID;
        // eslint-disable-next-line no-param-reassign
        role.value = role.ID; // TreeSelect 树型选择控件 控件中需要使用 value 字段, value 在整个树范围内唯一
        // eslint-disable-next-line no-param-reassign
        role.title = role.Name;
        // eslint-disable-next-line no-param-reassign
        role.children = role.Children as RoleTreeNode[];
        // eslint-disable-next-line no-param-reassign
        delete role.Children;
        if (role.children) {
          for (let i = 0; i < role.children.length; i += 1) {
            transformKeys(role.children[i]);
          }
        }
      };

      yield put({ type: 'role', payload: { loading: true } }); // 设置角色树加载状态为真

      const responseData = yield getRoleTree();

      // 更新对象的键
      transformKeys(responseData.Data);

      let selectedNode: RoleTreeNode | null = yield select(
        (state: any) => state.systemManageRolesAndUsersManage.role.selectedNode,
      ); // 测试输出state
      if (selectedNode) {
        selectedNode = getRoleNodeByID(responseData.Data, selectedNode.ID);
      }

      yield put({
        type: 'role',
        payload: {
          loading: false,
          tree: [responseData.Data],
          selectedNode: selectedNode || responseData.Data,
        },
      });

      // 获取当前角色可以操作的权限树
      const getMyPermissionTree = (
        currentPermissionTree: PermissionNode[],
        permissions: string[],
      ) => {
        // 检查权限数组中是否有超级管理员权限, 如果有的话则直接返回整个权限树
        for (let i = 0; i < permissions.length; i += 1) {
          if (permissions[i] === 'admin') {
            return currentPermissionTree;
          }
        }
        // 逐个检查权限树中的节点
        return currentPermissionTree.filter((currentPermission) => {
          // 判断子节点长度是否为 0
          if (currentPermission.children && currentPermission.children.length > 0) {
            // 不为 0 , 判断子节点中是否有权限数组中的权限
            // eslint-disable-next-line no-param-reassign
            currentPermission.children = getMyPermissionTree(
              currentPermission.children,
              permissions,
            );
          }
          // 再次判断子节点长度是否为 0
          if (!currentPermission.children || currentPermission.children.length === 0) {
            // 为 0, 判断自己是否在权限数组中
            let has = false;
            permissions.forEach((permission) => {
              // 判断本节点是否在权限数组中
              if (currentPermission.key === permission) {
                has = true;
              }
            });
            // 返回权限数组中是否有本权限, 作为 filter 函数是否删除本节点的标志
            return has;
          }
          // 具有子节点, 返回当前节点
          return true;
        });
      };

      const fullPermissionTree = yield select(
        (state: any) => state.systemManageRolesAndUsersManage.fullPermissionTree,
      );

      yield put({
        type: 'myPermissionTree',
        payload: getMyPermissionTree(fullPermissionTree, JSON.parse(responseData.Data.Permissions)),
      });
    },

    // 角色 更新上级角色
    *roleUpdateSuperior({ payload }, { put }) {
      const responseData = yield updateRoleSuperior(payload.dragNode.ID, payload.node.ID);
      if (responseData.Message === 'Success') yield put({ type: 'roleReloadData' });
    },

    // 角色 添加下级角色
    *roleAdd({ payload }, { put, select }) {
      const fullPermissionTree = yield select(
        (state: any) => state.systemManageRolesAndUsersManage.fullPermissionTree,
      );
      const responseData = yield createRole({
        SuperiorID: payload.superiorID,
        Name: payload.roleAddName,
        Permissions: JSON.stringify(
          roleGetLeafNodePermissions(fullPermissionTree, payload.roleAddPermissionsCheckedKeys),
        ),
      } as Role);
      if (responseData.Message === 'Success') yield put({ type: 'roleReloadData' });
      return responseData.Message === 'Success';
    },

    // 角色 修改角色信息
    *roleUpdate({ payload }, { put, select }) {
      const fullPermissionTree = yield select(
        (state: any) => state.systemManageRolesAndUsersManage.fullPermissionTree,
      );
      const responseData = yield updateRoleInfo({
        ID: payload.ID,
        Name: payload.roleDetailRoleName,
        Permissions: JSON.stringify(
          roleGetLeafNodePermissions(fullPermissionTree, payload.roleDetailPermissionsCheckedKeys),
        ),
      } as Role);
      if (responseData.Message === 'Success') yield put({ type: 'roleReloadData' });
      return responseData.Message === 'Success';
    },

    // 用户 分页获取数据
    *userGetPaginationData({ payload }) {
      const responseData: PaginationResponseParams = yield getPaginationUserData(payload);
      return Promise.resolve({
        data: responseData.Data,
        success: true,
        total: responseData.Total,
      });
    },

    // 用户 搜索
    *userSearch({ payload }, { put, select }) {
      const responseData = yield searchUser({ Type: payload.type, Criteria: payload.criteria });
      if (responseData.Message === 'Success') {
        const roles = yield select(
          (state: any) => state.systemManageRolesAndUsersManage.role.tree[0],
        );
        yield put({
          type: 'role',
          payload: { selectedNode: getRoleNodeByID(roles, responseData.Data.RoleID) },
        });
        return responseData.Data.Rank;
      }
      return 0;
    },
  },
  reducers: {
    role(state, { payload }) {
      return {
        ...state,
        role: { ...state?.role, ...payload },
      } as SystemManageRolesAndUsersManageState;
    },
    myPermissionTree(state, { payload }) {
      return { ...state, myPermissionTree: payload } as SystemManageRolesAndUsersManageState;
    },
  },
};

export default Model;
