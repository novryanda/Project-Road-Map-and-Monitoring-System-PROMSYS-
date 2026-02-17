"use client";

import React from "react";

import { Map, MapMarker, MarkerContent, MarkerPopup, MapControls } from "@/components/ui/map";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Phone, MapPin } from "lucide-react";
import { useTheme } from "next-themes";
import { useVendors } from "@/hooks/use-vendors";

interface VendorMapProps {
    focusLocation?: { lat: number; lng: number } | null;
}

export function VendorMap({ focusLocation }: VendorMapProps) {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);
    const { data: vendorsRes } = useVendors(1, 100);
    const vendors = vendorsRes?.data || [];
    const [viewport, setViewport] = React.useState({
        center: [106.8456, -6.1751] as [number, number],
        zoom: 11,
        bearing: 0,
        pitch: 0
    });

    React.useEffect(() => {
        if (focusLocation) {
            setViewport(prev => ({
                ...prev,
                center: [focusLocation.lng, focusLocation.lat],
                zoom: 15
            }));
        }
    }, [focusLocation]);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const vendorsWithLocation = vendors.filter(v => v.latitude && v.longitude);

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
                    viewport={viewport}
                    onViewportChange={setViewport}
                >
                    <MapControls showZoom showCompass showLocate position="bottom-right" />

                    {vendorsWithLocation.map((vendor) => (
                        <MapMarker
                            key={vendor.id}
                            latitude={vendor.latitude!}
                            longitude={vendor.longitude!}
                        >
                            <MarkerContent>
                                <div className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-transform hover:scale-110">
                                    <Building2 className="h-4 w-4" />
                                </div>
                            </MarkerContent>
                            <MarkerPopup className="w-64 p-0 overflow-hidden border-none shadow-xl bg-white dark:bg-slate-950">
                                <div className="p-4 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-bold text-sm">{vendor.name}</h3>
                                            <p className="text-xs text-muted-foreground">{vendor.category?.name || "Uncategorized"}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex items-center text-xs text-muted-foreground">
                                            <Phone className="mr-2 h-3 w-3" />
                                            {vendor.phone || "-"}
                                        </div>
                                        <div className="flex items-center text-xs text-muted-foreground">
                                            <MapPin className="mr-2 h-3 w-3" />
                                            {vendor.location || "?"}
                                        </div>
                                    </div>

                                    <a
                                        href={vendor.googleMapsUrl || "#"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`block w-full text-center rounded-md bg-primary py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity ${!vendor.googleMapsUrl ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
                                    >
                                        View Vendor Details
                                    </a>
                                </div>
                            </MarkerPopup>
                        </MapMarker>
                    ))}
                </Map>
            </div>
        </Card>
    );
}
