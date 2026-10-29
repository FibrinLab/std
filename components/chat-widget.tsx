"use client";

import { useEffect, useRef, useState } from "react";
import { MAX_MESSAGE_CHARS, MAX_TURNS, PRIVACY_NOTE, STARTER_LINE, SUGGESTED_QUESTIONS } from "@/lib/assistant-shared";
import { wedding } from "@/lib/content";

type Message = { role: "user" | "assistant"; content: string; note?: boolean };

// A small "Ask us" button that opens a chat panel in the site's own style. The conversation lives in
// component state only — nothing is stored — and replies stream in from /api/chat as plain text.
// `variant="inline"` renders the open panel on its own (the admin test page uses it).
export function ChatWidget({ variant = "floating" }: { variant?: "floating" | "inline" }) {
  const [open, setOpen] = useState(variant === "inline");
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);
  useEffect(() => { logRef.current?.scrollTo({ top: logRef.current.scrollHeight }); }, [messages]);
  useEffect(() => () => abortRef.current?.abort(), []);

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

  const panel = <section className={`flo-chat-panel${variant === "inline" ? " flo-chat-inline" : ""}`} role={variant === "inline" ? undefined : "dialog"} aria-label="Ask us about the wedding" onKeyDown={(e) => { if (e.key === "Escape" && variant === "floating") setOpen(false); }}>
    <header className="flo-chat-head">
      <div>
        <p className="flo-caps flo-chat-eyebrow">Ask us</p>
        <p className="flo-chat-title">Questions about the wedding?</p>
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
    {open ? panel : <button className="flo-chat-fab" type="button" onClick={() => setOpen(true)} aria-haspopup="dialog">Ask us</button>}
  </div>;
}
