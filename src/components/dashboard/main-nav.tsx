"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Package2, Package, ShoppingCart, BarChart3, Bell, Settings } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { useNotifications } from "@/contexts/notification-context"

interface MainNavProps {
    className?: string
}

export function MainNav({ className }: MainNavProps) {
    const pathname = usePathname()
    const { unreadCount } = useNotifications()

    return (
        <div className="flex items-center justify-between w-full">
            <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)}>
                <Link href="/" className="flex items-center space-x-2 font-medium text-sm transition-colors hover:text-primary">
                    <Package2 className="h-5 w-5" />
                    <span className="hidden md:inline-block">AutoParts</span>
                </Link>
                <Link
                    href="/inventory"
                    className={cn(
                        "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary",
                        pathname.startsWith("/inventory") ? "text-primary" : "text-muted-foreground",
                    )}
                >
                    <Package className="h-4 w-4" />
                    <span className="hidden sm:inline-block">Inventory</span>
                </Link>
                <Link
                    href="/sales"
                    className={cn(
                        "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary",
                        pathname.startsWith("/sales") ? "text-primary" : "text-muted-foreground",
                    )}
                >
                    <ShoppingCart className="h-4 w-4" />
                    <span className="hidden sm:inline-block">Sales</span>
                </Link>
                <Link
                    href="/reports"
                    className={cn(
                        "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary",
                        pathname.startsWith("/reports") ? "text-primary" : "text-muted-foreground",
                    )}
                >
                    <BarChart3 className="h-4 w-4" />
                    <span className="hidden sm:inline-block">Reports</span>
                </Link>
                <Link
                    href="/notifications"
                    className={cn(
                        "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary relative",
                        pathname.startsWith("/notifications") ? "text-primary" : "text-muted-foreground",
                    )}
                >
                    <Bell className="h-4 w-4" />
                    <span className="hidden sm:inline-block">Notifications</span>
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </Badge>
                    )}
                </Link>
                <Link
                    href="/settings"
                    className={cn(
                        "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary",
                        pathname.startsWith("/settings") ? "text-primary" : "text-muted-foreground",
                    )}
                >
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline-block">Settings</span>
                </Link>
            </nav>
            <ThemeToggle />
        </div>
    )
}

