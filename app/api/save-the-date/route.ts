import { NextResponse, after } from "next/server";
import { sendReplyEmail } from "@/lib/email";
import { findInviteByCode, saveReply } from "@/lib/repository";
import { saveTheDateSchema } from "@/lib/schemas";

const attempts = new Map<string, { count: number; reset: number }>();
function allowed(ip: string) { const now = Date.now(); const item = attempts.get(ip); if (!item || item.reset < now) { attempts.set(ip, { count: 1, reset: now + 60_000 }); return true; } if (item.count >= 10) return false; item.count++; return true; }

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  if (!allowed(ip)) return NextResponse.json({ error: "Too many replies from this connection. Please wait a minute." }, { status: 429 });
  const parsed = saveTheDateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check your name and email, then try again.", issues: parsed.error.issues }, { status: 400 });
  const invite = parsed.data.inviteCode ? await findInviteByCode(parsed.data.inviteCode) : null;
  // A party of two is only possible on a personal invite that grants a plus-one.
  if (parsed.data.guestCount > 1 && !invite?.plusOne) return NextResponse.json({ error: "Plus-ones are only with prior approval — please reply for yourself." }, { status: 400 });
  try {
    const reply = await saveReply({ ...parsed.data, inviteId: invite?.id ?? null });
    // after() runs post-response but is tracked by the runtime, so serverless hosts don't freeze it mid-send.
    after(() => sendReplyEmail(reply).catch((error) => console.error("Reply email failed", error)));
    return NextResponse.json({ ok: true, reply: { fullName: reply.fullName, status: reply.status, guestCount: reply.guestCount } });
  } catch (error) {
    console.error("Save-the-date reply failed", error);
    return NextResponse.json({ error: "We could not save your reply. Please try again." }, { status: 500 });
  }
}
