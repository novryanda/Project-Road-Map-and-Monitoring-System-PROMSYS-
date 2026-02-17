import Link from "next/link";

import { APP_CONFIG } from "@/config/app-config";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginV2() {
  return (
    <>
      <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[350px]">
        <div className="space-y-2 text-center">
          <h1 className="font-medium text-3xl">Login to your account</h1>
          <p className="text-muted-foreground text-sm">Please enter your details to login.</p>
        </div>
        <LoginForm />
        <p className="text-center text-muted-foreground text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/auth/v2/register" className="font-medium text-primary underline-offset-4 hover:underline">
            Register
          </Link>
        </p>
      </div>

      <div className="absolute bottom-5 flex w-full justify-between px-10">
        <div className="text-sm">{APP_CONFIG.copyright}</div>
      </div>
    </>
  );
}
