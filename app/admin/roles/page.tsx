"use client"

import * as React from "react"
import { Suspense, useState, useMemo, useEffect } from "react"

import { Input } from "@/components/ui/input"
import { CrudModal } from "@/components/modals/crud-modal"
import { ConfirmModal } from "@/components/modals/confirm-modal"
import { MainButton } from "@/components/shared/buttons"
import { RoleForm } from "@/features/roles/components/role-form"
import type { Role, RoleFormValues, Permission } from "@/features/roles/types"
import { useDataTable } from "@/hooks/use-data-table"
import { getColumns } from "@/features/roles/components/role-columns"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableAdvancedToolbar } from "@/components/data-table/data-table-advanced-toolbar"
import { DataTableFilterList } from "@/components/data-table/data-table-filter-list"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { Plus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

import { useRoleOperations } from "@/features/roles/hooks/use-role-operations"
import { useRoleStore } from "@/features/roles/stores/use-role-store"
import { api } from "@/lib/api"

export default function RolesPage() {
  return (
    <Suspense fallback={<RolesPageSkeleton />}>
      <RolesContent />
    </Suspense>
  )
}

function RolesPageSkeleton() {
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

function RolesContent() {
  const { roles, isLoading: isRoleLoading, fetchRoles } = useRoleStore()
  
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const { isProcessing, create, update, remove } = useRoleOperations()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [deletingRole, setDeletingRole] = useState<Role | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch roles and permissions in parallel
        const [, permissionsRes] = await Promise.all([
          fetchRoles(),
          api.get<{ data: Permission[] }>("/permissions")
        ])
        setPermissions(permissionsRes.data)
      } finally {
        setIsInitialLoading(false)
      }
    }
    loadData()
  }, [fetchRoles])

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return roles
    const query = searchQuery.toLowerCase()
    return roles.filter((role) =>
      role.name.toLowerCase().includes(query) ||
      role.description?.toLowerCase().includes(query)
    )
  }, [searchQuery, roles])

  const columns = useMemo(
    () =>
      getColumns({
        onEdit: (role) => setEditingRole(role),
        onDelete: (role) => setDeletingRole(role),
      }),
    []
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

  const showSkeleton = (isRoleLoading || isInitialLoading) && roles.length === 0

  const handleCreate = async (formData: RoleFormValues) => {
    await create(formData, () => setIsCreateModalOpen(false))
  }

  const handleUpdate = async (formData: RoleFormValues) => {
    if (!editingRole) return
    await update(editingRole.id, formData, () => setEditingRole(null))
  }

  const handleDelete = async () => {
    if (!deletingRole) return
    await remove(deletingRole.id, () => setDeletingRole(null))
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
          <p className="text-muted-foreground">
            Manage roles and their permissions
          </p>
        </div>
        <MainButton
          onClick={() => setIsCreateModalOpen(true)}
          icon={<Plus className="mr-2 h-4 w-4" />}
        >
          Create Role
        </MainButton>
      </div>

      {showSkeleton ? (
        <DataTableSkeleton rowCount={5} />
      ) : (
        <DataTable table={table}>
          <DataTableAdvancedToolbar table={table}>
            <Input
              placeholder="Search name or description..."
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
        title="Create Role"
        description="Add a new role to your application"
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      >
        <RoleForm 
          onSubmit={handleCreate} 
          isProcessing={isProcessing}
          availablePermissions={permissions}
        />
      </CrudModal>

      {/* Edit Modal */}
      <CrudModal
        title="Edit Role"
        description="Make changes to the role"
        open={!!editingRole}
        onOpenChange={(open) => !open && setEditingRole(null)}
      >
        <RoleForm
          onSubmit={handleUpdate}
          initialData={editingRole || undefined}
          isProcessing={isProcessing}
          availablePermissions={permissions}
        />
      </CrudModal>

      {/* Delete Confirmation */}
      <ConfirmModal
        title="Delete Role"
        description="Are you sure you want to delete this role? Users with this role will lose associated permissions."
        open={!!deletingRole}
        onOpenChange={(open) => !open && setDeletingRole(null)}
        onConfirm={handleDelete}
        isConfirming={isProcessing}
        variant="destructive"
      />
    </div>
  )
}
