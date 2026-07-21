import { Body, Container, Head, Heading, Hr, Html, Preview, render, Text } from "@react-email/components";
import { Resend } from "resend";
import { wedding } from "./content";
import { env } from "./env";
import type { SaveTheDateReply } from "./types";

const caps = { letterSpacing: 3, textTransform: "uppercase" as const, fontSize: 12, color: "#847a63" };

function ReplyEmail({ reply }: { reply: SaveTheDateReply }) {
  const celebrating = reply.status === "celebrating";
  return <Html><Head/><Preview>{`We got your reply for ${wedding.coupleNames}'s wedding`}</Preview><Body style={{ backgroundColor: "#f8f4ea", fontFamily: "Georgia, 'Times New Roman', serif", color: "#33271c" }}><Container style={{ maxWidth: 540, margin: "40px auto", background: "#fffdf7", padding: "44px 40px", border: "1px solid #d8cdb8" }}><Text style={caps}>{wedding.coupleNames} · {wedding.dateLong}</Text><Heading style={{ fontWeight: 500, fontSize: 32, lineHeight: 1.15, fontStyle: "italic" }}>Thank you, {reply.fullName}</Heading><Text style={{ fontSize: 16, lineHeight: 1.65 }}>{celebrating ? `Thank you for filling out the RSVP! We've saved your reply for ${reply.guestCount} ${reply.guestCount === 1 ? "seat" : "seats"}${reply.guestNames.length ? ` — you and ${reply.guestNames.join(", ")}` : ""}. We will be in touch shortly to confirm ${reply.guestCount === 1 ? "your seat" : "your seats"}.` : `Thank you for filling out the RSVP. You marked "Celebrating from afar" — we will miss you, and we're so grateful you told us.`}</Text>{reply.note && <Text style={{ fontSize: 15, fontStyle: "italic", color: "#5f5542" }}>“{reply.note}”</Text>}<Hr style={{ borderColor: "#d8cdb8" }}/><Text style={{ fontSize: 14, lineHeight: 1.65, color: "#5f5542" }}>Change of plans? Just fill in the reply again with the same email at {env.NEXT_PUBLIC_SITE_URL} and we will update it.</Text><Text style={{ fontSize: 13, color: "#847a63" }}>{wedding.hashtag} 🐝</Text><Text style={{ fontSize: 14, color: "#8e3b4a" }}>{wedding.signOff}</Text></Container></Body></Html>;
}

function ConfirmedEmail({ reply }: { reply: SaveTheDateReply }) {
  return <Html><Head/><Preview>Your RSVP is confirmed</Preview><Body style={{ backgroundColor: "#f8f4ea", fontFamily: "Georgia, 'Times New Roman', serif", color: "#33271c" }}><Container style={{ maxWidth: 540, margin: "40px auto", background: "#fffdf7", padding: "44px 40px", border: "1px solid #d8cdb8" }}><Text style={caps}>{wedding.coupleNames} · {wedding.dateLong}</Text><Heading style={{ fontWeight: 500, fontSize: 32, lineHeight: 1.15, fontStyle: "italic" }}>You&rsquo;re confirmed, {reply.fullName}! 🎉</Heading><Text style={{ fontSize: 16, lineHeight: 1.65 }}>Wonderful news — your RSVP is confirmed: {reply.guestCount} {reply.guestCount === 1 ? "seat" : "seats"}{reply.guestNames.length ? ` for you and ${reply.guestNames.join(", ")}` : ""} on {wedding.dateLong} in {wedding.venueAddress}. We truly cannot wait to celebrate with you.</Text><Hr style={{ borderColor: "#d8cdb8" }}/><Text style={{ fontSize: 14, lineHeight: 1.65, color: "#5f5542" }}>Venue details and the formal invitation will follow closer to the day.</Text><Text style={{ fontSize: 13, color: "#847a63" }}>{wedding.hashtag} 🐝</Text><Text style={{ fontSize: 14, color: "#8e3b4a" }}>{wedding.signOff}</Text></Container></Body></Html>;
}

export async function sendConfirmedEmail(reply: SaveTheDateReply) {
  if (!env.RESEND_API_KEY) return { skipped: true };
  const resend = new Resend(env.RESEND_API_KEY);
  return resend.emails.send({ from: env.EMAIL_FROM, to: [reply.email], bcc: [env.ADMIN_ALERT_EMAIL], subject: "Your RSVP is confirmed 🎉", react: <ConfirmedEmail reply={reply} /> });
}

export async function sendReplyEmail(reply: SaveTheDateReply) {
  if (!env.RESEND_API_KEY) return { skipped: true };
  const resend = new Resend(env.RESEND_API_KEY);
  return resend.emails.send({ from: env.EMAIL_FROM, to: [reply.email], bcc: [env.ADMIN_ALERT_EMAIL], subject: `Reply received — ${reply.fullName}`, react: <ReplyEmail reply={reply} /> });
}

function UpdateEmail({ subject, body }: { subject: string; body: string }) {
  const paragraphs = body.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  return <Html><Head/><Preview>{subject}</Preview><Body style={{ backgroundColor: "#f8f4ea", fontFamily: "Georgia, 'Times New Roman', serif", color: "#33271c" }}><Container style={{ maxWidth: 540, margin: "40px auto", background: "#fffdf7", padding: "44px 40px", border: "1px solid #d8cdb8" }}><Text style={caps}>{wedding.coupleNames} · {wedding.dateLong}</Text><Heading style={{ fontWeight: 500, fontSize: 30, lineHeight: 1.2 }}>{subject}</Heading>{paragraphs.map((paragraph, index) => <Text key={index} style={{ fontSize: 16, lineHeight: 1.65 }}>{paragraph}</Text>)}<Hr style={{ borderColor: "#d8cdb8" }}/><Text style={{ fontSize: 13, color: "#847a63" }}>{wedding.dateDisplay.replaceAll(".", " · ")} — {wedding.venueAddress} — {wedding.hashtag} 🐝</Text><Text style={{ fontSize: 14, color: "#8e3b4a" }}>{wedding.signOff}</Text></Container></Body></Html>;
}

// One render, personalized copies in batches of 100 (Resend's batch limit).
export async function sendBroadcast(subject: string, body: string, recipients: Array<{ email: string }>) {
  if (!env.RESEND_API_KEY) return { sent: 0, failed: recipients.length, skipped: true };
  const resend = new Resend(env.RESEND_API_KEY);
  const html = await render(<UpdateEmail subject={subject} body={body}/>);
  let sent = 0, failed = 0;
  for (let i = 0; i < recipients.length; i += 100) {
    const chunk = recipients.slice(i, i + 100);
    const { error } = await resend.batch.send(chunk.map((r) => ({ from: env.EMAIL_FROM, to: [r.email], subject, html })));
    if (error) { failed += chunk.length; console.error("Broadcast batch failed", error); } else sent += chunk.length;
  }
  return { sent, failed, skipped: false };
}
