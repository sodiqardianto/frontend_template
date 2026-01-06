import React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Register",
  description: "Register to your account",
}

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
