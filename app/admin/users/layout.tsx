import React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "User Management",
  description: "Manage application users",
}

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
