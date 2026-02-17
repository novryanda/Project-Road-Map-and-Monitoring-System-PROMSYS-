"use client";

import { useState } from "react";
import { VendorHeader } from "./components/vendor-header";
import { VendorMap } from "./components/vendor-map";
import { VendorTable } from "./components/vendor-table";

export default function Page() {
	const [focusLocation, setFocusLocation] = useState<{ lat: number; lng: number } | null>(null);

	return (
		<div className="flex flex-col gap-4 p-6 md:p-8">
			<VendorHeader />
			<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
				<section className="flex flex-col gap-4">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-semibold tracking-tight">Geographic Distribution</h2>
					</div>
					<VendorMap focusLocation={focusLocation} />
				</section>
				<section className="flex flex-col gap-4">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-semibold tracking-tight">Vendor Directory</h2>
					</div>
					<VendorTable onVendorSelect={(lat, lng) => setFocusLocation({ lat, lng })} />
				</section>
			</div>
		</div>
	);
}
