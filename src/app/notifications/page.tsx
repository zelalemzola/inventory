import type { Metadata } from "next"
import { MainNav } from "@/components/dashboard/main-nav"
import { UserNav } from "@/components/dashboard/user-nav"
import { Button } from "@/components/ui/button"
import { Check, Filter } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NotificationsList } from "@/components/notifications/notifications-list"

export const metadata: Metadata = {
    title: "Notifications | AutoParts",
    description: "View system notifications and alerts",
}

export default function NotificationsPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <div className="border-b">
                <div className="flex h-16 items-center px-4">
                    <MainNav className="mx-6" />
                    <div className="ml-auto flex items-center space-x-4">
                        <UserNav />
                    </div>
                </div>
            </div>
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                    <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline">
                            <Filter className="mr-2 h-4 w-4" />
                            Filter
                        </Button>
                        <Button>
                            <Check className="mr-2 h-4 w-4" />
                            Mark All as Read
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="all">
                    <TabsList className="flex flex-wrap">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="unread">Unread</TabsTrigger>
                        <TabsTrigger value="stock">Stock Alerts</TabsTrigger>
                        <TabsTrigger value="price">Price Changes</TabsTrigger>
                        <TabsTrigger value="sale">Sales</TabsTrigger>
                        <TabsTrigger value="system">System</TabsTrigger>
                    </TabsList>
                    <TabsContent value="all" className="space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle>All Notifications</CardTitle>
                                <CardDescription>View all system notifications and alerts</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <NotificationsList type="all" />
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="unread" className="space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle>Unread Notifications</CardTitle>
                                <CardDescription>Notifications you haven't read yet</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <NotificationsList type="unread" />
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="stock" className="space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle>Stock Alerts</CardTitle>
                                <CardDescription>Notifications about low or out of stock items</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <NotificationsList type="stock" />
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="price" className="space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle>Price Change Alerts</CardTitle>
                                <CardDescription>Notifications about price changes</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <NotificationsList type="price" />
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="sale" className="space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle>Sales Notifications</CardTitle>
                                <CardDescription>Notifications about new sales</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <NotificationsList type="sale" />
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="system" className="space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle>System Notifications</CardTitle>
                                <CardDescription>System-related notifications and updates</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <NotificationsList type="system" />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

