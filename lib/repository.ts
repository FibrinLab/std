import { getDemoReplies, saveDemoReply } from "./demo-store";
import { isDemoMode } from "./env";
import { createSupabaseAdminClient } from "./supabase/server";
import type { SaveTheDateInput, SaveTheDateReply } from "./types";

function mapReply(row: Record<string, unknown>): SaveTheDateReply {
  return { id: String(row.id), fullName: String(row.full_name), email: String(row.email), status: row.status as SaveTheDateReply["status"], guestCount: Number(row.guest_count), guestNames: Array.isArray(row.guest_names) ? row.guest_names.map(String) : [], note: String(row.note ?? ""), createdAt: String(row.created_at), updatedAt: String(row.updated_at) };
}

export async function saveReply(input: SaveTheDateInput): Promise<SaveTheDateReply> {
  if (isDemoMode) return saveDemoReply(input);
  const db = createSupabaseAdminClient();
  if (!db) throw new Error("Database unavailable");
  const { data, error } = await db
    .from("save_the_date_rsvps")
    .upsert({ full_name: input.fullName, email: input.email, status: input.status, guest_count: input.guestCount, guest_names: input.guestNames, note: input.note, updated_at: new Date().toISOString() }, { onConflict: "email" })
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
