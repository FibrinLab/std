import { NextResponse } from "next/server";
import { z } from "zod";
import { sendConfirmedEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { confirmReply } from "@/lib/repository";
import { isAdmin } from "@/lib/security";

const schema = z.object({ id: z.uuid() });

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid reply" }, { status: 400 });
  const reply = await confirmReply(parsed.data.id);
  if (!reply) return NextResponse.json({ error: "Reply not found" }, { status: 404 });
  if (env.RESEND_API_KEY) {
    try {
      await sendConfirmedEmail(reply);
    } catch (error) {
      console.error("Confirmation email failed", error);
      return NextResponse.json({ ok: true, warning: "Confirmed, but the email could not be sent." });
    }
  }
  return NextResponse.json({ ok: true });
}
