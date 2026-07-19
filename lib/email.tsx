import { Body, Container, Head, Heading, Hr, Html, Preview, Text } from "@react-email/components";
import { Resend } from "resend";
import { wedding } from "./content";
import { env } from "./env";
import type { SaveTheDateReply } from "./types";

const caps = { letterSpacing: 3, textTransform: "uppercase" as const, fontSize: 12, color: "#847a63" };

function ReplyEmail({ reply }: { reply: SaveTheDateReply }) {
  const celebrating = reply.status === "celebrating";
  return <Html><Head/><Preview>{`We got your reply for ${wedding.coupleNames}'s wedding`}</Preview><Body style={{ backgroundColor: "#f8f4ea", fontFamily: "Georgia, 'Times New Roman', serif", color: "#33271c" }}><Container style={{ maxWidth: 540, margin: "40px auto", background: "#fffdf7", padding: "44px 40px", border: "1px solid #d8cdb8" }}><Text style={caps}>{wedding.coupleNames} · {wedding.dateLong}</Text><Heading style={{ fontWeight: 500, fontSize: 32, lineHeight: 1.15, fontStyle: "italic" }}>Thank you, {reply.fullName}</Heading><Text style={{ fontSize: 16, lineHeight: 1.65 }}>{celebrating ? `You marked "Can't wait to celebrate!" for ${reply.guestCount} ${reply.guestCount === 1 ? "guest" : "guests"} — we are thrilled.` : `You marked "Celebrating from afar" — we will miss you, and we're so grateful you told us.`}</Text>{reply.note && <Text style={{ fontSize: 15, fontStyle: "italic", color: "#5f5542" }}>“{reply.note}”</Text>}<Hr style={{ borderColor: "#d8cdb8" }}/><Text style={{ fontSize: 14, lineHeight: 1.65, color: "#5f5542" }}>Change of plans? Just fill in the reply again with the same email at {env.NEXT_PUBLIC_SITE_URL} and we will update it.</Text><Text style={{ fontSize: 14, color: "#8e3b4a" }}>{wedding.signOff}</Text></Container></Body></Html>;
}

export async function sendReplyEmail(reply: SaveTheDateReply) {
  if (!env.RESEND_API_KEY) return { skipped: true };
  const resend = new Resend(env.RESEND_API_KEY);
  return resend.emails.send({ from: env.EMAIL_FROM, to: [reply.email], bcc: [env.ADMIN_ALERT_EMAIL], subject: `Reply received — ${reply.fullName}`, react: <ReplyEmail reply={reply} /> });
}
