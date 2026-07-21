import Image from "next/image";
import { SprigDivider } from "@/components/floral-art";
import { wedding } from "@/lib/content";
import { getReplies } from "@/lib/repository";

export const dynamic = "force-dynamic";

const formatDate = (value: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" }).format(new Date(value));

export default async function AdminPage() {
  const replies = await getReplies();
  const celebrating = replies.filter((r) => r.status === "celebrating");
  const stats = [
    ["Replies", replies.length],
    ["Celebrating", celebrating.length],
    ["From afar", replies.length - celebrating.length],
    ["Confirmed heads", celebrating.reduce((n, r) => n + r.guestCount, 0)],
  ] as const;
  return <main className="adm-main">
    <Image className="adm-bloom" src="/botanicals/cut-dahlia-pink.png" alt="" width={1000} height={950} aria-hidden="true"/>
    <header className="adm-title">
      <div>
        <p className="flo-caps adm-eyebrow">Save the date</p>
        <h1>Good morning.</h1>
        <p className="adm-sub">Here is who has replied to {wedding.coupleNames}&rsquo;s save-the-date so far.</p>
      </div>
      <a className="flo-button adm-export" href="/api/admin/export">Export CSV</a>
    </header>
    <section className="adm-stats">
      {stats.map(([label, value]) => <div className="adm-stat" key={label}><strong>{value}</strong><span className="flo-caps">{label}</span></div>)}
    </section>
    <section className="adm-panel">
      <SprigDivider className="adm-sprig"/>
      <h2 className="flo-caps adm-panel-title">Replies</h2>
      <p className="adm-hint">Newest first — a guest replying again with the same email updates their row.</p>
      <div className="table-scroll">
        <table className="adm-table">
          <thead><tr><th>Name</th><th>Email</th><th>Reply</th><th>Party size</th><th>Note</th><th>Last updated</th></tr></thead>
          <tbody>
            {replies.map((reply) => <tr key={reply.id}>
              <td className="adm-name">{reply.fullName}{reply.guestNames.length > 0 && <span className="adm-with">with {reply.guestNames.join(", ")}</span>}</td>
              <td>{reply.email}</td>
              <td><span className={`adm-chip ${reply.status}`}>{reply.status === "celebrating" ? "Celebrating" : "From afar"}</span></td>
              <td>{reply.guestCount}</td>
              <td className="adm-note">{reply.note || "—"}</td>
              <td>{formatDate(reply.updatedAt)}</td>
            </tr>)}
            {replies.length === 0 && <tr><td colSpan={6} className="adm-empty">No replies yet — share the site link with your guests.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  </main>;
}
