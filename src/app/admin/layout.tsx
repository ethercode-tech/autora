import type { PropsWithChildren } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ConfigurationState } from "@/components/feedback/configuration-state";
import { hasPublicSupabaseEnv } from "@/lib/config/env";
import { requireAdminSession } from "@/lib/auth/session";

export default async function AdminLayout({ children }: PropsWithChildren) {
  if (!hasPublicSupabaseEnv()) {
    return <AppShell><ConfigurationState /></AppShell>;
  }

  await requireAdminSession();

  return <AppShell>{children}</AppShell>;
}
