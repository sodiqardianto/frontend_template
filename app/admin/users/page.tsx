"use client"

import * as React from "react"
import { Suspense, useState, useMemo, useEffect, useCallback } from "react"

import { Input } from "@/components/ui/input"
import { CrudModal } from "@/components/modals/crud-modal"
import { ConfirmModal } from "@/components/modals/confirm-modal"
import { MainButton } from "@/components/shared/buttons"
import { UserForm } from "@/features/users/components/user-form"
import type { User, UserFormValues } from "@/features/users/types"
import { useDataTable } from "@/hooks/use-data-table"
import { getColumns } from "@/features/users/components/user-columns"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableAdvancedToolbar } from "@/components/data-table/data-table-advanced-toolbar"
import { DataTableFilterList } from "@/components/data-table/data-table-filter-list"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { DataTableBulkActions } from "@/components/data-table/data-table-bulk-actions"
import { Plus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

import { useUserOperations } from "@/features/users/hooks/use-user-operations"
import { useUsersQuery } from "@/features/users/hooks/use-users-query"
import { usePermissions } from "@/hooks/use-permissions"
import { useServerSearch } from "@/hooks/use-server-search"
import { api } from "@/lib/api"

interface Role {
  id: string
  name: string
  description: string | null
}

export default function UsersPage() {
  return (
    <Suspense fallback={<UsersPageSkeleton />}>
      <UsersContent />
    </Suspense>
  )
}

function UsersPageSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <DataTableSkeleton rowCount={5} />
    </div>
  )
}

function UsersContent() {
  const { data: users, pagination, isLoading, refetch } = useUsersQuery()
  const { can } = usePermissions()
  
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [roles, setRoles] = useState<Role[]>([])
  const { isProcessing, create, update, remove, bulkRemove } = useUserOperations()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [bulkDeletingIds, setBulkDeletingIds] = useState<string[] | null>(null)
  
  // Server-side state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortField, setSortField] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const canCreate = can("users:create")
  const canUpdate = can("users:update")
  const canDelete = can("users:delete")

  // Debounced search using reusable hook
  const { searchValue, handleSearchChange, debouncedValue } = useServerSearch(
    (search) => {
      setCurrentPage(1) // Reset to first page on search
      refetch({
        page: 1,
        limit: pageSize,
        sort: `${sortField}:${sortOrder}`,
        search: search || undefined,
      })
    },
    { delay: 500 }
  )

  // Fetch data when pagination/sorting changes
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
    const loadInitialData = async () => {
      try {
        const [, rolesRes] = await Promise.all([
          refetch({ page: 1, limit: 10, sort: "createdAt:desc" }),
          api.get<{ data: Role[] }>("/roles")
        ])
        setRoles(rolesRes.data)
      } finally {
        setIsInitialLoading(false)
      }
    }
    loadInitialData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const columns = useMemo(
    () =>
      getColumns({
        onEdit: canUpdate ? (user) => setEditingUser(user) : undefined,
        onDelete: canDelete ? (user) => setDeletingUser(user) : undefined,
      }),
    [canUpdate, canDelete]
  )

  // Calculate page count from server response
  const pageCount = pagination?.totalPages ?? 1

  const { table } = useDataTable({
    data: users,
    columns,
    pageCount,
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
      pagination: { pageSize, pageIndex: currentPage - 1 },
      columnPinning: { right: ["actions"] },
      columnVisibility: { createdAt: false },
    },
    getRowId: (row) => row.id,
    manualPagination: true,  // ✅ Server-side pagination
    manualSorting: true,     // ✅ Server-side sorting
    manualFiltering: true,   // ✅ Server-side filtering
  })

  // Extract table state for dependency tracking
  const tableState = table.getState()
  const tablePagination = tableState.pagination
  const tableSorting = tableState.sorting

  // Sync table state changes to trigger refetch
  useEffect(() => {
    const { pageIndex, pageSize: newPageSize } = tablePagination
    const newPage = pageIndex + 1
    
    if (newPage !== currentPage || newPageSize !== pageSize) {
      setCurrentPage(newPage)
      setPageSize(newPageSize)
    }
  }, [tablePagination, currentPage, pageSize])

  // Handle sorting changes
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

  // Refetch when page/sort changes (not on initial load)
  useEffect(() => {
    if (!isInitialLoading) {
      fetchData()
    }
  }, [currentPage, pageSize, sortField, sortOrder, fetchData, isInitialLoading])

  const showSkeleton = (isLoading || isInitialLoading) && users.length === 0

  const handleCreate = async (formData: UserFormValues) => {
    await create(formData, () => {
      setIsCreateModalOpen(false)
      fetchData() // Refresh data
    })
  }

  const handleUpdate = async (formData: UserFormValues) => {
    if (!editingUser) return
    await update(editingUser.id, formData, () => {
      setEditingUser(null)
      fetchData() // Refresh data
    })
  }

  const handleDelete = async () => {
    if (!deletingUser) return
    await remove(deletingUser.id, () => {
      setDeletingUser(null)
      fetchData() // Refresh data
    })
  }

  const handleBulkDelete = async () => {
    if (!bulkDeletingIds || bulkDeletingIds.length === 0) return
    await bulkRemove(bulkDeletingIds, () => {
      setBulkDeletingIds(null)
      table.resetRowSelection()
      fetchData() // Refresh data
    })
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage your application users
            {pagination && (
              <span className="ml-2 text-sm">
                ({pagination.total} total)
              </span>
            )}
          </p>
        </div>
        {canCreate && (
          <MainButton
            onClick={() => setIsCreateModalOpen(true)}
            icon={<Plus className="mr-2 h-4 w-4" />}
          >
            Create User
          </MainButton>
        )}
      </div>

      {showSkeleton ? (
        <DataTableSkeleton rowCount={5} />
      ) : (
        <DataTable table={table}>
          <DataTableAdvancedToolbar table={table}>
            <Input
              placeholder="Search name or email..."
              value={searchValue}
              onChange={handleSearchChange}
              className="h-10 w-[150px] lg:w-[250px] rounded-full"
            />
            <DataTableFilterList table={table} />
            {canDelete && (
              <DataTableBulkActions
                table={table}
                onBulkDelete={(ids) => setBulkDeletingIds(ids)}
                isDeleting={isProcessing}
              />
            )}
          </DataTableAdvancedToolbar>
        </DataTable>
      )}

      {/* Create Modal */}
      <CrudModal
        title="Create User"
        description="Add a new user to your application"
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      >
        {(containerRef) => (
          <UserForm 
            onSubmit={handleCreate} 
            isProcessing={isProcessing}
            availableRoles={roles}
            containerRef={containerRef}
          />
        )}
      </CrudModal>

      {/* Edit Modal */}
      <CrudModal
        title="Edit User"
        description="Make changes to the user account"
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
      >
        {(containerRef) => (
          <UserForm
            onSubmit={handleUpdate}
            initialData={editingUser || undefined}
            isProcessing={isProcessing}
            availableRoles={roles}
            containerRef={containerRef}
          />
        )}
      </CrudModal>

      {/* Delete Confirmation */}
      <ConfirmModal
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        open={!!deletingUser}
        onOpenChange={(open) => !open && setDeletingUser(null)}
        onConfirm={handleDelete}
        isConfirming={isProcessing}
        variant="destructive"
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmModal
        title="Delete Selected Users"
        description={`Are you sure you want to delete ${bulkDeletingIds?.length ?? 0} user(s)? This action cannot be undone.`}
        open={!!bulkDeletingIds}
        onOpenChange={(open) => !open && setBulkDeletingIds(null)}
        onConfirm={handleBulkDelete}
        isConfirming={isProcessing}
        variant="destructive"
      />
    </div>
  )
}
