"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Moon, Sun, Monitor, Globe, Bell } from "lucide-react";
import { useTheme } from "next-themes";
import React from "react";

export function PreferenceSettings() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <Card className="border-none bg-white/50 backdrop-blur-md dark:bg-slate-900/50">
            <CardHeader>
                <CardTitle>System Preferences</CardTitle>
                <CardDescription>Customize how you interact with the platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <Label className="flex items-center">
                        <Monitor className="mr-2 h-4 w-4" />
                        Appearance (Theme)
                    </Label>
                    <RadioGroup
                        defaultValue={theme}
                        onValueChange={(val) => setTheme(val)}
                        className="grid grid-cols-3 gap-4"
                    >
                        <div>
                            <RadioGroupItem value="light" id="light" className="peer sr-only" />
                            <Label
                                htmlFor="light"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                            >
                                <Sun className="mb-3 h-6 w-6" />
                                Light
                            </Label>
                        </div>
                        <div>
                            <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                            <Label
                                htmlFor="dark"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                            >
                                <Moon className="mb-3 h-6 w-6" />
                                Dark
                            </Label>
                        </div>
                        <div>
                            <RadioGroupItem value="system" id="system" className="peer sr-only" />
                            <Label
                                htmlFor="system"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                            >
                                <Monitor className="mb-3 h-6 w-6" />
                                System
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label className="flex items-center">
                            <Globe className="mr-2 h-4 w-4" />
                            Language
                        </Label>
                        <Select defaultValue="en">
                            <SelectTrigger>
                                <SelectValue placeholder="Select Language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">English (US)</SelectItem>
                                <SelectItem value="id">Bahasa Indonesia</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="flex items-center">
                            <Bell className="mr-2 h-4 w-4" />
                            Notifications
                        </Label>
                        <Select defaultValue="all">
                            <SelectTrigger>
                                <SelectValue placeholder="Select Preference" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All notifications</SelectItem>
                                <SelectItem value="mentions">Mentions only</SelectItem>
                                <SelectItem value="none">None</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
