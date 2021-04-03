// 数据类型 角色
export type Role = {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  SuperiorID: number;
  Name: string;
  Permissions: string;
};

// 数据类型 用户
export type User = {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  RoleID: number;
  Username: string;
  Name: string;
  Password: string;
};

// 数据类型 权限树的节点
export type PermissionNode = {
  title: string;
  key: string;
  children?: PermissionNode[];
};

// 数据类型 角色树的节点
export type RoleTreeNode = {
  ID: number;
  CreatedAt: string;
  LastUpdatedAt: string;
  CreatedUser: string;
  LastUpdatedUser: string;
  Name: string;
  title: string;
  key: number;
  value: number; // TreeSelect 树型选择控件 控件中需要使用 value 字段
  Children?: RoleTreeNode[];
  children: RoleTreeNode[];
  Permissions: string;
};
