"use client";

import { usePathname } from "next/navigation";
import { ChatWidget } from "./chat-widget";

// The root layout is shared with the admin, which has its own test chat — so the guest widget stays off there.
export function ChatMount() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <ChatWidget/>;
}
