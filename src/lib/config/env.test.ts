import { afterEach, describe, expect, it } from "vitest";
import { getPublicEnv, getServerEnv, hasPublicSupabaseEnv, hasServerSupabaseEnv } from "@/lib/config/env";

const ORIGINAL_ENV = { ...process.env };

function restoreEnv() {
  for (const key of Object.keys(process.env)) {
    if (!(key in ORIGINAL_ENV)) {
      delete process.env[key];
    }
  }

  Object.assign(process.env, ORIGINAL_ENV);
}

afterEach(() => {
  restoreEnv();
});

describe("env config", () => {
  it("reads public env dynamically at call time", () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    expect(hasPublicSupabaseEnv()).toBe(false);

    process.env.NEXT_PUBLIC_APP_URL = "https://autoracontable.vercel.app";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://skqtwagdshdppijswchw.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";

    expect(hasPublicSupabaseEnv()).toBe(true);
    expect(getPublicEnv().success).toBe(true);
  });

  it("reads server env dynamically at call time", () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(hasServerSupabaseEnv()).toBe(false);

    process.env.NEXT_PUBLIC_APP_URL = "https://autoracontable.vercel.app";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://skqtwagdshdppijswchw.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";

    expect(hasServerSupabaseEnv()).toBe(true);
    expect(getServerEnv().success).toBe(true);
  });
});
