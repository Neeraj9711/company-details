import { Suspense } from "react";
import { SignUpForm } from "@/components/sign-up-form";

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="px-4 py-16" aria-busy="true" />}>
      <SignUpForm />
    </Suspense>
  );
}
