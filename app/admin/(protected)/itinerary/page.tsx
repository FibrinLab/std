import { SprigDivider } from "@/components/floral-art";
import { itinerary } from "@/lib/content";
import { env } from "@/lib/env";
import { getReplies } from "@/lib/repository";
import { SendItinerary } from "./send-itinerary";

export const dynamic = "force-dynamic";

export default async function ItineraryPage() {
  const replies = await getReplies();
  const celebrating = replies.filter((r) => r.status === "celebrating").length;
  const counts = { all: replies.length, celebrating, from_afar: replies.length - celebrating };
  const eventCount = itinerary.days.reduce((n, day) => n + day.events.length, 0);
  return <main className="adm-main">
    <header className="adm-title">
      <div>
        <p className="flo-caps adm-eyebrow">Guest itinerary</p>
        <h1>Send the itinerary.</h1>
        <p className="adm-sub">A styled guide to the wedding weekend, greeting each guest by name. {itinerary.days.length} days and {eventCount} events, as written in lib/content.ts.</p>
      </div>
    </header>
    <section className="adm-panel adm-panel-left">
      <SendItinerary counts={counts} guests={replies.map((r) => ({ email: r.email, fullName: r.fullName }))} subject={itinerary.subject} testAddress={env.ADMIN_ALERT_EMAIL}/>
    </section>
    <section className="adm-panel" style={{ marginTop: 26 }}>
      <SprigDivider className="adm-sprig"/>
      <h2 className="flo-caps adm-panel-title">Schedule</h2>
      <div className="adm-days">
        {itinerary.days.map((day) => <div className="adm-day" key={day.date}>
          <p className="flo-caps adm-day-date">{day.date}</p>
          <h3 className="adm-day-title">{day.title}</h3>
          <ul className="adm-day-events">{day.events.map((event, index) => <li key={index}><strong>{event.time}</strong> {event.title}{event.place && <em> · {event.place}</em>}</li>)}</ul>
        </div>)}
      </div>
      <p className="adm-hint">To change times or places, edit the itinerary block in lib/content.ts and redeploy — the preview above updates with it.</p>
    </section>
  </main>;
}
