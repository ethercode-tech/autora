import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { isOperationalAccountStatus } from "@/lib/auth/account-status";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type AdminUserRow = Pick<Database["public"]["Tables"]["admin_users"]["Row"], "user_id" | "active" | "role">;

async function getAdminUser(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string
): Promise<AdminUserRow | null> {
  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("user_id, active, role")
    .eq("user_id", userId)
    .maybeSingle();

  return adminUser as AdminUserRow | null;
}

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
  const adminUser = await getAdminUser(session.supabase, session.user.id);

  if (adminUser?.active === true) {
    redirect("/admin");
  }

  if (!session.profile || !isOperationalAccountStatus(session.profile.account_status)) {
    redirect("/account-status");
  }

  return session;
}

export async function requireAdminSession() {
  const session = await requireUserSession();
  const adminUser = await getAdminUser(session.supabase, session.user.id);

  if (!adminUser || adminUser.active !== true) {
    redirect("/dashboard");
  }

  return session;
}
