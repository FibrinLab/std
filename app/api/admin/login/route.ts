import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { setAdminSession, verifyPassword } from "@/lib/security";

const schema = z.object({ password: z.string().min(1).max(200) });

const attempts = new Map<string, { count: number; reset: number }>();
function allowed(ip: string) { const now = Date.now(); const item = attempts.get(ip); if (!item || item.reset < now) { attempts.set(ip, { count: 1, reset: now + 60_000 }); return true; } if (item.count >= 8) return false; item.count++; return true; }

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  if (!allowed(ip)) return NextResponse.json({ error: "Too many attempts. Please wait a minute." }, { status: 429 });
  if (!env.ADMIN_PASSWORD) return NextResponse.json({ error: "Admin password is not configured. Set ADMIN_PASSWORD in the environment." }, { status: 503 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !verifyPassword(parsed.data.password)) return NextResponse.json({ error: "That password is not right." }, { status: 401 });
  await setAdminSession();
  return NextResponse.json({ ok: true });
}
