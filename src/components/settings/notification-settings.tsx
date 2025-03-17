"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner"
 // Ensure this file exists or fix the path

const formSchema = z.object({
    stockAlerts: z.boolean(),
    priceChanges: z.boolean(),
    salesNotifications: z.boolean(),
    systemUpdates: z.boolean(),
    emailNotifications: z.boolean(),
    smsNotifications: z.boolean(),
    pushNotifications: z.boolean(),
    lowStockThreshold: z.coerce.number().min(0, {
        message: "Threshold cannot be negative.",
    }),
});

export function NotificationSettings() {
    const [loading, setLoading] = useState(true);
    // const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            stockAlerts: true,
            priceChanges: true,
            salesNotifications: true,
            systemUpdates: true,
            emailNotifications: true,
            smsNotifications: false,
            pushNotifications: false,
            lowStockThreshold: 5,
        },
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true);
                const response = await axios.get("/api/settings/notifications");

                if (response.data) {
                    // Update form with fetched settings
                    form.reset(response.data);
                }
            } catch (error) {
                console.error("Error fetching notification settings:", error);
                toast("Failed to load notification settings");
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, [form, toast]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await axios.post("/api/settings/notifications", values);

            toast("Your notification settings have been updated");
        } catch (error) {
            console.error("Error saving notification settings:", error);
            toast("Failed to save notification settings");
        }
    }

    if (loading) {
        return <div className="flex justify-center p-8">Loading notification settings...</div>;
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Notification Types</CardTitle>
                        <CardDescription>Choose which notifications you want to receive</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="stockAlerts"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <FormLabel>Stock Alerts</FormLabel>
                                        <FormDescription>Receive notifications when products are low or out of stock</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="priceChanges"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <FormLabel>Price Changes</FormLabel>
                                        <FormDescription>Receive notifications when product prices change</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="salesNotifications"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <FormLabel>Sales Notifications</FormLabel>
                                        <FormDescription>Receive notifications for new sales and transactions</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="systemUpdates"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <FormLabel>System Updates</FormLabel>
                                        <FormDescription>Receive notifications about system maintenance and updates</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Notification Channels</CardTitle>
                        <CardDescription>Choose how you want to receive notifications</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="emailNotifications"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <FormLabel>Email Notifications</FormLabel>
                                        <FormDescription>Receive notifications via email</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="smsNotifications"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <FormLabel>SMS Notifications</FormLabel>
                                        <FormDescription>Receive notifications via SMS</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="pushNotifications"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <FormLabel>Push Notifications</FormLabel>
                                        <FormDescription>Receive push notifications in your browser</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Thresholds</CardTitle>
                        <CardDescription>Configure notification thresholds</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="lowStockThreshold"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Low Stock Threshold</FormLabel>
                                    <FormDescription>Receive notifications when product stock falls below this level</FormDescription>
                                    <FormControl>
                                        <Input type="number" min="0" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <Separator />

                <div className="flex justify-end">
                    <Button type="submit">Save Changes</Button>
                </div>
            </form>
        </Form>
    );
}