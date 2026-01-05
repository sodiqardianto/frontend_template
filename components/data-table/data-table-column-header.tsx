"use client"

import type { Column } from "@tanstack/react-table"
import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  label: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  label,
  className,
  ...props
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{label}</div>
  }

  const toggleSorting = () => {
    const isSorted = column.getIsSorted()
    if (isSorted === false) {
      column.toggleSorting(true) // Desc
    } else if (isSorted === "desc") {
      column.toggleSorting(false) // Asc
    } else {
      column.clearSorting() // Reset
    }
  }

  return (
    <div
      onClick={toggleSorting}
      className={cn(
        "-ml-3 flex h-8 cursor-pointer items-center gap-2 rounded-md px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent [&_svg]:size-4",
        className
      )}
      {...props}
    >
      <span>{label}</span>
      {column.getIsSorted() === "desc" ? (
        <ChevronDown />
      ) : column.getIsSorted() === "asc" ? (
        <ChevronUp />
      ) : (
        <ChevronsUpDown className="text-muted-foreground/50" />
      )}
    </div>
  )
}
