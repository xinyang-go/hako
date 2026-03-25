# Server Monitoring Platform

[中文](./README.md)

A production-ready server monitoring platform built with Next.js 16 + shadcn/ui, featuring JWT authentication, light/dark theme switching, and real-time system metrics monitoring.

## Features

### 🔐 Authentication

- JWT Token authentication
- Secure password storage
- Session management (localStorage + Cookie)

### 📊 Server Monitoring

- **CPU Load**: Real-time 1/5/15 minute load averages
- **Memory Usage**: Used/Total/Percentage
- **Disk Space**: Root partition usage
- **System Info**: Hostname, Platform, Uptime

### 🎨 Interface

- **Collapsible Sidebar**: Save space, focus on content
- **Light/Dark Theme**: One-click toggle
- **Responsive Design**: Desktop and mobile friendly

### ⚙️ User Settings

- Update username and email
- Change password

## Quick Start

### Requirements

- Node.js 18+
- npm / pnpm / bun

### Configuration

Copy `.env.example` to `.env` and modify variables as needed:

```bash
cp .env.example .env
```

| Variable         | Description                                    | Default                                          |
| ---------------- | ---------------------------------------------- | ------------------------------------------------ |
| `JWT_SECRET`     | JWT signing secret (must change in production) | `your-super-secret-jwt-key-change-in-production` |
| `ADMIN_USERNAME` | Default admin username                         | `admin`                                          |
| `ADMIN_PASSWORD` | Default admin password                         | `admin123`                                       |
| `ADMIN_EMAIL`    | Default admin email                            | `admin@example.com`                              |

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit `http://localhost:3000` and login with default credentials:

- **Username**: admin
- **Password**: admin123

### Validate Code

```bash
# Type check
npm run typecheck

# ESLint check
npm run lint

# Format code
npm run format
```

## Documentation

For detailed development guides, please refer to: [Development Documentation](./docs/DEVELOPMENT.md)

The documentation includes:

- Project architecture overview
- Authentication system explanation
- New page/feature development guide
- Component usage standards

## Tech Stack

| Tech         | Purpose          |
| ------------ | ---------------- |
| Next.js 16   | Framework        |
| shadcn/ui    | UI Components    |
| TypeScript   | Type Safety      |
| Tailwind CSS | Styling          |
| jose         | JWT Auth         |
| next-themes  | Theme Management |

## Project Structure

```
hako/
├── app/                # Next.js App Router
│   ├── (dashboard)/    # Protected dashboard pages
│   │   └── system/     # System module (monitoring, settings)
│   ├── api/            # API routes
│   └── login/          # Login page
├── components/         # React components
│   └── ui/            # shadcn/ui components
├── lib/                # Utility functions
├── types/              # TypeScript types
└── data/               # JSON data storage
```

## License

MIT
