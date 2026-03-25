# AI Agent Guide

This document provides guidance for AI agents working on this codebase.

## ⚠️ Before Starting - Read These First

**IMPORTANT**: You MUST read the following skills before making any changes:

| Skill                   | Path                                          | Why Read                                                              |
| ----------------------- | --------------------------------------------- | --------------------------------------------------------------------- |
| **shadcn**              | `.agents/skills/shadcn/SKILL.md`              | Component patterns, styling rules, form guidelines, composition rules |
| **next-best-practices** | `.agents/skills/next-best-practices/SKILL.md` | File conventions, RSC boundaries, async patterns, route handlers      |

### Quick Reference from Skills

**shadcn rules to follow:**

- Use `cn()` for conditional classes
- Components follow `CardHeader/CardTitle/CardContent` structure
- NO raw color overrides (e.g., `bg-blue-500`) - use semantic tokens
- Forms use `FieldGroup` + `Field` pattern

**Next.js rules to follow:**

- Next.js 16+ uses `proxy.ts` (NOT `middleware.ts`)
- Client components need `'use client'` directive
- Route groups use parentheses: `(dashboard)`

## Start Here

After reading the skills above, read the [Development Documentation](./docs/DEVELOPMENT.md) for complete context on:

- Project structure and architecture
- Authentication system (JWT + proxy.ts)
- How to add new pages and API routes
- Type definitions and data flow

## Key Principles

### 1. Follow Existing Patterns

This project uses:

- **Next.js 16 App Router** with route groups `(dashboard)`
- **shadcn/ui** components - check `components.json` for installed components
- **JWT authentication** via `proxy.ts` (Next.js 16+ middleware)
- **JSON file storage** in `data/users.json`

### 2. Authentication Flow

```
User Login → POST /api/auth → JWT Token → localStorage + cookie
                                       ↓
Protected Routes → proxy.ts → verifyJWT → Allow/Deny
```

Never expose passwords in API responses. Always use `UserWithoutPassword` type.

### 3. Type Safety

- All shared types are in `types/index.ts`
- Import types using: `import type { ... } from '@/types'`
- Don't redefine types in component files

### 4. Component Guidelines

When adding new components:

1. Use shadcn/ui components first: `npx shadcn@latest add <component>`
2. Follow shadcn patterns (CardHeader/CardTitle/CardContent for cards)
3. Use semantic colors: `bg-background`, `text-muted-foreground`
4. Use `cn()` utility for conditional classes

### 5. Sidebar Navigation

When adding new pages:

1. Add route to `app/(dashboard)/<module>/<page>/page.tsx`
2. Add navigation item to `components/app-sidebar.tsx` in `navGroups`
3. Update `proxy.ts` matcher if the page needs protection

## Common Tasks

### Add a new page

See [docs/DEVELOPMENT.md - Section 4](./docs/DEVELOPMENT.md#4-新页面开发指导)

### Add a new API route

See [docs/DEVELOPMENT.md - Section 4.2](./docs/DEVELOPMENT.md#42-创建新的-api-路由)

### Add a new shadcn component

```bash
npx shadcn@latest add <component-name>
```

### Run validation

```bash
npm run typecheck && npm run lint && npm run build
```

## File Quick Reference

| File                           | Purpose                          |
| ------------------------------ | -------------------------------- |
| `proxy.ts`                     | Route protection, auth redirects |
| `lib/auth.ts`                  | JWT sign/verify                  |
| `lib/db.ts`                    | User CRUD operations             |
| `components/auth-provider.tsx` | React Context for auth state     |
| `components/app-sidebar.tsx`   | Collapsible sidebar with nav     |
| `types/index.ts`               | Shared TypeScript types          |

## Verification Checklist

Before completing any task, ensure:

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] New pages/routes follow existing patterns
- [ ] Types are imported from `@/types`, not redefined
- [ ] Protected routes are added to `proxy.ts` matcher
- [ ] Sidebar navigation is updated if adding pages
- [ ] **Documentation is updated** (if applicable):
  - [ ] `docs/DEVELOPMENT.md` - New pages, API routes, features
  - [ ] `README.md` / `README_EN.md` - New features or configuration changes
  - [ ] `AGENTS.md` - If adding new development patterns or conventions
