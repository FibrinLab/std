import Anthropic from "@anthropic-ai/sdk";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { ASSISTANT_MODEL, MAX_REPLY_TOKENS, WHATSAPP_FALLBACK_REPLY, buildSystemPrompt, chatRequestSchema, isAssistantConfigured } from "@/lib/assistant";
import { env } from "@/lib/env";
import { createDailyCap, createWindowLimiter, isCloudflareRateLimiter } from "@/lib/rate-limit";

// Guest chat: the question goes to Claude with the site copy as its only knowledge, and the reply streams
// back as plain text. Questions are never logged — only error types and counts.

const perIp = createWindowLimiter({ limit: 20, windowMs: 10 * 60 * 1000 });
const daily = createDailyCap(2000);
const systemPrompt = buildSystemPrompt();
const BUSY_REPLY = "Our assistant is a little busy right now — please try again in a few minutes, or message us on WhatsApp.";

const clientIp = (request: Request) => request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";

// Cloudflare's rate limiting bindings count across every isolate; locally (next dev) there is no context, so skip.
async function cloudflareAllows(ip: string) {
  let bindings: Record<string, unknown>;
  try { bindings = getCloudflareContext().env as unknown as Record<string, unknown>; } catch { return true; }
  const checks = [[bindings.CHAT_RATE_LIMIT, ip], [bindings.CHAT_GLOBAL_LIMIT, "everyone"]] as const;
  for (const [limiter, key] of checks) {
    if (!isCloudflareRateLimiter(limiter)) continue;
    const { success } = await limiter.limit({ key });
    if (!success) return false;
  }
  return true;
}

export async function POST(request: Request) {
  if (!isAssistantConfigured()) return NextResponse.json({ error: "The assistant is not switched on yet. Please message us on WhatsApp instead." }, { status: 503 });
  const ip = clientIp(request);
  if (!(await cloudflareAllows(ip)) || !perIp.allow(ip) || !daily.allow("everyone")) return NextResponse.json({ error: BUSY_REPLY }, { status: 429 });
  const parsed = chatRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please keep each message under 1000 characters and start a fresh chat if this one has grown long." }, { status: 400 });

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, maxRetries: 1, timeout: 60_000 });
  const today = new Intl.DateTimeFormat("en-GB", { dateStyle: "full", timeZone: "Africa/Lagos" }).format(new Date());
  const stream = client.beta.messages.stream({
    model: ASSISTANT_MODEL,
    max_tokens: MAX_REPLY_TOKENS,
    output_config: { effort: "low" },
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: [
      // The site copy is identical on every request, so it is cached; the date sits after the breakpoint.
      { type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } },
      { type: "text", text: `Today is ${today} (Lagos time).` },
    ],
    messages: parsed.data.messages.map((message) => ({ role: message.role, content: message.content })),
  });

  const encoder = new TextEncoder();
  let cancelled = false;
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      let sent = 0;
      const push = (text: string) => { if (!cancelled) { sent += text.length; controller.enqueue(encoder.encode(text)); } };
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") push(event.delta.text);
        }
        const final = await stream.finalMessage();
        // Classifier declines arrive as a normal message with stop_reason "refusal" (empty or partial content).
        if (final.stop_reason === "refusal") push(`${sent > 0 ? "\n\n" : ""}${WHATSAPP_FALLBACK_REPLY}`);
      } catch (error) {
        // The guest closed the panel or left the page mid-reply — nothing to report.
        if (cancelled || error instanceof Anthropic.APIUserAbortError) return;
        // Only the error class and status are logged — never the conversation.
        const label = error instanceof Anthropic.APIConnectionError ? `connection: ${error.message}` : error instanceof Anthropic.APIError ? `${error.constructor.name} ${error.status ?? ""}`.trim() : error instanceof Error ? error.constructor.name : "unknown";
        console.error("Chat reply failed:", label);
        push(`${sent > 0 ? "\n\n" : ""}${WHATSAPP_FALLBACK_REPLY}`);
      } finally {
        if (!cancelled) controller.close();
      }
    },
    cancel() { cancelled = true; stream.abort(); },
  });
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store", "x-accel-buffering": "no" } });
}
