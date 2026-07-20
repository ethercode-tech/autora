import process from "node:process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { loadResolvedEnv } from "./load-project-env.mjs";

const REQUIRED_ENV_KEYS = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
const DEFAULT_OPTIONS = {
  businessName: "AUTORA Administracion",
  businessType: "manufacturer",
  currency: "ARS",
  timezone: "America/Argentina/Buenos_Aires",
  accountStatus: "active",
  role: "admin"
};

function requiredEnv(name, env) {
  const value = env[name];

  if (!value) {
    throw new Error(`Missing ${name}.`);
  }

  return value;
}

export function parseBootstrapAdminArgs(argv = process.argv.slice(2)) {
  const options = { ...DEFAULT_OPTIONS };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith("--")) {
      throw new Error(`Unexpected argument: ${token}`);
    }

    const key = token.slice(2);
    const value = argv[index + 1];

    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }

    index += 1;

    switch (key) {
      case "email":
        options.email = value.trim().toLowerCase();
        break;
      case "password":
        options.password = value;
        break;
      case "business-name":
        options.businessName = value.trim();
        break;
      case "business-type":
        options.businessType = value.trim();
        break;
      case "currency":
        options.currency = value.trim().toUpperCase();
        break;
      case "timezone":
        options.timezone = value.trim();
        break;
      case "account-status":
        options.accountStatus = value.trim();
        break;
      case "role":
        options.role = value.trim();
        break;
      default:
        throw new Error(`Unknown option: --${key}`);
    }
  }

  if (!options.email) {
    throw new Error("Pass --email <address> to create or promote the admin account.");
  }

  return options;
}

export function generateAdminPassword() {
  return `Autora!${randomUUID().replace(/-/gu, "").slice(0, 12)}`;
}

async function findUserByEmail(adminClient, email) {
  let page = 1;

  while (true) {
    const { data, error } = await adminClient.auth.admin.listUsers({
      page,
      perPage: 200
    });

    if (error) {
      throw new Error(`Could not list auth users: ${error.message}`);
    }

    const users = data?.users ?? [];
    const matchingUser = users.find((user) => user.email?.toLowerCase() === email);

    if (matchingUser) {
      return matchingUser;
    }

    if (users.length < 200) {
      return null;
    }

    page += 1;
  }
}

async function ensureProfile(adminClient, userId, options) {
  const payload = {
    user_id: userId,
    business_name: options.businessName,
    currency: options.currency,
    business_type: options.businessType,
    account_status: options.accountStatus,
    onboarding_completed: options.accountStatus === "active",
    timezone: options.timezone
  };

  const { data: existingProfile, error: profileLookupError } = await adminClient
    .from("profiles")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (profileLookupError) {
    throw new Error(`Could not resolve the admin profile: ${profileLookupError.message}`);
  }

  if (existingProfile) {
    const { error: profileUpdateError } = await adminClient.from("profiles").update(payload).eq("user_id", userId);

    if (profileUpdateError) {
      throw new Error(`Could not update the admin profile: ${profileUpdateError.message}`);
    }

    return "updated";
  }

  const { error: profileInsertError } = await adminClient.from("profiles").insert(payload);

  if (profileInsertError) {
    throw new Error(`Could not create the admin profile: ${profileInsertError.message}`);
  }

  return "created";
}

async function ensureAdminRole(adminClient, userId, role) {
  const { error } = await adminClient.from("admin_users").upsert(
    {
      user_id: userId,
      role,
      active: true
    },
    {
      onConflict: "user_id"
    }
  );

  if (error) {
    throw new Error(`Could not assign the admin role: ${error.message}`);
  }
}

export function createBootstrapSummary(result) {
  const lines = [
    `[admin:bootstrap] status=ok`,
    `[admin:bootstrap] email=${result.email}`,
    `[admin:bootstrap] user-id=${result.userId}`,
    `[admin:bootstrap] auth-user=${result.authUserAction}`,
    `[admin:bootstrap] profile=${result.profileAction}`,
    `[admin:bootstrap] admin-role=active`
  ];

  if (result.password) {
    lines.push(`[admin:bootstrap] password=${result.password}`);
  }

  return lines;
}

export async function runBootstrapAdmin({ argv = process.argv.slice(2), cwd = process.cwd(), env = process.env } = {}) {
  const options = parseBootstrapAdminArgs(argv);
  const resolvedEnv = await loadResolvedEnv(env, cwd);

  for (const key of REQUIRED_ENV_KEYS) {
    requiredEnv(key, resolvedEnv);
  }

  const generatedPassword = options.password || generateAdminPassword();
  const adminClient = createClient(resolvedEnv.NEXT_PUBLIC_SUPABASE_URL, resolvedEnv.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  let user = await findUserByEmail(adminClient, options.email);
  let authUserAction = "existing";

  if (!user) {
    const { data, error } = await adminClient.auth.admin.createUser({
      email: options.email,
      password: generatedPassword,
      email_confirm: true
    });

    if (error || !data.user) {
      throw new Error(`Could not create the admin auth user: ${error?.message ?? "missing user"}`);
    }

    user = data.user;
    authUserAction = "created";
  } else if (options.password) {
    const { data, error } = await adminClient.auth.admin.updateUserById(user.id, {
      password: generatedPassword,
      email_confirm: true
    });

    if (error || !data.user) {
      throw new Error(`Could not update the admin auth user: ${error?.message ?? "missing user"}`);
    }

    user = data.user;
    authUserAction = "updated-password";
  }

  const profileAction = await ensureProfile(adminClient, user.id, options);
  await ensureAdminRole(adminClient, user.id, options.role);

  return {
    email: options.email,
    userId: user.id,
    authUserAction,
    profileAction,
    password: authUserAction === "existing" && !options.password ? null : generatedPassword
  };
}

const isDirectExecution = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirectExecution) {
  runBootstrapAdmin()
    .then((result) => {
      process.stdout.write(`${createBootstrapSummary(result).join("\n")}\n`);
    })
    .catch((error) => {
      process.stderr.write(`[admin:bootstrap] status=failed\n[admin:bootstrap] error=${error.message}\n`);
      process.exitCode = 1;
    });
}
