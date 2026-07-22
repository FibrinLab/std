import Image from "next/image";
import { SprigDivider } from "@/components/floral-art";
import { wedding } from "@/lib/content";
import { getReplies, listInvites } from "@/lib/repository";
import { ConfirmButton } from "./confirm-button";

export const dynamic = "force-dynamic";

const formatDate = (value: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" }).format(new Date(value));

export default async function AdminPage() {
  const [replies, invites] = await Promise.all([getReplies(), listInvites()]);
  const inviteName = new Map(invites.map((i) => [i.id, i.name]));
  const celebrating = replies.filter((r) => r.status === "celebrating");
  const approved = celebrating.filter((r) => r.approval === "confirmed");
  const stats = [
    ["Replies", replies.length],
    ["Celebrating", celebrating.length],
    ["Approved", approved.length],
    ["Confirmed heads", approved.reduce((n, r) => n + r.guestCount, 0)],
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
          <thead><tr><th>Name</th><th>Email</th><th>Reply</th><th>Approval</th><th>Party size</th><th>Note</th><th>Last updated</th></tr></thead>
          <tbody>
            {replies.map((reply) => <tr key={reply.id}>
              <td className="adm-name">{reply.fullName}{reply.guestNames.length > 0 && <span className="adm-with">with {reply.guestNames.join(", ")}</span>}<span className="adm-with">{reply.inviteId ? `invited as ${inviteName.get(reply.inviteId) ?? "?"}` : <span className="adm-chip unmatched">Unmatched</span>}</span></td>
              <td>{reply.email}</td>
              <td><span className={`adm-chip ${reply.status}`}>{reply.status === "celebrating" ? "Celebrating" : "From afar"}</span></td>
              <td>{reply.status === "celebrating"
                ? <span className="adm-approval"><span className={`adm-chip ${reply.approval}`}>{reply.approval === "confirmed" ? "Confirmed" : "Pending"}</span>{reply.approval === "pending" && <ConfirmButton replyId={reply.id}/>}</span>
                : "—"}</td>
              <td>{reply.guestCount}</td>
              <td className="adm-note">{reply.note || "—"}</td>
              <td>{formatDate(reply.updatedAt)}</td>
            </tr>)}
            {replies.length === 0 && <tr><td colSpan={7} className="adm-empty">No replies yet — share the site link with your guests.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  </main>;
}
