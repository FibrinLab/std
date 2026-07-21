"use client";

import { SprigDivider } from "@/components/floral-art";
import { listNames, REPLY_OPTIONS, useSaveTheDateForm } from "@/lib/use-save-the-date-form";

export function FloralForm() {
  const form = useSaveTheDateForm();

  if (form.saved) {
    return <div className="flo-thanks" role="status">
      <SprigDivider className="flo-sprig"/>
      <h3 className="flo-thanks-title">Thank you, {form.firstName}</h3>
      <p className="flo-italic">{form.saved.status === "celebrating" ? `${form.saved.guestCount === 1 ? "One seat is" : `${form.saved.guestCount} seats are`} noted for the celebration${form.saved.guestNames.length ? ` — you and ${listNames(form.saved.guestNames)}` : ""} — we are so glad.` : "We will miss you on the day, and we are grateful you told us."}</p>
      <p className="flo-fine">A copy is on its way to {form.email}.</p>
      <button className="flo-linklike" type="button" onClick={form.editReply}>Change of plans? Edit your reply</button>
    </div>;
  }

  return <form className="flo-form" onSubmit={form.submit}>
    <fieldset className="flo-fieldset">
      <legend className="flo-caps flo-legend">Kindly reply</legend>
      <div className="flo-options">
        {REPLY_OPTIONS.map((option) => <label className="flo-option" key={option.value}>
          <input type="radio" name="reply" value={option.value} checked={form.status === option.value} onChange={() => form.setStatus(option.value)}/>
          <span className="flo-dot" aria-hidden="true"/>
          <span className="flo-option-text">{option.label}</span>
        </label>)}
      </div>
    </fieldset>
    <div className="flo-fields">
      <div className="flo-field"><label className="flo-caps" htmlFor="flo-name">Your name(s)</label><input className="flo-input" id="flo-name" value={form.fullName} onChange={(e) => form.setFullName(e.target.value)} autoComplete="name" required maxLength={120}/></div>
      <div className="flo-field"><label className="flo-caps" htmlFor="flo-email">Email</label><input className="flo-input" id="flo-email" type="email" value={form.email} onChange={(e) => form.setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required maxLength={254}/></div>
      {form.status !== "from_afar" && <div className="flo-field"><label className="flo-caps" id="flo-count-label" htmlFor="flo-count-down">How many of you?</label><div className="flo-count" role="group" aria-labelledby="flo-count-label">
        <button className="flo-count-btn" id="flo-count-down" type="button" aria-label="One fewer guest" onClick={form.decrement}>−</button>
        <output aria-live="polite">{form.guestCount}</output>
        <button className="flo-count-btn" type="button" aria-label="One more guest" onClick={form.increment}>+</button>
      </div></div>}
      {form.status !== "from_afar" && form.guestNames.map((name, index) => <div className="flo-field" key={index}>
        <label className="flo-caps" htmlFor={`flo-guest-${index}`}>Guest {index + 2}&rsquo;s name</label>
        <input className="flo-input" id={`flo-guest-${index}`} value={name} onChange={(e) => form.setGuestName(index, e.target.value)} required maxLength={120}/>
      </div>)}
      <div className="flo-field flo-field-wide"><label className="flo-caps" htmlFor="flo-note">A note for us (optional)</label><textarea className="flo-input flo-textarea" id="flo-note" value={form.note} onChange={(e) => form.setNote(e.target.value)} rows={3} maxLength={500} placeholder="Anything you'd like us to know"/></div>
    </div>
    {form.error && <p className="flo-error" role="alert">{form.error}</p>}
    <button className="flo-button" disabled={form.busy}>{form.busy ? "Sending…" : "Send"}</button>
    <p className="flo-fine">Plans change? Reply again with the same email and we&rsquo;ll update it.</p>
  </form>;
}
