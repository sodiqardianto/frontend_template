# Frontend Template

A modern Next.js admin dashboard template with authentication, role-based access control, and dynamic menu management.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI, shadcn/ui
- **State Management:** Zustand
- **Form Handling:** React Hook Form + Zod
- **Data Table:** TanStack Table
- **Drag & Drop:** dnd-kit

## Features

- Authentication (Login/Register)
- Role-based access control (RBAC)
- Dynamic menu management with drag & drop reorder
- User management
- Permission management
- Responsive sidebar with collapsible menus
- Dark/Light mode support

## Getting Started

### Prerequisites

- Node.js 22+
- Docker & Docker Compose (optional)

### Backend

This project requires a backend API. Use the companion backend template:

👉 **[backend_template](https://github.com/sodiqardianto/backend_template)**

### Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3010/api
NEXT_PUBLIC_APP_NAME=Frontend Template
```

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Docker

### Development (with hot reload)

```bash
# Setup override file
cp docker-compose.override.yml.example docker-compose.override.yml

# Run
docker compose up -d --build
```

Access: `http://localhost:3011`

### Production (local test)

```bash
# Stop development first
docker compose down

# Run production
docker compose -f docker-compose.yml up -d --build
```

Access: `http://localhost:3000`

### Production (deployment)

For production deployment, remove `ports` mapping in `docker-compose.yml` and use `expose` only. Configure reverse proxy (nginx/traefik) to handle external traffic.

## Project Structure

```
├── app/                  # Next.js App Router pages
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (shadcn)
│   ├── data-table/      # Data table components
│   ├── modals/          # Modal components
│   └── shared/          # Shared components
├── features/            # Feature modules
│   ├── auth/            # Authentication
│   ├── menus/           # Menu management
│   ├── users/           # User management
│   ├── roles/           # Role management
│   └── permissions/     # Permission management
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and API client
└── types/               # TypeScript types
```

## License

MIT
