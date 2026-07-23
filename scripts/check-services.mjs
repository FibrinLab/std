// Verifies the Supabase + Resend wiring without printing any secrets.
// Usage: npm run check:services
import { readFileSync, existsSync } from "node:fs";

const root = new URL("..", import.meta.url);
for (const file of [".env", ".env.local"]) {
  const path = new URL(file, root);
  if (!existsSync(path)) continue;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const match = line.match(/^([A-Z_0-9]+)=(.*)$/);
    if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2].replace(/^["']|["']$/g, "").trim();
  }
}

const { NEXT_PUBLIC_SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key, RESEND_API_KEY: resendKey, EMAIL_FROM: emailFrom = "", ADMIN_PASSWORD: adminPassword, DEMO_MODE: demoMode } = process.env;
const ok = (msg) => console.log(`  ✓ ${msg}`);
const bad = (msg) => console.log(`  ✗ ${msg}`);
let failures = 0;
const fail = (msg) => { failures++; bad(msg); };

console.log("\nSupabase");
if (!url || !key) {
  fail("NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY are missing — paste them into .env (Supabase → Project Settings → API).");
} else {
  const query = async (path) => fetch(`${url}/rest/v1/${path}`, { headers: { apikey: key, authorization: `Bearer ${key}` } });
  const checks = [
    ["save_the_date_rsvps?select=id&limit=1", "save_the_date_rsvps table", "0001_initial.sql"],
    ["save_the_date_rsvps?select=guest_names&limit=1", "guest_names column", "0002_guest_names.sql"],
    ["broadcasts?select=id,audience&limit=1", "broadcasts table", "0003_broadcasts.sql"],
    ["save_the_date_rsvps?select=approval&limit=1", "approval column", "0005_approval_and_selected.sql"],
    ["invites?select=id,code,plus_one&limit=1", "invites table", "0006_invites.sql"],
    ["save_the_date_rsvps?select=invite_id&limit=1", "invite_id column", "0006_invites.sql"],
    ["save_the_date_rsvps?select=phone&limit=1", "phone column", "0007_phone.sql"],
  ];
  for (const [path, label, migration] of checks) {
    try {
      const res = await query(path);
      if (res.ok) ok(`${label} present`);
      else if (res.status === 401 || res.status === 403) { fail("service role key was rejected — re-copy it from Supabase."); break; }
      else fail(`${label} missing — run supabase/migrations/${migration} (and any earlier ones) in the Supabase SQL editor.`);
    } catch { fail(`could not reach ${url} — check the project URL.`); break; }
  }
}

console.log("\nResend");
if (!resendKey) {
  fail("RESEND_API_KEY is missing — create one at resend.com/api-keys and paste it into .env.");
} else {
  try {
    const res = await fetch("https://api.resend.com/domains", { headers: { authorization: `Bearer ${resendKey}` } });
    if (!res.ok) fail(`API key rejected (HTTP ${res.status}) — re-copy it from Resend.`);
    else {
      ok("API key is valid");
      const { data } = await res.json();
      const domains = (Array.isArray(data) ? data : data?.data ?? []).map((d) => ({ name: d.name, status: d.status }));
      const fromDomain = emailFrom.match(/@([^>\s]+)/)?.[1]?.toLowerCase();
      if (!fromDomain) bad("EMAIL_FROM is not set or has no address.");
      else if (fromDomain === "resend.dev") bad(`EMAIL_FROM uses ${fromDomain} — Resend only delivers that to YOUR own inbox. Verify your domain in Resend and update EMAIL_FROM before guests can receive email.`);
      else {
        const match = domains.find((d) => fromDomain.endsWith(d.name.toLowerCase()));
        if (!match) fail(`EMAIL_FROM domain "${fromDomain}" is not among your Resend domains (${domains.map((d) => d.name).join(", ") || "none added"}). Add and verify it at resend.com/domains.`);
        else if (match.status !== "verified") fail(`Domain "${match.name}" is added but "${match.status}" — finish DNS verification in Resend.`);
        else ok(`EMAIL_FROM domain "${match.name}" is verified`);
      }
    }
  } catch { fail("could not reach api.resend.com."); }
}

console.log("\nApp settings");
if (demoMode === "false") ok("DEMO_MODE=false — replies persist to Supabase");
else bad("DEMO_MODE is not \"false\" — replies stay in memory and are lost on restart. Set DEMO_MODE=false for the live site.");
if (adminPassword && adminPassword.length >= 8) ok("ADMIN_PASSWORD is set");
else bad("ADMIN_PASSWORD is missing or under 8 characters — the admin will be locked in production until it is set.");

console.log(failures ? `\n${failures} issue(s) to fix — see above.\n` : "\nAll wired up. 🐝\n");
process.exit(failures ? 1 : 0);
