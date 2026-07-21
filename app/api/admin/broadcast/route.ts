import { NextResponse } from "next/server";
import { z } from "zod";
import { sendBroadcast } from "@/lib/email";
import { env, isDemoMode } from "@/lib/env";
import { getRecipients, saveBroadcast } from "@/lib/repository";
import { isAdmin } from "@/lib/security";

const schema = z.object({
  subject: z.string().trim().min(1).max(150),
  body: z.string().trim().min(1).max(5000),
  audience: z.enum(["all", "celebrating", "from_afar"]),
});

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check the subject and message." }, { status: 400 });
  const recipients = await getRecipients(parsed.data.audience);
  if (recipients.length === 0) return NextResponse.json({ error: "No guests match that audience yet." }, { status: 400 });
  try {
    if (!env.RESEND_API_KEY) {
      if (!isDemoMode) return NextResponse.json({ error: "RESEND_API_KEY is not configured, so emails cannot be sent." }, { status: 503 });
      const broadcast = await saveBroadcast({ ...parsed.data, sentCount: recipients.length });
      return NextResponse.json({ ok: true, sent: recipients.length, failed: 0, demo: true, broadcast });
    }
    const { sent, failed } = await sendBroadcast(parsed.data.subject, parsed.data.body, recipients);
    const broadcast = await saveBroadcast({ ...parsed.data, sentCount: sent });
    if (failed > 0) return NextResponse.json({ ok: false, sent, failed, error: `${failed} email(s) failed to send.`, broadcast }, { status: 502 });
    return NextResponse.json({ ok: true, sent, failed, broadcast });
  } catch (error) {
    console.error("Broadcast failed", error);
    return NextResponse.json({ error: "The update could not be sent. Please try again." }, { status: 500 });
  }
}
