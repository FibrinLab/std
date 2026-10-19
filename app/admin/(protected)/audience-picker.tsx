"use client";

import type { Audience } from "@/lib/types";

export const AUDIENCES: Array<{ value: Audience; label: string }> = [
  { value: "all", label: "Everyone" },
  { value: "celebrating", label: "Celebrating" },
  { value: "from_afar", label: "From afar" },
  { value: "selected", label: "Selected guests" },
];

export type Guest = { email: string; fullName: string };
export type AudienceCounts = Record<"all" | "celebrating" | "from_afar", number>;
// "custom" = addresses typed by hand (people who have not replied yet). Only mailers that pass
// `custom` to the picker offer it; the server records such sends under "selected".
export type PickerAudience = Audience | "custom";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// One recipient per line: "jane@example.com" or "Jane Doe <jane@example.com>".
export function parseCustomRecipients(text: string): { recipients: Guest[]; invalid: string[] } {
  const recipients: Guest[] = [], invalid: string[] = [], seen = new Set<string>();
  for (const raw of text.split(/\n|,|;/)) {
    const line = raw.trim();
    if (!line) continue;
    const match = line.match(/^(.*?)\s*<([^<>]+)>$/);
    const email = (match ? match[2] : line).trim().toLowerCase();
    const fullName = (match ? match[1] : "").trim().replace(/^["']|["']$/g, "");
    if (!EMAIL.test(email)) { invalid.push(line); continue; }
    if (seen.has(email)) continue;
    seen.add(email);
    recipients.push({ email, fullName });
  }
  return { recipients, invalid };
}

// Shared "Send to" control for the mailers: audience radios plus the guest checklist for
// "Selected guests" and, when `custom` is given, a textarea for typed addresses. The parent owns the state.
export function AudiencePicker({ audience, selected, counts, guests, onAudience, onToggle, custom }: {
  audience: PickerAudience; selected: Set<string>; counts: AudienceCounts; guests: Guest[];
  onAudience: (audience: PickerAudience) => void; onToggle: (email: string) => void;
  custom?: { text: string; onChange: (text: string) => void; count: number; invalid: string[] };
}) {
  const options: Array<{ value: PickerAudience; label: string }> = custom ? [...AUDIENCES, { value: "custom", label: "Specific emails" }] : AUDIENCES;
  const countFor = (value: PickerAudience) => value === "selected" ? selected.size : value === "custom" ? custom?.count ?? 0 : counts[value];
  return <>
    <fieldset className="flo-fieldset">
      <legend className="flo-caps adm-compose-legend">Send to</legend>
      <div className="adm-audiences">
        {options.map((option) => <label className="flo-option" key={option.value}>
          <input type="radio" name="audience" value={option.value} checked={audience === option.value} onChange={() => onAudience(option.value)}/>
          <span className="flo-dot" aria-hidden="true"/>
          <span className="adm-audience-text">{option.label} <em>({countFor(option.value)})</em></span>
        </label>)}
      </div>
    </fieldset>
    {audience === "selected" && <fieldset className="flo-fieldset adm-guestlist">
      <legend className="flo-caps adm-compose-legend">Guests</legend>
      {guests.length === 0 && <p className="adm-hint" style={{ margin: 0 }}>No replies yet.</p>}
      {guests.map((guest) => <label className="adm-guest" key={guest.email}>
        <input type="checkbox" checked={selected.has(guest.email)} onChange={() => onToggle(guest.email)}/>
        <span>{guest.fullName}</span> <em>{guest.email}</em>
      </label>)}
    </fieldset>}
    {audience === "custom" && custom && <div className="flo-field">
      <label className="flo-caps" htmlFor="custom-recipients">Email addresses</label>
      <textarea className="flo-input flo-textarea" id="custom-recipients" value={custom.text} onChange={(e) => custom.onChange(e.target.value)} rows={4} placeholder={"One per line — add a name for the greeting:\nBello Adeyemi <bello@example.com>\nfunmi@example.com"} aria-describedby="custom-recipients-hint"/>
      <p className="adm-hint" id="custom-recipients-hint" style={{ margin: "6px 0 0" }}>{custom.invalid.length > 0 ? <span className="flo-error">Not a valid address: {custom.invalid.join(", ")}</span> : "Anyone — they do not need to have replied. Without a name the email opens “Dear friend”."}</p>
    </div>}
  </>;
}

export const recipientCount = (audience: PickerAudience, selected: Set<string>, counts: AudienceCounts, customCount = 0) => audience === "selected" ? selected.size : audience === "custom" ? customCount : counts[audience];
