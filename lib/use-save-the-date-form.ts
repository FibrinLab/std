"use client";

import { useState } from "react";
import { MAX_PARTY_SIZE, type ReplyStatus } from "./types";

export const REPLY_OPTIONS: Array<{ value: ReplyStatus; label: string }> = [
  { value: "celebrating", label: "Yes - Can't wait to celebrate!" },
  { value: "from_afar", label: "No - Celebrating from afar" },
];

// All RSVP behavior lives here; each design supplies only its own markup.
export function useSaveTheDateForm() {
  const [status, setStatus] = useState<ReplyStatus | "">("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [guestNames, setGuestNames] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<null | { status: ReplyStatus; guestCount: number; guestNames: string[] }>(null);

  // The counter and the extra name boxes move together: party of N = lead guest + (N - 1) named guests.
  function increment() {
    setGuestCount((n) => {
      const next = Math.min(MAX_PARTY_SIZE, n + 1);
      setGuestNames((names) => names.length < next - 1 ? [...names, ""] : names);
      return next;
    });
  }
  function decrement() {
    setGuestCount((n) => {
      const next = Math.max(1, n - 1);
      setGuestNames((names) => names.slice(0, next - 1));
      return next;
    });
  }
  function setGuestName(index: number, value: string) {
    setGuestNames((names) => names.map((name, i) => (i === index ? value : name)));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!status) { setError("Please pick one of the two lines above."); return; }
    setBusy(true); setError("");
    const celebrating = status === "celebrating";
    const payload = { fullName, email, status, guestCount: celebrating ? guestCount : 1, guestNames: celebrating ? guestNames : [], note };
    const response = await fetch("/api/save-the-date", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }).catch(() => null);
    const body = await response?.json().catch(() => ({}));
    setBusy(false);
    if (!response?.ok) { setError(body?.error ?? "We could not save your reply. Please try again."); return; }
    setSaved({ status, guestCount: payload.guestCount, guestNames: payload.guestNames });
  }

  return {
    status, setStatus, fullName, setFullName, email, setEmail,
    guestCount, increment, decrement, guestNames, setGuestName,
    note, setNote, error, busy, saved, submit, editReply: () => setSaved(null),
    // "Jordan Bennett" → "Jordan", but "The Bennett family" keeps the whole name.
    firstName: /^the$/i.test(fullName.trim().split(/\s+/)[0] ?? "") ? fullName.trim() : fullName.trim().split(/\s+/)[0],
  };
}

// "Ada" / "Ada & Tunde" / "Ada, Tunde & Bisi" — for thank-you lines and emails.
export function listNames(names: string[]) {
  const clean = names.map((n) => n.trim()).filter(Boolean);
  if (clean.length <= 1) return clean[0] ?? "";
  return `${clean.slice(0, -1).join(", ")} & ${clean[clean.length - 1]}`;
}
