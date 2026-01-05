"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as LucideIcons from "lucide-react";
import {
  ChevronDown,
  Settings,
  BookOpen,
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
import type { Menu } from "@/features/menus/lib/menu-validation";

// Helper to resolve icon component from string name
const getIcon = (name?: string) => {
  if (!name) return LucideIcons.Circle;
  const Icon = (LucideIcons as unknown as Record<string, React.ElementType>)[name];
  return Icon || LucideIcons.Circle;
};

// Recursive type for menu tree
type MenuNode = Menu & {
  items: MenuNode[];
};

export function AppSidebar() {
  const pathname = usePathname();
  const { menus, fetchMenus, isLoading } = useMenuStore();

  React.useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  const menuTree = React.useMemo(() => {
    // Filter active menus only
    const activeMenus = menus.filter((m) => m.isActive);

    // Build tree
    const menuMap = new Map<string, MenuNode>();
    // First pass: create nodes
    activeMenus.forEach((menu) => {
      menuMap.set(menu.id, { ...menu, items: [] });
    });

    const tree: MenuNode[] = [];
    
    // Second pass: link parents and children
    // We sort by order first to ensure proper display order
    activeMenus
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .forEach((menu) => {
        const node = menuMap.get(menu.id);
        if (node) {
          if (menu.parentId && menuMap.has(menu.parentId)) {
            menuMap.get(menu.parentId)!.items.push(node);
          } else {
            tree.push(node);
          }
        }
      });
    return tree;
  }, [menus]);

  const renderMenuItem = (item: MenuNode) => {
    const Icon = getIcon(item.icon);
    const hasChildren = item.items && item.items.length > 0;
    const isActive = pathname === item.path;
    const isChildActive = item.items.some((child) => child.path === pathname);

    if (hasChildren) {
      return (
        <Collapsible
          key={item.id}
          asChild
          defaultOpen={isActive || isChildActive}
          className="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                tooltip={item.title}
                className="rounded-2xl"
                isActive={isActive}
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
          className="rounded-2xl"
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
          className="rounded-2xl"
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
            S
          </div>
          <div>
            <h2 className="font-semibold">Sodiq Admin</h2>
            <p className="text-muted-foreground text-xs">Menu Management</p>
          </div>
        </div>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            {isLoading ? (
              <div className="p-4 text-sm text-muted-foreground">Loading menus...</div>
            ) : (
              <SidebarMenu>
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
            <SidebarMenuButton className="rounded-2xl" tooltip="Settings">
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="rounded-2xl" tooltip="Help">
              <BookOpen className="h-5 w-5" />
              <span>Help</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
