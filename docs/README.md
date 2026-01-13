# Frontend Documentation

Dokumentasi teknis untuk frontend application.

## 📚 Available Documentation

| Document | Description |
|----------|-------------|
| [DATATABLE.md](./DATATABLE.md) | Panduan lengkap penggunaan DataTable (Client-Side & Server-Side) |
| [HOOKS.md](./HOOKS.md) | Referensi untuk semua custom hooks |

## 🏗️ Architecture Overview

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── admin/              # Admin protected routes
│   │   ├── users/          # User management page
│   │   ├── roles/          # Role management page
│   │   ├── permissions/    # Permission management page
│   │   └── menus/          # Menu management page
│   ├── auth/               # Authentication pages
│   └── layout.tsx          # Root layout
│
├── components/             # Reusable UI components
│   ├── data-table/         # DataTable components
│   ├── modals/             # Modal components
│   ├── shared/             # Shared components (buttons, etc.)
│   └── ui/                 # shadcn/ui components
│
├── features/               # Feature-based modules
│   ├── users/              # User feature
│   │   ├── api/            # API functions
│   │   ├── components/     # Feature components
│   │   ├── hooks/          # Feature hooks
│   │   ├── stores/         # Zustand stores
│   │   ├── schemas/        # Zod validation schemas
│   │   └── types/          # TypeScript types
│   ├── roles/              # Role feature
│   └── permissions/        # Permission feature
│
├── hooks/                  # Global custom hooks
│   ├── use-data-table.ts
│   ├── use-server-search.ts
│   ├── use-debounced-value.ts
│   ├── use-debounced-callback.ts
│   └── use-permissions.ts
│
├── lib/                    # Utilities and configurations
│   ├── api/                # API client
│   └── utils.ts            # Utility functions
│
└── docs/                   # Documentation
    ├── README.md           # This file
    ├── DATATABLE.md        # DataTable documentation
    └── HOOKS.md            # Hooks documentation
```

## 🚀 Quick Start

### Running Development Server

```bash
cd frontend
npm run dev
```

### Type Checking

```bash
npm run type-check
# or
npx tsc --noEmit
```

### Linting

```bash
npm run lint
```

## 📖 Key Concepts

### Feature Module Structure

Setiap feature memiliki struktur yang konsisten:

```
features/[feature-name]/
├── api/                    # API calls
│   └── [name]-api.ts
├── components/             # Components specific to feature
│   ├── [name]-columns.tsx  # DataTable columns
│   └── [name]-form.tsx     # Form component
├── hooks/                  # Feature-specific hooks
│   ├── use-[name]-operations.ts  # CRUD operations
│   └── use-[name]-query.ts       # Server-side data fetching
├── stores/                 # Zustand stores
│   └── use-[name]-store.ts
├── schemas/                # Zod schemas
│   └── [name]-schema.ts
└── types/                  # TypeScript types
    └── index.ts
```

### Data Fetching Patterns

#### Client-Side (for small datasets)

```typescript
// Use Zustand store
const { data, fetchData } = useDataStore()

useEffect(() => {
  fetchData()
}, [])
```

#### Server-Side (for large datasets)

```typescript
// Use query hook
const { data, pagination, refetch } = useDataQuery()

// Fetch with pagination params
refetch({ page: 1, limit: 10, sort: "name:asc" })
```

See [DATATABLE.md](./DATATABLE.md) for complete examples.

## 🔗 Related Documentation

- [Backend README](../../backend/README.md) - Backend API documentation
- [Code Style Guide](../../code-style-guide.md) - Project coding conventions
