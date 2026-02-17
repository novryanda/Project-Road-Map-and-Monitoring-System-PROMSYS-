"use client";

import { Building2, MapPin, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useVendors } from "@/hooks/use-vendors";

export function VendorHeader() {
    const { data: vendorsRes } = useVendors(1, 100);
    const vendors = vendorsRes?.data || [];
    const totalVendors = vendors.length;
    const withLocation = vendors.filter((v) => v.location).length;
    const withContact = vendors.filter((v) => v.email || v.phone).length;

    const stats = [
        {
            label: "Total Vendors",
            value: String(totalVendors),
            icon: <Building2 className="h-4 w-4 text-blue-500" />,
            description: "Registered vendors",
        },
        {
            label: "Active Locations",
            value: String(withLocation),
            icon: <MapPin className="h-4 w-4 text-emerald-500" />,
            description: "Vendors with location",
        },
        {
            label: "Contact Coverage",
            value: totalVendors > 0 ? `${Math.round((withContact / totalVendors) * 100)}%` : "0%",
            icon: <TrendingUp className="h-4 w-4 text-orange-500" />,
            description: "With contact info",
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                {stats.map((stat, index) => (
                    <Card key={index} className="overflow-hidden border-none bg-white/50 backdrop-blur-md dark:bg-slate-900/50">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between space-x-4">
                                <div className="flex items-center space-x-4">
                                    <div className="rounded-full bg-slate-100 p-2 dark:bg-slate-800">
                                        {stat.icon}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            {stat.label}
                                        </p>
                                        <h2 className="text-2xl font-bold">{stat.value}</h2>
                                    </div>
                                </div>
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
