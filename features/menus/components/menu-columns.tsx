"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import type { Menu } from "@/features/menus/types"
import { IconButton } from "@/components/shared/buttons"
import { SquarePenIcon, Trash2 } from "lucide-react"

interface GetColumnsProps {
  onEdit: (menu: Menu) => void
  onDelete: (menu: Menu) => void
}

export function getColumns({ onEdit, onDelete }: GetColumnsProps): ColumnDef<Menu>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Title" />
      ),
      meta: {
        label: "Title",
        variant: "text",
      },
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: "path",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Path" />
      ),
      cell: ({ row }) => (
        <code className="text-sm bg-gray-100 px-1.5 py-0.5 rounded">
          {row.getValue("path")}
        </code>
      ),
      meta: {
        label: "Path",
        variant: "text",
      },
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: "icon",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Icon" />
      ),
      cell: ({ row }) => <div>{row.getValue("icon") || "-"}</div>,
      meta: {
        label: "Icon",
        variant: "text",
      },
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: "permission",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Permission" />
      ),
      cell: ({ row }) => {
        const permission = row.getValue("permission") as string | null
        if (!permission) return null
        return (
          <Badge variant="outline" className="text-xs">
            {permission}
          </Badge>
        )
      },
      meta: {
        label: "Permission",
        variant: "text",
      },
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Status" />
      ),
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(String(row.getValue(id)))
      },
      meta: {
        label: "Status",
        variant: "select",
        options: [
          { label: "Active", value: "true" },
          { label: "Inactive", value: "false" },
        ],
      },
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Actions" className="justify-end" />
      ),
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <IconButton
            icon={<SquarePenIcon className="h-4 w-4" />}
            className="text-yellow-500 bg-yellow-50 hover:bg-yellow-500 hover:text-white hover:border-yellow-500 border-input"
            onClick={() => onEdit(row.original)}
          />
          <IconButton
            icon={<Trash2 className="h-4 w-4" />}
            className="text-destructive bg-destructive/10 hover:bg-destructive hover:text-white hover:border-destructive border-input"
            onClick={() => onDelete(row.original)}
          />
        </div>
      ),
    },
  ]
}
