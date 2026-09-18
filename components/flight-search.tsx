"use client";

import { useId, useState } from "react";
import { airportLabel } from "@/lib/airports";
import { flights } from "@/lib/content";
import { buildSearchLinks, cabins, matchAirport, suggestAirports, validateSearch, type Cabin, type FlightSearch } from "@/lib/flight-search";

const copy = flights.search;

function Stepper({ label, hint, value, min, max, onChange }: { label: string; hint: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  return <div className="flo-fl-stepper">
    <span className="flo-fl-stepper-label">{label} <em>{hint}</em></span>
    <div className="flo-count">
      <button type="button" className="flo-count-btn" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`Fewer ${label.toLowerCase()}`}>−</button>
      <output aria-live="polite" aria-label={label}>{value}</output>
      <button type="button" className="flo-count-btn" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`More ${label.toLowerCase()}`}>+</button>
    </div>
  </div>;
}

export function FlightSearchForm() {
  const listId = useId();
  const [search, setSearch] = useState<FlightSearch>({ from: "", depart: copy.defaultDepart, return: copy.defaultReturn, adults: 1, children: 0, infants: 0, cabin: "economy" });
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const update = (patch: Partial<FlightSearch>) => { setSearch((current) => ({ ...current, ...patch })); setError(null); };

  const suggestions = open ? suggestAirports(search.from) : [];
  const links = buildSearchLinks(search);
  const unmatched = search.from.trim().length > 2 && !links.origin && suggestions.length === 0;
  const pick = (label: string) => { update({ from: label }); setOpen(false); };

  function onFromKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!suggestions.length) return;
    if (event.key === "ArrowDown") { event.preventDefault(); setCursor((cursor + 1) % suggestions.length); }
    if (event.key === "ArrowUp") { event.preventDefault(); setCursor((cursor - 1 + suggestions.length) % suggestions.length); }
    if (event.key === "Enter") { event.preventDefault(); pick(airportLabel(suggestions[cursor])); }
    if (event.key === "Escape") setOpen(false);
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const problem = validateSearch(search);
    if (problem) { setError(problem); return; }
    window.open(links.primary, "_blank", "noopener,noreferrer");
  }

  return <form className="flo-fl-search" onSubmit={onSubmit} noValidate>
    <div className="flo-fields">
      <div className="flo-field flo-field-wide flo-fl-from">
        <label className="flo-caps" htmlFor={`${listId}-from`}>Flying from</label>
        <input id={`${listId}-from`} className="flo-input" type="text" autoComplete="off" placeholder={copy.fromPlaceholder} value={search.from}
          role="combobox" aria-expanded={suggestions.length > 0} aria-controls={listId} aria-autocomplete="list" aria-activedescendant={suggestions.length ? `${listId}-${cursor}` : undefined}
          onChange={(event) => { update({ from: event.target.value }); setOpen(true); setCursor(0); }}
          onFocus={() => setOpen(!matchAirport(search.from))} onBlur={() => setOpen(false)} onKeyDown={onFromKeyDown}/>
        <ul id={listId} role="listbox" className="flo-fl-suggest" hidden={!suggestions.length}>
          {suggestions.map((airport, index) => <li key={airport.code} id={`${listId}-${index}`} role="option" aria-selected={index === cursor}
            onMouseDown={(event) => { event.preventDefault(); pick(airportLabel(airport)); }} onMouseEnter={() => setCursor(index)}>
            <span>{airport.city}{airport.name !== airport.city && <em> — {airport.name}</em>}</span><span className="flo-fl-suggest-code">{airport.code}</span>
          </li>)}
        </ul>
        {unmatched && <p className="flo-fine">{copy.fallbackNote}</p>}
      </div>

      <div className="flo-field flo-field-wide">
        <span className="flo-caps">Flying to</span>
        <p className="flo-fl-locked"><span>{copy.destination}</span><span className="flo-fl-lock" aria-hidden="true">Fixed</span></p>
      </div>

      <label className="flo-field"><span className="flo-caps">Departure date</span>
        <input className="flo-input" type="date" value={search.depart} onChange={(event) => update({ depart: event.target.value, ...(event.target.value > search.return ? { return: event.target.value } : {}) })}/>
      </label>
      <label className="flo-field"><span className="flo-caps">Return date</span>
        <input className="flo-input" type="date" min={search.depart} value={search.return} onChange={(event) => update({ return: event.target.value })}/>
      </label>

      <fieldset className="flo-field flo-field-wide flo-fieldset">
        <legend className="flo-caps flo-fl-legend">Passengers</legend>
        <div className="flo-fl-steppers">
          <Stepper label="Adults" hint="12+" value={search.adults} min={1} max={9} onChange={(adults) => update({ adults, infants: Math.min(search.infants, adults) })}/>
          <Stepper label="Children" hint="2–11" value={search.children} min={0} max={8} onChange={(children) => update({ children })}/>
          <Stepper label="Infants" hint="under 2" value={search.infants} min={0} max={search.adults} onChange={(infants) => update({ infants })}/>
        </div>
      </fieldset>

      <label className="flo-field flo-field-wide"><span className="flo-caps">Cabin class</span>
        <select className="flo-input flo-fl-select" value={search.cabin} onChange={(event) => update({ cabin: event.target.value as Cabin })}>
          {cabins.map((cabin) => <option key={cabin.value} value={cabin.value}>{cabin.label}</option>)}
        </select>
      </label>
    </div>

    {error && <p className="flo-error" role="alert">{error}</p>}
    <button className="flo-button flo-fl-submit" type="submit">{copy.button}<span aria-hidden="true">&nbsp;↗</span><span className="flo-sr"> (opens {links.primarySite} in a new tab)</span></button>
    <p className="flo-fine flo-fl-alt">{!search.from.trim()
      ? "Opens Skyscanner, with Google Flights and Kayak offered as alternatives."
      : links.origin
        ? <>Searches Skyscanner. Prefer another site? <a className="flo-detail-link" href={links.google} target="_blank" rel="noopener noreferrer">Google Flights</a> · <a className="flo-detail-link" href={links.kayak ?? links.google} target="_blank" rel="noopener noreferrer">Kayak</a></>
        : "Searches Google Flights. Pick an airport from the list to use Skyscanner or Kayak instead."}
    </p>
    <p className="flo-fine flo-fl-disclaimer">{copy.disclaimer}</p>
  </form>;
}
