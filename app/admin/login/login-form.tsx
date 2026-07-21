"use client";
import { useState } from "react";

export function LoginForm() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMessage("");
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password }) }).catch(() => null);
    const data = await res?.json().catch(() => ({}));
    setBusy(false);
    if (res?.ok) { location.assign("/admin"); return; }
    setMessage(data?.error ?? "Could not sign in. Please try again.");
  }
  return <form className="adm-login-form" onSubmit={submit}>
    <div className="flo-field"><label className="flo-caps" htmlFor="admin-password">Admin password</label><input className="flo-input" id="admin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required/></div>
    <button className="flo-button" disabled={busy}>{busy ? "Checking…" : "Sign in"}</button>
    {message && <p className="flo-fine" role="status">{message}</p>}
  </form>;
}
