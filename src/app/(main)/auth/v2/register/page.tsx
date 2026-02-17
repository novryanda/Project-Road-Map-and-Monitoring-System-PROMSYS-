import Link from "next/link";

import { APP_CONFIG } from "@/config/app-config";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <>
      <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[350px]">
        <div className="space-y-2 text-center">
          <h1 className="font-medium text-3xl">Create an account</h1>
          <p className="text-muted-foreground text-sm">Enter your details to create your account.</p>
        </div>
        <RegisterForm />
        <p className="text-center text-muted-foreground text-sm">
          Already have an account?{" "}
          <Link href="/auth/v2/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Login
          </Link>
        </p>
      </div>

      <div className="absolute bottom-5 flex w-full justify-between px-10">
        <div className="text-sm">{APP_CONFIG.copyright}</div>
      </div>
    </>
  );
}
