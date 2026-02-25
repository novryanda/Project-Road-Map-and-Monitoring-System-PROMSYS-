import axios from "axios";
import { env } from "@/env";

// In production, NEXT_PUBLIC_API_URL points to the BE (e.g. https://api.netkrida.cloud)
// In development, it falls back to empty string so "/api" uses Next.js rewrites
let API_BASE = env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ?? "";

// Resilience: If we are on a production domain but API_BASE points to localhost,
// it means an old env was baked into the build. We override it to use same-origin.
if (
    typeof window !== "undefined" &&
    !window.location.hostname.includes("localhost") &&
    API_BASE.includes("localhost")
) {
    console.warn("Resilience: Overriding localhost API URL to same-origin in production.");
    API_BASE = "";
}

const api = axios.create({
    // Only add /api if API_BASE doesn't already end with /api
    baseURL: API_BASE.endsWith("/api") ? API_BASE : `${API_BASE}/api`,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
});

// Global Response Interceptor
api.interceptors.response.use(
    (response) => {
        // If the response follows the WebResponse structure { data, paging?, meta? },
        // we return the full data object to allow hooks access to pagination.
        if (response.data && "data" in response.data) {
            return response.data;
        }
        return response.data;
    },
    (error) => {
        const message = error.response?.data?.message || error.message || "An unexpected error occurred";
        const status = error.response?.status;

        // Optional: Log errors in dev
        if (process.env.NODE_ENV === "development") {
            console.error(`[API Error] ${status}: ${message}`, error.response?.data);
        }

        // Trigger toast notification (assuming sonner/toast is used)
        import("sonner").then(({ toast }) => {
            toast.error(message, {
                description: status ? `Status Code: ${status}` : undefined,
            });
        });

        return Promise.reject(error);
    },
);

export default api;
