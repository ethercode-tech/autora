import type { PropsWithChildren } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ConfigurationState } from "@/components/feedback/configuration-state";
import { hasPublicSupabaseEnv } from "@/lib/config/env";
import { requireActiveAccount } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: PropsWithChildren) {
  if (!hasPublicSupabaseEnv()) {
    return <AppShell><ConfigurationState /></AppShell>;
  }

  const session = await requireActiveAccount();

  return <AppShell businessName={session.profile?.business_name} businessType={session.profile?.business_type}>{children}</AppShell>;
}
