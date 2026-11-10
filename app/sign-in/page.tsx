import { Suspense } from "react";
import { SignInForm } from "@/components/sign-in-form";

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="px-4 py-16" aria-busy="true" />}>
      <SignInForm />
    </Suspense>
  );
}
