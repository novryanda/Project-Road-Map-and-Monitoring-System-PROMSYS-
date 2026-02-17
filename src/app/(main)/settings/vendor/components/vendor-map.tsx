"use client";

import React from "react";

import { Map, MapMarker, MarkerContent, MarkerPopup, MapControls } from "@/components/ui/map";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Phone, MapPin } from "lucide-react";
import { useTheme } from "next-themes";

const VENDORS = [
    {
        id: 1,
        name: "PT. Global Logistik",
        lat: -6.2088,
        lng: 106.8456,
        status: "Active",
        phone: "+62 21 555 0123",
        type: "Logistics",
    },
    {
        id: 2,
        name: "Mitra Bangun Jaya",
        lat: -6.1751,
        lng: 106.8650,
        status: "Active",
        phone: "+62 21 555 0456",
        type: "Construction",
    },
    {
        id: 3,
        name: "Tekno Solusindo",
        lat: -6.2297,
        lng: 106.8091,
        status: "Maintenance",
        phone: "+62 21 555 0789",
        type: "IT Services",
    },
    {
        id: 4,
        name: "Sentosa Catering",
        lat: -6.1375,
        lng: 106.8146,
        status: "Active",
        phone: "+62 21 555 0111",
        type: "F&B",
    },
];

export function VendorMap() {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Card className="overflow-hidden border-none bg-white/50 p-1 backdrop-blur-md dark:bg-slate-900/50">
                <div className="h-[450px] w-full rounded-lg border bg-muted/20 animate-pulse" />
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden border-none bg-white/50 p-1 backdrop-blur-md dark:bg-slate-900/50">
            <div className="h-[450px] w-full overflow-hidden rounded-lg border bg-muted/20">
                <Map
                    theme={resolvedTheme as "light" | "dark"}
                    viewport={{
                        center: [106.8456, -6.1751],
                        zoom: 11,
                    }}
                >
                    <MapControls showZoom showCompass showLocate position="bottom-right" />

                    {VENDORS.map((vendor) => (
                        <MapMarker
                            key={vendor.id}
                            latitude={vendor.lat}
                            longitude={vendor.lng}
                        >
                            <MarkerContent>
                                <div className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-transform hover:scale-110">
                                    <Building2 className="h-4 w-4" />
                                </div>
                            </MarkerContent>
                            <MarkerPopup className="w-64 p-0 overflow-hidden border-none shadow-xl">
                                <div className="p-4 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-bold text-sm">{vendor.name}</h3>
                                            <p className="text-xs text-muted-foreground">{vendor.type}</p>
                                        </div>
                                        <Badge variant={vendor.status === "Active" ? "default" : "secondary"} className="text-[10px] h-5">
                                            {vendor.status}
                                        </Badge>
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex items-center text-xs text-muted-foreground">
                                            <Phone className="mr-2 h-3 w-3" />
                                            {vendor.phone}
                                        </div>
                                        <div className="flex items-center text-xs text-muted-foreground">
                                            <MapPin className="mr-2 h-3 w-3" />
                                            Jakarta, Indonesia
                                        </div>
                                    </div>

                                    <button className="w-full rounded-md bg-primary py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity">
                                        View Vendor Details
                                    </button>
                                </div>
                            </MarkerPopup>
                        </MapMarker>
                    ))}
                </Map>
            </div>
        </Card>
    );
}
