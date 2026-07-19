import type { Metadata } from "next";
import { Cormorant_Garamond, Instrument_Sans } from "next/font/google";
import { wedding } from "@/lib/content";
import "./globals.css";

const display = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-cormorant", weight: ["400", "500", "600"], display: "swap", style: ["normal", "italic"] });
const sans = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument", display: "swap" });

export const metadata: Metadata = {
  title: { default: `${wedding.coupleNames} — Save the date`, template: `%s | ${wedding.coupleNames}` },
  description: `${wedding.announcement} Save the date: ${wedding.dateLong}, ${wedding.venueAddress}.`,
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth"><body className={`${display.variable} ${sans.variable}`}>{children}</body></html>;
}
