// Limits and copy shared by the chat widget (client) and the chat route (server). Keep this file free of
// server-only imports — it is bundled into the browser.

export const MAX_TURNS = 12;
export const MAX_MESSAGE_CHARS = 1000;
export const SUGGESTED_QUESTIONS = ["What should I wear?", "Where should I stay?", "How do I get a visa?"] as const;
export const STARTER_LINE = "Hello! Ask me anything about the wedding — what to wear, where to stay, or how to get to Lagos.";
export const PRIVACY_NOTE = "Answers come from an AI assistant and your questions are sent to Anthropic to generate them. Please don't share personal details here.";
