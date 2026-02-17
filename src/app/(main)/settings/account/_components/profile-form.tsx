"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { authClient } from "@/lib/auth-client";
import { getInitials } from "@/lib/utils";

const profileFormSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileForm() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            name: "",
            email: "",
        },
    });

    useEffect(() => {
        if (user) {
            form.reset({
                name: user.name,
                email: user.email,
            });
        }
    }, [user, form]);

    const onSubmit = async (data: ProfileFormValues) => {
        setIsLoading(true);
        try {
            const result = await authClient.updateUser({
                name: data.name,
            });
            if (result.error) {
                toast.error(result.error.message || "Failed to update profile");
                return;
            }
            toast.success("Profile updated successfully");
        } catch {
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="border-none bg-white/50 backdrop-blur-md dark:bg-slate-900/50">
            <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details and how others see you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                    <div className="relative group">
                        <Avatar className="h-24 w-24 border-2 border-primary/20">
                            <AvatarImage src={user?.image || undefined} />
                            <AvatarFallback>{getInitials(user?.name ?? "")}</AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                            <Camera className="h-6 w-6" />
                        </div>
                    </div>
                    <div>
                        <Button variant="outline" size="sm">Change Avatar</Button>
                        <p className="text-xs text-muted-foreground mt-1">JPG, GIF or PNG. Max size 2MB.</p>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Your name" disabled={isLoading} {...field} className="bg-white/50 dark:bg-slate-800/50" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="your@email.com" disabled className="bg-white/50 dark:bg-slate-800/50" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-[150px]" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
