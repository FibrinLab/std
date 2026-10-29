import { SprigDivider } from "@/components/floral-art";
import { gifts } from "@/lib/content";
import { findGift, giftAvailability, giftQuantity } from "@/lib/gifts";
import { listGiftClaims } from "@/lib/repository";
import { ReleaseClaim } from "./release-claim";

export const dynamic = "force-dynamic";

const formatDate = (value: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" }).format(new Date(value));

export default async function GiftsAdminPage() {
  const claims = await listGiftClaims();
  const availability = giftAvailability(claims);
  const wanted = gifts.items.reduce((n, gift) => n + giftQuantity(gift), 0);
  const reserved = Object.values(availability).reduce((n, a) => n + Math.min(a.claimed, a.quantity), 0);
  const stats = [
    ["Gifts listed", gifts.items.length],
    ["Wanted in all", wanted],
    ["Reserved", reserved],
    ["Still open", wanted - reserved],
  ] as const;
  return <main className="adm-main">
    <header className="adm-title">
      <div>
        <p className="flo-caps adm-eyebrow">Gift list</p>
        <h1>Who’s giving what.</h1>
        <p className="adm-sub">Reservations made on the public Gifts page. Guests see only “Reserved”; names, emails and notes are for you alone. The list itself is edited in lib/content.ts.</p>
      </div>
      <span className={`adm-chip ${gifts.registry.href ? "confirmed" : "pending"}`}>{gifts.registry.href ? "Registry link set" : "Registry link missing"}</span>
    </header>
    <section className="adm-stats">
      {stats.map(([label, value]) => <div className="adm-stat" key={label}><strong>{value}</strong><span className="flo-caps">{label}</span></div>)}
    </section>
    <section className="adm-panel">
      <SprigDivider className="adm-sprig"/>
      <h2 className="flo-caps adm-panel-title">Reservations</h2>
      <p className="adm-hint">Newest first. Release a reservation if a guest changes their mind, and the gift opens up again on the site.</p>
      <div className="table-scroll">
        <table className="adm-table">
          <thead><tr><th>Gift</th><th>Guest</th><th>Email</th><th>Note</th><th>Reserved</th><th></th></tr></thead>
          <tbody>
            {claims.map((claim) => {
              const gift = findGift(claim.giftId);
              return <tr key={claim.id}>
                <td className="adm-name">{gift?.name ?? claim.giftId}{gift ? <span className="adm-with">{gift.category} · {gift.price}</span> : <span className="adm-with"><span className="adm-chip unmatched">No longer on the list</span></span>}</td>
                <td>{claim.guestName}</td>
                <td>{claim.email || "—"}</td>
                <td className="adm-note">{claim.message || "—"}</td>
                <td>{formatDate(claim.createdAt)}</td>
                <td><ReleaseClaim id={claim.id}/></td>
              </tr>;
            })}
            {claims.length === 0 && <tr><td colSpan={6} className="adm-empty">Nothing reserved yet — share the Gifts page with your guests.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
    <section className="adm-panel" style={{ marginTop: 26 }}>
      <SprigDivider className="adm-sprig"/>
      <h2 className="flo-caps adm-panel-title">The list</h2>
      <p className="adm-hint">What guests see, with how many of each are still open.</p>
      <div className="table-scroll">
        <table className="adm-table">
          <thead><tr><th>Gift</th><th>Category</th><th>Price</th><th>Wanted</th><th>Reserved</th><th>Amazon link</th></tr></thead>
          <tbody>
            {gifts.items.map((gift) => <tr key={gift.id}>
              <td className="adm-name">{gift.name}</td>
              <td>{gift.category}</td>
              <td>{gift.price}</td>
              <td>{availability[gift.id].quantity}</td>
              <td><span className={`adm-chip ${availability[gift.id].left === 0 ? "confirmed" : "pending"}`}>{availability[gift.id].claimed} of {availability[gift.id].quantity}</span></td>
              <td>{gift.href ? "Own link" : gifts.registry.href ? "Registry" : <span className="adm-chip unmatched">Missing</span>}</td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </section>
  </main>;
}
