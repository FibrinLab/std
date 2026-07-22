import { SprigDivider } from "@/components/floral-art";
import { listInvites } from "@/lib/repository";
import { CopyLink, DeleteInvite, InviteCreator, ShareWhatsApp } from "./invite-tools";

export const dynamic = "force-dynamic";

const formatDate = (value: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "Africa/Lagos" }).format(new Date(value));

export default async function GuestsPage() {
  const invites = await listInvites();
  const replied = invites.filter((i) => i.reply).length;
  return <main className="adm-main">
    <header className="adm-title">
      <div>
        <p className="flo-caps adm-eyebrow">Guest list</p>
        <h1>Invite someone.</h1>
        <p className="adm-sub">Add each guest as you invite them — you&rsquo;ll get a personal link to send over WhatsApp, and their reply is matched to it automatically.</p>
      </div>
    </header>
    <section className="adm-panel adm-panel-left">
      <InviteCreator/>
    </section>
    <section className="adm-panel" style={{ marginTop: 26 }}>
      <SprigDivider className="adm-sprig"/>
      <h2 className="flo-caps adm-panel-title">Invited guests</h2>
      <p className="adm-hint">{invites.length} invited · {replied} replied</p>
      {invites.length === 0
        ? <p className="adm-hint">Nobody invited yet — create the first invite above.</p>
        : <div className="table-scroll"><table className="adm-table"><thead><tr><th>Name</th><th>Plus-one</th><th>Status</th><th>Personal link</th><th>Invited</th><th></th></tr></thead><tbody>
            {invites.map((invite) => <tr key={invite.id}>
              <td className="adm-name">{invite.name}</td>
              <td>{invite.plusOne ? <span className="adm-chip confirmed">Allowed</span> : "—"}</td>
              <td>{invite.reply
                ? <span className={`adm-chip ${invite.reply.approval === "confirmed" ? "confirmed" : invite.reply.status === "celebrating" ? "celebrating" : "from_afar"}`}>{invite.reply.approval === "confirmed" ? "Confirmed" : invite.reply.status === "celebrating" ? "Replied · yes" : "Replied · from afar"}</span>
                : <span className="adm-chip pending">Awaiting reply</span>}</td>
              <td className="adm-invite-link">/i/{invite.code} <CopyLink code={invite.code}/> <ShareWhatsApp name={invite.name} code={invite.code}/></td>
              <td>{formatDate(invite.createdAt)}</td>
              <td>{!invite.reply && <DeleteInvite id={invite.id}/>}</td>
            </tr>)}
          </tbody></table></div>}
    </section>
  </main>;
}
