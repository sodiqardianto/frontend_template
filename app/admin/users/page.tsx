"use client"

import * as React from "react"
import { Suspense, useState, useMemo, useEffect } from "react"

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
import { useUserStore } from "@/features/users/stores/use-user-store"
import { usePermissions } from "@/hooks/use-permissions"
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
  const { users, isLoading: isUserLoading, fetchUsers } = useUserStore()
  const { can } = usePermissions()
  
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [roles, setRoles] = useState<Role[]>([])
  const { isProcessing, create, update, remove, bulkRemove } = useUserOperations()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [bulkDeletingIds, setBulkDeletingIds] = useState<string[] | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const canCreate = can("users:create")
  const canUpdate = can("users:update")
  const canDelete = can("users:delete")

  useEffect(() => {
    const loadData = async () => {
      try {
        const [, rolesRes] = await Promise.all([
          fetchUsers(),
          api.get<{ data: Role[] }>("/roles")
        ])
        setRoles(rolesRes.data)
      } finally {
        setIsInitialLoading(false)
      }
    }
    loadData()
  }, [fetchUsers])

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return users
    const query = searchQuery.toLowerCase()
    return users.filter((user) =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    )
  }, [searchQuery, users])

  const columns = useMemo(
    () =>
      getColumns({
        onEdit: canUpdate ? (user) => setEditingUser(user) : undefined,
        onDelete: canDelete ? (user) => setDeletingUser(user) : undefined,
      }),
    [canUpdate, canDelete]
  )

  const { table } = useDataTable({
    data: filteredData,
    columns,
    pageCount: 1,
    initialState: {
      sorting: [{ id: "name", desc: false }],
      pagination: { pageSize: 10, pageIndex: 0 },
      columnPinning: { right: ["actions"] },
      columnVisibility: { createdAt: false },
    },
    getRowId: (row) => row.id,
    manualSorting: false,
  })

  const showSkeleton = (isUserLoading || isInitialLoading) && users.length === 0

  const handleCreate = async (formData: UserFormValues) => {
    await create(formData, () => setIsCreateModalOpen(false))
  }

  const handleUpdate = async (formData: UserFormValues) => {
    if (!editingUser) return
    await update(editingUser.id, formData, () => setEditingUser(null))
  }

  const handleDelete = async () => {
    if (!deletingUser) return
    await remove(deletingUser.id, () => setDeletingUser(null))
  }

  const handleBulkDelete = async () => {
    if (!bulkDeletingIds || bulkDeletingIds.length === 0) return
    await bulkRemove(bulkDeletingIds, () => {
      setBulkDeletingIds(null)
      table.resetRowSelection()
    })
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage your application users
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
              value={searchQuery}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(event.target.value)
              }
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
