// Every word on the public site lives here. Edit freely — no other file needs to change.

export const wedding = {
  coupleNames: "Doyin & Akan",
  announcement: "Doyin and Akan are tying the knot!",
  hashtag: "#ForeverHisOyin27",
  dateDisplay: "02.04.2027",
  dateLong: "Friday 2 April 2027",
  dateISO: "2027-04-02T00:00:00+01:00",
  venueAddress: "Lagos, Nigeria",
  whatsapp: { label: "+44 7392 576501", href: "https://wa.me/447392576501" },
  signOff: "Love, Doyin & Akan",
};

// Links in the bar at the top of every page. "#…" links are sections of the home page; "/…" links are pages.
export const navLinks: Array<{ label: string; href: `#${string}` | `/${string}` }> = [
  { label: "RSVP", href: "#rsvp" },
  { label: "Accommodation", href: "#stay" },
  { label: "Flights", href: "/flights" },
  { label: "Details", href: "#details" },
];

export const detailSections: Array<{ heading: string; body: string; link?: { label: string; href: string }; after?: string }> = [
  {
    heading: "Getting there",
    body: "Flying in? Murtala Muhammed International Airport (LOS) is the gateway to Lagos. Suggested travel dates, tips and a flight search are on our",
    link: { label: "Flights to Lagos page", href: "/flights" },
    after: ".",
  },
  {
    heading: "All the extras",
    body: "Schedule, gift notes and more fun stuff will follow with the formal invitation. Until then, keep an eye on your inbox.",
  },
  {
    heading: "Questions?",
    body: "Don't hesitate to send us a WhatsApp message at",
    link: wedding.whatsapp,
    after: " — we're here to help!",
  },
];

export const countdownLine = "We're counting down the days and can't wait to celebrate with you!";

// ---------- Where to stay ----------
// Hotel facts below were checked against each hotel's own website and Google Maps (September 2026).
// The Art Hotel and Eko Hotel price ranges are the couple's own estimates from booking sites, in pounds.
// Leave a field as null rather than guessing — the site shows a "confirm with the hotel" line instead.

export type Hotel = {
  id: string;
  name: string;
  category: string;
  address: string;
  // null = no fixed published rate; priceNote explains where to look instead.
  priceFrom: string | null;
  priceNote: string;
  venue: { minutes: number; km: number };
  description: string;
  highlights: string[];
  images: Array<{ src: string; alt: string; width: number; height: number; credit?: { label: string; href: string } }>;
  galleryNote?: string;
  rooms: Array<{ name: string; price?: string; size?: string }>;
  roomsNote?: string;
  amenities: string[];
  breakfast: string;
  wifi: string;
  poolGym: string;
  checkInOut: string;
  contact?: string;
  website: { label: "Visit Hotel Website" | "View Rooms"; href: string };
  officialSite: string;
  mapsHref: string;
  directionsHref: string;
  mapEmbedSrc: string;
  // WEDDING RATE: once the group rate is agreed, replace null with the booking link, e.g.
  //   weddingRate: { href: "https://…", code: "DOYINAKAN27" },
  // A prominent "Book Doyin & Akan Wedding Rate" button then appears on that hotel's card and
  // details view (code is optional and shown beside it). Until then the section intro carries the message.
  weddingRate: { href: string; code?: string } | null;
};

const venueQuery = "The+Five+Palm+Oniru,+Remi+Olowude+St,+Lagos";

export const stay = {
  heading: "Where to Stay",
  intro: "We’ve shortlisted four convenient hotels close to our wedding venue in Oniru. Preferential wedding rates are currently being arranged, and we’ll update this page with booking details as soon as they are confirmed.",
  venueName: "The Five Palm Event Center",
  weddingRateLabel: "Book Doyin & Akan Wedding Rate",
  travelNote: "Journey times are to The Five Palm Event Center — Google Maps estimates in light traffic, so allow extra time on the day.",
};

export const hotels: Hotel[] = [
  {
    id: "four-points",
    name: "Four Points by Sheraton Lagos",
    category: "4-star · Marriott Bonvoy",
    address: "Plot 9/10, Block 2, Oniru Chieftaincy Estate, Victoria Island, Lagos",
    priceFrom: null,
    priceNote: "Rates vary by date — see marriott.com for live prices",
    venue: { minutes: 9, km: 3.2 },
    description: "An international-brand hotel in the Oniru estate, a short drive from the venue. A comfortable, familiar choice for guests flying in, with a pool, fitness centre and dining on site.",
    highlights: ["231 rooms & suites", "Swimming pool", "Fitness centre", "24-hour room service"],
    images: [
      { src: "/hotels/four-points-exterior.jpg", alt: "Exterior of Four Points by Sheraton Lagos", width: 1024, height: 683, credit: { label: "Photo: Kaizen Photography, CC BY-SA 4.0", href: "https://commons.wikimedia.org/wiki/File:Four_Points_by_Sheraton.jpg" } },
    ],
    galleryNote: "See the full photo gallery on the hotel’s website.",
    rooms: [{ name: "Guest rooms" }, { name: "Studio suites with private balconies" }, { name: "Suites with creek views" }],
    roomsNote: "231 rooms and suites in total. Live availability and prices are on marriott.com.",
    amenities: ["Swimming pool", "Fitness centre", "24-hour room service", "On-site restaurant", "In-room ironing facilities"],
    breakfast: "Not included as standard — available on site at the hotel’s Brazzerie restaurant for a fee.",
    wifi: "Complimentary in-room Wi-Fi.",
    poolGym: "On-site swimming pool, plus a complimentary fitness centre with free weights and strength equipment.",
    checkInOut: "Check-in from 3:00 pm · Check-out by 12:00 noon",
    website: { label: "View Rooms", href: "https://www.marriott.com/en-us/hotels/losfp-four-points-lagos/rooms/" },
    officialSite: "https://www.marriott.com/en-us/hotels/losfp-four-points-lagos/overview/",
    mapsHref: "https://www.google.com/maps/search/?api=1&query=Four+Points+by+Sheraton+Lagos",
    directionsHref: `https://www.google.com/maps/dir/?api=1&origin=Four+Points+by+Sheraton+Lagos&destination=${venueQuery}`,
    mapEmbedSrc: "https://www.google.com/maps?q=Four+Points+by+Sheraton+Lagos&output=embed",
    weddingRate: null,
  },
  {
    id: "hotelinn",
    name: "Hotelinn Oniru",
    category: "3-star hotel",
    address: "1 Prince Yomi Daramola St, off Water Corporation Drive, Oniru, Victoria Island, Lagos",
    priceFrom: "From ₦97,000",
    priceNote: "per night, as listed on hotelinn.ng",
    venue: { minutes: 8, km: 2.5 },
    description: "A modern, good-value hotel in the heart of Oniru and the closer of the two to the venue. Simple, comfortable rooms with a restaurant and round-the-clock reception.",
    highlights: ["Five room types", "Free Wi-Fi", "Restaurant", "24-hour room service"],
    images: [
      { src: "/hotels/hotelinn-room.jpg", alt: "A guest room at Hotelinn Oniru", width: 1600, height: 1066 },
      { src: "/hotels/hotelinn-reception.jpg", alt: "The reception lobby at Hotelinn Oniru", width: 1600, height: 1066 },
      { src: "/hotels/hotelinn-restaurant.jpg", alt: "The restaurant at Hotelinn Oniru", width: 1600, height: 1066 },
      { src: "/hotels/hotelinn-room-detail.jpg", alt: "Smart TV and desk in a Hotelinn Oniru room", width: 1600, height: 1066 },
    ],
    rooms: [
      { name: "Standard", price: "₦97,000" },
      { name: "Standard Plus", price: "₦105,000" },
      { name: "Deluxe Plus", price: "₦114,000" },
      { name: "Deluxe", price: "₦120,000" },
      { name: "Executive", price: "₦135,000" },
    ],
    roomsNote: "Nightly prices as listed on hotelinn.ng in September 2026 — they may change.",
    amenities: ["Air-conditioning", "Smart TV", "24-hour room service", "Round-the-clock reception", "Restaurant", "Laundry", "Car hire service", "Meeting rooms"],
    breakfast: "Listed on the hotel’s website at ₦15,000 per room, per day — confirm what your rate includes when booking.",
    wifi: "Free Wi-Fi.",
    poolGym: "Not listed on the hotel’s website — please check with the hotel.",
    checkInOut: "Times aren’t published on the hotel’s website — please confirm when booking.",
    contact: "reservations@hotelinn.ng · +234 707 451 8500",
    website: { label: "Visit Hotel Website", href: "https://hotelinn.ng/" },
    officialSite: "https://hotelinn.ng/",
    mapsHref: "https://www.google.com/maps/search/?api=1&query=Hotelinn+Oniru,+1+Prince+Yomi+Daramola+St,+Lagos",
    directionsHref: `https://www.google.com/maps/dir/?api=1&origin=Hotelinn+Oniru,+1+Prince+Yomi+Daramola+St,+Lagos&destination=${venueQuery}`,
    mapEmbedSrc: "https://www.google.com/maps?q=Hotelinn+Oniru,+1+Prince+Yomi+Daramola+St,+Lagos&output=embed",
    weddingRate: null,
  },
  {
    id: "art-hotel",
    name: "The Art Hotel Lagos",
    category: "5-star luxury boutique hotel",
    address: "Plot 13A, Block III, Yesufu Abiodun Oniru Way, Victoria Island, Lagos",
    priceFrom: "≈ £200–£220",
    priceNote: "per night — an estimate; varies by date and room",
    venue: { minutes: 8, km: 2.9 },
    description: "A design-led boutique hotel on Oniru Way, filled with African art and steps from Oniru Beach. The most indulgent of our picks, with a rooftop terrace bar and a signature restaurant.",
    highlights: ["Six room & suite types", "Rooftop bar", "Gym", "Complimentary Wi-Fi"],
    images: [
      { src: "/hotels/art-hotel-exterior.jpg", alt: "The Art Hotel Lagos at dusk", width: 1600, height: 716 },
      { src: "/hotels/art-hotel-room.jpg", alt: "A king room at The Art Hotel Lagos", width: 955, height: 630 },
      { src: "/hotels/art-hotel-lobby.jpg", alt: "The art-filled lobby of The Art Hotel Lagos", width: 700, height: 500 },
      { src: "/hotels/art-hotel-rooftop.jpg", alt: "The rooftop terrace at The Art Hotel Lagos", width: 1600, height: 718 },
    ],
    rooms: [
      { name: "Duke Room (King)", size: "36 sqm" },
      { name: "Duke Deluxe", size: "42 sqm" },
      { name: "Duke Superior Room", size: "46 sqm" },
      { name: "Prince Suite", size: "54 sqm" },
      { name: "Prince Deluxe Suite", size: "64 sqm" },
      { name: "Emperor Suite", size: "84 sqm" },
    ],
    roomsNote: "A standard King room currently starts around £175–£205 a night; refundable and breakfast-inclusive rates cost more.",
    amenities: ["Gym", "Mist Restaurant & Mist Bar", "Cloud Terrace rooftop bar", "Curated African art gallery", "24/7 in-room dining", "Rain showers & smart room controls", "50-inch Smart TV, minibar & safe", "Meeting rooms"],
    breakfast: "Offered on breakfast-inclusive rates, which cost more than room-only — check what your rate includes when booking.",
    wifi: "Complimentary high-speed Wi-Fi.",
    poolGym: "Gym on site. The hotel’s website doesn’t list a pool — please check with the hotel.",
    checkInOut: "Times aren’t published on the hotel’s website — please confirm when booking.",
    contact: "info@arthotelng.com · +234 916 610 5381",
    website: { label: "View Rooms", href: "https://arthotelng.com/rooms-suites/" },
    officialSite: "https://arthotelng.com/",
    mapsHref: "https://www.google.com/maps/search/?api=1&query=The+Art+Hotel+Lagos,+Yesufu+Abiodun+Oniru+Way",
    directionsHref: `https://www.google.com/maps/dir/?api=1&origin=The+Art+Hotel+Lagos,+Yesufu+Abiodun+Oniru+Way&destination=${venueQuery}`,
    mapEmbedSrc: "https://www.google.com/maps?q=The+Art+Hotel+Lagos,+Yesufu+Abiodun+Oniru+Way&output=embed",
    weddingRate: null,
  },
  {
    id: "eko-hotel",
    name: "Eko Hotels & Suites",
    category: "5-star resort hotel",
    address: "Plot 1415 Adetokunbo Ademola Street, Victoria Island, Lagos",
    priceFrom: "≈ £150–£175",
    priceNote: "per night — an estimate; varies by date, room and package",
    venue: { minutes: 14, km: 5.1 },
    description: "A Lagos landmark on the Victoria Island waterfront, with a large pool, tennis, spa and a choice of restaurants. A little further from the venue, with the most to do on site.",
    highlights: ["Swimming pool", "Gym & spa", "Tennis court", "Several restaurants & bars"],
    images: [
      { src: "/hotels/eko-hotel-pool.jpg", alt: "The swimming pool at Eko Hotels & Suites", width: 1600, height: 700 },
      { src: "/hotels/eko-hotel-atlantic-room.jpg", alt: "An Atlantic Superior room at Eko Hotel", width: 1080, height: 650 },
      { src: "/hotels/eko-hotel-poolside.jpg", alt: "Poolside loungers at Eko Hotels & Suites", width: 1600, height: 700 },
      { src: "/hotels/eko-hotel-classic-room.jpg", alt: "A Classic Superior room at Eko Hotel", width: 1080, height: 650 },
    ],
    rooms: [{ name: "Classic Superior" }, { name: "Queen" }, { name: "Atlantic Superior" }, { name: "Classic Suites" }, { name: "Diplomatic Suites" }, { name: "Presidential Suite" }],
    roomsNote: "Room types shown are for the main Eko Hotel building (447 rooms, all with balconies). The complex also includes Eko Suites, Eko Signature and Eko Gardens. Prices average roughly £119 in quieter months to £170 in March.",
    amenities: ["Swimming pool", "Gymnasium with sauna & steam rooms", "Spa & massage", "Flood-lit tennis court", "Sky Restaurant, Red Chinese, Lagoon Breeze & more", "Calabash Bar & Lagos Irish Pub", "Salon & nail studio", "Business centre & medical clinic"],
    breakfast: "Depends on the room package you book — check what your rate includes.",
    wifi: "Not stated on the hotel’s website — please confirm when booking.",
    poolGym: "Swimming pool, plus a gymnasium with sauna rooms and an instructor available.",
    checkInOut: "Times aren’t published on the hotel’s website — please confirm when booking.",
    contact: "reservation@ekohotels.com · +234 201 277 2700",
    website: { label: "View Rooms", href: "https://www.ekohotels.com/eko-hotel.php" },
    officialSite: "https://www.ekohotels.com/",
    mapsHref: "https://www.google.com/maps/search/?api=1&query=Eko+Hotels+%26+Suites,+Adetokunbo+Ademola+Street,+Lagos",
    directionsHref: `https://www.google.com/maps/dir/?api=1&origin=Eko+Hotels+%26+Suites,+Adetokunbo+Ademola+Street,+Lagos&destination=${venueQuery}`,
    mapEmbedSrc: "https://www.google.com/maps?q=Eko+Hotels+%26+Suites,+Adetokunbo+Ademola+Street,+Lagos&output=embed",
    weddingRate: null,
  },
];

// ---------- Flights & travel (/flights) ----------
// Entry rules below were checked against gov.uk's Nigeria travel advice (September 2026) and are worded
// as prompts to check, because requirements depend on each guest's passport and can change.

export const flights = {
  title: "Flights to Lagos",
  intro: "We can’t wait to celebrate with you in Lagos. If you’re travelling from outside Nigeria, we’ve put together a few helpful details to make planning your journey a little easier.",
  airport: {
    eyebrow: "Fly to Lagos",
    code: "LOS",
    name: "Murtala Muhammed International Airport",
    place: "Lagos, Nigeria",
    body: "For international guests, Murtala Muhammed International Airport (LOS) is the main airport serving Lagos and the airport we recommend flying into.",
    mapLabel: "View airport location",
    mapHref: "https://www.google.com/maps/search/?api=1&query=Murtala+Muhammed+International+Airport+Lagos",
  },
  dates: {
    heading: "When should I arrive?",
    steps: [
      { label: "Suggested arrival", date: "30–31 March 2027", body: "We recommend arriving in Lagos at least 1–2 days before the wedding so you have time to settle in, recover from your journey and avoid any last-minute travel stress.", suggested: true },
      { label: "Wedding", date: "2 April 2027", body: "The big day.", suggested: false },
      { label: "Suggested departure", date: "4–5 April 2027", body: "If your schedule allows, staying for a couple of days after the wedding gives you some time to relax and enjoy Lagos before travelling home.", suggested: true },
    ],
    note: "These dates are only suggestions. Please book the flights that work best for your own schedule.",
  },
  search: {
    heading: "Find Your Flight",
    intro: "Use the search below to start comparing flights to Lagos.",
    destination: "Lagos – Murtala Muhammed International Airport (LOS)",
    fromPlaceholder: "City or airport, e.g. London",
    defaultDepart: "2027-03-30",
    defaultReturn: "2027-04-05",
    button: "Search Flights",
    disclaimer: "Your search opens in a new tab on a flight-comparison site. We don’t sell tickets or receive anything from your booking — prices and availability are theirs.",
    fallbackNote: "We couldn’t match that to an airport, so we’ll search Google Flights with what you typed — you may need to re-enter passengers there.",
  },
  tips: {
    heading: "Good to Know",
    items: [
      { title: "Passport", body: "Check your passport’s expiry date early — Nigeria asks visitors for at least six months’ validity from the day they arrive." },
      { title: "Visa", body: "If you don’t hold a Nigerian passport you will most likely need a visa, arranged online before you travel — visas are no longer issued on arrival.", link: { label: "Nigeria Immigration Service portal", href: "https://portal.immigration.gov.ng/" } },
      { title: "Yellow fever certificate", body: "Nigeria asks travellers for proof of yellow fever vaccination. Speak to a travel clinic in good time about this and any other health advice.", link: { label: "UK government entry advice for Nigeria", href: "https://www.gov.uk/foreign-travel-advice/nigeria/entry-requirements" } },
      { title: "Landing card", body: "Visitors are asked to complete a landing and departure card online before flying.", link: { label: "Online landing card", href: "https://lecard.immigration.gov.ng/" } },
      { title: "Book early", body: "The wedding falls the week after Easter (Easter Sunday is 28 March 2027), a popular time to travel — fares tend to climb as seats fill." },
      { title: "From the airport", body: "Victoria Island and Oniru are across the city from the airport and Lagos traffic varies a great deal, so ask your hotel about an airport pickup and allow plenty of time." },
    ],
    note: "Entry rules depend on your passport and can change — please check your own government’s travel advice before booking.",
  },
  after: {
    heading: "After You’ve Booked",
    steps: [
      { title: "Send your RSVP", body: "If you haven’t already, let us know you’re coming.", link: { label: "RSVP", href: "/#rsvp" } },
      { title: "Choose where to stay", body: "We’ve shortlisted hotels close to the venue.", link: { label: "See the hotels", href: "/#stay" } },
      { title: "Share your flight details", body: "Send us your arrival date and flight number so we know when to expect you.", link: { label: "Message us on WhatsApp", href: wedding.whatsapp.href } },
    ],
  },
};
