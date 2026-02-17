import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin // browser: use same origin (proxied via Next.js rewrites)
      : process.env.NEXT_PUBLIC_API_URL, // SSR: call BE directly
  plugins: [adminClient()],
});

export const { useSession, signIn, signUp, signOut } = authClient;
