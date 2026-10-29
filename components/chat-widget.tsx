"use client";

import { useEffect, useRef, useState } from "react";
import { CHAT_BUTTON_LABEL, CHAT_BUTTON_SUB, CHAT_NUDGE, CHAT_PANEL_EYEBROW, CHAT_PANEL_TITLE, MAX_MESSAGE_CHARS, MAX_TURNS, PRIVACY_NOTE, STARTER_LINE, SUGGESTED_QUESTIONS } from "@/lib/assistant-shared";
import { wedding } from "@/lib/content";

type Message = { role: "user" | "assistant"; content: string; note?: boolean };

const NUDGE_KEY = "flo-chat-nudge-seen";

function SparkIcon() {
  return <svg className="flo-chat-spark" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M12 2.5c.6 4.6 2.9 6.9 7.5 7.5-4.6.6-6.9 2.9-7.5 7.5-.6-4.6-2.9-6.9-7.5-7.5 4.6-.6 6.9-2.9 7.5-7.5Z" fill="currentColor"/><path d="M19 15.5c.3 2 1.2 2.9 3.2 3.2-2 .3-2.9 1.2-3.2 3.2-.3-2-1.2-2.9-3.2-3.2 2-.3 2.9-1.2 3.2-3.2Z" fill="currentColor" opacity=".7"/></svg>;
}

// An "Ask our AI" button that opens a chat panel in the site's own style. The conversation lives in
// component state only — nothing is stored — and replies stream in from /api/chat as plain text.
// `variant="inline"` renders the open panel on its own (the admin test page uses it).
export function ChatWidget({ variant = "floating" }: { variant?: "floating" | "inline" }) {
  const [open, setOpen] = useState(variant === "inline");
  const [nudge, setNudge] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);
  useEffect(() => { logRef.current?.scrollTo({ top: logRef.current.scrollHeight }); }, [messages]);
  useEffect(() => () => abortRef.current?.abort(), []);

  // A one-time speech bubble a few seconds after arriving, so the button reads as instant help rather than a contact form.
  useEffect(() => {
    if (variant !== "floating") return;
    let seen = false;
    try { seen = sessionStorage.getItem(NUDGE_KEY) === "1"; } catch {}
    if (seen) return;
    const show = setTimeout(() => setNudge(true), 2500);
    const hide = setTimeout(() => setNudge(false), 16_000);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, [variant]);

  const dismissNudge = () => {
    setNudge(false);
    try { sessionStorage.setItem(NUDGE_KEY, "1"); } catch {}
  };
  const openChat = () => { dismissNudge(); setOpen(true); };

  async function ask(question: string) {
    const content = question.trim().slice(0, MAX_MESSAGE_CHARS);
    if (!content || busy) return;
    // Trim to the last turns the route accepts, and never resend a note (those came from us, not the assistant).
    const history = [...messages.filter((m) => !m.note), { role: "user" as const, content }].slice(-MAX_TURNS);
    const payload = history[0]?.role === "assistant" ? history.slice(1) : history;
    setMessages((prev) => [...prev, { role: "user", content }, { role: "assistant", content: "" }]);
    setDraft(""); setBusy(true);
    const controller = new AbortController();
    abortRef.current = controller;
    // The prompt asks for plain text, but strip any Markdown emphasis that slips through so no asterisks show.
    const append = (text: string) => setMessages((prev) => prev.map((m, i) => i === prev.length - 1 ? { ...m, content: (m.content + text).replace(/\*\*/g, "") } : m));
    const note = (text: string) => setMessages((prev) => prev.map((m, i) => i === prev.length - 1 ? { role: "assistant", content: text, note: true } : m));
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: payload }), signal: controller.signal });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        note(data?.error ?? `Something went wrong — please try again, or message us on WhatsApp at ${wedding.whatsapp.label}.`);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        append(decoder.decode(value, { stream: true }));
      }
      append(decoder.decode());
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) note(`We couldn't reach the assistant — please try again, or message us on WhatsApp at ${wedding.whatsapp.label}.`);
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void ask(draft); }
  }

  const panel = <section className={`flo-chat-panel${variant === "inline" ? " flo-chat-inline" : ""}`} role={variant === "inline" ? undefined : "dialog"} aria-label="Ask our AI about the wedding" onKeyDown={(e) => { if (e.key === "Escape" && variant === "floating") setOpen(false); }}>
    <header className="flo-chat-head">
      <div>
        <p className="flo-caps flo-chat-eyebrow"><SparkIcon/>{CHAT_PANEL_EYEBROW}</p>
        <p className="flo-chat-title">{CHAT_PANEL_TITLE}</p>
      </div>
      {variant === "floating" && <button className="flo-chat-close" type="button" onClick={() => setOpen(false)} aria-label="Close chat">×</button>}
    </header>
    <div className="flo-chat-log" ref={logRef} aria-live="polite">
      <p className="flo-chat-msg is-assistant">{STARTER_LINE}</p>
      {messages.length === 0 && <div className="flo-chat-suggestions">
        {SUGGESTED_QUESTIONS.map((question) => <button className="flo-chat-chip" type="button" key={question} onClick={() => ask(question)}>{question}</button>)}
      </div>}
      {messages.map((message, index) => <p className={`flo-chat-msg is-${message.role}${message.note ? " is-note" : ""}${busy && index === messages.length - 1 && message.content === "" ? " is-thinking" : ""}`} key={index}>
        {message.content === "" && busy && index === messages.length - 1 ? <span className="flo-chat-dots" aria-label="Thinking"><i/><i/><i/></span> : message.content}
      </p>)}
    </div>
    <form className="flo-chat-form" onSubmit={(e) => { e.preventDefault(); void ask(draft); }}>
      <label className="flo-visually-hidden" htmlFor={`chat-input-${variant}`}>Your question</label>
      <textarea className="flo-chat-input" id={`chat-input-${variant}`} ref={inputRef} value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={onKeyDown} rows={1} maxLength={MAX_MESSAGE_CHARS} placeholder="Type a question…" disabled={busy}/>
      <button className="flo-chat-send" type="submit" disabled={busy || draft.trim() === ""}>Send</button>
    </form>
    <p className="flo-chat-privacy">{PRIVACY_NOTE}</p>
  </section>;

  if (variant === "inline") return panel;
  return <div className="flo-chat">
    {open ? panel : <>
      {nudge && <div className="flo-chat-nudge" role="status">
        <button type="button" className="flo-chat-nudge-text" onClick={openChat}>{CHAT_NUDGE}</button>
        <button type="button" className="flo-chat-nudge-close" onClick={dismissNudge} aria-label="Dismiss">×</button>
      </div>}
      <button className={`flo-chat-fab${nudge ? " is-nudging" : ""}`} type="button" onClick={openChat} aria-haspopup="dialog">
        <SparkIcon/>
        <span className="flo-chat-fab-text"><span className="flo-caps flo-chat-fab-label">{CHAT_BUTTON_LABEL}</span><span className="flo-chat-fab-sub">{CHAT_BUTTON_SUB}</span></span>
      </button>
    </>}
  </div>;
}
