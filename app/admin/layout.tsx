"use client"

import { useEffect } from "react"
import { toast } from "sonner"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { AuthGuard } from "@/components/auth-guard"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Show welcome toast after login redirect
  useEffect(() => {
    const userName = sessionStorage.getItem("showWelcomeToast")
    if (userName) {
      // Clear the flag
      sessionStorage.removeItem("showWelcomeToast")
      // Show welcome toast with slight delay for better UX
      setTimeout(() => {
        toast.success(`Selamat Datang, ${userName} !`, {
          duration: 4000,
        })
      }, 300)
    }
  }, [])

  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AppHeader title="Dashboard" notifications={5} />
          <div className="flex flex-1 flex-col gap-4 p-4">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  )
}
