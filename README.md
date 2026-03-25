# 服务器监控平台

[English](./README_EN.md)

一个基于 Next.js 16 + shadcn/ui 构建的生产级服务器监控平台，支持 JWT 认证、明暗主题切换和实时系统指标监控。

## 功能特性

### 🔐 认证系统

- JWT Token 认证
- 安全的密码存储
- 会话管理（localStorage + Cookie）

### 📊 服务器监控

- **CPU 负载**：实时显示 1/5/15 分钟负载平均值
- **内存使用**：已用/总计/百分比
- **磁盘空间**：根分区使用情况
- **系统信息**：主机名、平台、运行时长

### 🎨 界面特色

- **可折叠侧边栏**：节省空间，便于专注内容
- **明暗主题**：一键切换，适配不同环境
- **响应式设计**：适配桌面和移动设备

### ⚙️ 用户设置

- 修改用户名和邮箱
- 修改密码

## 快速开始

### 环境要求

- Node.js 18+
- npm / pnpm / bun

### 配置

复制 `.env.example` 为 `.env`，根据需要修改以下变量：

```bash
cp .env.example .env
```

| 变量名           | 说明                             | 默认值                                           |
| ---------------- | -------------------------------- | ------------------------------------------------ |
| `JWT_SECRET`     | JWT 签名密钥（生产环境务必修改） | `your-super-secret-jwt-key-change-in-production` |
| `ADMIN_USERNAME` | 默认管理员用户名                 | `admin`                                          |
| `ADMIN_PASSWORD` | 默认管理员密码                   | `admin123`                                       |
| `ADMIN_EMAIL`    | 默认管理员邮箱                   | `admin@example.com`                              |

### 安装运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

访问 `http://localhost:3000`，使用默认账号登录：

- **用户名**: admin
- **密码**: admin123

### 验证代码

```bash
# 类型检查
npm run typecheck

# ESLint 检查
npm run lint

# 格式化代码
npm run format
```

## 项目文档

详细的开发指南请参阅：[开发文档](./docs/DEVELOPMENT.md)

文档包含：

- 项目架构介绍
- 认证系统说明
- 新页面/功能开发指导
- 组件使用规范

## 技术栈

| 技术         | 用途      |
| ------------ | --------- |
| Next.js 16   | 框架      |
| shadcn/ui    | UI 组件库 |
| TypeScript   | 类型安全  |
| Tailwind CSS | 样式      |
| jose         | JWT 认证  |
| next-themes  | 主题管理  |

## 目录结构

```
hako/
├── app/                # Next.js App Router
│   ├── (dashboard)/    # 受保护的仪表板页面
│   │   └── system/     # 系统模块（监控、设置）
│   ├── api/            # API 路由
│   └── login/          # 登录页面
├── components/         # React 组件
│   └── ui/            # shadcn/ui 组件
├── lib/                # 工具函数
├── types/              # TypeScript 类型
└── data/               # JSON 数据存储
```

## License

MIT
