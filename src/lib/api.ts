import axios from "axios";
import { env } from "@/env";

// In production, NEXT_PUBLIC_API_URL points to the BE (e.g. https://api.netkrida.cloud)
// In development, it falls back to empty string so "/api" uses Next.js rewrites
const API_BASE = env.NEXT_PUBLIC_API_URL ?? "";

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export default api;
