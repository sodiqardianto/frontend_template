# DataTable Documentation

Panduan penggunaan DataTable dengan dua mode: **Client-Side** dan **Server-Side**.

## 📋 Table of Contents

- [Overview](#overview)
- [Client-Side DataTable](#client-side-datatable)
- [Server-Side DataTable](#server-side-datatable)
- [Hooks Reference](#hooks-reference)
- [Best Practices](#best-practices)

---

## Overview

DataTable di project ini menggunakan **TanStack Table** dengan wrapper `useDataTable` hook. Ada dua pendekatan:

| Mode | Best For | Data Fetch | Sorting/Filtering/Pagination |
|------|----------|------------|------------------------------|
| **Client-Side** | < 1000 records | Sekali saat mount | Di browser (JavaScript) |
| **Server-Side** | > 1000 records | Setiap perubahan state | Di database (SQL) |

---

## Client-Side DataTable

### Kapan Menggunakan

- Dataset kecil (< 1000 records)
- Data jarang berubah
- Butuh navigasi instant tanpa loading

### Implementasi

#### 1. API Function (Simple Response)

```typescript
// features/permissions/api/permission-api.ts
export const getPermissions = async (): Promise<Permission[]> => {
  const response = await api.get<{ data: Permission[] }>("/permissions")
  return response.data
}
```

#### 2. Zustand Store

```typescript
// features/permissions/stores/use-permission-store.ts
import { create } from "zustand"
import { getPermissions } from "../api/permission-api"

interface PermissionStore {
  permissions: Permission[]
  isLoading: boolean
  error: string | null
  hasFetched: boolean
  fetchPermissions: (force?: boolean) => Promise<void>
}

export const usePermissionStore = create<PermissionStore>((set, get) => ({
  permissions: [],
  isLoading: false,
  error: null,
  hasFetched: false,
  fetchPermissions: async (force = false) => {
    if (get().hasFetched && !force) return
    
    set({ isLoading: true, error: null })
    try {
      const permissions = await getPermissions()
      set({ permissions, isLoading: false, hasFetched: true })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },
}))
```

#### 3. Page Component

```tsx
// app/admin/permissions/page.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { usePermissionStore } from "@/features/permissions/stores/use-permission-store"
import { useDataTable } from "@/hooks/use-data-table"

function PermissionsContent() {
  const { permissions, isLoading, fetchPermissions } = usePermissionStore()
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchPermissions()
  }, [fetchPermissions])

  // Client-side filtering
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return permissions
    const query = searchQuery.toLowerCase()
    return permissions.filter((p) => p.name.toLowerCase().includes(query))
  }, [searchQuery, permissions])

  const { table } = useDataTable({
    data: filteredData,
    columns,
    pageCount: -1,                  // Unknown/dynamic
    manualPagination: false,        // ❌ Client handles pagination
    manualSorting: false,           // ❌ Client handles sorting
    manualFiltering: false,         // ❌ Client handles filtering
    initialState: {
      sorting: [{ id: "name", desc: false }],
      pagination: { pageSize: 10, pageIndex: 0 },
    },
  })

  return (
    <DataTable table={table}>
      <DataTableAdvancedToolbar table={table}>
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search..."
        />
      </DataTableAdvancedToolbar>
    </DataTable>
  )
}
```

### Flow Diagram (Client-Side)

```
[Initial Load]
     │
     ▼
GET /api/permissions ──────► Returns ALL data
     │
     ▼
[Zustand Store] ◄──────────► permissions[] (cached)
     │
     ▼
[useMemo Filter] ─────────► filteredData[]
     │
     ▼
[TanStack Table] ─────────► Sorted, Paginated (in-memory)
     │
     ▼
[Rendered UI]
```

---

## Server-Side DataTable

### Kapan Menggunakan

- Dataset besar (> 1000 records)
- Butuh real-time data
- Filter kompleks di database lebih efisien

### Implementasi

#### 1. Backend: Validation Schema

```typescript
// backend/src/features/users/user.validation.ts
export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sort: z.string().optional(),     // format: "field:asc" or "field:desc"
  search: z.string().optional(),
  isActive: z.enum(["true", "false"]).optional(),
})

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>
```

#### 2. Backend: Repository

```typescript
// backend/src/features/users/user.repository.ts
export interface PaginatedResult<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface FindAllPaginatedOptions {
  page: number
  limit: number
  sort?: { field: string; order: "asc" | "desc" }
  search?: string
  isActive?: boolean
}

async findAllPaginated(options: FindAllPaginatedOptions): Promise<PaginatedResult<UserWithRoles>> {
  const { page, limit, sort, search, isActive } = options
  const skip = (page - 1) * limit

  const where: Prisma.UserWhereInput = { deletedAt: null }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ]
  }
  
  if (isActive !== undefined) {
    where.isActive = isActive
  }

  const [data, total] = await Promise.all([
    prisma.user.findMany({ where, orderBy, skip, take: limit, include: {...} }),
    prisma.user.count({ where }),
  ])

  return {
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}
```

#### 3. Backend: Controller

```typescript
// backend/src/features/users/user.controller.ts
getAll = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListUsersQuery

  let sort: { field: string; order: "asc" | "desc" } | undefined
  if (query.sort) {
    const [field, order] = query.sort.split(":")
    sort = { field, order: order as "asc" | "desc" }
  }

  const result = await userService.getAllUsersPaginated({
    page: query.page ?? 1,
    limit: query.limit ?? 10,
    sort,
    search: query.search,
    isActive: query.isActive === "true" ? true : query.isActive === "false" ? false : undefined,
  })

  ApiResponse.paginated(res, result.data, {
    page: result.meta.page,
    pageSize: result.meta.limit,
    total: result.meta.total,
  }, "Users retrieved successfully")
})
```

#### 4. Frontend: API Function

```typescript
// frontend/features/users/api/user-api.ts
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface GetUsersParams {
  page?: number
  limit?: number
  sort?: string      // "field:asc" or "field:desc"
  search?: string
  isActive?: boolean
}

export const getUsers = async (params?: GetUsersParams): Promise<PaginatedResponse<User>> => {
  const searchParams = new URLSearchParams()

  if (params?.page) searchParams.set("page", params.page.toString())
  if (params?.limit) searchParams.set("limit", params.limit.toString())
  if (params?.sort) searchParams.set("sort", params.sort)
  if (params?.search) searchParams.set("search", params.search)
  if (params?.isActive !== undefined) searchParams.set("isActive", params.isActive.toString())

  const query = searchParams.toString()
  const url = `/users${query ? `?${query}` : ""}`

  return await api.get<PaginatedResponse<User>>(url)
}
```

#### 5. Frontend: Query Hook

```typescript
// frontend/features/users/hooks/use-users-query.ts
import { useState, useCallback } from "react"
import { getUsers, type GetUsersParams, type PaginatedResponse } from "../api/user-api"

export function useUsersQuery() {
  const [data, setData] = useState<User[]>([])
  const [pagination, setPagination] = useState<PaginatedResponse<User>["pagination"] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async (params?: GetUsersParams) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await getUsers(params)
      setData(response.data)
      setPagination(response.pagination)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { data, pagination, isLoading, error, refetch }
}
```

#### 6. Frontend: Page Component

```tsx
// frontend/app/admin/users/page.tsx
"use client"

import { useEffect, useState, useCallback } from "react"
import { useUsersQuery } from "@/features/users/hooks/use-users-query"
import { useServerSearch } from "@/hooks/use-server-search"
import { useDataTable } from "@/hooks/use-data-table"

function UsersContent() {
  const { data: users, pagination, isLoading, refetch } = useUsersQuery()
  
  // Server-side state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortField, setSortField] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Debounced search
  const { searchValue, handleSearchChange, debouncedValue } = useServerSearch(
    (search) => {
      setCurrentPage(1)
      refetch({
        page: 1,
        limit: pageSize,
        sort: `${sortField}:${sortOrder}`,
        search: search || undefined,
      })
    },
    { delay: 500 }
  )

  // Fetch data function
  const fetchData = useCallback(() => {
    refetch({
      page: currentPage,
      limit: pageSize,
      sort: `${sortField}:${sortOrder}`,
      search: debouncedValue || undefined,
    })
  }, [currentPage, pageSize, sortField, sortOrder, debouncedValue, refetch])

  // Initial load
  useEffect(() => {
    refetch({ page: 1, limit: 10, sort: "createdAt:desc" })
  }, [])

  // DataTable with server-side mode
  const { table } = useDataTable({
    data: users,
    columns,
    pageCount: pagination?.totalPages ?? 1,
    manualPagination: true,      // ✅ Server handles pagination
    manualSorting: true,         // ✅ Server handles sorting
    manualFiltering: true,       // ✅ Server handles filtering
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
      pagination: { pageSize, pageIndex: currentPage - 1 },
    },
  })

  // Extract table state for reactivity
  const tableState = table.getState()
  const tablePagination = tableState.pagination
  const tableSorting = tableState.sorting

  // Sync pagination changes
  useEffect(() => {
    const { pageIndex, pageSize: newPageSize } = tablePagination
    const newPage = pageIndex + 1
    
    if (newPage !== currentPage || newPageSize !== pageSize) {
      setCurrentPage(newPage)
      setPageSize(newPageSize)
    }
  }, [tablePagination, currentPage, pageSize])

  // Sync sorting changes
  useEffect(() => {
    if (tableSorting.length > 0) {
      const newField = tableSorting[0].id
      const newOrder = tableSorting[0].desc ? "desc" : "asc"
      if (newField !== sortField || newOrder !== sortOrder) {
        setSortField(newField)
        setSortOrder(newOrder)
      }
    }
  }, [tableSorting, sortField, sortOrder])

  // Refetch when state changes
  useEffect(() => {
    fetchData()
  }, [currentPage, pageSize, sortField, sortOrder, fetchData])

  return (
    <DataTable table={table}>
      <DataTableAdvancedToolbar table={table}>
        <Input
          value={searchValue}
          onChange={handleSearchChange}
          placeholder="Search..."
        />
      </DataTableAdvancedToolbar>
    </DataTable>
  )
}
```

### Flow Diagram (Server-Side)

```
[User Action] ──────────► Change page/sort/search
       │
       ▼
[Local State Update] ───► currentPage, sortField, searchValue
       │
       ▼
[useEffect Trigger] ────► fetchData()
       │
       ▼
GET /api/users?page=2&limit=10&sort=name:asc&search=john
       │
       ▼
[Backend Query] ────────► Prisma: skip, take, orderBy, where
       │
       ▼
[Response] ─────────────► { data: [...10 items], pagination: {...} }
       │
       ▼
[Update State] ─────────► users[], pagination
       │
       ▼
[Rendered UI]
```

---

## Hooks Reference

### useDataTable

```typescript
const { table } = useDataTable({
  data: T[],                      // Data array
  columns: ColumnDef<T>[],        // Column definitions
  pageCount: number,              // Total pages (-1 for unknown)
  
  // Mode flags
  manualPagination?: boolean,     // true = server, false = client
  manualSorting?: boolean,        // true = server, false = client
  manualFiltering?: boolean,      // true = server, false = client
  
  // Initial state
  initialState?: {
    sorting?: SortingState,
    pagination?: PaginationState,
    columnPinning?: ColumnPinningState,
    columnVisibility?: VisibilityState,
  },
  
  getRowId?: (row: T) => string,  // Row ID accessor
})
```

### useServerSearch

```typescript
const {
  searchValue,        // Input value (immediate)
  debouncedValue,     // Debounced value (for API)
  handleSearchChange, // onChange handler
  setSearchValue,     // Set programmatically
  clearSearch,        // Reset search
  isPending,          // Debounce in progress
} = useServerSearch(
  onSearch: (value: string) => void,
  options?: {
    delay?: number,   // Default: 500ms
    minChars?: number // Default: 0
  }
)
```

### useDebouncedValue

```typescript
const debouncedValue = useDebouncedValue(value, delay)
// delay default: 500ms
```

### useDebouncedCallback

```typescript
const debouncedFn = useDebouncedCallback(callback, delay)
// Returns a debounced version of the callback
```

---

## Best Practices

### 1. Choose the Right Mode

| Scenario | Mode |
|----------|------|
| Permissions (< 100 records) | Client-Side |
| Roles (< 50 records) | Client-Side |
| Users (potentially 1000+) | Server-Side |
| Audit Logs (1M+ records) | Server-Side |

### 2. Debounce Search Appropriately

```typescript
// Too fast (many API calls)
{ delay: 100 }  // ❌

// Good balance
{ delay: 500 }  // ✅

// Too slow (poor UX)
{ delay: 1000 } // ❌
```

### 3. Handle Loading States

```tsx
{isLoading ? (
  <DataTableSkeleton rowCount={5} />
) : (
  <DataTable table={table}>...</DataTable>
)}
```

### 4. Show Total Count

```tsx
<p className="text-muted-foreground">
  {pagination && `(${pagination.total} total)`}
</p>
```

### 5. Reset Page on Search

```typescript
const { searchValue, handleSearchChange } = useServerSearch(
  (search) => {
    setCurrentPage(1)  // ✅ Always reset to page 1
    refetch({ page: 1, search })
  }
)
```

### 6. Validate Sort Fields

```typescript
// Backend: Only allow valid sort fields
const validSortFields = ["name", "email", "createdAt", "isActive"]
if (sort && validSortFields.includes(sort.field)) {
  orderBy = { [sort.field]: sort.order }
}
```

---

## API Response Format

### Client-Side (Simple)

```json
{
  "success": true,
  "data": [...all records],
  "message": "Success"
}
```

### Server-Side (Paginated)

```json
{
  "success": true,
  "data": [...page records],
  "message": "Success",
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 150,
    "totalPages": 15
  }
}
```

---

## Comparison Summary

| Aspect | Client-Side | Server-Side |
|--------|-------------|-------------|
| `manualPagination` | `false` | `true` |
| `manualSorting` | `false` | `true` |
| `manualFiltering` | `false` | `true` |
| `pageCount` | `-1` | `pagination.totalPages` |
| Data Storage | Zustand Store | Local State + Hook |
| Search | `useMemo` filter | `useServerSearch` + API |
| Page Change | Instant | API call (~200ms) |
| Initial Load | All data | First page only |
