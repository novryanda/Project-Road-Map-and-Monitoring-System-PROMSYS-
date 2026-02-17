import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { env } from "@/env";

// We use "" (relative) to leverage Next.js rewrites/proxy both in dev and prod
// This ensures cookies are handled correctly on the same origin (promsys.netkrida.cloud)
export const authClient = createAuthClient({
  baseURL: "",
  plugins: [adminClient()],
});

export const { useSession, signIn, signUp, signOut } = authClient;
