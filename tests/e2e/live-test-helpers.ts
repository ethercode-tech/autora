import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

function loadEnvFile() {
  const envFilePath = path.resolve(process.cwd(), ".env");

  if (!existsSync(envFilePath)) {
    return {} as Record<string, string>;
  }

  const entries = readFileSync(envFilePath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"))
    .map((line) => {
      const separatorIndex = line.indexOf("=");

      if (separatorIndex === -1) {
        return null;
      }

      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim();

      return [key, value] as const;
    })
    .filter((entry): entry is readonly [string, string] => entry !== null);

  return Object.fromEntries(entries);
}

const envFromFile = loadEnvFile();

export const liveE2EEnv = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? envFromFile.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? envFromFile.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? envFromFile.SUPABASE_SERVICE_ROLE_KEY
};

export function createAdminClient(): SupabaseClient<Database> {
  if (!liveE2EEnv.url || !liveE2EEnv.serviceRoleKey) {
    throw new Error("Missing live Supabase environment for Playwright live tests.");
  }

  return createClient<Database>(liveE2EEnv.url, liveE2EEnv.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
}

export function createUserClient() {
  if (!liveE2EEnv.url || !liveE2EEnv.anonKey) {
    throw new Error("Missing anon Supabase environment for Playwright live tests.");
  }

  return createClient<Database>(liveE2EEnv.url, liveE2EEnv.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
}

export async function findUserIdByEmail(adminClient: SupabaseClient<Database>, email: string) {
  const { data, error } = await adminClient.auth.admin.listUsers();

  if (error) {
    throw error;
  }

  return data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase())?.id ?? null;
}

export async function cleanupLiveArtifacts(adminClient: SupabaseClient<Database>, email: string) {
  const userId = await findUserIdByEmail(adminClient, email);

  if (userId) {
    try {
      await adminClient.auth.admin.deleteUser(userId);
    } catch {
      // Cleanup should not mask the test result.
    }
  }

  try {
    await adminClient.from("access_requests").delete().eq("email", email.toLowerCase());
  } catch {
    // Cleanup should not mask the test result.
  }
}
