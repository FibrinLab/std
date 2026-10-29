"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gifts, type Gift } from "@/lib/content";
import { buyHref, type GiftAvailability } from "@/lib/gifts";

// The gift cards and the reserve dialog. Availability arrives from the server and is replaced by whatever
// the reserve route answers, so a guest never sees a stale "available" after reserving.

function GiftOrnament() {
  return <svg className="flo-gift-ornament" viewBox="0 0 120 100" fill="none" aria-hidden="true" focusable="false">
    <g stroke="#8a7d5f" strokeWidth="1.1" strokeLinejoin="round" fill="none">
      <rect x="22" y="40" width="76" height="50" rx="1"/>
      <path d="M18 40 H102 V54 H18 Z"/>
      <path d="M60 40 V90"/>
      <path d="M60 40 C50 24 30 22 32 32 C34 40 50 40 60 40 C70 40 86 40 88 32 C90 22 70 24 60 40 Z" stroke="#8e3b4a"/>
      <path d="M60 40 C56 46 54 52 55 58 M60 40 C64 46 66 52 65 58" stroke="#8e3b4a"/>
    </g>
    <circle cx="14" cy="22" r="2" fill="#C9B078"/><circle cx="108" cy="18" r="1.6" fill="#C9B078"/><circle cx="100" cy="30" r="1.2" fill="#C9B078"/>
  </svg>;
}

function BuyLink({ gift, className }: { gift: Gift; className: string }) {
  const href = buyHref(gift);
  if (!href) return <span className={`${className} is-soon`}>{gifts.registry.buyLabel} · soon</span>;
  return <a className={className} href={href} target="_blank" rel="noopener noreferrer">{gifts.registry.buyLabel}<span aria-hidden="true">&nbsp;↗</span><span className="flo-sr"> (opens in a new tab)</span></a>;
}

function GiftCard({ gift, availability, onReserve }: { gift: Gift; availability: GiftAvailability; onReserve: () => void }) {
  const reserved = availability.left === 0;
  const partly = !reserved && availability.quantity > 1;
  return <article className={`flo-gift${reserved ? " is-reserved" : ""}`} aria-label={gift.name}>
    <div className="flo-gift-art">
      {gift.image ? <Image src={gift.image.src} alt={gift.image.alt} width={600} height={450} sizes="(max-width:700px) 90vw, 320px"/> : <GiftOrnament/>}
      {reserved && <span className="flo-caps flo-gift-chip">{gifts.reserve.reserved}</span>}
      {partly && <span className="flo-caps flo-gift-chip is-left">{gifts.reserve.left(availability.left)}</span>}
    </div>
    <div className="flo-gift-body">
      <p className="flo-caps flo-gift-cat">{gift.category}</p>
      <h3 className="flo-gift-name">{gift.name}</h3>
      <p className="flo-gift-note">{gift.note}</p>
      <p className="flo-gift-price"><strong>{gift.price}</strong>{availability.quantity > 1 && <span> · {availability.quantity} wanted</span>}</p>
      <div className="flo-gift-actions">
        {reserved
          ? <p className="flo-gift-taken">Already reserved — thank you!</p>
          : <button type="button" className="flo-button flo-gift-btn" onClick={onReserve} aria-haspopup="dialog">{gifts.reserve.button}</button>}
        {!reserved && <BuyLink gift={gift} className="flo-gift-buy"/>}
      </div>
    </div>
  </article>;
}

type Status = { kind: "idle" } | { kind: "busy" } | { kind: "error"; message: string } | { kind: "done" };

export function GiftList({ initialAvailability }: { initialAvailability: Record<string, GiftAvailability> }) {
  const [availability, setAvailability] = useState(initialAvailability);
  const [openId, setOpenId] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openGift = gifts.items.find((gift) => gift.id === openId);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (openId && !dialog.open) dialog.showModal();
    if (!openId && dialog.open) dialog.close();
  }, [openId]);

  const close = () => { setOpenId(null); setStatus({ kind: "idle" }); };

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!openGift) return;
    const form = new FormData(event.currentTarget);
    setStatus({ kind: "busy" });
    const response = await fetch("/api/gifts/reserve", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ giftId: openGift.id, guestName: form.get("guestName"), email: form.get("email") ?? "", message: form.get("message") ?? "" }),
    }).catch(() => null);
    const data = await response?.json().catch(() => ({})) ?? {};
    if (data.availability) setAvailability(data.availability);
    if (!response?.ok) { setStatus({ kind: "error", message: data.error ?? "Something went wrong — please try again." }); return; }
    setStatus({ kind: "done" });
  }

  return <>
    <p className="flo-stay-intro">{gifts.registry.deliveryNote}</p>
    <div className="flo-gifts">
      {gifts.items.map((gift) => <GiftCard key={gift.id} gift={gift} availability={availability[gift.id] ?? { quantity: 1, claimed: 0, left: 1 }} onReserve={() => { setStatus({ kind: "idle" }); setOpenId(gift.id); }}/>)}
    </div>

    {/* A click on the backdrop lands on the <dialog> itself; clicks inside land on its children. */}
    <dialog ref={dialogRef} className="flo-hotel-dialog flo-gift-dialog" aria-labelledby={openGift ? "gift-dialog-title" : undefined} onClose={close} onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
      {openGift && <div className="flo-hotel-sheet flo-gift-sheet">
        <button type="button" className="flo-hotel-close" onClick={close} aria-label="Close">×</button>
        {status.kind === "done"
          ? <div className="flo-gift-thanks" role="status">
              <GiftOrnament/>
              <p className="flo-caps flo-gift-cat">{openGift.name}</p>
              <h3 className="flo-gift-name flo-gift-name-lg" id="gift-dialog-title">{gifts.reserve.thanksHeading}</h3>
              <p className="flo-gift-note">{gifts.reserve.thanksBody}</p>
              {!buyHref(openGift) && <p className="flo-fine flo-gf-soon">{gifts.registry.comingSoon}</p>}
              <div className="flo-gift-actions flo-gift-actions-row">
                {buyHref(openGift) && <BuyLink gift={openGift} className="flo-button flo-gift-btn flo-gift-buy-btn"/>}
                <button type="button" className="flo-hotel-btn flo-hotel-btn-ghost" onClick={close}>Back to the list</button>
              </div>
            </div>
          : <form className="flo-gift-form" onSubmit={submit}>
              <p className="flo-caps flo-gift-cat">{gifts.reserve.dialogEyebrow}</p>
              <h3 className="flo-gift-name flo-gift-name-lg" id="gift-dialog-title">{openGift.name}</h3>
              <p className="flo-gift-price"><strong>{openGift.price}</strong></p>
              <p className="flo-gift-note">{gifts.reserve.dialogIntro}</p>
              <div className="flo-fields">
                <div className="flo-field flo-field-wide"><label className="flo-caps" htmlFor="gift-name">{gifts.reserve.nameLabel}</label><input className="flo-input" id="gift-name" name="guestName" required minLength={2} maxLength={120} autoComplete="name"/></div>
                <div className="flo-field flo-field-wide"><label className="flo-caps" htmlFor="gift-email">{gifts.reserve.emailLabel}</label><input className="flo-input" id="gift-email" name="email" type="email" maxLength={254} autoComplete="email"/></div>
                <div className="flo-field flo-field-wide"><label className="flo-caps" htmlFor="gift-message">{gifts.reserve.messageLabel}</label><textarea className="flo-input flo-textarea" id="gift-message" name="message" rows={2} maxLength={300}/></div>
              </div>
              {status.kind === "error" && <p className="flo-error" role="alert">{status.message}</p>}
              <div className="flo-gift-actions flo-gift-actions-row">
                <button type="submit" className="flo-button flo-gift-btn" disabled={status.kind === "busy"}>{status.kind === "busy" ? "Reserving…" : gifts.reserve.submit}</button>
                <button type="button" className="flo-hotel-btn flo-hotel-btn-ghost" onClick={close}>Cancel</button>
              </div>
              <p className="flo-fine flo-gift-privacy">{gifts.reserve.privacy}</p>
            </form>}
      </div>}
    </dialog>
  </>;
}
