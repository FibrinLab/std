"use client";

import { useState } from "react";
import type { ReplyStatus } from "./types";

export const REPLY_OPTIONS: Array<{ value: ReplyStatus; label: string }> = [
  { value: "celebrating", label: "Can't wait to celebrate!" },
  { value: "from_afar", label: "Celebrating from afar" },
];

// All RSVP behavior lives here; each design supplies only its own markup.
export function useSaveTheDateForm() {
  const [status, setStatus] = useState<ReplyStatus | "">("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<null | { status: ReplyStatus; guestCount: number }>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!status) { setError("Please pick one of the two lines above."); return; }
    setBusy(true); setError("");
    const count = status === "celebrating" ? guestCount : 1;
    const response = await fetch("/api/save-the-date", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ fullName, email, status, guestCount: count, note }) }).catch(() => null);
    const body = await response?.json().catch(() => ({}));
    setBusy(false);
    if (!response?.ok) { setError(body?.error ?? "We could not save your reply. Please try again."); return; }
    setSaved({ status, guestCount: count });
  }

  return {
    status, setStatus, fullName, setFullName, email, setEmail,
    guestCount, decrement: () => setGuestCount((n) => Math.max(1, n - 1)), increment: () => setGuestCount((n) => Math.min(10, n + 1)),
    note, setNote, error, busy, saved, submit, editReply: () => setSaved(null),
    // "Jordan Bennett" → "Jordan", but "The Bennett family" keeps the whole name.
    firstName: /^the$/i.test(fullName.trim().split(/\s+/)[0] ?? "") ? fullName.trim() : fullName.trim().split(/\s+/)[0],
  };
}
