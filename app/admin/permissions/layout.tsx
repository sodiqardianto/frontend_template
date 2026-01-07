import React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Permission Management",
  description: "Manage application permissions",
}

export default function PermissionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
