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

// Shared "Send to" control for the update and itinerary mailers: audience radios plus the guest
// checklist that appears for "Selected guests". The parent owns the state.
export function AudiencePicker({ audience, selected, counts, guests, onAudience, onToggle }: {
  audience: Audience; selected: Set<string>; counts: AudienceCounts; guests: Guest[];
  onAudience: (audience: Audience) => void; onToggle: (email: string) => void;
}) {
  return <>
    <fieldset className="flo-fieldset">
      <legend className="flo-caps adm-compose-legend">Send to</legend>
      <div className="adm-audiences">
        {AUDIENCES.map((option) => <label className="flo-option" key={option.value}>
          <input type="radio" name="audience" value={option.value} checked={audience === option.value} onChange={() => onAudience(option.value)}/>
          <span className="flo-dot" aria-hidden="true"/>
          <span className="adm-audience-text">{option.label} <em>({option.value === "selected" ? selected.size : counts[option.value]})</em></span>
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
  </>;
}

export const recipientCount = (audience: Audience, selected: Set<string>, counts: AudienceCounts) => audience === "selected" ? selected.size : counts[audience];
