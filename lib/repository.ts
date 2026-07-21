import { confirmDemoReply, getDemoBroadcasts, getDemoReplies, saveDemoBroadcast, saveDemoReply } from "./demo-store";
import { isDemoMode } from "./env";
import { createSupabaseAdminClient } from "./supabase/server";
import type { Audience, Broadcast, SaveTheDateInput, SaveTheDateReply } from "./types";

function mapReply(row: Record<string, unknown>): SaveTheDateReply {
  return { id: String(row.id), fullName: String(row.full_name), email: String(row.email), status: row.status as SaveTheDateReply["status"], approval: (row.approval as SaveTheDateReply["approval"]) ?? "pending", guestCount: Number(row.guest_count), guestNames: Array.isArray(row.guest_names) ? row.guest_names.map(String) : [], note: String(row.note ?? ""), createdAt: String(row.created_at), updatedAt: String(row.updated_at) };
}

export async function saveReply(input: SaveTheDateInput): Promise<SaveTheDateReply> {
  if (isDemoMode) return saveDemoReply(input);
  const db = createSupabaseAdminClient();
  if (!db) throw new Error("Database unavailable");
  const { data, error } = await db
    .from("save_the_date_rsvps")
    .upsert({ full_name: input.fullName, email: input.email, status: input.status, approval: "pending", guest_count: input.guestCount, guest_names: input.guestNames, note: input.note, updated_at: new Date().toISOString() }, { onConflict: "email" })
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
