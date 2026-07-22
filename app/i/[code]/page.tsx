import { notFound } from "next/navigation";
import { SaveTheDatePage } from "@/components/save-the-date-page";
import { findInviteByCode } from "@/lib/repository";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your invitation", robots: { index: false, follow: false } };

export default async function InvitePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const invite = await findInviteByCode(code);
  if (!invite) notFound();
  return <SaveTheDatePage invite={{ code: invite.code, name: invite.name, plusOne: invite.plusOne }}/>;
}
