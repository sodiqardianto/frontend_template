"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as LucideIcons from "lucide-react";
import {
  ChevronDown,
  Settings,
  BookOpen,
  LayoutGrid,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useMenuStore } from "@/features/menus/stores/use-menu-store";
import { useAuthStore } from "@/features/auth/stores/use-auth-store";
import type { Menu } from "@/features/menus/types";
import { useEffect, useMemo, useState } from "react";
import { ElementType } from "react";

// Helper to resolve icon component from string name
const getIcon = (name?: string) => {
  if (!name) return LucideIcons.Circle;
  const Icon = (LucideIcons as unknown as Record<string, ElementType>)[name];
  return Icon || LucideIcons.Circle;
};

// Recursive type for menu tree
type MenuNode = Menu & {
  items: MenuNode[];
};

export function AppSidebar() {
  const pathname = usePathname();
  const { menus, fetchMenus, isLoading, error } = useMenuStore();
  const user = useAuthStore((state) => state.user);
  const [openMenus, setOpenMenus] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchMenus(true);
  }, [fetchMenus]);

  const userPermissions = useMemo(() => {
    return user?.permissions || [];
  }, [user]);

  const menuTree = useMemo(() => {
    const activeMenus = menus.filter((m) => m.isActive);

    const menuMap = new Map<string, MenuNode>();

    activeMenus.forEach((menu) => {
      menuMap.set(menu.id, { ...menu, items: [] });
    });

    const tree: MenuNode[] = [];

    activeMenus
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .forEach((menu) => {
        const node = menuMap.get(menu.id);
        if (node) {
          if (menu.parentId && menuMap.has(menu.parentId)) {
            menuMap.get(menu.parentId)!.items.push(node);
          } else if (!menu.parentId) {
            tree.push(node);
          }
        }
      });

    const hasPermission = (menu: MenuNode): boolean => {
      if (!menu.permission) return true;
      return userPermissions.includes(menu.permission);
    };

    const filterByPermissions = (nodes: MenuNode[]): MenuNode[] => {
      return nodes
        .map((node) => {
          if (!hasPermission(node)) return null;

          const filteredChildren = filterByPermissions(node.items);

          if (node.items.length > 0 && filteredChildren.length === 0) {
            return null;
          }

          return { ...node, items: filteredChildren };
        })
        .filter((node): node is MenuNode => node !== null);
    };

    return filterByPermissions(tree);
  }, [menus, userPermissions]);

  // Auto open/close based on pathname
  useEffect(() => {
    const newOpenMenus = new Set<string>();
    menuTree.forEach((item) => {
      const isChildActive = item.items.some((child) => child.path === pathname);
      if (isChildActive) {
        newOpenMenus.add(item.id);
      }
    });
    setOpenMenus(newOpenMenus);
  }, [pathname, menuTree]);

  const toggleMenu = (id: string) => {
    setOpenMenus((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderMenuItem = (item: MenuNode) => {
    const Icon = getIcon(item.icon);
    const hasChildren = item.items && item.items.length > 0;
    const isActive = pathname === item.path;
    const isChildActive = item.items.some((child) => child.path === pathname);
    const isOpen = openMenus.has(item.id);

    if (hasChildren) {
      return (
        <Collapsible
          key={item.id}
          asChild
          open={isOpen}
          onOpenChange={() => toggleMenu(item.id)}
          className="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                tooltip={item.title}
                className="rounded-2xl cursor-pointer px-3 py-2"
                isActive={isActive || isChildActive}
              >
                <Icon className="size-4" />
                <span>{item.title}</span>
                <ChevronDown className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {item.items.map((subItem) => renderSubMenuItem(subItem))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      );
    }

    return (
      <SidebarMenuItem key={item.id}>
        <SidebarMenuButton
          asChild
          tooltip={item.title}
          isActive={isActive}
          className="rounded-2xl px-3"
        >
          <Link href={item.path}>
            <Icon className="size-4" />
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  const renderSubMenuItem = (item: MenuNode) => {
    return (
      <SidebarMenuSubItem key={item.id}>
        <SidebarMenuSubButton
          asChild
          isActive={pathname === item.path}
          className="rounded-2xl cursor-pointer px-2 py-2"
        >
          <Link href={item.path}>
            <span>{item.title}</span>
          </Link>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    );
  };

  return (
    <Sidebar>
      {/* Header */}
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex aspect-square size-6 items-center justify-center font-bold text-xl">
            TA
          </div>
          <div>
            <h2 className="font-semibold">Template Admin</h2>
            <p className="text-muted-foreground text-xs">Template Admin</p>
          </div>
        </div>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            {isLoading ? (
              <div className="p-4 text-sm text-muted-foreground">Loading menus...</div>
            ) : error ? (
              <div className="p-4 text-sm text-destructive">Error: {error}</div>
            ) : (
              <SidebarMenu>
                {/* Dashboard - always visible */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Dashboard"
                    isActive={pathname === "/admin"}
                    className="rounded-2xl px-3 py-2"
                  >
                    <Link href="/admin">
                      <LayoutGrid className="size-4" />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {/* Dynamic menus from database */}
                {menuTree.map((item) => renderMenuItem(item))}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="rounded-2xl px-3 py-2 cursor-pointer" tooltip="Settings">
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="rounded-2xl px-3 py-2 cursor-pointer" tooltip="Help">
              <BookOpen className="h-5 w-5" />
              <span>Help</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
