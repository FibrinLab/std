import Image from "next/image";
import Link from "next/link";
import { FlightSearchForm } from "@/components/flight-search";
import { SprigDivider } from "@/components/floral-art";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { flights, wedding } from "@/lib/content";

function Bloom({ src, width, height, className }: { src: string; width: number; height: number; className: string }) {
  return <Image className={`flo-bloom ${className}`} src={src} alt="" width={width} height={height} aria-hidden="true"/>;
}

// A pen-and-ink plane gliding along a dotted arc, in the same ink as the sprig dividers.
function PlaneArc() {
  return <svg className="flo-fl-plane" viewBox="0 0 320 90" fill="none" aria-hidden="true" focusable="false">
    <path d="M14 78 C 90 18 190 6 262 30" stroke="currentColor" strokeWidth="1.2" strokeDasharray="1.5 7" strokeLinecap="round" opacity=".8"/>
    <circle cx="14" cy="78" r="3" fill="#C9B078"/>
    <g transform="translate(262 30) rotate(18) scale(1.15)" stroke="#8e3b4a" strokeWidth="1.1" strokeLinejoin="round" strokeLinecap="round" fill="#f8f4ea">
      <path d="M-20 0 C-20 -2.4 -17 -3 -14 -3 L-4 -3 L-11 -15 L-6.5 -15 L5 -3 L15 -3 C19 -3 23 -1.5 23 0 C23 1.5 19 3 15 3 L5 3 L-6.5 15 L-11 15 L-4 3 L-14 3 L-18 8 L-21 8 L-19.5 0 L-21 -8 L-18 -8 L-14 -3"/>
    </g>
  </svg>;
}

function PinIcon() {
  return <svg viewBox="0 0 16 20" width="12" height="15" aria-hidden="true"><path d="M8 19s6.5-6.6 6.5-11.2A6.5 6.5 0 0 0 1.5 7.8C1.5 12.4 8 19 8 19Z" fill="none" stroke="currentColor" strokeWidth="1.3"/><circle cx="8" cy="7.7" r="2.2" fill="currentColor"/></svg>;
}

function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  if (href.startsWith("/")) return <Link className="flo-detail-link" href={href}>{children}</Link>;
  return <a className="flo-detail-link" href={href} target="_blank" rel="noopener noreferrer">{children}<span aria-hidden="true">&nbsp;↗</span><span className="flo-sr"> (opens in a new tab)</span></a>;
}

export function FlightsPage() {
  const { airport, dates, search, tips, after } = flights;
  return <main className="flo-page">
    <SiteNav/>

    <section className="flo-hero flo-fl-hero">
      <span className="flo-aura flo-aura-coral" aria-hidden="true"/>
      <span className="flo-aura flo-aura-gold" aria-hidden="true"/>
      <Bloom src="/botanicals/cut-magnolia.png" width={1250} height={1375} className="flo-b-rose"/>
      <Bloom src="/botanicals/cut-peony-burgundy.png" width={1100} height={1075} className="flo-b-peony"/>
      <div className="flo-hero-text">
        <PlaneArc/>
        <p className="flo-caps flo-names">{wedding.coupleNames} · {wedding.dateLong.replace(/^\w+ /, "")}</p>
        <h1 className="flo-heading flo-fl-title">{flights.title}</h1>
        <p className="flo-fl-intro">{flights.intro}</p>
        <a className="flo-caps flo-scroll" href="#find-flight">{search.heading}</a>
      </div>
    </section>

    <div className="flo-wrap">
      <Reveal className="flo-section">
        <SprigDivider className="flo-sprig"/>
        <div className="flo-fl-airport">
          <span className="flo-fl-code" aria-hidden="true">{airport.code}</span>
          <p className="flo-caps flo-fl-eyebrow">{airport.eyebrow}</p>
          <h2 className="flo-fl-airport-name">{airport.name} <span className="flo-sr">({airport.code})</span></h2>
          <p className="flo-caps flo-fl-place"><PinIcon/>{airport.place}</p>
          <p className="flo-fl-body">{airport.body}</p>
          <p><TextLink href={airport.mapHref}>{airport.mapLabel}</TextLink></p>
        </div>
      </Reveal>
    </div>

    <div className="flo-wrap">
      <span className="flo-aura flo-aura-rose" aria-hidden="true"/>
      <Reveal className="flo-section flo-section-wide">
        <SprigDivider className="flo-sprig"/>
        <h2 className="flo-heading">{dates.heading}</h2>
        <ol className="flo-fl-timeline">
          {dates.steps.map((step) => <li key={step.label} className={step.suggested ? "" : "is-wedding"}>
            <span className="flo-fl-dot" aria-hidden="true"/>
            <p className="flo-caps flo-fl-step-label">{step.label}</p>
            <p className="flo-fl-step-date">{step.date}</p>
            <p className="flo-fl-step-body">{step.body}</p>
          </li>)}
        </ol>
        <p className="flo-fine flo-fl-note">{dates.note}</p>
      </Reveal>
    </div>

    <div className="flo-wrap">
      <Bloom src="/botanicals/cut-sprigs.png" width={1050} height={1050} className="flo-b-sprigs"/>
      <Reveal id="find-flight" className="flo-section flo-fl-search-section">
        <SprigDivider className="flo-sprig"/>
        <h2 className="flo-heading">{search.heading}</h2>
        <p className="flo-fl-intro">{search.intro}</p>
        <FlightSearchForm/>
      </Reveal>
    </div>

    <div className="flo-wrap">
      <span className="flo-aura flo-aura-plum" aria-hidden="true"/>
      <Bloom src="/botanicals/cut-dahlia-pink.png" width={1000} height={950} className="flo-b-dahlia"/>
      <Reveal className="flo-section flo-section-wide">
        <SprigDivider className="flo-sprig"/>
        <h2 className="flo-heading">{tips.heading}</h2>
        <ul className="flo-fl-tips">
          {tips.items.map((tip) => <li key={tip.title}>
            <h3 className="flo-caps flo-detail-heading">{tip.title}</h3>
            <p>{tip.body}</p>
            {tip.link && <p className="flo-fl-tip-link"><TextLink href={tip.link.href}>{tip.link.label}</TextLink></p>}
          </li>)}
        </ul>
        <p className="flo-fine flo-fl-note">{tips.note}</p>
      </Reveal>
    </div>

    <div className="flo-wrap">
      <Reveal className="flo-section flo-section-wide">
        <SprigDivider className="flo-sprig"/>
        <h2 className="flo-heading">{after.heading}</h2>
        <ol className="flo-fl-after">
          {after.steps.map((step, index) => <li key={step.title}>
            <span className="flo-fl-num" aria-hidden="true">{index + 1}</span>
            <h3 className="flo-fl-after-title">{step.title}</h3>
            <p>{step.body}</p>
            <p><TextLink href={step.link.href}>{step.link.label}</TextLink></p>
          </li>)}
        </ol>
        <p className="flo-italic" style={{ marginTop: 48 }}>Safe travels — we’ll see you in Lagos.</p>
        <p className="flo-caps" style={{ marginTop: 10 }}>{wedding.signOff.replace("Love, ", "With love — ")}</p>
      </Reveal>
    </div>

    <SiteFooter/>
  </main>;
}
