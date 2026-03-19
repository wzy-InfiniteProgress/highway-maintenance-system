# 高速公路机电维护管理系统

## 项目概述

本系统是一个专业的高速公路机电设备维护管理平台，提供设备档案管理、维护计划管理、故障知识库、维护心得分享等功能。

## 技术栈

### 前端
- **框架**: Next.js 16 (App Router)
- **UI 库**: Ant Design 5
- **富文本编辑器**: TipTap
- **样式**: Tailwind CSS
- **图表**: @ant-design/charts

### 后端
- **框架**: Next.js API Routes
- **数据库**: SQLite (better-sqlite3)
- **认证**: JWT + bcryptjs

### 移动端
- **跨平台**: Capacitor
- **目标平台**: Android

## 项目结构

```
highway-maintenance-system/
├── app/                          # Next.js App Router 目录
│   ├── api/                      # API 路由
│   │   ├── auth/                 # 认证相关 API
│   │   │   ├── login/           # 登录
│   │   │   ├── logout/          # 登出
│   │   │   └── me/              # 获取当前用户
│   │   ├── equipment/            # 设备管理 API
│   │   ├── maintenance-plan/    # 维护计划 API
│   │   ├── knowledge-base/       # 知识库 API
│   │   ├── posts/               # 维护心得 API
│   │   ├── users/               # 用户管理 API
│   │   └── stats/               # 统计 API
│   │
│   ├── dashboard/                # 数据统计页面
│   ├── equipment/              # 设备档案页面
│   ├── knowledge-base/          # 故障知识库页面
│   ├── maintenance-plan/        # 维护计划页面
│   ├── posts/                  # 维护心得页面
│   │   ├── [id]/               # 帖子详情
│   │   │   └── edit/           # 编辑帖子
│   │   └── new/                # 新建帖子
│   ├── users/                  # 用户管理页面
│   ├── login/                  # 登录页面
│   └── layout.tsx              # 根布局
│
├── components/                  # React 组件
│   ├── Layout/                 # 布局组件
│   │   └── MainLayout.tsx      # 主布局（含导航）
│   └── RichTextEditor.tsx       # 富文本编辑器
│
├── lib/                         # 工具库
│   ├── db.ts                   # 数据库操作封装
│   ├── auth.ts                # 认证工具（密码加密）
│   └── jwt.ts                 # JWT 工具
│
├── prisma/                      # 数据库相关
│   ├── schema.prisma           # Prisma 数据模型
│   ├── dev.db                  # SQLite 数据库文件
│   └── seed.ts                 # 数据种子脚本
│
├── public/                     # 静态资源
│   ├── manifest.json           # PWA 配置
│   ├── sw.js                   # Service Worker
│   └── icons/                  # 应用图标
│
├── android/                    # Android 原生项目
│   └── app/                   # Capacitor Android 应用
│
├── .env.local                  # 环境变量
└── capacitor.config.ts        # Capacitor 配置
```

## 功能模块

### 1. 用户认证
- 用户登录/登出
- JWT Token 认证
- 角色权限控制（管理员/普通用户）

### 2. 数据统计仪表板
- 关键指标卡片（设备数、计划数、故障数、帖子数）
- 设备状态分布图表
- 维护计划到期提醒
- 最新故障记录

### 3. 设备档案管理
- 设备 CRUD 操作
- 按状态/部门筛选
- CSV 导出/导入
- IP 地址管理

### 4. 维护计划管理
- 计划 CRUD 操作
- 关联设备和负责人
- 计划类型（每日/每周/每月/每年）
- 状态管理（待执行/执行中/已完成）

### 5. 故障知识库
- 知识库条目 CRUD
- 故障现象/原因/解决方案（富文本）
- 分类和标签管理
- 全文搜索

### 6. 维护心得
- 心得文章 CRUD
- 富文本编辑（加粗、斜体、图片、链接等）
- 分类和标签
- 浏览量统计

### 7. 移动端支持
- PWA 配置
- 响应式布局
- 移动端底部导航
- Android APK 打包

## 数据库表结构

### User (用户表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | STRING | 用户ID |
| username | STRING | 用户名 |
| email | STRING | 邮箱 |
| password | STRING | 密码（加密） |
| role | STRING | 角色：admin/user |
| department | STRING | 部门 |
| isActive | INT | 是否激活 |
| createdAt | STRING | 创建时间 |
| updatedAt | STRING | 更新时间 |

### Equipment (设备表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | STRING | 设备ID |
| name | STRING | 设备名称 |
| model | STRING | 型号 |
| manufacturer | STRING | 制造商 |
| installDate | STRING | 安装日期 |
| location | STRING | 安装位置 |
| department | STRING | 所属部门 |
| status | STRING | 状态 |
| ip | STRING | IP地址 |
| createdAt | STRING | 创建时间 |
| updatedAt | STRING | 更新时间 |

### MaintenancePlan (维护计划表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | STRING | 计划ID |
| equipmentId | STRING | 关联设备ID |
| title | STRING | 计划标题 |
| description | STRING | 描述 |
| scheduleType | STRING | 类型：daily/weekly/monthly/yearly |
| nextMaintenanceDate | STRING | 下次维护日期 |
| assigneeId | STRING | 负责人ID |
| status | STRING | 状态 |
| createdAt | STRING | 创建时间 |
| updatedAt | STRING | 更新时间 |

### FaultRecord (故障记录表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | STRING | 故障ID |
| equipmentId | STRING | 关联设备ID |
| title | STRING | 故障标题 |
| symptoms | STRING | 故障现象 |
| causes | STRING | 故障原因 |
| solutions | STRING | 解决方案 |
| faultDate | STRING | 故障日期 |
| resolvedDate | STRING | 解决日期 |
| status | STRING | 状态 |
| createdAt | STRING | 创建时间 |
| updatedAt | STRING | 更新时间 |

### KnowledgeBase (知识库表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | STRING | 知识库ID |
| title | STRING | 标题 |
| symptoms | STRING | 故障现象 |
| causes | STRING | 故障原因 |
| solutions | STRING | 解决方案 |
| attachments | STRING | 附件 |
| tags | STRING | 标签（JSON） |
| category | STRING | 分类 |
| authorId | STRING | 作者ID |
| createdAt | STRING | 创建时间 |
| updatedAt | STRING | 更新时间 |

### Post (维护心得表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | STRING | 帖子ID |
| title | STRING | 标题 |
| content | STRING | 内容（富文本HTML） |
| category | STRING | 分类 |
| tags | STRING | 标签（JSON） |
| authorId | STRING | 作者ID |
| isPublic | INT | 是否公开 |
| views | INT | 浏览次数 |
| createdAt | STRING | 创建时间 |
| updatedAt | STRING | 更新时间 |

## API 接口

### 认证接口
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/me` - 获取当前用户

### 业务接口
- `GET/POST /api/equipment` - 设备列表/创建设备
- `GET/PUT/DELETE /api/equipment/[id]` - 设备详情/更新/删除
- `GET/POST /api/maintenance-plan` - 维护计划列表/创建
- `GET/PUT/DELETE /api/maintenance-plan/[id]` - 计划详情/更新/删除
- `GET/POST /api/knowledge-base` - 知识库列表/创建
- `GET/PUT/DELETE /api/knowledge-base/[id]` - 知识库详情/更新/删除
- `GET/POST /api/posts` - 心得列表/创建
- `GET/PUT/DELETE /api/posts/[id]` - 心得详情/更新/删除
- `GET /api/stats` - 统计数据

## 部署说明

### 前端部署 (Vercel)
1. 将代码推送到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量
4. 部署

### 数据库部署 (Supabase)
1. 创建 Supabase 项目
2. 使用 SQL 创建表结构
3. 获取连接 URL
4. 更新环境变量

### Android APK
1. 构建：`npm run build`
2. 同步：`npx cap sync android`
3. 打包：`cd android && ./gradlew assembleDebug`
4. APK 位置：`android/app/build/outputs/apk/debug/app-debug.apk`

## 环境变量

```env
# 数据库
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="your-64-char-secret-key"
JWT_EXPIRES_IN="7d"

# 应用
NEXT_PUBLIC_APP_NAME="高速公路机电维护管理系统"
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
```

## 开发指南

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 同步 Capacitor
```bash
npx cap sync android
```

### Android Studio 打开项目
```bash
open android
```

## 默认账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 管理员 |
| user1 | user123 | 普通用户 |

## 许可证

MIT License
