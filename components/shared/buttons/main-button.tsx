"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ButtonProps = React.ComponentProps<typeof Button>

interface MainButtonProps extends ButtonProps {
  icon?: React.ReactNode
}

export function MainButton({
  icon,
  className,
  children,
  ...props
}: MainButtonProps) {
  return (
    <Button
      className={cn("rounded-full hover:cursor-pointer", className)}
      {...props}
    >
      {icon}
      {children}
    </Button>
  )
}
