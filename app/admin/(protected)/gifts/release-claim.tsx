"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ReleaseClaim({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return <button className="adm-mini-btn adm-mini-danger" type="button" disabled={busy} onClick={async () => {
    if (!confirm("Release this reservation? The gift will show as available again.")) return;
    setBusy(true);
    await fetch("/api/admin/gifts", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id }) }).catch(() => null);
    setBusy(false);
    router.refresh();
  }}>{busy ? "…" : "Release"}</button>;
}
