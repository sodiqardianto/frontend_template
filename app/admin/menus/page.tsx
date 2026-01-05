"use client"

import * as React from "react"

import { Suspense, useState } from "react"

import { Input } from "@/components/ui/input"
import { CrudModal } from "@/components/modals/crud-modal"
import { ConfirmModal } from "@/components/modals/confirm-modal"
import { MainButton } from "@/components/shared/buttons"
import { MenuForm } from "@/features/menus/components/menu-form"
import type { Menu, MenuFormValues } from "@/features/menus/types"
import { useDataTable } from "@/hooks/use-data-table"
import { getColumns } from "@/features/menus/components/menu-columns"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableAdvancedToolbar } from "@/components/data-table/data-table-advanced-toolbar"
import { DataTableFilterList } from "@/components/data-table/data-table-filter-list"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { Plus } from "lucide-react"

import { useMenuOperations } from "@/features/menus/hooks/use-menu-operations"
import { useMenuStore } from "@/features/menus/stores/use-menu-store"

import { useMemo, useEffect } from "react"

import { Skeleton } from "@/components/ui/skeleton"

export default function MenusPage() {
  return (
    <Suspense fallback={<MenusPageSkeleton />}>
      <MenusContent />
    </Suspense>
  )
}

function MenusPageSkeleton() {
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

function MenusContent() {
  const { menus, isLoading: isMenuLoading, fetchMenus } = useMenuStore()
  
  // Local state to prevent "No results" flash before initial fetch
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  
  const { isProcessing, create, update, remove } = useMenuOperations()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null)
  const [deletingMenu, setDeletingMenu] = useState<Menu | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchMenus().finally(() => setIsInitialLoading(false))
  }, [fetchMenus])

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return menus
    return menus.filter((menu) =>
      menu.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery, menus])

  // Memoize columns to prevent infinite re-renders
  const columns = useMemo(
    () =>
      getColumns({
        onEdit: (menu) => setEditingMenu(menu),
        onDelete: (menu) => setDeletingMenu(menu),
      }),
    []
  )

  const { table } = useDataTable({
    data: filteredData,
    columns,
    pageCount: 1,
    initialState: {
      sorting: [{ id: "order", desc: false }], // Default sort by order
      pagination: { pageSize: 10, pageIndex: 0 },
      columnPinning: { right: ["actions"] },
    },
    getRowId: (row) => row.id,
    manualSorting: false,
  })

  const showSkeleton = (isMenuLoading || isInitialLoading) && menus.length === 0

  const handleCreate = async (formData: MenuFormValues) => {
    await create(formData, () => setIsCreateModalOpen(false))
  }

  const handleUpdate = async (formData: MenuFormValues) => {
    if (!editingMenu) return
    await update(editingMenu.id, formData, () => setEditingMenu(null))
  }

  const handleDelete = async () => {
    if (!deletingMenu) return
    await remove(deletingMenu.id, () => setDeletingMenu(null))
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menu Management</h1>
          <p className="text-muted-foreground">
            Manage your application menus and navigation
          </p>
        </div>
        <MainButton
          onClick={() => setIsCreateModalOpen(true)}
          icon={<Plus className="mr-2 h-4 w-4" />}
        >
          Create Menu
        </MainButton>
      </div>

      {showSkeleton ? (
        <DataTableSkeleton rowCount={5} />
      ) : (
        <DataTable table={table}>
          <DataTableAdvancedToolbar table={table}>
            <Input
              placeholder="Search title..."
              value={searchQuery}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(event.target.value)
              }
              className="h-8 w-[150px] lg:w-[250px]"
            />
            <DataTableFilterList table={table} />
          </DataTableAdvancedToolbar>
        </DataTable>
      )}

      {/* Create Modal */}
      <CrudModal
        title="Create Menu"
        description="Add a new menu item to your application"
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      >
        <MenuForm 
          onSubmit={handleCreate} 
          isProcessing={isProcessing} 
          availableMenus={menus}
        />
      </CrudModal>

      {/* Edit Modal */}
      <CrudModal
        title="Edit Menu"
        description="Make changes to the menu item"
        open={!!editingMenu}
        onOpenChange={(open) => !open && setEditingMenu(null)}
      >
        <MenuForm
          onSubmit={handleUpdate}
          initialData={editingMenu || undefined}
          isProcessing={isProcessing}
          availableMenus={menus}
        />
      </CrudModal>

      {/* Delete Confirmation */}
      <ConfirmModal
        title="Delete Menu"
        description="Are you sure you want to delete this menu? This action cannot be undone."
        open={!!deletingMenu}
        onOpenChange={(open) => !open && setDeletingMenu(null)}
        onConfirm={handleDelete}
        isConfirming={isProcessing}
        variant="destructive"
      />
    </div>
  )
}
