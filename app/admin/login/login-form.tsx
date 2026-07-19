"use client";
import { useState } from "react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) });
    const data = await res.json();
    setMessage(data.message ?? data.error);
  }
  return <form className="adm-login-form" onSubmit={submit}>
    <div className="flo-field"><label className="flo-caps" htmlFor="admin-email">Email address</label><input className="flo-input" id="admin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required/></div>
    <button className="flo-button">Email sign-in link</button>
    {message && <p className="flo-fine" role="status">{message}</p>}
  </form>;
}
