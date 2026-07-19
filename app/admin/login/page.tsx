import { redirect } from "next/navigation";
import { SprigDivider } from "@/components/floral-art";
import { isAdmin } from "@/lib/security";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return <main className="adm-login">
    <section className="adm-login-panel">
      <SprigDivider className="adm-sprig"/>
      <p className="flo-caps adm-eyebrow">Private administration</p>
      <h1>Welcome back.</h1>
      <p className="adm-sub">Enter an approved administrator email and we will send you a secure sign-in link.</p>
      <LoginForm/>
    </section>
  </main>;
}
