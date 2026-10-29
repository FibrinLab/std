// Limits and copy shared by the chat widget (client) and the chat route (server). Keep this file free of
// server-only imports — it is bundled into the browser.

export const MAX_TURNS = 12;
export const MAX_MESSAGE_CHARS = 1000;
export const SUGGESTED_QUESTIONS = ["What should I wear?", "Where should I stay?", "How do I get a visa?"] as const;
export const STARTER_LINE = "Hello! I’m Doyin & Akan’s AI helper. Ask me anything about the wedding — what to wear, where to stay, or how to get to Lagos — and I’ll answer straight away.";
// The floating button and its one-time nudge, so guests know this is instant, automatic help rather than a message to the couple.
export const CHAT_BUTTON_LABEL = "Ask our AI";
export const CHAT_BUTTON_SUB = "Instant answers";
export const CHAT_PANEL_EYEBROW = "Ask our AI";
export const CHAT_PANEL_TITLE = "Instant answers about the wedding";
export const CHAT_NUDGE = "Questions about the wedding? Ask our AI — instant answers, day or night.";
export const PRIVACY_NOTE = "Answers come from an AI assistant and your questions are sent to Anthropic to generate them. Please don't share personal details here.";
