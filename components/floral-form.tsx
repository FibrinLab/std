"use client";

import { SprigDivider } from "@/components/floral-art";
import { REPLY_OPTIONS, useSaveTheDateForm, type FormInvite } from "@/lib/use-save-the-date-form";

export function FloralForm({ invite }: { invite?: FormInvite }) {
  const form = useSaveTheDateForm(invite);
  const inviteFirstName = invite?.name.trim().split(/\s+/)[0];

  if (form.saved) {
    return <div className="flo-thanks" role="status">
      <SprigDivider className="flo-sprig"/>
      <h3 className="flo-thanks-title">Thank you, {form.firstName.trim()}</h3>
      <p className="flo-italic">{form.saved.status === "celebrating" ? `Your seat${form.saved.plusOneName ? ` — and one for ${form.saved.plusOneName} —` : " is"} noted for the celebration — we are so glad.` : "We will miss you on the day, and we are grateful you told us."}</p>
      <p className="flo-fine">A copy is on its way to {form.email}.</p>
      <button className="flo-linklike" type="button" onClick={form.editReply}>Change of plans? Edit your reply</button>
    </div>;
  }

  return <form className="flo-form" onSubmit={form.submit}>
    <fieldset className="flo-fieldset">
      <legend className="flo-caps flo-legend">{invite ? `Kindly reply, ${inviteFirstName}` : "Kindly reply"}</legend>
      <div className="flo-options">
        {REPLY_OPTIONS.map((option) => <label className="flo-option" key={option.value}>
          <input type="radio" name="reply" value={option.value} checked={form.status === option.value} onChange={() => form.setStatus(option.value)}/>
          <span className="flo-dot" aria-hidden="true"/>
          <span className="flo-option-text">{option.label}</span>
        </label>)}
      </div>
    </fieldset>
    <p className="flo-fine flo-invite-note">{invite?.plusOne
      ? "Your invitation includes a plus-one — add their name below if they will join you."
      : "Kindly note — this celebration is strictly by invitation, and plus-ones are only with prior approval. If you would like to request one, mention it in your note and we will come back to you."}</p>
    <div className="flo-fields">
      <div className="flo-field"><label className="flo-caps" htmlFor="flo-first-name">First name</label><input className="flo-input" id="flo-first-name" value={form.firstName} onChange={(e) => form.setFirstName(e.target.value)} autoComplete="given-name" required maxLength={60}/></div>
      <div className="flo-field"><label className="flo-caps" htmlFor="flo-last-name">Last name</label><input className="flo-input" id="flo-last-name" value={form.lastName} onChange={(e) => form.setLastName(e.target.value)} autoComplete="family-name" required maxLength={60}/></div>
      <div className="flo-field"><label className="flo-caps" htmlFor="flo-email">Email</label><input className="flo-input" id="flo-email" type="email" value={form.email} onChange={(e) => form.setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required maxLength={254}/></div>
      <div className="flo-field"><label className="flo-caps" htmlFor="flo-phone">Phone number</label><input className="flo-input" id="flo-phone" type="tel" value={form.phone} onChange={(e) => form.setPhone(e.target.value)} placeholder="+234 801 234 5678" autoComplete="tel" required pattern="\+?[0-9][0-9 ()\-]{6,19}" maxLength={20}/></div>
      {invite?.plusOne && form.status !== "from_afar" && <div className="flo-field flo-field-wide"><label className="flo-caps" htmlFor="flo-plus-one">Your guest&rsquo;s name (optional)</label><input className="flo-input" id="flo-plus-one" value={form.plusOneName} onChange={(e) => form.setPlusOneName(e.target.value)} maxLength={120}/></div>}
      <div className="flo-field flo-field-wide"><label className="flo-caps" htmlFor="flo-note">A note for us (optional)</label><textarea className="flo-input flo-textarea" id="flo-note" value={form.note} onChange={(e) => form.setNote(e.target.value)} rows={3} maxLength={500} placeholder="Anything you'd like us to know"/></div>
    </div>
    {form.error && <p className="flo-error" role="alert">{form.error}</p>}
    <button className="flo-button" disabled={form.busy}>{form.busy ? "Sending…" : "Send"}</button>
    <p className="flo-fine">Plans change? Reply again with the same email and we&rsquo;ll update it.</p>
  </form>;
}
