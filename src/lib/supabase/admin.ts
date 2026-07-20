import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getServerEnv } from "@/lib/config/env";

export function createSupabaseAdminClient() {
  const serverEnv = getServerEnv();

  if (!serverEnv.success) {
    throw new Error("Supabase server environment variables are not configured.");
  }

  return createClient<Database>(
    serverEnv.data.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.data.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}
