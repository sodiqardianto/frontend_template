"use client"

import * as React from "react"
import { Suspense, useState, useMemo, useEffect } from "react"

import { Input } from "@/components/ui/input"
import { CrudModal } from "@/components/modals/crud-modal"
import { ConfirmModal } from "@/components/modals/confirm-modal"
import { MainButton } from "@/components/shared/buttons"
import { PermissionForm } from "@/features/permissions/components/permission-form"
import type { Permission, PermissionFormValues } from "@/features/permissions/types"
import { useDataTable } from "@/hooks/use-data-table"
import { getColumns } from "@/features/permissions/components/permission-columns"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableAdvancedToolbar } from "@/components/data-table/data-table-advanced-toolbar"
import { DataTableFilterList } from "@/components/data-table/data-table-filter-list"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { Plus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

import { usePermissionOperations } from "@/features/permissions/hooks/use-permission-operations"
import { usePermissionStore } from "@/features/permissions/stores/use-permission-store"

export default function PermissionsPage() {
  return (
    <Suspense fallback={<PermissionsPageSkeleton />}>
      <PermissionsContent />
    </Suspense>
  )
}

function PermissionsPageSkeleton() {
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

function PermissionsContent() {
  const { permissions, isLoading: isPermissionLoading, fetchPermissions } = usePermissionStore()
  
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const { isProcessing, create, update, remove } = usePermissionOperations()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null)
  const [deletingPermission, setDeletingPermission] = useState<Permission | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchPermissions().finally(() => setIsInitialLoading(false))
  }, [fetchPermissions])

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return permissions
    const query = searchQuery.toLowerCase()
    return permissions.filter((permission) =>
      permission.name.toLowerCase().includes(query)
    )
  }, [searchQuery, permissions])

  const columns = useMemo(
    () =>
      getColumns({
        onEdit: (permission) => setEditingPermission(permission),
        onDelete: (permission) => setDeletingPermission(permission),
      }),
    []
  )

  const { table } = useDataTable({
    data: filteredData,
    columns,
    pageCount: -1,
    initialState: {
      sorting: [{ id: "name", desc: false }],
      pagination: { pageSize: 10, pageIndex: 0 },
      columnPinning: { right: ["actions"] },
      columnVisibility: { createdAt: false },
    },
    getRowId: (row) => row.id,
    manualPagination: false,
    manualSorting: false,
    manualFiltering: false,
  })

  const showSkeleton = (isPermissionLoading || isInitialLoading) && permissions.length === 0

  const handleCreate = async (formData: PermissionFormValues) => {
    await create(formData, () => setIsCreateModalOpen(false))
  }

  const handleUpdate = async (formData: PermissionFormValues) => {
    if (!editingPermission) return
    await update(editingPermission.id, formData, () => setEditingPermission(null))
  }

  const handleDelete = async () => {
    if (!deletingPermission) return
    await remove(deletingPermission.id, () => setDeletingPermission(null))
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Permission Management</h1>
          <p className="text-muted-foreground">
            Manage application permissions
          </p>
        </div>
        <MainButton
          onClick={() => setIsCreateModalOpen(true)}
          icon={<Plus className="mr-2 h-4 w-4" />}
        >
          Create Permission
        </MainButton>
      </div>

      {showSkeleton ? (
        <DataTableSkeleton rowCount={5} />
      ) : (
        <DataTable table={table}>
          <DataTableAdvancedToolbar table={table}>
            <Input
              placeholder="Search permission..."
              value={searchQuery}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(event.target.value)
              }
              className="h-10 w-[150px] lg:w-[250px] rounded-full"
            />
            <DataTableFilterList table={table} />
          </DataTableAdvancedToolbar>
        </DataTable>
      )}

      {/* Create Modal */}
      <CrudModal
        title="Create Permission"
        description="Add a new permission to your application"
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      >
        <PermissionForm 
          onSubmit={handleCreate} 
          isProcessing={isProcessing}
        />
      </CrudModal>

      {/* Edit Modal */}
      <CrudModal
        title="Edit Permission"
        description="Make changes to the permission"
        open={!!editingPermission}
        onOpenChange={(open) => !open && setEditingPermission(null)}
      >
        <PermissionForm
          onSubmit={handleUpdate}
          initialData={editingPermission || undefined}
          isProcessing={isProcessing}
        />
      </CrudModal>

      {/* Delete Confirmation */}
      <ConfirmModal
        title="Delete Permission"
        description="Are you sure you want to delete this permission? Roles with this permission will lose it."
        open={!!deletingPermission}
        onOpenChange={(open) => !open && setDeletingPermission(null)}
        onConfirm={handleDelete}
        isConfirming={isProcessing}
        variant="destructive"
      />
    </div>
  )
}
