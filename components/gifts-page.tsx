import Image from "next/image";
import { SprigDivider } from "@/components/floral-art";
import { GiftList } from "@/components/gift-list";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { gifts, wedding } from "@/lib/content";
import type { GiftAvailability } from "@/lib/gifts";

function Bloom({ src, width, height, className }: { src: string; width: number; height: number; className: string }) {
  return <Image className={`flo-bloom ${className}`} src={src} alt="" width={width} height={height} aria-hidden="true"/>;
}

// A pen-and-ink parcel with a trailing ribbon, in the same ink as the sprig dividers.
function RibbonArc() {
  return <svg className="flo-gf-ribbon" viewBox="0 0 320 90" fill="none" aria-hidden="true" focusable="false">
    <path d="M12 72 C 70 20 150 14 214 44 C 240 56 262 58 300 40" stroke="currentColor" strokeWidth="1.2" strokeDasharray="1.5 7" strokeLinecap="round" opacity=".8"/>
    <g transform="translate(142 30)" stroke="#8e3b4a" strokeWidth="1.1" strokeLinejoin="round" fill="#f8f4ea">
      <rect x="-19" y="-6" width="38" height="30" rx="1"/>
      <path d="M-21 -6 H21 V2 H-21 Z"/>
      <path d="M0 -6 V24 M0 -6 C-4 -14 -14 -16 -14 -9 C-14 -4 -6 -6 0 -6 C6 -6 14 -4 14 -9 C14 -16 4 -14 0 -6 Z"/>
    </g>
    <circle cx="300" cy="40" r="3" fill="#C9B078"/>
  </svg>;
}

function ExternalLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  return <a className={className} href={href} target="_blank" rel="noopener noreferrer">{children}<span aria-hidden="true">&nbsp;↗</span><span className="flo-sr"> (opens in a new tab)</span></a>;
}

export function GiftsPage({ availability }: { availability: Record<string, GiftAvailability> }) {
  const { howItWorks, registry, contribution } = gifts;
  return <main className="flo-page">
    <SiteNav/>

    <section className="flo-hero flo-fl-hero flo-gf-hero">
      <span className="flo-aura flo-aura-coral" aria-hidden="true"/>
      <span className="flo-aura flo-aura-gold" aria-hidden="true"/>
      <Bloom src="/botanicals/cut-peony-burgundy.png" width={1100} height={1075} className="flo-b-rose"/>
      <Bloom src="/botanicals/cut-magnolia.png" width={1250} height={1375} className="flo-b-peony"/>
      <div className="flo-hero-text">
        <RibbonArc/>
        <p className="flo-caps flo-names">{wedding.coupleNames} · {wedding.dateLong.replace(/^\w+ /, "")}</p>
        <h1 className="flo-heading flo-fl-title">{gifts.title}</h1>
        <p className="flo-fl-intro">{gifts.intro}</p>
        <a className="flo-caps flo-scroll" href="#gift-list">See the list</a>
      </div>
    </section>

    <div className="flo-wrap">
      <Reveal className="flo-section flo-section-wide">
        <SprigDivider className="flo-sprig"/>
        <h2 className="flo-heading">{howItWorks.heading}</h2>
        <ol className="flo-gf-steps">
          {howItWorks.steps.map((step, index) => <li key={step.title}>
            <span className="flo-fl-num" aria-hidden="true">{index + 1}</span>
            <h3 className="flo-fl-after-title">{step.title}</h3>
            <p>{step.body}</p>
          </li>)}
        </ol>
        <div className="flo-gf-registry">
          {registry.href
            ? <><ExternalLink className="flo-button flo-gf-registry-btn" href={registry.href}>{registry.label}</ExternalLink><p className="flo-fine">{registry.deliveryNote}</p></>
            : <p className="flo-fine flo-gf-soon">{registry.comingSoon}</p>}
        </div>
      </Reveal>
    </div>

    <div className="flo-wrap">
      <span className="flo-aura flo-aura-rose" aria-hidden="true"/>
      <Bloom src="/botanicals/cut-sprigs.png" width={1050} height={1050} className="flo-b-sprigs"/>
      <Reveal id="gift-list" className="flo-section flo-section-wide flo-gf-list-section">
        <SprigDivider className="flo-sprig"/>
        <h2 className="flo-heading">Our list</h2>
        <GiftList initialAvailability={availability}/>
      </Reveal>
    </div>

    <div className="flo-wrap">
      <span className="flo-aura flo-aura-plum" aria-hidden="true"/>
      <Bloom src="/botanicals/cut-dahlia-pink.png" width={1000} height={950} className="flo-b-dahlia"/>
      <Reveal className="flo-section">
        <SprigDivider className="flo-sprig"/>
        <h2 className="flo-heading">{contribution.heading}</h2>
        <p className="flo-gf-contrib">{contribution.body}</p>
        <p><ExternalLink className="flo-detail-link" href={contribution.link.href}>Message us on WhatsApp</ExternalLink></p>
        <p className="flo-italic" style={{ marginTop: 48 }}>{gifts.closing}</p>
        <p className="flo-caps" style={{ marginTop: 10 }}>{wedding.signOff.replace("Love, ", "With love — ")}</p>
      </Reveal>
    </div>

    <SiteFooter/>
  </main>;
}
