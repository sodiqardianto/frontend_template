import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CrudModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode | ((containerRef: React.RefObject<HTMLDivElement | null>) => React.ReactNode)
}

export function CrudModal({
  open,
  onOpenChange,
  title,
  description,
  children,
}: CrudModalProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" ref={containerRef}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {typeof children === "function" ? children(containerRef) : children}
      </DialogContent>
    </Dialog>
  )
}
