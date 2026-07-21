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

export const detailSections: Array<{ heading: string; body: string; link?: { label: string; href: string }; after?: string }> = [
  {
    heading: "Where to stay",
    body: "We are putting together a list of recommended hotels and guest rates close to the venue — it will arrive with the formal invitation.",
  },
  {
    heading: "Getting there",
    body: "Flying in? Murtala Muhammed International Airport (LOS) is the gateway to Lagos. We will share the venue, directions and travel tips with the formal invitation.",
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
