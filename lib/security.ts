import { env, isDemoMode } from "./env";

export async function isAdmin() {
  if (isDemoMode) return true;
  const { createSupabaseServerClient } = await import("./supabase/server");
  const client = await createSupabaseServerClient();
  if (!client) return false;
  const { data: { user } } = await client.auth.getUser();
  if (!user?.email) return false;
  const allowlist = env.ADMIN_EMAILS.split(",").map((email) => email.trim().toLowerCase());
  return allowlist.includes(user.email.toLowerCase());
}
