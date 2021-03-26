# 第三代哈士齐营销平台 ( Gaea ) 管理中台

[![MIT license](https://img.shields.io/badge/license-MIT-brightgreen.svg)](https://opensource.org/licenses/MIT) [![代码扫描](https://github.com/offcn-jl/gaea-middle-end/workflows/CD%20CodeQL/badge.svg)](https://github.com/offcn-jl/gaea-middle-end/actions?query=workflow%3ACD%20CodeQL) [![持续交付](https://github.com/offcn-jl/gaea-middle-end/workflows/CD/badge.svg)](https://github.com/offcn-jl/gaea-middle-end/actions?query=workflow%3ACD) [![持续集成](https://github.com/offcn-jl/gaea-middle-end/workflows/CI/badge.svg)](https://github.com/offcn-jl/gaea-middle-end/actions?query=workflow%3ACI) [![代码扫描](https://github.com/offcn-jl/gaea-middle-end/workflows/CI%20CodeQL/badge.svg)](https://github.com/offcn-jl/gaea-middle-end/actions?query=workflow%3ACI%20CodeQL)

## 待办列表

### 基础架构

- [x] 迭代认证逻辑
  - [x] RSA 公钥改为从接口获取 `便于更新密钥并增强安全性`
  - [x] 登陆
    - [x] 会话信息使用 localStorage 进行存储 ( 原来使用 Cookies ) `增强安全性`
    - [x] 登陆时可以选择是否保持会话永不过期 ( 通过在保存时增加过期时间字段实现 ) `减少登陆操作的次数，优化使用体验`
    - [x] 登陆时增加校验 MisToken 的步骤 `优化操作体验`
  - [x] 更新口令码操作改为带遮罩且不可关闭带弹窗 `不中断用户当前的操作，优化操作体验`
  - [x] 每次切换路由时重新获取用户基本信息并刷新用户权限配置 `达成权限或用户信息发生变更后立刻体现的效果，该操作对用户完全透明`
  - [x] 业务接口校验到无对应的权限时，返回固定地无权限提示。 前端接收到无权限提示后，更新权限信息然后重定向路由到首页。`达成权限变更后立刻体现的效果`
- [ ] 增加单元测试，在 CI/CD 流程中， 通过单元测试后再进行代码的编译及镜像的构建等操作
- [x] 增加 CodeQL 代码检查功能进行源码安全审查
- [ ] 将分散在 Statics ( 静态资源站 ) 中的页面重新整合; 减少需要维护的项目数量, 增强项目关联性与可维护性;  
       `目前不具备整合条件。 将上述页面整合入本项目后, 由于本项目采用单页面应用模式进行开发, 会导致需要使用某个特定功能时, 用户都需要加载整个单页面应用。既影响用户加载速度和使用体验, 也会造成没必要的流量浪费。`
- [ ] 重新设计权限分级管理功能, 目前应用的权限分级管理功能不够成熟 `简化操作流程`
  - [ ] 角色、权限集成逻辑基本不变
  - [ ] 上级角色可以查看下级角色全部的资源
  - [ ] 取消前端右上角的角色切换操作
- [ ] 增加群发模板消息功能 `待定，因为模板消息发送功能有可能会下线`

### 系统管理

- [x] 配置管理
- [x] 用户与角色管理

### 个人后缀

- [ ] 后缀管理
- [ ] CRM 组织管理
- [ ] 登陆模块 ( 为了保障数据的安全性, 会话管理需要单独进行权限管理, 所以不考虑使用嵌套表格或弹窗方案合并模块管理与会话管理 )
  - [ ] 模块管理
  - [ ] 会话管理
- [ ] 白皮书个人码生成
- [ ] 宣传物料管理
- [ ] 白皮书 CRM 推送 ( 也许可以用嵌套表格？ 把日志嵌套进任务 https://procomponents.ant.design/components/table/#%E5%B5%8C%E5%A5%97%E8%A1%A8%E6%A0%BC )
  - [ ] 任务管理
  - [ ] 日志管理

## 开发

1. 克隆本仓库到本地
1. 安装环境
   1. 安装 Node.js ( 10.0.0 以上 )
   1. 安装 yarn ( 或 npm )
1. 安装依赖
   1. 切换到代码根目录
   1. yarn install ( 或 npm i )
1. 开始开发
   1. 切换到代码根目录
   1. yarn start ( 启动开发服务 )

## 编译与部署

### Github Actions CI/CD ( 使用 Github Actions 进行持续继承与持续部署 )

1. fork 本仓库
1. 修改 GitHub Actions 配置
   1. 打开 Settings ( 仓库配置 )
   1. 打开 Secrets ( 密钥配置 )
   1. New repository secret ( 添加密钥 )
   1. TENCENT_CLOUD_SECRET_ID_OFFCN ( 腾讯云密钥 ID )
   1. TENCENT_CLOUD_SECRET_KEY_OFFCN ( 腾讯云密钥 KEY )
   1. TENCENT_CLOUD_BUCKET_NAME ( 对象存储的存储桶名称 )
1. 触发 Action
   1. 手动触发或进行任意提交触发

### 手动编译部署

1. 克隆本仓库到本地
1. 安装环境
   1. 安装 Node.js ( 10.0.0 以上 )
   1. 安装 yarn ( 或 npm )
1. 安装依赖
   1. 切换到代码根目录
   1. yarn install ( 或 npm i )
1. 编译 ( 构建 )
   1. 切换到代码根目录
   1. [ 构建测试环境 ] yarn build:test ( npm build:test )
   1. [ 构建生产环境 ] yarn build ( npm build )
1. 部署
   1. 在代码根目录找到 dist 文件夹
   1. 将文件夹内的内容拷贝到 web 环境的 /test/ 目录中 ( 测试环境 )
   1. 将文件夹内的内容拷贝到 web 环境的 / 目录中 ( 生产环境 )
