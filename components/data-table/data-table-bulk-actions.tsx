"use client"

import * as React from "react"
import type { Table } from "@tanstack/react-table"
import { Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DataTableBulkActionsProps<TData> {
  table: Table<TData>
  onBulkDelete?: (selectedIds: string[]) => void
  isDeleting?: boolean
  getRowId?: (row: TData) => string
}

/**
 * DataTableBulkActions - Reusable component for bulk actions on selected table rows
 * Following Single Responsibility Principle: Only handles bulk action UI
 * Following Open/Closed Principle: Can be extended with new actions via props
 */
export function DataTableBulkActions<TData>({
  table,
  onBulkDelete,
  isDeleting = false,
  getRowId = (row) => (row as { id: string }).id,
}: DataTableBulkActionsProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedCount = selectedRows.length

  if (selectedCount === 0) {
    return null
  }

  const handleBulkDelete = () => {
    if (!onBulkDelete) return
    const selectedIds = selectedRows.map((row) => getRowId(row.original))
    onBulkDelete(selectedIds)
  }

  return (
    <div className="flex items-center gap-2">
      {onBulkDelete && (
        <Button
          variant="destructive"
          size="sm"
          onClick={handleBulkDelete}
          disabled={isDeleting}
          className={cn("rounded-full cursor-pointer h-10")}
        >
          {isDeleting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="mr-2 h-4 w-4" />
          )}
        Delete {selectedCount} Selected
        </Button>
      )}
    </div>
  )
}
