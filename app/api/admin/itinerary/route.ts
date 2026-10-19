import { NextResponse } from "next/server";
import { z } from "zod";
import { itinerary } from "@/lib/content";
import { env, isDemoMode } from "@/lib/env";
import { sendItinerary } from "@/lib/itinerary-email";
import { getRecipients, saveBroadcast } from "@/lib/repository";
import { isAdmin } from "@/lib/security";

const schema = z.object({
  note: z.string().trim().max(2000).default(""),
  audience: z.enum(["all", "celebrating", "from_afar", "selected"]).default("celebrating"),
  recipientEmails: z.array(z.email()).max(500).default([]),
  // A test copy goes only to the couple's alert address and is not recorded as a sent update.
  test: z.boolean().default(false),
});

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check the note and audience." }, { status: 400 });
  const { audience, recipientEmails, note, test } = parsed.data;

  let recipients: Array<{ email: string; fullName: string }>;
  if (test) {
    recipients = [{ email: env.ADMIN_ALERT_EMAIL, fullName: "Test guest" }];
  } else {
    recipients = await getRecipients(audience);
    if (audience === "selected") {
      const wanted = new Set(recipientEmails.map((e) => e.toLowerCase()));
      recipients = recipients.filter((r) => wanted.has(r.email.toLowerCase()));
    }
    if (recipients.length === 0) return NextResponse.json({ error: audience === "selected" ? "Pick at least one guest." : "No guests match that audience yet." }, { status: 400 });
  }

  const record = (sentCount: number) => saveBroadcast({ subject: itinerary.subject, body: note ? `Itinerary — ${note}` : "Itinerary", audience, sentCount });
  try {
    if (!env.RESEND_API_KEY) {
      if (!isDemoMode) return NextResponse.json({ error: "RESEND_API_KEY is not configured, so emails cannot be sent." }, { status: 503 });
      if (!test) await record(recipients.length);
      return NextResponse.json({ ok: true, sent: recipients.length, failed: 0, demo: true, test });
    }
    const { sent, failed } = await sendItinerary(recipients, note);
    if (!test && sent > 0) await record(sent);
    if (failed > 0) return NextResponse.json({ ok: false, sent, failed, test, error: `${failed} email(s) failed to send.` }, { status: 502 });
    return NextResponse.json({ ok: true, sent, failed, test });
  } catch (error) {
    console.error("Itinerary send failed", error);
    return NextResponse.json({ error: "The itinerary could not be sent. Please try again." }, { status: 500 });
  }
}
