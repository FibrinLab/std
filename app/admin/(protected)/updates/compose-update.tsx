"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Audience } from "@/lib/types";
import { AudiencePicker, recipientCount, type AudienceCounts, type Guest } from "../audience-picker";

export function ComposeUpdate({ counts, guests }: { counts: AudienceCounts; guests: Guest[] }) {
  const router = useRouter();
  const [audience, setAudience] = useState<Audience>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const recipients = recipientCount(audience, selected, counts);

  function toggle(email: string) {
    setConfirming(false);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email); else next.add(email);
      return next;
    });
  }

  async function send() {
    setBusy(true); setError(""); setResult("");
    const payload = { subject, body, audience, recipientEmails: audience === "selected" ? [...selected] : [] };
    const res = await fetch("/api/admin/broadcast", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }).catch(() => null);
    const data = await res?.json().catch(() => ({}));
    setBusy(false); setConfirming(false);
    if (!res?.ok) { setError(data?.error ?? "The update could not be sent."); return; }
    setResult(data.demo ? `Recorded — demo mode, so no real emails went out (${data.sent} recipient${data.sent === 1 ? "" : "s"}).` : `Sent to ${data.sent} guest${data.sent === 1 ? "" : "s"}.`);
    setSubject(""); setBody(""); setSelected(new Set());
    router.refresh();
  }

  return <form className="adm-compose" onSubmit={(e) => { e.preventDefault(); setConfirming(true); }}>
    <AudiencePicker audience={audience} selected={selected} counts={counts} guests={guests} onAudience={(value) => { setAudience(value); setConfirming(false); }} onToggle={toggle}/>
    <div className="flo-field"><label className="flo-caps" htmlFor="update-subject">Subject</label><input className="flo-input" id="update-subject" value={subject} onChange={(e) => { setSubject(e.target.value); setConfirming(false); }} required maxLength={150}/></div>
    <div className="flo-field"><label className="flo-caps" htmlFor="update-body">Message</label><textarea className="flo-input flo-textarea" id="update-body" value={body} onChange={(e) => { setBody(e.target.value); setConfirming(false); }} rows={8} required maxLength={5000} placeholder="Blank lines start new paragraphs."/></div>
    {error && <p className="flo-error" role="alert">{error}</p>}
    {result && <p className="adm-sent" role="status">{result}</p>}
    {confirming
      ? <div className="adm-confirm"><span>This will email {recipients} guest{recipients === 1 ? "" : "s"}.</span><button className="flo-button" type="button" disabled={busy} onClick={send}>{busy ? "Sending…" : "Confirm send"}</button><button className="flo-linklike" type="button" onClick={() => setConfirming(false)}>Cancel</button></div>
      : <button className="flo-button" disabled={busy || recipients === 0}>Send update</button>}
  </form>;
}
