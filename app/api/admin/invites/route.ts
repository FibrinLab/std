import { NextResponse } from "next/server";
import { z } from "zod";
import { createInvite, deleteInvite } from "@/lib/repository";
import { isAdmin } from "@/lib/security";

const createSchema = z.object({ name: z.string().trim().min(1).max(120), plusOne: z.boolean().default(false) });
const deleteSchema = z.object({ id: z.uuid() });

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please enter the guest's name." }, { status: 400 });
  try {
    const invite = await createInvite(parsed.data.name, parsed.data.plusOne);
    return NextResponse.json({ ok: true, invite });
  } catch (error) {
    console.error("Invite creation failed", error);
    return NextResponse.json({ error: "Could not create the invite. Please try again." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = deleteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid invite" }, { status: 400 });
  const removed = await deleteInvite(parsed.data.id);
  if (!removed) return NextResponse.json({ error: "This invite has a reply attached, so it can't be removed." }, { status: 400 });
  return NextResponse.json({ ok: true });
}
