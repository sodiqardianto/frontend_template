"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ButtonProps = React.ComponentProps<typeof Button>

// Keep it simple and reusable. 
// Specific styles should be passed via className from the parent.
interface IconButtonProps extends ButtonProps {
  icon: React.ReactNode
}

export function IconButton({ 
  icon, 
  className, 
  variant = "outline",
  ...props 
}: IconButtonProps) {
  return (
    <Button
      variant={variant}
      size="icon"
      className={cn(
        "rounded-xl hover:cursor-pointer transition-all duration-200", 
        className
      )}
      {...props}
    >
      {icon}
    </Button>
  )
}
