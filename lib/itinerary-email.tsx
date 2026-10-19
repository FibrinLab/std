import { Body, Column, Container, Head, Heading, Hr, Html, Img, Link, Preview, render, Row, Section, Text } from "@react-email/components";
import { Resend } from "resend";
import { itinerary, wedding } from "./content";
import { env } from "./env";

// Email clients ignore most CSS, so everything here is inline and table-based. The palette and
// Georgia fallback match the site (Cormorant isn't available in mail clients).
const ink = "#33271c", inkSoft = "#5f5542", sand = "#847a63", hairline = "#d8cdb8", burgundy = "#8e3b4a", gold = "#a5793a";
const serif = "Georgia, 'Times New Roman', serif";
const caps = { fontFamily: serif, letterSpacing: 3, textTransform: "uppercase" as const, fontSize: 11, color: sand, margin: 0 };
const body = { fontFamily: serif, fontSize: 16, lineHeight: 1.65, color: ink, margin: "0 0 14px" };
const small = { fontFamily: serif, fontSize: 14, lineHeight: 1.6, color: inkSoft, margin: 0 };

export type ItineraryEmailProps = { guestName: string; note?: string };

export function ItineraryEmail({ guestName, note }: ItineraryEmailProps) {
  const site = env.NEXT_PUBLIC_SITE_URL;
  const firstName = guestName.trim().split(/\s+/)[0] || "friend";
  const noteParagraphs = (note ?? "").split(/\n+/).map((line) => line.trim()).filter(Boolean);
  return <Html lang="en"><Head/><Preview>{`${itinerary.title} · ${wedding.dateLong}`}</Preview>
    <Body style={{ backgroundColor: "#f8f4ea", margin: 0, padding: "24px 12px", fontFamily: serif, color: ink }}>
      <Container style={{ maxWidth: 580, margin: "0 auto", background: "#fffdf7", border: `1px solid ${hairline}`, padding: "0 0 36px" }}>
        {/* Masthead */}
        <Section style={{ textAlign: "center", padding: "34px 40px 6px" }}>
          <Img src={`${site}/email/sprigs.png`} alt="" width={170} height={170} style={{ margin: "0 auto 14px", display: "block" }}/>
          <Text style={{ ...caps, color: burgundy, letterSpacing: 4, fontSize: 12 }}>{wedding.coupleNames}</Text>
          <Text style={{ ...caps, marginTop: 8 }}>{itinerary.eyebrow} · {wedding.dateLong}</Text>
          <Heading as="h1" style={{ fontFamily: serif, fontWeight: 500, fontStyle: "italic", fontSize: 34, lineHeight: 1.15, color: ink, margin: "18px 0 6px" }}>{itinerary.title}</Heading>
          <Text style={{ ...caps, fontSize: 11 }}>{wedding.venueAddress}</Text>
        </Section>

        <Section style={{ padding: "18px 40px 0" }}>
          <Text style={body}>{`Dear ${firstName},`}</Text>
          <Text style={body}>{itinerary.intro}</Text>
          {noteParagraphs.length > 0 && <Section style={{ borderLeft: `2px solid ${gold}`, padding: "2px 0 2px 18px", margin: "6px 0 18px" }}>
            {noteParagraphs.map((paragraph, index) => <Text key={index} style={{ ...body, fontStyle: "italic", color: inkSoft, margin: index === noteParagraphs.length - 1 ? 0 : "0 0 10px" }}>{paragraph}</Text>)}
          </Section>}
        </Section>

        {/* Days */}
        {itinerary.days.map((day) => <Section key={day.date} style={{ padding: "22px 40px 0" }}>
          <Hr style={{ borderColor: hairline, borderWidth: "1px 0 0", margin: "0 0 22px" }}/>
          <Text style={{ ...caps, color: burgundy }}>{day.date}</Text>
          <Heading as="h2" style={{ fontFamily: serif, fontWeight: 500, fontStyle: "italic", fontSize: 26, lineHeight: 1.2, color: ink, margin: "8px 0 6px" }}>{day.title}</Heading>
          {day.description && <Text style={{ ...small, margin: "0 0 14px" }}>{day.description}</Text>}
          {day.events.map((event, index) => <Row key={`${day.date}-${index}`} style={{ borderTop: index === 0 ? undefined : `1px dotted ${hairline}` }}>
            <Column style={{ width: 96, verticalAlign: "top", padding: "14px 12px 14px 0" }}>
              <Text style={{ ...caps, color: burgundy, letterSpacing: 2, fontSize: 12, lineHeight: 1.5 }}>{event.time}</Text>
            </Column>
            <Column style={{ verticalAlign: "top", padding: "12px 0 14px" }}>
              <Text style={{ fontFamily: serif, fontSize: 18, lineHeight: 1.35, color: ink, margin: 0 }}>{event.title}</Text>
              {event.place && <Text style={{ ...small, fontStyle: "italic", color: sand, margin: "3px 0 0" }}>{event.place}</Text>}
              {event.note && <Text style={{ ...small, margin: "6px 0 0" }}>{event.note}</Text>}
            </Column>
          </Row>)}
        </Section>)}

        {/* Dress code */}
        <Section style={{ padding: "26px 40px 0" }}>
          <Section style={{ background: "#f3ece0", border: `1px solid ${hairline}`, padding: "20px 24px" }}>
            <Text style={{ ...caps, color: gold }}>{itinerary.dressCode.heading}</Text>
            <Text style={{ ...body, margin: "8px 0 0" }}>{itinerary.dressCode.body}</Text>
          </Section>
        </Section>

        {/* Good to know */}
        <Section style={{ padding: "26px 40px 0" }}>
          <Text style={caps}>Good to know</Text>
          {itinerary.goodToKnow.map((item) => <Section key={item.title} style={{ paddingTop: 12 }}>
            <Text style={{ fontFamily: serif, fontSize: 17, fontStyle: "italic", color: ink, margin: 0 }}>{item.title}</Text>
            <Text style={{ ...small, margin: "2px 0 0" }}>{item.body}{item.title === "Questions" && <> <Link href={wedding.whatsapp.href} style={{ color: burgundy }}>{wedding.whatsapp.label}</Link>.</>}</Text>
          </Section>)}
        </Section>

        {/* Closing */}
        <Section style={{ textAlign: "center", padding: "30px 40px 0" }}>
          <Hr style={{ borderColor: hairline, borderWidth: "1px 0 0", margin: "0 0 24px" }}/>
          <Text style={{ ...body, fontStyle: "italic", fontSize: 18, margin: "0 0 4px" }}>{itinerary.closing}</Text>
          <Text style={{ fontFamily: serif, fontSize: 15, color: burgundy, margin: "0 0 18px" }}>{wedding.signOff}</Text>
          <Img src={`${site}/email/peony.png`} alt="" width={150} height={147} style={{ margin: "0 auto 14px", display: "block" }}/>
          <Text style={{ ...caps, fontSize: 11 }}>{wedding.dateDisplay.replaceAll(".", " · ")} — <Link href={site} style={{ color: sand, textDecoration: "underline" }}>{site.replace(/^https?:\/\//, "")}</Link></Text>
          <Text style={{ ...caps, fontSize: 11, marginTop: 6, textTransform: "none" }}>{wedding.hashtag} 🐝</Text>
        </Section>
      </Container>
    </Body></Html>;
}

export const renderItineraryEmail = (props: ItineraryEmailProps) => render(<ItineraryEmail {...props}/>);

// Every guest gets a personalised copy (greeting), sent in batches of 100 (Resend's batch limit).
export async function sendItinerary(recipients: Array<{ email: string; fullName: string }>, note: string) {
  if (!env.RESEND_API_KEY) return { sent: 0, failed: recipients.length, skipped: true };
  const resend = new Resend(env.RESEND_API_KEY);
  let sent = 0, failed = 0;
  for (let i = 0; i < recipients.length; i += 100) {
    const chunk = recipients.slice(i, i + 100);
    const messages = await Promise.all(chunk.map(async (r) => ({ from: env.EMAIL_FROM, to: [r.email], subject: itinerary.subject, html: await renderItineraryEmail({ guestName: r.fullName, note }) })));
    const { error } = await resend.batch.send(messages);
    if (error) { failed += chunk.length; console.error("Itinerary batch failed", error); } else sent += chunk.length;
  }
  return { sent, failed, skipped: false };
}
