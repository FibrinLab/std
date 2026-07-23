import { randomUUID } from "node:crypto";
import { generateInviteCode } from "./invite-code";
import type { Audience, Broadcast, Invite, InviteWithReply, SaveTheDateInput, SaveTheDateReply } from "./types";

// Kept on globalThis so every route bundle sees the same store (Next.js dev compiles routes separately).
const globalStore = globalThis as unknown as { __demoReplies?: SaveTheDateReply[]; __demoBroadcasts?: Broadcast[]; __demoInvites?: Invite[] };
const replies: SaveTheDateReply[] = (globalStore.__demoReplies ??= [
  { id: "40000000-0000-4000-8000-000000000001", inviteId: null, fullName: "Jordan Bennett", email: "jordan@example.com", phone: "+234 801 234 5678", status: "celebrating", approval: "pending", guestCount: 2, guestNames: ["Taylor Bennett"], note: "Wouldn't miss it for the world!", createdAt: "2026-07-01T10:00:00.000Z", updatedAt: "2026-07-01T10:00:00.000Z" },
  { id: "40000000-0000-4000-8000-000000000002", inviteId: null, fullName: "Amara Okafor", email: "amara@example.com", phone: "+44 7700 900123", status: "from_afar", approval: "pending", guestCount: 1, guestNames: [], note: "Sending all our love from London.", createdAt: "2026-07-03T18:30:00.000Z", updatedAt: "2026-07-03T18:30:00.000Z" },
]);

export function getDemoReplies(): SaveTheDateReply[] {
  return structuredClone(replies).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

const broadcasts: Broadcast[] = (globalStore.__demoBroadcasts ??= []);

export function getDemoBroadcasts(): Broadcast[] {
  return structuredClone(broadcasts).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function saveDemoBroadcast(input: { subject: string; body: string; audience: Audience; sentCount: number }): Broadcast {
  const broadcast: Broadcast = { id: randomUUID(), ...input, createdAt: new Date().toISOString() };
  broadcasts.push(broadcast);
  return structuredClone(broadcast);
}

export function saveDemoReply(input: SaveTheDateInput): SaveTheDateReply {
  const now = new Date().toISOString();
  const existing = replies.find((reply) => reply.email === input.email);
  if (existing) {
    // A changed reply needs re-approval; keep the invite link unless a new one arrives.
    Object.assign(existing, input, { inviteId: input.inviteId ?? existing.inviteId, approval: "pending", updatedAt: now });
    return structuredClone(existing);
  }
  const reply: SaveTheDateReply = { ...input, inviteId: input.inviteId ?? null, id: randomUUID(), approval: "pending", createdAt: now, updatedAt: now };
  replies.push(reply);
  return structuredClone(reply);
}

const invites: Invite[] = (globalStore.__demoInvites ??= []);

export function createDemoInvite(name: string, plusOne: boolean): Invite {
  const invite: Invite = { id: randomUUID(), code: generateInviteCode(), name, plusOne, createdAt: new Date().toISOString() };
  invites.push(invite);
  return structuredClone(invite);
}

export function listDemoInvites(): InviteWithReply[] {
  return structuredClone(invites)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((invite) => {
      const reply = replies.find((r) => r.inviteId === invite.id);
      return { ...invite, reply: reply ? { id: reply.id, status: reply.status, approval: reply.approval, guestCount: reply.guestCount } : null };
    });
}

export function findDemoInviteByCode(code: string): Invite | null {
  const invite = invites.find((i) => i.code === code);
  return invite ? structuredClone(invite) : null;
}

export function deleteDemoInvite(id: string): boolean {
  if (replies.some((r) => r.inviteId === id)) return false;
  const index = invites.findIndex((i) => i.id === id);
  if (index === -1) return false;
  invites.splice(index, 1);
  return true;
}

export function confirmDemoReply(id: string): SaveTheDateReply | null {
  const reply = replies.find((r) => r.id === id);
  if (!reply) return null;
  reply.approval = "confirmed";
  reply.updatedAt = new Date().toISOString();
  return structuredClone(reply);
}
