"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { KeyRound, ShieldCheck, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";

const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export function SecuritySettings() {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<ChangePasswordValues>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data: ChangePasswordValues) => {
        setIsLoading(true);
        try {
            const result = await authClient.changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            });
            if (result.error) {
                toast.error(result.error.message || "Failed to change password");
                return;
            }
            toast.success("Password changed successfully");
            form.reset();
            setOpen(false);
        } catch {
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="border-none bg-white/50 backdrop-blur-md dark:bg-slate-900/50">
            <CardHeader>
                <CardTitle>Security & Privacy</CardTitle>
                <CardDescription>Manage your password and account security settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center space-x-4">
                        <div className="rounded-full bg-slate-100 p-2 dark:bg-slate-800">
                            <KeyRound className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="font-medium">Password</p>
                            <p className="text-sm text-muted-foreground">Keep your account secure with a strong password</p>
                        </div>
                    </div>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">Change Password</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[400px]">
                            <DialogHeader>
                                <DialogTitle>Change Password</DialogTitle>
                                <DialogDescription>
                                    Enter your current password and choose a new one.
                                </DialogDescription>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="currentPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Current Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="••••••••" disabled={isLoading} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="newPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>New Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="••••••••" disabled={isLoading} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Confirm New Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="••••••••" disabled={isLoading} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="flex justify-end gap-2 pt-2">
                                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={isLoading}>
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Changing...
                                                </>
                                            ) : (
                                                "Change Password"
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="rounded-full bg-slate-100 p-2 dark:bg-slate-800">
                            <ShieldCheck className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                            <p className="font-medium">Account Access</p>
                            <p className="text-sm text-muted-foreground">See which devices currently have access to your account.</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm">Review Activity</Button>
                </div>
            </CardContent>
        </Card>
    );
}
