"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AudiencePicker, parseCustomRecipients, recipientCount, type AudienceCounts, type Guest, type PickerAudience } from "../audience-picker";

export function SendItinerary({ counts, guests, subject, testAddress }: { counts: AudienceCounts; guests: Guest[]; subject: string; testAddress: string }) {
  const router = useRouter();
  const [audience, setAudience] = useState<PickerAudience>("celebrating");
  const [customText, setCustomText] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [note, setNote] = useState("");
  const [previewNote, setPreviewNote] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState<"" | "send" | "test">("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const custom = parseCustomRecipients(customText);
  const recipients = recipientCount(audience, selected, counts, custom.recipients.length);

  // Re-render the preview a moment after typing stops, not on every keystroke.
  useEffect(() => { const id = setTimeout(() => setPreviewNote(note), 400); return () => clearTimeout(id); }, [note]);

  function toggle(email: string) {
    setConfirming(false);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email); else next.add(email);
      return next;
    });
  }

  async function send(test: boolean) {
    setBusy(test ? "test" : "send"); setError(""); setResult("");
    const payload = { note, audience, recipientEmails: audience === "selected" ? [...selected] : [], customRecipients: audience === "custom" ? custom.recipients : [], test };
    const res = await fetch("/api/admin/itinerary", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }).catch(() => null);
    const data = await res?.json().catch(() => ({}));
    setBusy(""); setConfirming(false);
    if (!res?.ok) { setError(data?.error ?? "The itinerary could not be sent."); return; }
    if (test) { setResult(data.demo ? `Demo mode — a real deployment would send a test copy to ${testAddress}.` : `Test copy sent to ${testAddress}.`); return; }
    setResult(data.demo ? `Recorded — demo mode, so no real emails went out (${data.sent} recipient${data.sent === 1 ? "" : "s"}).` : `Itinerary sent to ${data.sent} guest${data.sent === 1 ? "" : "s"}.`);
    setSelected(new Set()); setCustomText("");
    router.refresh();
  }

  return <div className="adm-itinerary">
    <form className="adm-compose" onSubmit={(e) => { e.preventDefault(); setConfirming(true); }}>
      <AudiencePicker audience={audience} selected={selected} counts={counts} guests={guests} onAudience={(value) => { setAudience(value); setConfirming(false); }} onToggle={toggle} custom={{ text: customText, onChange: (text) => { setCustomText(text); setConfirming(false); }, count: custom.recipients.length, invalid: custom.invalid }}/>
      <div className="flo-field"><label className="flo-caps" htmlFor="itinerary-subject">Subject</label><input className="flo-input" id="itinerary-subject" value={subject} readOnly aria-describedby="itinerary-subject-hint"/><p className="adm-hint" id="itinerary-subject-hint" style={{ margin: "6px 0 0" }}>Set in lib/content.ts.</p></div>
      <div className="flo-field"><label className="flo-caps" htmlFor="itinerary-note">A note from you <em className="adm-optional">(optional)</em></label><textarea className="flo-input flo-textarea" id="itinerary-note" value={note} onChange={(e) => { setNote(e.target.value); setConfirming(false); }} rows={4} maxLength={2000} placeholder="A few personal lines shown under the greeting, e.g. “Bello — so glad you asked for this.”"/></div>
      {error && <p className="flo-error" role="alert">{error}</p>}
      {result && <p className="adm-sent" role="status">{result}</p>}
      {confirming
        ? <div className="adm-confirm"><span>This will email the itinerary to {recipients} guest{recipients === 1 ? "" : "s"}.</span><button className="flo-button" type="button" disabled={busy !== ""} onClick={() => send(false)}>{busy === "send" ? "Sending…" : "Confirm send"}</button><button className="flo-linklike" type="button" onClick={() => setConfirming(false)}>Cancel</button></div>
        : <div className="adm-actions"><button className="flo-button" disabled={busy !== "" || recipients === 0 || (audience === "custom" && custom.invalid.length > 0)}>Send itinerary</button><button className="flo-linklike" type="button" disabled={busy !== ""} onClick={() => send(true)}>{busy === "test" ? "Sending test…" : `Send a test to ${testAddress}`}</button></div>}
    </form>
    <div className="adm-preview">
      <p className="flo-caps adm-compose-legend">Preview — as Bello would see it</p>
      <iframe className="adm-preview-frame" title="Itinerary email preview" src={`/api/admin/itinerary/preview?note=${encodeURIComponent(previewNote)}`}/>
    </div>
  </div>;
}
