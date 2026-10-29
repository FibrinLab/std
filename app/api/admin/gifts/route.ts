import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteGiftClaim } from "@/lib/repository";
import { isAdmin } from "@/lib/security";

const deleteSchema = z.object({ id: z.uuid() });

// Releases a reservation (for example when a guest changes their mind) so the gift shows as available again.
export async function DELETE(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = deleteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid reservation" }, { status: 400 });
  const removed = await deleteGiftClaim(parsed.data.id);
  if (!removed) return NextResponse.json({ error: "That reservation was not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
