import { redirect } from "next/navigation";
import { SprigDivider } from "@/components/floral-art";
import { isAdmin } from "@/lib/security";
import { LoginForm } from "./login-form";

export const metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return <main className="adm-login">
    <section className="adm-login-panel">
      <SprigDivider className="adm-sprig"/>
      <p className="flo-caps adm-eyebrow">Private administration</p>
      <h1>Welcome back.</h1>
      <p className="adm-sub">Enter the admin password to see replies and send updates.</p>
      <LoginForm/>
    </section>
  </main>;
}
