"use client";

import { useState } from "react";
import type { ReplyStatus } from "./types";

export const REPLY_OPTIONS: Array<{ value: ReplyStatus; label: string }> = [
  { value: "celebrating", label: "Yes - Can't wait to celebrate!" },
  { value: "from_afar", label: "No - Celebrating from afar" },
];

export interface FormInvite {
  code: string;
  name: string;
  plusOne: boolean;
}

// All RSVP behavior lives here; each design supplies only its own markup.
// Guests reply for themselves; a personal invite that grants a plus-one unlocks one extra name.
export function useSaveTheDateForm(invite?: FormInvite) {
  const [status, setStatus] = useState<ReplyStatus | "">("");
  const [fullName, setFullName] = useState(invite?.name ?? "");
  const [email, setEmail] = useState("");
  const [plusOneName, setPlusOneName] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<null | { status: ReplyStatus; plusOneName: string }>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!status) { setError("Please pick one of the two lines above."); return; }
    setBusy(true); setError("");
    const withGuest = status === "celebrating" && Boolean(invite?.plusOne) && plusOneName.trim().length > 0;
    const payload = {
      fullName, email, status, note,
      guestCount: withGuest ? 2 : 1,
      guestNames: withGuest ? [plusOneName.trim()] : [],
      ...(invite ? { inviteCode: invite.code } : {}),
    };
    const response = await fetch("/api/save-the-date", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }).catch(() => null);
    const body = await response?.json().catch(() => ({}));
    setBusy(false);
    if (!response?.ok) { setError(body?.error ?? "We could not save your reply. Please try again."); return; }
    setSaved({ status, plusOneName: withGuest ? plusOneName.trim() : "" });
  }

  return {
    status, setStatus, fullName, setFullName, email, setEmail,
    plusOneName, setPlusOneName, note, setNote, error, busy, saved, submit,
    editReply: () => setSaved(null), invite,
    // "Jordan Bennett" → "Jordan", but "The Bennett family" keeps the whole name.
    firstName: /^the$/i.test(fullName.trim().split(/\s+/)[0] ?? "") ? fullName.trim() : fullName.trim().split(/\s+/)[0],
  };
}
