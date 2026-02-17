import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { env } from "@/env";

// In production, NEXT_PUBLIC_API_URL should be the full BE URL (e.g. https://api.netkrida.cloud)
// In development, we use "" (relative) to leverage Next.js rewrites/proxy
export const authClient = createAuthClient({
  baseURL: process.env.NODE_ENV === "development" ? "" : (env.NEXT_PUBLIC_API_URL ?? ""),
  plugins: [adminClient()],
});

export const { useSession, signIn, signUp, signOut } = authClient;
