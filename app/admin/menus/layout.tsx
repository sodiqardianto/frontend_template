import React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Menu Management",
  description: "Manage application menus and navigation",
}

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
