"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type ButtonProps = React.ComponentProps<typeof Button>

interface IconButtonProps extends ButtonProps {
  icon: React.ReactNode
  tooltip?: string
}

export function IconButton({ 
  icon, 
  className, 
  variant = "outline",
  tooltip,
  ...props 
}: IconButtonProps) {
  const button = (
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

  if (!tooltip) return button

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
