"use client"

import { useState } from "react"
import { Bell, LogOut, User2, Loader2 } from "lucide-react"
import { logout } from "@/features/auth/services"
import { useAuthStore } from "@/features/auth/stores/use-auth-store"

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AppHeaderProps {
  title?: string
  notifications?: number
}

export function AppHeader({ 
  title = "Dashboard",
  notifications = 5 
}: AppHeaderProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const user = useAuthStore((state) => state.user)

  const userName = user?.name || "User"
  const userEmail = user?.email || ""

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      window.location.href = "/login"
    } catch (error) {
      console.error("Logout failed:", error)
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b px-4 bg-background/95 backdrop-blur">
      <SidebarTrigger />
      <div className="flex flex-1 items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">{title}</h1>

        <div className="flex items-center gap-3">
          {/* Notifications */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-2xl cursor-pointer"
                >
                  <Bell className="h-5 w-5" />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white font-medium">
                      {notifications}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{notifications} new notifications</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 cursor-pointer">
                <Avatar className="h-9 w-9 border-2 border-primary">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {userName.split(" ").map((n: string) => n[0].toUpperCase()).join("")}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userEmail}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User2 className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer rounded-md font-bold bg-red-600 text-white focus:bg-red-700 focus:text-white my-1"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <Loader2 className="mr-2 h-4 w-4 text-white animate-spin" />
                ) : (
                  <LogOut className="mr-2 h-4 w-4 text-white" />
                )}
                <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
