"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { hotels, stay, type Hotel } from "@/lib/content";

function PinIcon() {
  return <svg className="flo-hotel-pin" viewBox="0 0 16 20" width="12" height="15" aria-hidden="true"><path d="M8 19s6.5-6.6 6.5-11.2A6.5 6.5 0 0 0 1.5 7.8C1.5 12.4 8 19 8 19Z" fill="none" stroke="currentColor" strokeWidth="1.3"/><circle cx="8" cy="7.7" r="2.2" fill="currentColor"/></svg>;
}

function ExternalLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  return <a className={className} href={href} target="_blank" rel="noopener noreferrer"><span>{children}<span className="flo-hotel-arrow" aria-hidden="true">&nbsp;↗</span><span className="flo-sr"> (opens in a new tab)</span></span></a>;
}

// Renders nothing until content.ts has a weddingRate for the hotel — the section intro already says rates are being arranged.
function WeddingRate({ hotel }: { hotel: Hotel }) {
  if (!hotel.weddingRate) return null;
  return <div className="flo-hotel-rate">
    <ExternalLink className="flo-button flo-hotel-rate-btn" href={hotel.weddingRate.href}>{stay.weddingRateLabel}</ExternalLink>
    {hotel.weddingRate.code && <p className="flo-fine">Quote booking code <strong className="flo-hotel-code">{hotel.weddingRate.code}</strong></p>}
  </div>;
}

// Compact on purpose: just what guests compare at a glance. Everything else lives in the details view.
function HotelCard({ hotel, onDetails }: { hotel: Hotel; onDetails: () => void }) {
  const cover = hotel.images[0];
  return <article className="flo-hotel">
    <div className="flo-hotel-photo">
      <Image src={cover.src} alt={cover.alt} width={cover.width} height={cover.height} sizes="(max-width:1000px) 46vw, 280px"/>
    </div>
    <div className="flo-hotel-body">
      <p className="flo-caps flo-hotel-venue"><PinIcon/>Approx. {hotel.venue.minutes} mins to venue</p>
      <h3 className="flo-hotel-name">{hotel.name}</h3>
      <p className="flo-caps flo-hotel-category">{hotel.category}</p>
      <p className="flo-hotel-price">{hotel.priceFrom ? <><strong>{hotel.priceFrom}</strong> <span>a night</span></> : <span>Rates vary by date</span>}</p>
      <WeddingRate hotel={hotel}/>
      <div className="flo-hotel-actions">
        <button type="button" className="flo-button flo-hotel-btn" onClick={onDetails} aria-haspopup="dialog">View Hotel Details</button>
        <ExternalLink className="flo-hotel-site" href={hotel.website.href}>{hotel.website.label}</ExternalLink>
      </div>
    </div>
  </article>;
}

function HotelDetails({ hotel }: { hotel: Hotel }) {
  const rows: Array<[string, React.ReactNode]> = [
    ["Nightly rate", <>{hotel.priceFrom && <strong>{hotel.priceFrom} </strong>}{hotel.priceNote}</>],
    ["Breakfast", hotel.breakfast],
    ["Wi-Fi", hotel.wifi],
    ["Pool & gym", hotel.poolGym],
    ["Check-in & check-out", hotel.checkInOut],
    ["Journey to the venue", <>About {hotel.venue.minutes} minutes by car ({hotel.venue.km} km) to {stay.venueName}, Oniru. {stay.travelNote}</>],
  ];
  return <>
    <p className="flo-caps flo-hotel-venue"><PinIcon/>Approx. {hotel.venue.minutes} mins to {stay.venueName}</p>
    <h3 className="flo-hotel-name flo-hotel-name-lg" id={`hotel-title-${hotel.id}`}>{hotel.name}</h3>
    <p className="flo-caps flo-hotel-category">{hotel.category}</p>
    <p className="flo-hotel-desc">{hotel.description}</p>

    <div className="flo-hotel-gallery" tabIndex={0} role="group" aria-label={`Photos of ${hotel.name}`}>
      {hotel.images.map((image) => <figure key={image.src}>
        <Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="(max-width:760px) 84vw, 560px"/>
        {image.credit && <figcaption><ExternalLink href={image.credit.href}>{image.credit.label}</ExternalLink></figcaption>}
      </figure>)}
    </div>
    {hotel.galleryNote && <p className="flo-fine"><ExternalLink className="flo-detail-link" href={hotel.officialSite}>{hotel.galleryNote}</ExternalLink></p>}

    <div className="flo-hotel-cols">
      <section>
        <h4 className="flo-caps flo-hotel-sub">Room categories</h4>
        <ul className="flo-hotel-rooms">{hotel.rooms.map((room) => <li key={room.name}><span>{room.name}</span>{room.price && <span>{room.price}<small> / night</small></span>}{room.size && <span><small>{room.size}</small></span>}</li>)}</ul>
        {hotel.roomsNote && <p className="flo-fine">{hotel.roomsNote}</p>}
      </section>
      <section>
        <h4 className="flo-caps flo-hotel-sub">Key amenities</h4>
        <ul className="flo-hotel-amenities">{hotel.amenities.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>
    </div>

    <dl className="flo-hotel-info">{rows.map(([label, value]) => <div key={label}><dt className="flo-caps">{label}</dt><dd>{value}</dd></div>)}</dl>

    <section>
      <h4 className="flo-caps flo-hotel-sub">Location</h4>
      <p className="flo-hotel-address">{hotel.address}</p>
      {hotel.contact && <p className="flo-fine">{hotel.contact}</p>}
      <iframe className="flo-hotel-map" src={hotel.mapEmbedSrc} title={`Map showing ${hotel.name}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade"/>
    </section>

    <WeddingRate hotel={hotel}/>
    <div className="flo-hotel-actions flo-hotel-actions-wide">
      <ExternalLink className="flo-button flo-hotel-btn" href={hotel.officialSite}>Official Hotel Website</ExternalLink>
      <ExternalLink className="flo-hotel-btn flo-hotel-btn-ghost" href={hotel.mapsHref}>Open in Google Maps</ExternalLink>
      <ExternalLink className="flo-hotel-btn flo-hotel-btn-ghost" href={hotel.directionsHref}>Directions to the Venue</ExternalLink>
    </div>
  </>;
}

export function HotelStay() {
  const [openId, setOpenId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openHotel = hotels.find((hotel) => hotel.id === openId);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (openId && !dialog.open) dialog.showModal();
    if (!openId && dialog.open) dialog.close();
  }, [openId]);

  return <>
    <p className="flo-stay-intro">{stay.intro}</p>
    <div className="flo-hotels">{hotels.map((hotel) => <HotelCard key={hotel.id} hotel={hotel} onDetails={() => setOpenId(hotel.id)}/>)}</div>
    <p className="flo-fine flo-stay-note">{stay.travelNote}</p>

    {/* A click on the backdrop lands on the <dialog> itself; clicks inside land on its children. */}
    <dialog ref={dialogRef} className="flo-hotel-dialog" aria-labelledby={openHotel ? `hotel-title-${openHotel.id}` : undefined} onClose={() => setOpenId(null)} onClick={(event) => { if (event.target === event.currentTarget) setOpenId(null); }}>
      {openHotel && <div className="flo-hotel-sheet">
        <button type="button" className="flo-hotel-close" onClick={() => setOpenId(null)} aria-label="Close hotel details">×</button>
        <HotelDetails hotel={openHotel}/>
      </div>}
    </dialog>
  </>;
}
