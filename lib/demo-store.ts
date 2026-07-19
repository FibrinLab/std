import { randomUUID } from "node:crypto";
import type { SaveTheDateInput, SaveTheDateReply } from "./types";

// Kept on globalThis so every route bundle sees the same store (Next.js dev compiles routes separately).
const globalStore = globalThis as unknown as { __demoReplies?: SaveTheDateReply[] };
const replies: SaveTheDateReply[] = (globalStore.__demoReplies ??= [
  { id: "40000000-0000-4000-8000-000000000001", fullName: "Jordan Bennett", email: "jordan@example.com", status: "celebrating", guestCount: 2, note: "Wouldn't miss it for the world!", createdAt: "2026-07-01T10:00:00.000Z", updatedAt: "2026-07-01T10:00:00.000Z" },
  { id: "40000000-0000-4000-8000-000000000002", fullName: "Amara Okafor", email: "amara@example.com", status: "from_afar", guestCount: 1, note: "Sending all our love from London.", createdAt: "2026-07-03T18:30:00.000Z", updatedAt: "2026-07-03T18:30:00.000Z" },
]);

export function getDemoReplies(): SaveTheDateReply[] {
  return structuredClone(replies).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function saveDemoReply(input: SaveTheDateInput): SaveTheDateReply {
  const now = new Date().toISOString();
  const existing = replies.find((reply) => reply.email === input.email);
  if (existing) {
    Object.assign(existing, input, { updatedAt: now });
    return structuredClone(existing);
  }
  const reply: SaveTheDateReply = { id: randomUUID(), ...input, createdAt: now, updatedAt: now };
  replies.push(reply);
  return structuredClone(reply);
}
