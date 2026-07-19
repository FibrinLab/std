import Image from "next/image";
import { SprigDivider } from "@/components/floral-art";
import { FloralForm } from "@/components/floral-form";
import { Reveal } from "@/components/reveal";
import { countdownLine, detailSections, wedding } from "@/lib/content";

// Positioning, size, and drift animation live in CSS (per-class, with mobile overrides).
function Bloom({ src, width, height, className }: { src: string; width: number; height: number; className: string }) {
  return <Image className={`flo-bloom ${className}`} src={src} alt="" width={width} height={height} aria-hidden="true"/>;
}

export default function HomePage() {
  return <main className="flo-page">
    <section className="flo-hero">
      <span className="flo-aura flo-aura-coral" aria-hidden="true"/>
      <span className="flo-aura flo-aura-gold" aria-hidden="true"/>
      <Bloom src="/botanicals/cut-peony-blush.png" width={1075} height={825} className="flo-blur flo-b-heroglow"/>
      <Bloom src="/botanicals/cut-peony-burgundy.png" width={1100} height={1075} className="flo-b-peony"/>
      <Bloom src="/botanicals/cut-magnolia.png" width={1250} height={1375} className="flo-b-rose"/>
      <Bloom src="/botanicals/cut-peony-blush.png" width={1075} height={825} className="flo-b-blush"/>
      <Bloom src="/botanicals/cut-rose-red.png" width={675} height={500} className="flo-b-red"/>
      <Bloom src="/botanicals/cut-dahlia-pink.png" width={1000} height={950} className="flo-b-hero-dahlia"/>
      <Bloom src="/botanicals/cut-leaves.png" width={1500} height={967} className="flo-b-hero-leaves"/>
      <div className="flo-hero-text">
        <h1 className="flo-display"><span className="flo-d1">Save</span><span className="flo-d2">the</span><span className="flo-d1">Date</span></h1>
        <p className="flo-caps flo-names">{wedding.coupleNames}</p>
        <p className="flo-caps">{wedding.dateLong}</p>
        <p className="flo-caps">{wedding.venueAddress.replace(", ", " | ")}</p>
        <p className="flo-italic flo-follow">venue &amp; invitation to follow</p>
        <a className="flo-caps flo-scroll" href="#rsvp">Kindly reply below</a>
      </div>
    </section>

    <div className="flo-wrap">
      <span className="flo-aura flo-aura-rose" aria-hidden="true"/>
      <Bloom src="/botanicals/cut-dahlia-pink.png" width={1000} height={950} className="flo-blur flo-b-rsvpglow"/>
      <Bloom src="/botanicals/cut-sprigs.png" width={1050} height={1050} className="flo-b-sprigs"/>
      <Bloom src="/botanicals/cut-rose-cabbage.png" width={825} height={750} className="flo-b-cabbage"/>
      <Bloom src="/botanicals/cut-rose-red.png" width={675} height={500} className="flo-b-rsvp-rose"/>
      <Reveal id="rsvp" className="flo-section">
        <SprigDivider className="flo-sprig"/>
        <h2 className="flo-heading">R S V P</h2>
        <FloralForm/>
      </Reveal>
    </div>

    <div className="flo-wrap">
      <span className="flo-aura flo-aura-plum" aria-hidden="true"/>
      <Bloom src="/botanicals/cut-magnolia.png" width={1250} height={1375} className="flo-blur flo-b-detailsglow"/>
      <Bloom src="/botanicals/cut-magnolia.png" width={1250} height={1375} className="flo-b-magnolia"/>
      <Bloom src="/botanicals/cut-dahlia-pink.png" width={1000} height={950} className="flo-b-dahlia"/>
      <Bloom src="/botanicals/cut-peony-burgundy.png" width={1100} height={1075} className="flo-b-details-peony"/>
      <Reveal className="flo-section">
        <SprigDivider className="flo-sprig"/>
        <h2 className="flo-heading">The Details</h2>
        <div className="flo-details">
          {detailSections.map((section) => <section key={section.heading}>
            <h3 className="flo-caps flo-detail-heading">{section.heading}</h3>
            <p>{section.body}</p>
          </section>)}
        </div>
        <p className="flo-italic" style={{ marginTop: 44 }}>{countdownLine}</p>
        <p className="flo-caps" style={{ marginTop: 10 }}>{wedding.signOff.replace("Love, ", "With love — ")}</p>
      </Reveal>
    </div>

    <footer className="flo-footer">
      <Image className="flo-footer-leaves" src="/botanicals/cut-leaves.png" alt="" width={1500} height={967} aria-hidden="true"/>
      <span className="flo-caps">{wedding.dateDisplay.replaceAll(".", " · ")} — {wedding.venueAddress} — {wedding.hashtag}</span>
    </footer>
  </main>;
}
