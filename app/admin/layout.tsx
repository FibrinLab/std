import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/security";

export const metadata = { title: "Wedding administration", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");
  return <div className="adm-shell">
    <header className="adm-header">
      <Link href="/admin" className="adm-brand">A&thinsp;&amp;&thinsp;D <span className="flo-caps">— Save the date</span></Link>
      <nav className="adm-nav flo-caps"><Link href="/admin">Replies</Link><Link href="/">View site</Link></nav>
    </header>
    {children}
  </div>;
}
