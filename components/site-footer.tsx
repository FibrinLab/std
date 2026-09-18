import Image from "next/image";
import { wedding } from "@/lib/content";

export function SiteFooter() {
  return <footer className="flo-footer">
    <Image className="flo-footer-leaves" src="/botanicals/cut-leaves.png" alt="" width={1500} height={967} aria-hidden="true"/>
    <span className="flo-caps">{wedding.dateDisplay.replaceAll(".", " · ")} — {wedding.venueAddress} — <span className="flo-keepcase">{wedding.hashtag}</span> 🐝</span>
  </footer>;
}
