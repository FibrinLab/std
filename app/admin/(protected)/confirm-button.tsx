"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ConfirmButton({ replyId }: { replyId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  async function confirm() {
    setBusy(true); setNote("");
    const res = await fetch("/api/admin/replies/confirm", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: replyId }) }).catch(() => null);
    const data = await res?.json().catch(() => ({}));
    setBusy(false);
    if (!res?.ok) { setNote(data?.error ?? "Could not confirm."); return; }
    if (data.warning) setNote(data.warning);
    router.refresh();
  }
  return <span className="adm-confirm-wrap">
    <button className="adm-confirm-btn" type="button" disabled={busy} onClick={confirm}>{busy ? "Confirming…" : "Confirm"}</button>
    {note && <span className="adm-confirm-note">{note}</span>}
  </span>;
}
