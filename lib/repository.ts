import { confirmDemoReply, createDemoInvite, deleteDemoInvite, findDemoInviteByCode, getDemoBroadcasts, getDemoReplies, listDemoInvites, saveDemoBroadcast, saveDemoReply } from "./demo-store";
import { isDemoMode } from "./env";
import { generateInviteCode } from "./invite-code";
import { createSupabaseAdminClient } from "./supabase/server";
import type { Audience, Broadcast, Invite, InviteWithReply, SaveTheDateInput, SaveTheDateReply } from "./types";

function mapReply(row: Record<string, unknown>): SaveTheDateReply {
  return { id: String(row.id), inviteId: row.invite_id ? String(row.invite_id) : null, fullName: String(row.full_name), email: String(row.email), phone: String(row.phone ?? ""), status: row.status as SaveTheDateReply["status"], approval: (row.approval as SaveTheDateReply["approval"]) ?? "pending", guestCount: Number(row.guest_count), guestNames: Array.isArray(row.guest_names) ? row.guest_names.map(String) : [], note: String(row.note ?? ""), createdAt: String(row.created_at), updatedAt: String(row.updated_at) };
}

export async function saveReply(input: SaveTheDateInput): Promise<SaveTheDateReply> {
  if (isDemoMode) return saveDemoReply(input);
  const db = createSupabaseAdminClient();
  if (!db) throw new Error("Database unavailable");
  const { data, error } = await db
    .from("save_the_date_rsvps")
    .upsert({ full_name: input.fullName, email: input.email, phone: input.phone, status: input.status, approval: "pending", guest_count: input.guestCount, guest_names: input.guestNames, note: input.note, ...(input.inviteId ? { invite_id: input.inviteId } : {}), updated_at: new Date().toISOString() }, { onConflict: "email" })
    .select()
    .single();
  if (error || !data) throw error ?? new Error("Reply not saved");
  return mapReply(data);
}

export async function getReplies(): Promise<SaveTheDateReply[]> {
  if (isDemoMode) return getDemoReplies();
  const db = createSupabaseAdminClient();
  if (!db) return [];
  const { data } = await db.from("save_the_date_rsvps").select("*").order("updated_at", { ascending: false });
  return (data ?? []).map(mapReply);
}

export async function getRecipients(audience: Audience): Promise<Array<{ email: string; fullName: string }>> {
  const replies = await getReplies();
  return replies.filter((r) => audience === "all" || audience === "selected" || r.status === audience).map((r) => ({ email: r.email, fullName: r.fullName }));
}

const mapInvite = (row: Record<string, unknown>): Invite => ({ id: String(row.id), code: String(row.code), name: String(row.name), plusOne: Boolean(row.plus_one), createdAt: String(row.created_at) });

export async function createInvite(name: string, plusOne: boolean): Promise<Invite> {
  if (isDemoMode) return createDemoInvite(name, plusOne);
  const db = createSupabaseAdminClient();
  if (!db) throw new Error("Database unavailable");
  const { data, error } = await db.from("invites").insert({ code: generateInviteCode(), name, plus_one: plusOne }).select().single();
  if (error || !data) throw error ?? new Error("Invite not saved");
  return mapInvite(data);
}

export async function listInvites(): Promise<InviteWithReply[]> {
  if (isDemoMode) return listDemoInvites();
  const db = createSupabaseAdminClient();
  if (!db) return [];
  const [{ data: inviteRows }, replies] = await Promise.all([
    db.from("invites").select("*").order("created_at", { ascending: false }),
    getReplies(),
  ]);
  return (inviteRows ?? []).map((row) => {
    const invite = mapInvite(row);
    const reply = replies.find((r) => r.inviteId === invite.id);
    return { ...invite, reply: reply ? { id: reply.id, status: reply.status, approval: reply.approval, guestCount: reply.guestCount } : null };
  });
}

export async function findInviteByCode(code: string): Promise<Invite | null> {
  if (isDemoMode) return findDemoInviteByCode(code);
  const db = createSupabaseAdminClient();
  if (!db) return null;
  const { data } = await db.from("invites").select("*").eq("code", code).maybeSingle();
  return data ? mapInvite(data) : null;
}

export async function deleteInvite(id: string): Promise<boolean> {
  if (isDemoMode) return deleteDemoInvite(id);
  const db = createSupabaseAdminClient();
  if (!db) return false;
  const { data: linked } = await db.from("save_the_date_rsvps").select("id").eq("invite_id", id).limit(1);
  if (linked && linked.length > 0) return false;
  const { error } = await db.from("invites").delete().eq("id", id);
  return !error;
}

export async function confirmReply(id: string): Promise<SaveTheDateReply | null> {
  if (isDemoMode) return confirmDemoReply(id);
  const db = createSupabaseAdminClient();
  if (!db) throw new Error("Database unavailable");
  const { data, error } = await db.from("save_the_date_rsvps").update({ approval: "confirmed", updated_at: new Date().toISOString() }).eq("id", id).select().single();
  if (error || !data) return null;
  return mapReply(data);
}

export async function saveBroadcast(input: { subject: string; body: string; audience: Audience; sentCount: number }): Promise<Broadcast> {
  if (isDemoMode) return saveDemoBroadcast(input);
  const db = createSupabaseAdminClient();
  if (!db) throw new Error("Database unavailable");
  const { data, error } = await db.from("broadcasts").insert({ subject: input.subject, body: input.body, audience: input.audience, sent_count: input.sentCount }).select().single();
  if (error || !data) throw error ?? new Error("Broadcast not saved");
  return { id: String(data.id), subject: String(data.subject), body: String(data.body), audience: data.audience as Audience, sentCount: Number(data.sent_count), createdAt: String(data.created_at) };
}

export async function listBroadcasts(): Promise<Broadcast[]> {
  if (isDemoMode) return getDemoBroadcasts();
  const db = createSupabaseAdminClient();
  if (!db) return [];
  const { data } = await db.from("broadcasts").select("*").order("created_at", { ascending: false });
  return (data ?? []).map((row) => ({ id: String(row.id), subject: String(row.subject), body: String(row.body), audience: row.audience as Audience, sentCount: Number(row.sent_count), createdAt: String(row.created_at) }));
}
