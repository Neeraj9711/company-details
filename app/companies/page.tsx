import { Suspense } from "react";
import { CompaniesFallback } from "@/components/companies/companies-fallback";
import { CompaniesScreen } from "@/components/companies/companies-screen";

export default function CompaniesPage() {
  return (
    <Suspense fallback={<CompaniesFallback />}>
      <CompaniesScreen />
    </Suspense>
  );
}
