"use client"

import { useState } from "react"
import {
  Activity,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Server,
  Sun,
  Moon,
  ChevronDown,
  Monitor,
  Wifi,
  Power,
} from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface SubNavItem {
  title: string
  href: string
  icon: React.ElementType
}

interface NavGroup {
  title: string
  icon: React.ElementType
  items: SubNavItem[]
}

const navGroups: NavGroup[] = [
  {
    title: "System",
    icon: Monitor,
    items: [
      { title: "Monitor", href: "/system/monitor", icon: Activity },
      { title: "Setting", href: "/system/setting", icon: Settings },
    ],
  },
  {
    title: "Network",
    icon: Wifi,
    items: [{ title: "Wake on LAN", href: "/network/wol", icon: Power }],
  },
]

interface AppSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    System: true,
    Network: true,
  })

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 flex h-screen flex-col border-r bg-sidebar transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Header */}
        <div className="flex h-14 items-center border-b px-3">
          <div
            className={cn(
              "flex items-center gap-2",
              collapsed && "justify-center"
            )}
          >
            <Server className="size-5 text-sidebar-primary" />
            {!collapsed && (
              <span className="font-semibold text-sidebar-foreground">
                Hako
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto size-8 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={onToggle}
          >
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-1 p-2">
          {navGroups.map((group) => {
            const isGroupActive = group.items.some(
              (item) =>
                pathname === item.href || pathname.startsWith(`${item.href}/`)
            )
            const isOpen = openGroups[group.title]

            if (collapsed) {
              // When collapsed, show items directly without collapsible
              return (
                <div key={group.title} className="flex flex-col gap-1">
                  <Tooltip disableHoverableContent>
                    <TooltipTrigger asChild>
                      <div className="flex items-center justify-center py-2">
                        <group.icon className="size-5 text-sidebar-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">{group.title}</TooltipContent>
                  </Tooltip>
                  {group.items.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`)
                    return (
                      <Tooltip key={item.href} disableHoverableContent>
                        <TooltipTrigger asChild>
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center justify-center rounded-md py-2 text-sm font-medium transition-colors",
                              isActive
                                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            )}
                          >
                            <item.icon className="size-4" />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          {item.title}
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
                </div>
              )
            }

            return (
              <Collapsible
                key={group.title}
                open={isOpen}
                onOpenChange={() => toggleGroup(group.title)}
              >
                <CollapsibleTrigger asChild>
                  <button
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isGroupActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <group.icon className="size-5 shrink-0" />
                      <span>{group.title}</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 transition-transform",
                        isOpen && "rotate-180"
                      )}
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="flex flex-col gap-1 px-3 py-1">
                  {group.items.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-sidebar-accent/50 text-sidebar-accent-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <item.icon className="size-4 shrink-0" />
                        <span>{item.title}</span>
                      </Link>
                    )
                  })}
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t p-3">
          <div
            className={cn("flex flex-col gap-3", collapsed && "items-center")}
          >
            {/* Theme Toggle */}
            <Tooltip disableHoverableContent>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size={collapsed ? "icon" : "default"}
                  className={cn(
                    "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    collapsed && "justify-center px-2"
                  )}
                  onClick={toggleTheme}
                >
                  {theme === "dark" ? (
                    <>
                      <Sun
                        data-icon={!collapsed ? "inline-start" : undefined}
                      />
                      {!collapsed && <span>Light Mode</span>}
                    </>
                  ) : (
                    <>
                      <Moon
                        data-icon={!collapsed ? "inline-start" : undefined}
                      />
                      {!collapsed && <span>Dark Mode</span>}
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right">
                  {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
                </TooltipContent>
              )}
            </Tooltip>

            {/* User Info & Logout */}
            <div
              className={cn("flex items-center gap-3", collapsed && "flex-col")}
            >
              <Tooltip disableHoverableContent>
                <TooltipTrigger asChild>
                  <Link href="/system/setting">
                    <Avatar className="size-8 shrink-0 cursor-pointer">
                      <AvatarFallback className="bg-sidebar-primary text-xs text-sidebar-primary-foreground">
                        {user?.username?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">{user?.username}</TooltipContent>
                )}
              </Tooltip>

              {!collapsed && (
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium text-sidebar-foreground">
                    {user?.username}
                  </span>
                  <span className="truncate text-xs text-sidebar-foreground/60">
                    {user?.email}
                  </span>
                </div>
              )}

              <Tooltip disableHoverableContent>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    onClick={logout}
                  >
                    <LogOut className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side={collapsed ? "right" : "top"}>
                  Logout
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  )
}
