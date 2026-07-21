"use client";

export function SignOut() {
  return <button className="adm-signout" type="button" onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); location.assign("/admin/login"); }}>Sign out</button>;
}
