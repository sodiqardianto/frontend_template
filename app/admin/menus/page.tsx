"use client"

import * as React from "react"
import { Suspense, useState, useMemo, useEffect } from "react"
import { arrayMove } from "@dnd-kit/sortable"
import {
  GripVertical,
  Plus,
  SquarePen,
  Trash2,
  Menu as MenuIcon,
  ChevronRight,
} from "lucide-react"
import * as LucideIcons from "lucide-react"

import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableItemHandle,
  SortableOverlay,
} from "@/components/ui/sortable"
import { CrudModal } from "@/components/modals/crud-modal"
import { ConfirmModal } from "@/components/modals/confirm-modal"
import { MainButton, IconButton } from "@/components/shared/buttons"
import { MenuForm } from "@/features/menus/components/menu-form"
import type { Menu, MenuFormValues } from "@/features/menus/types"
import type { Permission } from "@/features/permissions/types"
import { useMenuOperations } from "@/features/menus/hooks/use-menu-operations"
import { useMenuStore } from "@/features/menus/stores/use-menu-store"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name]
  if (!IconComponent) return <MenuIcon className={className} />
  return <IconComponent className={className} />
}

type MenuTree = Menu & { children: MenuTree[] }

function buildMenuTree(menus: Menu[]): MenuTree[] {
  const sorted = [...menus].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  const map = new Map<string, MenuTree>()
  const roots: MenuTree[] = []

  sorted.forEach((m) => map.set(m.id, { ...m, children: [] }))
  sorted.forEach((m) => {
    const node = map.get(m.id)!
    if (m.parentId && map.has(m.parentId)) {
      map.get(m.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  })
  return roots
}

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
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  )
}

function MenusContent() {
  const { menus, isLoading, fetchMenus, setMenus } = useMenuStore()
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const { isProcessing, create, update, remove, reorder } = useMenuOperations()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null)
  const [deletingMenu, setDeletingMenu] = useState<Menu | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const loadData = async () => {
      try {
        const [, permissionsRes] = await Promise.all([
          fetchMenus(),
          api.get<{ data: Permission[] }>("/permissions"),
        ])
        setPermissions(permissionsRes.data)
      } finally {
        setIsInitialLoading(false)
      }
    }
    loadData()
  }, [fetchMenus])

  const menuTree = useMemo(() => buildMenuTree(menus), [menus])

  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) return menuTree
    const query = searchQuery.toLowerCase()
    const filterNode = (nodes: MenuTree[]): MenuTree[] =>
      nodes
        .map((n) => ({ ...n, children: filterNode(n.children) }))
        .filter((n) => n.title.toLowerCase().includes(query) || n.children.length > 0)
    return filterNode(menuTree)
  }, [searchQuery, menuTree])

  const handleReorder = (items: MenuTree[], parentId: string | null) => {
    const updated = items.map((item, index) => ({
      id: item.id,
      parentId,
      order: index,
    }))
    const newMenus = menus.map((m) => {
      const upd = updated.find((u) => u.id === m.id)
      return upd ? { ...m, order: upd.order } : m
    })
    setMenus(newMenus)
    reorder(updated)
  }

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

  const showSkeleton = (isLoading || isInitialLoading) && menus.length === 0
  const isSearching = searchQuery.trim().length > 0

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menu Management</h1>
          <p className="text-muted-foreground">
            Drag to reorder menus, expand to see children
          </p>
        </div>
        <MainButton
          onClick={() => setIsCreateModalOpen(true)}
          icon={<Plus className="mr-2 h-4 w-4" />}
        >
          Create Menu
        </MainButton>
      </div>

      <Input
        placeholder="Search menus..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="h-10 max-w-sm rounded-full"
      />

      {showSkeleton ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredTree.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <p>No menus found</p>
        </div>
      ) : (
        <MenuList
          items={filteredTree}
          parentId={null}
          onReorder={handleReorder}
          onEdit={setEditingMenu}
          onDelete={setDeletingMenu}
          disabled={isSearching}
        />
      )}

      <CrudModal
        title="Create Menu"
        description="Add a new menu item"
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      >
        {(containerRef) => (
          <MenuForm
            onSubmit={handleCreate}
            isProcessing={isProcessing}
            availableMenus={menus}
            availablePermissions={permissions}
            containerRef={containerRef}
          />
        )}
      </CrudModal>

      <CrudModal
        title="Edit Menu"
        description="Make changes to the menu"
        open={!!editingMenu}
        onOpenChange={(open) => !open && setEditingMenu(null)}
      >
        {(containerRef) => (
          <MenuForm
            onSubmit={handleUpdate}
            initialData={editingMenu || undefined}
            isProcessing={isProcessing}
            availableMenus={menus}
            availablePermissions={permissions}
            containerRef={containerRef}
          />
        )}
      </CrudModal>

      <ConfirmModal
        title="Delete Menu"
        description="Are you sure? This action cannot be undone."
        open={!!deletingMenu}
        onOpenChange={(open) => !open && setDeletingMenu(null)}
        onConfirm={handleDelete}
        isConfirming={isProcessing}
        variant="destructive"
      />
    </div>
  )
}

interface MenuListProps {
  items: MenuTree[]
  parentId: string | null
  onReorder: (items: MenuTree[], parentId: string | null) => void
  onEdit: (menu: Menu) => void
  onDelete: (menu: Menu) => void
  disabled?: boolean
  depth?: number
}

function MenuList({ items, parentId, onReorder, onEdit, onDelete, disabled, depth = 0 }: MenuListProps) {
  return (
    <Sortable
      value={items}
      onMove={({ activeIndex, overIndex }) => {
        onReorder(arrayMove(items, activeIndex, overIndex), parentId)
      }}
      getItemValue={(item) => item.id}
    >
      <SortableContent className="space-y-2">
        {items.map((menu) => (
          <MenuItemRow
            key={menu.id}
            menu={menu}
            onReorder={onReorder}
            onEdit={onEdit}
            onDelete={onDelete}
            disabled={disabled}
            depth={depth}
          />
        ))}
      </SortableContent>
      <SortableOverlay>
        {({ value }) => {
          const menu = items.find((m) => m.id === value)
          return menu ? <MenuItemOverlay menu={menu} depth={depth} /> : null
        }}
      </SortableOverlay>
    </Sortable>
  )
}

interface MenuItemRowProps {
  menu: MenuTree
  onReorder: (items: MenuTree[], parentId: string | null) => void
  onEdit: (menu: Menu) => void
  onDelete: (menu: Menu) => void
  disabled?: boolean
  depth: number
}

function MenuItemRow({ menu, onReorder, onEdit, onDelete, disabled, depth }: MenuItemRowProps) {
  const [open, setOpen] = useState(true)
  const hasChildren = menu.children.length > 0

  return (
    <SortableItem value={menu.id} asChild>
      <div>
        <Collapsible open={open} onOpenChange={setOpen}>
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl border bg-card p-3 shadow-sm transition-colors hover:bg-accent/50",
              depth > 0 && "ml-8 border-l-2 border-l-primary/20"
            )}
          >
            <SortableItemHandle
              className={cn(
                "text-muted-foreground hover:text-foreground",
                disabled && "opacity-50 pointer-events-none"
              )}
            >
              <GripVertical className="h-5 w-5" />
            </SortableItemHandle>

            {hasChildren ? (
              <CollapsibleTrigger asChild>
                <button className="p-1 rounded hover:bg-accent cursor-pointer">
                  <ChevronRight className={cn("h-4 w-4 transition-transform", open && "rotate-90")} />
                </button>
              </CollapsibleTrigger>
            ) : (
              <div className="w-6" />
            )}

            <div className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <DynamicIcon name={menu.icon || "Menu"} className="h-4 w-4 text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{menu.title}</p>
              <p className="text-xs text-muted-foreground truncate">{menu.path}</p>
            </div>

            <Badge variant={menu.isActive ? "default" : "secondary"} className="hidden sm:inline-flex">
              {menu.isActive ? "Active" : "Inactive"}
            </Badge>

            <div className="flex items-center gap-2">
              <IconButton
                icon={<SquarePen className="h-4 w-4" />}
                tooltip="Edit"
                className="text-yellow-500 bg-yellow-50 hover:bg-yellow-500 hover:text-white hover:border-yellow-500 border-input"
                onClick={() => onEdit(menu)}
              />
              <IconButton
                icon={<Trash2 className="h-4 w-4" />}
                tooltip="Delete"
                className="text-destructive bg-destructive/10 hover:bg-destructive hover:text-white hover:border-destructive border-input"
                onClick={() => onDelete(menu)}
              />
            </div>
          </div>

          {hasChildren && (
            <CollapsibleContent className="mt-2">
              <MenuList
                items={menu.children}
                parentId={menu.id}
                onReorder={onReorder}
                onEdit={onEdit}
                onDelete={onDelete}
                disabled={disabled}
                depth={depth + 1}
              />
            </CollapsibleContent>
          )}
        </Collapsible>
      </div>
    </SortableItem>
  )
}

function MenuItemOverlay({ menu, depth }: { menu: MenuTree; depth: number }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border bg-card p-3 shadow-lg",
        depth > 0 && "ml-8"
      )}
    >
      <GripVertical className="h-5 w-5 text-muted-foreground" />
      <div className="w-6" />
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
        <DynamicIcon name={menu.icon || "Menu"} className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{menu.title}</p>
        <p className="text-xs text-muted-foreground">{menu.path}</p>
      </div>
    </div>
  )
}
