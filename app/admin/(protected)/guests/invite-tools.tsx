"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { wedding } from "@/lib/content";

const inviteUrl = (code: string) => `${location.origin}/i/${code}`;
const whatsappText = (name: string, code: string) =>
  `Hello ${name.trim().split(/\s+/)[0]}! ${wedding.coupleNames} are getting married on ${wedding.dateLong} in ${wedding.venueAddress}. Kindly save the date and RSVP here: ${inviteUrl(code)} ${wedding.hashtag} 🐝`;

export function InviteCreator() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [plusOne, setPlusOne] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<null | { name: string; code: string }>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    const res = await fetch("/api/admin/invites", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, plusOne }) }).catch(() => null);
    const data = await res?.json().catch(() => ({}));
    setBusy(false);
    if (!res?.ok) { setError(data?.error ?? "Could not create the invite."); return; }
    setCreated({ name: data.invite.name, code: data.invite.code });
    setName(""); setPlusOne(false);
    router.refresh();
  }

  return <form className="adm-compose" onSubmit={submit}>
    <div className="flo-fields">
      <div className="flo-field"><label className="flo-caps" htmlFor="invite-name">Guest name</label><input className="flo-input" id="invite-name" value={name} onChange={(e) => { setName(e.target.value); setCreated(null); }} required maxLength={120}/></div>
      <div className="flo-field"><span className="flo-caps">Plus-one</span><label className="adm-guest" style={{ marginTop: 8 }}><input type="checkbox" checked={plusOne} onChange={(e) => setPlusOne(e.target.checked)}/><span>Allow a plus-one</span></label></div>
    </div>
    {error && <p className="flo-error" role="alert">{error}</p>}
    {created && <p className="adm-sent" role="status">Invite for {created.name} is ready — <CopyLink code={created.code}/> or <ShareWhatsApp name={created.name} code={created.code}/>.</p>}
    <button className="flo-button" disabled={busy}>{busy ? "Creating…" : "Create invite"}</button>
  </form>;
}

export function CopyLink({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return <button className="adm-mini-btn" type="button" onClick={async () => { await navigator.clipboard.writeText(inviteUrl(code)); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>{copied ? "Copied!" : "Copy link"}</button>;
}

export function ShareWhatsApp({ name, code }: { name: string; code: string }) {
  return <button className="adm-mini-btn" type="button" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(whatsappText(name, code))}`, "_blank", "noopener")}>WhatsApp</button>;
}

export function DeleteInvite({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return <button className="adm-mini-btn adm-mini-danger" type="button" disabled={busy} onClick={async () => {
    setBusy(true);
    await fetch("/api/admin/invites", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id }) }).catch(() => null);
    setBusy(false);
    router.refresh();
  }}>{busy ? "…" : "Remove"}</button>;
}
