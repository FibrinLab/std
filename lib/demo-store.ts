import { randomUUID } from "node:crypto";
import type { Audience, Broadcast, SaveTheDateInput, SaveTheDateReply } from "./types";

// Kept on globalThis so every route bundle sees the same store (Next.js dev compiles routes separately).
const globalStore = globalThis as unknown as { __demoReplies?: SaveTheDateReply[]; __demoBroadcasts?: Broadcast[] };
const replies: SaveTheDateReply[] = (globalStore.__demoReplies ??= [
  { id: "40000000-0000-4000-8000-000000000001", fullName: "Jordan Bennett", email: "jordan@example.com", status: "celebrating", approval: "pending", guestCount: 2, guestNames: ["Taylor Bennett"], note: "Wouldn't miss it for the world!", createdAt: "2026-07-01T10:00:00.000Z", updatedAt: "2026-07-01T10:00:00.000Z" },
  { id: "40000000-0000-4000-8000-000000000002", fullName: "Amara Okafor", email: "amara@example.com", status: "from_afar", approval: "pending", guestCount: 1, guestNames: [], note: "Sending all our love from London.", createdAt: "2026-07-03T18:30:00.000Z", updatedAt: "2026-07-03T18:30:00.000Z" },
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
    // A changed reply needs re-approval.
    Object.assign(existing, input, { approval: "pending", updatedAt: now });
    return structuredClone(existing);
  }
  const reply: SaveTheDateReply = { id: randomUUID(), ...input, approval: "pending", createdAt: now, updatedAt: now };
  replies.push(reply);
  return structuredClone(reply);
}

export function confirmDemoReply(id: string): SaveTheDateReply | null {
  const reply = replies.find((r) => r.id === id);
  if (!reply) return null;
  reply.approval = "confirmed";
  reply.updatedAt = new Date().toISOString();
  return structuredClone(reply);
}
