# 项目开发文档

## 0. 开发前必读

在开始任何开发工作之前，AI Agent 必须阅读以下 skills 以确保遵循最佳实践：

### 必须阅读

| Skill                   | 说明                                                     | 路径                                          |
| ----------------------- | -------------------------------------------------------- | --------------------------------------------- |
| **shadcn**              | shadcn/ui 组件使用规范、样式指南、表单规范、组件组合规则 | `.agents/skills/shadcn/SKILL.md`              |
| **next-best-practices** | Next.js 文件约定、RSC 边界、异步模式、错误处理、路由规范 | `.agents/skills/next-best-practices/SKILL.md` |

### 关键规则摘要

**shadcn 规范**:

- 使用 `cn()` 工具处理条件类名
- 组件结构遵循 `CardHeader/CardTitle/CardContent` 模式
- 禁止在组件上覆盖颜色或使用 raw color（如 `bg-blue-500`）
- 图标使用 `data-icon` 属性或直接传入
- 表单使用 `FieldGroup` + `Field` 模式

**Next.js 规范**:

- Next.js 16+ 使用 `proxy.ts` 替代 `middleware.ts`
- 路由使用 route groups `(dashboard)` 组织
- 客户端组件使用 `'use client'` 指令
- API 路由返回 `NextResponse`

### 开发前检查清单

- [ ] 已阅读 `.agents/skills/shadcn/SKILL.md`
- [ ] 已阅读 `.agents/skills/next-best-practices/SKILL.md`
- [ ] 了解项目使用的 shadcn 风格（`radix-nova`）和基础库（`radix`）
- [ ] 确认组件已安装：`npx shadcn@latest info`

### 完成后检查清单

- [ ] `npm run typecheck` 通过
- [ ] `npm run lint` 通过
- [ ] `npm run test` 通过（单元测试）
- [ ] `npm run test:e2e` 通过（E2E 测试）
- [ ] `npm run build` 成功

---

## 1. 项目环境介绍

### 1.1 技术栈

- **框架**: Next.js 16.1.7 (App Router + Turbopack)
- **UI 组件库**: shadcn/ui (radix-nova 风格)
- **语言**: TypeScript 5.9.3
- **样式**: Tailwind CSS v4 + tw-animate-css
- **图标**: Lucide React
- **认证**: JWT (jose)
- **状态管理**: React Context + localStorage
- **数据存储**: JSON 文件 (data/users.json)

### 1.2 环境变量

| 变量名           | 说明             | 默认值                                           |
| ---------------- | ---------------- | ------------------------------------------------ |
| `JWT_SECRET`     | JWT 签名密钥     | `your-super-secret-jwt-key-change-in-production` |
| `ADMIN_USERNAME` | 默认管理员用户名 | `admin`                                          |
| `ADMIN_PASSWORD` | 默认管理员密码   | `admin123`                                       |
| `ADMIN_EMAIL`    | 默认管理员邮箱   | `admin@example.com`                              |

### 1.3 默认用户

默认用户在首次启动时从环境变量读取，若未设置则使用默认值。用户在 `data/users.json` 中持久化存储。

---

## 2. 项目目录结构

```
hako/
├── app/                          # Next.js App Router
│   ├── (dashboard)/               # 路由组 - 需要认证的页面
│   │   ├── layout.tsx            # 仪表板布局
│   │   ├── system/               # 系统模块
│   │   │   ├── monitor/          # 监控页面
│   │   │   │   └── page.tsx
│   │   │   └── setting/          # 设置页面
│   │   │       └── page.tsx
│   ├── api/                      # API 路由
│   │   ├── auth/route.ts         # 认证 API
│   │   ├── monitoring/route.ts   # 系统监控 API
│   │   └── user/route.ts         # 用户管理 API
│   ├── login/                    # 登录页面
│   │   └── page.tsx
│   ├── globals.css               # 全局样式
│   ├── layout.tsx                # 根布局
│   └── page.tsx                  # 首页 (重定向)
├── components/                   # React 组件
│   ├── ui/                       # shadcn/ui 组件
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── collapsible.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── switch.tsx
│   │   └── ... (其他 shadcn 组件)
│   ├── app-sidebar.tsx           # 应用侧边栏
│   ├── auth-provider.tsx          # 认证上下文提供者
│   ├── dashboard-layout.tsx       # 仪表板布局组件
│   ├── login-form.tsx             # 登录表单
│   ├── monitoring-page.tsx        # 监控页面组件
│   ├── settings-page.tsx          # 设置页面组件
│   └── theme-provider.tsx         # 主题提供者
├── lib/                          # 工具库
│   ├── auth.ts                   # JWT 认证工具
│   ├── db.ts                     # 用户数据操作
│   └── utils.ts                  # 通用工具函数 (cn)
├── types/                        # TypeScript 类型定义
│   └── index.ts                  # 共享类型
├── data/                         # 数据存储
│   └── users.json                # 用户数据
├── proxy.ts                      # Next.js 16+ 路由代理/中间件
├── components.json               # shadcn/ui 配置
└── package.json
```

---

## 3. 项目架构介绍

### 3.1 认证架构

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Login     │ ──► │  Auth API   │ ──► │   JWT       │
│   Form      │     │  /api/auth  │     │  Token      │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                              ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Dashboard │ ◄── │  proxy.ts   │ ◄── │ localStorage│
│   Pages     │     │ (Middleware)│     │             │
└─────────────┘     └─────────────┘     └─────────────┘
```

**认证流程**:

1. 用户访问 `/login` 页面，输入用户名密码
2. 调用 `POST /api/auth` 验证并获取 JWT token
3. Token 存储在 `localStorage` 和 cookie 中
4. `proxy.ts` 拦截所有 `/system/*` 和 `/api/*` 请求
5. 验证 Token 有效性，无效或缺失则重定向到 `/login`

### 3.2 侧边栏导航结构

```
┌────────────────────────────────────┐
│  [Logo] Admin         [Collapse]  │  <- Header
├────────────────────────────────────┤
│  ▼ System (可折叠)                  │
│    ├─ Monitor                      │
│    └─ Setting                      │
│                                    │
│  (其他导航项...)                    │
├────────────────────────────────────┤
│  [Theme Toggle]                    │  <- Footer
│  [Avatar] Username    [Logout]     │
└────────────────────────────────────┘
```

### 3.3 数据流

```
用户操作 → React Component → API Route → lib/db.ts → users.json
                ↑                                    │
                └──────────── Response ──────────────┘
```

---

## 4. 新页面开发指导

### 4.1 创建新页面

**示例：创建 `/system/example` 页面**

1. **创建页面文件**:

```bash
mkdir -p app/(dashboard)/system/example
```

2. **编写页面组件** (`app/(dashboard)/system/example/page.tsx`):

```tsx
import { ExamplePage } from "@/components/example-page"

export default function Page() {
  return <ExamplePage />
}
```

3. **创建组件** (`components/example-page.tsx`):

```tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ExamplePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Example</h1>
        <p className="text-muted-foreground">Example page description</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Example Card</CardTitle>
        </CardHeader>
        <CardContent>{/* Your content here */}</CardContent>
      </Card>
    </div>
  )
}
```

4. **添加侧边栏导航** (`components/app-sidebar.tsx`):

在 `navGroups` 中添加新项:

```tsx
const navGroups: NavGroup[] = [
  {
    title: "System",
    icon: Monitor,
    items: [
      { title: "Monitor", href: "/system/monitor", icon: Activity },
      { title: "Setting", href: "/system/setting", icon: Settings },
      { title: "Example", href: "/system/example", icon: ExampleIcon }, // 新增
    ],
  },
]
```

5. **更新 proxy.ts 的 matcher** (如果需要 API 保护):

```tsx
export const proxyConfig = {
  matcher: [
    "/",
    "/system/:path*",
    "/login",
    "/api/monitoring/:path*",
    "/api/user/:path*",
    "/api/example/:path*", // 新增
  ],
}
```

### 4.2 创建新的 API 路由

**示例：创建 `/api/example` 端点**

1. **创建目录**: `mkdir -p app/api/example`

2. **编写 API 路由** (`app/api/example/route.ts`):

```tsx
import { NextResponse } from "next/server"
import { verifyJWT } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    // 验证认证
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // 业务逻辑
    const data = { message: "Hello" }
    return NextResponse.json(data)
  } catch (error) {
    console.error("Example API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
```

### 4.3 创建新的数据类型

在 `types/index.ts` 中添加:

```tsx
export interface NewType {
  id: string
  // ... fields
}
```

### 4.4 添加新的 shadcn/ui 组件

```bash
npx shadcn@latest add <component-name>
```

常用组件:

- `button`, `card`, `input`, `label` - 基础组件
- `switch`, `toggle` - 开关组件
- `badge`, `avatar` - 展示组件
- `tooltip`, `dialog`, `sheet` - 浮层组件
- `collapsible` - 可折叠组件
- `separator`, `skeleton` - 辅助组件

---

## 5. 重要文件说明

| 文件                           | 说明                                         |
| ------------------------------ | -------------------------------------------- |
| `proxy.ts`                     | Next.js 16+ 中间件，负责路由保护和认证重定向 |
| `lib/auth.ts`                  | JWT 签名、验证工具                           |
| `lib/db.ts`                    | 用户数据读写（JSON 文件）                    |
| `components/auth-provider.tsx` | React Context，提供全局认证状态              |
| `components/app-sidebar.tsx`   | 可折叠侧边栏，包含导航和用户信息             |

---

## 6. 开发命令

```bash
# 开发服务器
npm run dev

# 类型检查
npm run typecheck

# ESLint 检查
npm run lint

# 格式化代码
npm run format

# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 单元测试 (Vitest)
npm run test

# 单元测试 - 监视模式
npm run test:watch

# E2E 测试 (Playwright)
npm run test:e2e

# E2E 测试 - UI 模式
npm run test:e2e:ui
```

---

## 6.1 测试指南

### 测试文件位置

- **单元测试**: `lib/__tests__/*.test.ts` - 工具函数和库的测试
- **API 测试**: `app/api/*/__tests__/route.test.ts` - API 路由的测试
- **E2E 测试**: `e2e/*.spec.ts` - 端到端测试

### 测试配置

- **Vitest**: `vitest.config.ts` - 单元测试配置
- **Playwright**: `playwright.config.ts` - E2E 测试配置

### 编写新测试

**单元测试示例** (`lib/__tests__/example.test.ts`):

```tsx
import { describe, it, expect } from "vitest"

describe("example", () => {
  it("should do something", () => {
    expect(true).toBe(true)
  })
})
```

**E2E 测试示例** (`e2e/example.spec.ts`):

```tsx
import { test, expect } from "@playwright/test"

test("example flow", async ({ page }) => {
  await page.goto("/login")
  await expect(page.getByText("Welcome back")).toBeVisible()
})
```

---

## 7. 注意事项

1. **认证**: 所有 `/system/*` 页面需要通过 `proxy.ts` 保护，确保用户已登录
2. **类型**: 自定义类型定义在 `types/index.ts`，组件使用 `import type { ... } from '@/types'`
3. **主题**: 使用 `useTheme()` from `next-themes`，主题切换按钮已集成在侧边栏
4. **样式**: 遵循 shadcn/ui 规范，使用语义化颜色如 `bg-background`、`text-muted-foreground`
5. **组件**: 优先使用 shadcn/ui 组件，参考 `components.json` 中的配置

---

## 8. 路由清单

| 路径              | 说明                       | 认证 |
| ----------------- | -------------------------- | ---- |
| `/`               | 重定向到 `/system/monitor` | 是   |
| `/login`          | 登录页面                   | 否   |
| `/system/monitor` | 服务器监控                 | 是   |
| `/system/setting` | 用户设置                   | 是   |
| `/api/auth`       | 认证 API                   | 否   |
| `/api/monitoring` | 监控数据 API               | 是   |
| `/api/user`       | 用户管理 API               | 是   |
