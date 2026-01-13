# Custom Hooks Documentation

Dokumentasi lengkap untuk hooks yang tersedia di project ini.

## 📋 Table of Contents

- [Search & Debounce Hooks](#search--debounce-hooks)
  - [useServerSearch](#useserversearch)
  - [useDebouncedValue](#usedebouncedvalue)
  - [useDebouncedCallback](#usedebouncedcallback)
- [Data Table Hooks](#data-table-hooks)
  - [useDataTable](#usedatatable)
- [Permission Hooks](#permission-hooks)
  - [usePermissions](#usepermissions)
- [Utility Hooks](#utility-hooks)
  - [useCallbackRef](#usecallbackref)
  - [useMobile](#usemobile)

---

## Search & Debounce Hooks

### useServerSearch

Hook lengkap untuk implementasi server-side search dengan debouncing.

#### Import

```typescript
import { useServerSearch } from "@/hooks/use-server-search"
```

#### Signature

```typescript
function useServerSearch(
  onSearch: (value: string) => void,
  options?: UseServerSearchOptions
): UseServerSearchReturn
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `delay` | `number` | `500` | Delay dalam milliseconds sebelum trigger search |
| `minChars` | `number` | `0` | Minimum karakter sebelum trigger (0 = immediate) |

#### Return Values

| Property | Type | Description |
|----------|------|-------------|
| `searchValue` | `string` | Nilai input (untuk controlled input) |
| `debouncedValue` | `string` | Nilai yang sudah di-debounce (untuk API calls) |
| `handleSearchChange` | `(e: ChangeEvent) => void` | Handler untuk input onChange |
| `setSearchValue` | `(value: string) => void` | Set value secara programatik |
| `clearSearch` | `() => void` | Reset search ke empty string |
| `isPending` | `boolean` | True jika debounce sedang berjalan |

#### Example

```tsx
import { useServerSearch } from "@/hooks/use-server-search"
import { Input } from "@/components/ui/input"

function SearchableList() {
  const { refetch } = useDataQuery()

  const { searchValue, handleSearchChange, isPending } = useServerSearch(
    (search) => {
      // Called after 500ms (default) delay
      refetch({ page: 1, search: search || undefined })
    },
    { delay: 500, minChars: 2 } // Only search if >= 2 characters
  )

  return (
    <div className="relative">
      <Input
        value={searchValue}
        onChange={handleSearchChange}
        placeholder="Search..."
      />
      {isPending && (
        <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />
      )}
    </div>
  )
}
```

---

### useDebouncedValue

Hook untuk mendapatkan versi debounced dari sebuah value.

#### Import

```typescript
import { useDebouncedValue } from "@/hooks/use-debounced-value"
```

#### Signature

```typescript
function useDebouncedValue<T>(value: T, delay?: number): T
```

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `value` | `T` | - | Value yang akan di-debounce |
| `delay` | `number` | `500` | Delay dalam milliseconds |

#### Example

```tsx
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useState, useEffect } from "react"

function SearchWithDebouncedValue() {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 500)

  // Effect hanya dipanggil setelah 500ms tidak ada perubahan
  useEffect(() => {
    if (debouncedSearch) {
      console.log("Searching for:", debouncedSearch)
      fetchResults(debouncedSearch)
    }
  }, [debouncedSearch])

  return (
    <Input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Type to search..."
    />
  )
}
```

#### Use Cases

- Debounce search input
- Debounce form validation
- Delay API calls pada auto-save
- Throttle expensive computations

---

### useDebouncedCallback

Hook untuk membuat versi debounced dari sebuah callback function.

#### Import

```typescript
import { useDebouncedCallback } from "@/hooks/use-debounced-callback"
```

#### Signature

```typescript
function useDebouncedCallback<T extends (...args: never[]) => unknown>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `callback` | `T` | Function yang akan di-debounce |
| `delay` | `number` | Delay dalam milliseconds |

#### Example

```tsx
import { useDebouncedCallback } from "@/hooks/use-debounced-callback"

function AutoSaveForm() {
  const [content, setContent] = useState("")

  // Auto-save dipanggil 1 detik setelah user berhenti mengetik
  const debouncedSave = useDebouncedCallback((text: string) => {
    saveToServer(text)
  }, 1000)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    debouncedSave(e.target.value)
  }

  return (
    <textarea
      value={content}
      onChange={handleChange}
      placeholder="Type here, auto-saves after 1 second..."
    />
  )
}
```

---

## Data Table Hooks

### useDataTable

Hook wrapper untuk TanStack Table dengan fitur tambahan seperti URL state sync.

#### Import

```typescript
import { useDataTable } from "@/hooks/use-data-table"
```

#### Signature

```typescript
function useDataTable<TData>(props: UseDataTableProps<TData>): {
  table: Table<TData>
  shallow: boolean
  debounceMs: number
  throttleMs: number
}
```

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `TData[]` | ✅ | Data array untuk ditampilkan |
| `columns` | `ColumnDef<TData>[]` | ✅ | Column definitions |
| `pageCount` | `number` | ✅ | Total halaman (-1 untuk client-side) |
| `manualPagination` | `boolean` | ❌ | Server-side pagination (default: `true`) |
| `manualSorting` | `boolean` | ❌ | Server-side sorting (default: `true`) |
| `manualFiltering` | `boolean` | ❌ | Server-side filtering (default: `true`) |
| `initialState` | `Partial<TableState>` | ❌ | Initial state |
| `getRowId` | `(row: TData) => string` | ❌ | Row ID accessor |

#### Example: Client-Side

```tsx
const { table } = useDataTable({
  data: filteredData,
  columns,
  pageCount: -1,
  manualPagination: false,
  manualSorting: false,
  manualFiltering: false,
  initialState: {
    sorting: [{ id: "name", desc: false }],
    pagination: { pageSize: 10, pageIndex: 0 },
  },
  getRowId: (row) => row.id,
})
```

#### Example: Server-Side

```tsx
const { table } = useDataTable({
  data: users,
  columns,
  pageCount: pagination?.totalPages ?? 1,
  manualPagination: true,
  manualSorting: true,
  manualFiltering: true,
  initialState: {
    sorting: [{ id: "createdAt", desc: true }],
    pagination: { pageSize: 10, pageIndex: 0 },
  },
  getRowId: (row) => row.id,
})
```

---

## Permission Hooks

### usePermissions

Hook untuk mengecek permissions user yang sedang login.

#### Import

```typescript
import { usePermissions } from "@/hooks/use-permissions"
```

#### Signature

```typescript
function usePermissions(): {
  can: (permission: string) => boolean
  permissions: string[]
  isLoading: boolean
}
```

#### Return Values

| Property | Type | Description |
|----------|------|-------------|
| `can` | `(permission: string) => boolean` | Check apakah user memiliki permission |
| `permissions` | `string[]` | Array semua permissions user |
| `isLoading` | `boolean` | True jika permissions masih loading |

#### Example

```tsx
import { usePermissions } from "@/hooks/use-permissions"

function UserActions() {
  const { can } = usePermissions()

  const canCreate = can("users:create")
  const canUpdate = can("users:update")
  const canDelete = can("users:delete")

  return (
    <div className="flex gap-2">
      {canCreate && <Button>Create User</Button>}
      {canUpdate && <Button>Edit</Button>}
      {canDelete && <Button variant="destructive">Delete</Button>}
    </div>
  )
}
```

---

## Utility Hooks

### useCallbackRef

Hook untuk membuat callback reference yang stabil.

#### Import

```typescript
import { useCallbackRef } from "@/hooks/use-callback-ref"
```

#### Signature

```typescript
function useCallbackRef<T extends (...args: never[]) => unknown>(
  callback: T | undefined
): T
```

#### Description

Hook ini memastikan callback selalu up-to-date tanpa perlu memasukkannya ke dependency array. Berguna untuk event handlers dan callbacks yang sering berubah.

#### Example

```typescript
const handleCallback = useCallbackRef(callback)
// handleCallback selalu reference ke versi terbaru callback
// tanpa menyebabkan re-render
```

### useMobile

Hook untuk mendeteksi apakah viewport adalah mobile.

#### Import

```typescript
import { useMobile } from "@/hooks/use-mobile"
```

#### Signature

```typescript
function useMobile(): boolean
```

#### Example

```tsx
import { useMobile } from "@/hooks/use-mobile"

function ResponsiveComponent() {
  const isMobile = useMobile()

  return isMobile ? (
    <MobileLayout />
  ) : (
    <DesktopLayout />
  )
}
```

---

## Best Practices

### 1. Pilih Hook yang Tepat untuk Debouncing

| Scenario | Hook |
|----------|------|
| Form input dengan API call | `useServerSearch` |
| Debounce single value | `useDebouncedValue` |
| Debounce function call | `useDebouncedCallback` |

### 2. Delay yang Tepat

```typescript
// Terlalu cepat - banyak API calls
{ delay: 100 }  // ❌

// Optimal untuk search
{ delay: 500 }  // ✅

// Terlalu lambat - UX buruk
{ delay: 1500 } // ❌
```

### 3. Gunakan minChars untuk Search

```typescript
// Prevent search dengan 1 karakter
useServerSearch(onSearch, { minChars: 2 })
```

### 4. Handle Loading States

```tsx
const { isPending } = useServerSearch(...)

return (
  <div className="relative">
    <Input ... />
    {isPending && <Spinner className="absolute right-2" />}
  </div>
)
```

---

## TypeScript Tips

### Generic Types dengan useDataTable

```typescript
interface User {
  id: string
  name: string
  email: string
}

const { table } = useDataTable<User>({
  data: users,
  columns: userColumns, // ColumnDef<User>[]
  ...
})
```

### Type-Safe Permissions

```typescript
type Permission = 
  | "users:create" 
  | "users:update" 
  | "users:delete"
  | "roles:create"
  // ...

const { can } = usePermissions()
const canCreate = can("users:create" as Permission)
```
