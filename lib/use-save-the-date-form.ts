"use client";

import { useState } from "react";
import type { ReplyStatus } from "./types";

export const REPLY_OPTIONS: Array<{ value: ReplyStatus; label: string }> = [
  { value: "celebrating", label: "Yes - Can't wait to celebrate!" },
  { value: "from_afar", label: "No - Celebrating from afar" },
];

// All RSVP behavior lives here; each design supplies only its own markup.
// Guests reply for themselves only — plus-ones are granted by the couple on approval.
export function useSaveTheDateForm() {
  const [status, setStatus] = useState<ReplyStatus | "">("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<null | { status: ReplyStatus }>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!status) { setError("Please pick one of the two lines above."); return; }
    setBusy(true); setError("");
    const payload = { fullName, email, status, guestCount: 1, guestNames: [], note };
    const response = await fetch("/api/save-the-date", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }).catch(() => null);
    const body = await response?.json().catch(() => ({}));
    setBusy(false);
    if (!response?.ok) { setError(body?.error ?? "We could not save your reply. Please try again."); return; }
    setSaved({ status });
  }

  return {
    status, setStatus, fullName, setFullName, email, setEmail,
    note, setNote, error, busy, saved, submit, editReply: () => setSaved(null),
    // "Jordan Bennett" → "Jordan", but "The Bennett family" keeps the whole name.
    firstName: /^the$/i.test(fullName.trim().split(/\s+/)[0] ?? "") ? fullName.trim() : fullName.trim().split(/\s+/)[0],
  };
}
