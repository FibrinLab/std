import { SprigDivider } from "@/components/floral-art";
import { getReplies, listBroadcasts } from "@/lib/repository";
import { ComposeUpdate } from "./compose-update";

export const dynamic = "force-dynamic";

const AUDIENCE_LABEL = { all: "Everyone", celebrating: "Celebrating", from_afar: "From afar", selected: "Selected" } as const;
const formatDate = (value: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" }).format(new Date(value));

export default async function UpdatesPage() {
  const [replies, broadcasts] = await Promise.all([getReplies(), listBroadcasts()]);
  const celebrating = replies.filter((r) => r.status === "celebrating").length;
  const counts = { all: replies.length, celebrating, from_afar: replies.length - celebrating };
  return <main className="adm-main">
    <header className="adm-title">
      <div>
        <p className="flo-caps adm-eyebrow">Guest updates</p>
        <h1>Send an update.</h1>
        <p className="adm-sub">Write once — every guest in the audience receives a styled email from you.</p>
      </div>
    </header>
    <section className="adm-panel adm-panel-left">
      <ComposeUpdate counts={counts} guests={replies.map((r) => ({ email: r.email, fullName: r.fullName }))}/>
    </section>
    <section className="adm-panel" style={{ marginTop: 26 }}>
      <SprigDivider className="adm-sprig"/>
      <h2 className="flo-caps adm-panel-title">Past updates</h2>
      {broadcasts.length === 0
        ? <p className="adm-hint">Nothing sent yet.</p>
        : <div className="table-scroll"><table className="adm-table"><thead><tr><th>Subject</th><th>Audience</th><th>Sent to</th><th>When</th></tr></thead><tbody>
            {broadcasts.map((b) => <tr key={b.id}><td className="adm-name">{b.subject}</td><td>{AUDIENCE_LABEL[b.audience]}</td><td>{b.sentCount}</td><td>{formatDate(b.createdAt)}</td></tr>)}
          </tbody></table></div>}
    </section>
  </main>;
}
