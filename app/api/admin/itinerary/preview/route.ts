import { renderItineraryEmail } from "@/lib/itinerary-email";
import { isAdmin } from "@/lib/security";

// Rendered email HTML for the preview frame on Admin → Itinerary. ?note=… shows the personal note.
export async function GET(request: Request) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const note = new URL(request.url).searchParams.get("note") ?? "";
  const html = await renderItineraryEmail({ guestName: "Bello", note: note.slice(0, 2000) });
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" } });
}
