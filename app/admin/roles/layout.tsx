import React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Role Management",
  description: "Manage application roles and permissions",
}

export default function RolesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
