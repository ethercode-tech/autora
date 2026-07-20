import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { isOperationalAccountStatus } from "@/lib/auth/account-status";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export async function requireUserSession(): Promise<{
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  user: User;
  profile: ProfileRow | null;
}> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .returns<Database["public"]["Tables"]["profiles"]["Row"]>()
    .maybeSingle();

  const profile = profileData as ProfileRow | null;

  return { supabase, user, profile };
}

export async function requireActiveAccount() {
  const session = await requireUserSession();

  if (!session.profile || !isOperationalAccountStatus(session.profile.account_status)) {
    redirect("/account-status");
  }

  return session;
}

export async function requireAdminSession() {
  const session = await requireUserSession();
  const { data: adminUser } = await session.supabase.from("admin_users").select("user_id, active").eq("user_id", session.user.id).maybeSingle();

  if (!adminUser || adminUser.active !== true) {
    redirect("/dashboard");
  }

  return session;
}
