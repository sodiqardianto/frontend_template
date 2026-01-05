"use client"

import { Bell, LogOut, User2, CreditCard, Settings as SettingsIcon, Sparkles } from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
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
// import { Input } from "@/components/ui/input"
// import { useState } from "react"

interface AppHeaderProps {
  title?: string
  notifications?: number
}

// User data
const user = {
  name: "Admin User",
  email: "admin@example.com",
  avatar: "/avatars/shadcn.jpg",
}

export function AppHeader({ 
  title = "Dashboard",
  notifications = 5 
}: AppHeaderProps) {
  // const [searchQuery, setSearchQuery] = useState("")

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b px-4 bg-background/95 backdrop-blur">
      <SidebarTrigger />
      <div className="flex flex-1 items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">{title}</h1>
        
        {/* Search Input - Desktop Only */}
        {/* <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-2xl bg-gray-100 border-border focus-visible:ring-1"
            />
          </div>
        </div> */}

        <div className="flex items-center gap-3">
          {/* TODO: Implement Cloud Storage and Messages buttons
           * Add cloud storage integration
           * Add messaging system
           */}

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
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Sparkles className="mr-2 h-4 w-4" />
                <span>Upgrade to Pro</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User2 className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Billing</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <SettingsIcon className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer bg-red-600 text-white focus:bg-red-700 focus:text-white my-1">
                <LogOut className="mr-2 h-4 w-4 text-white" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
