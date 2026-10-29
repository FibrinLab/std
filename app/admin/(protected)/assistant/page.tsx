import { ChatWidget } from "@/components/chat-widget";
import { SprigDivider } from "@/components/floral-art";
import { ASSISTANT_MODEL, buildSystemPrompt, isAssistantConfigured } from "@/lib/assistant";

export const dynamic = "force-dynamic";

export default function AssistantPage() {
  const configured = isAssistantConfigured();
  const prompt = buildSystemPrompt();
  return <main className="adm-main">
    <header className="adm-title">
      <div>
        <p className="flo-caps adm-eyebrow">Guest assistant</p>
        <h1>Ask us.</h1>
        <p className="adm-sub">The chat button on the public site, answered by Claude ({ASSISTANT_MODEL}) using only what lib/content.ts says. Try it here before guests do.</p>
      </div>
      <span className={`adm-chip ${configured ? "confirmed" : "pending"}`}>{configured ? "API key configured" : "API key missing"}</span>
    </header>
    {!configured && <p className="flo-error" role="alert">ANTHROPIC_API_KEY is not set, so the button on the site answers with a polite &ldquo;not switched on yet&rdquo; message. Add it as a Secret in the Cloudflare Worker&rsquo;s Variables and Secrets (or in .env locally) and redeploy.</p>}
    <div className="adm-itinerary" style={{ marginTop: configured ? 0 : 26 }}>
      <section className="adm-panel adm-panel-left">
        <p className="flo-caps adm-compose-legend">Test chat — exactly what guests see</p>
        <ChatWidget variant="inline"/>
        <p className="adm-hint">Each question here counts against the same limits as the public site: 20 per 10 minutes per connection, 2000 a day in all.</p>
      </section>
      <section className="adm-panel adm-panel-left">
        <SprigDivider className="adm-sprig"/>
        <p className="flo-caps adm-compose-legend">What the assistant is told</p>
        <textarea className="adm-prompt" value={prompt} readOnly rows={28} aria-label="System prompt" spellCheck={false}/>
        <p className="adm-hint">Built from lib/content.ts on every request — edit the site copy and the assistant learns it on the next deploy. It has no access to RSVPs, invites or guest names.</p>
      </section>
    </div>
  </main>;
}
