import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { env } from "@/env";

// In production, NEXT_PUBLIC_API_URL should be the full BE URL (e.g. https://api.netkrida.cloud)
// In development, it falls back to empty string so requests go to same origin (proxied via Next.js rewrites)
export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_API_URL ?? "",
  plugins: [adminClient()],
});

export const { useSession, signIn, signUp, signOut } = authClient;
