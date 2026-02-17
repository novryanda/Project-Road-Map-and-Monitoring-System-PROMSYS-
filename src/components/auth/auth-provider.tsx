"use client";

import { createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
};

type AuthContextType = {
  user: AuthUser | null;
  isPending: boolean;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isPending: true,
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const user = session.data?.user ?? null;

  return (
    <AuthContext.Provider
      value={{
        user: user as AuthUser | null,
        isPending: session.isPending,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isPending, isAuthenticated } = useAuth();
  const router = useRouter();

  if (isPending) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="size-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.replace("/auth/v2/login");
    return null;
  }

  return <>{children}</>;
}
