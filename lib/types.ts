export const MAX_PARTY_SIZE = 2;

export type ReplyStatus = "celebrating" | "from_afar";
export type Approval = "pending" | "confirmed";
export type Audience = "all" | "selected" | ReplyStatus;

export interface Broadcast {
  id: string;
  subject: string;
  body: string;
  audience: Audience;
  sentCount: number;
  createdAt: string;
}

export interface Invite {
  id: string;
  code: string;
  name: string;
  plusOne: boolean;
  createdAt: string;
}

export interface InviteWithReply extends Invite {
  reply: { id: string; status: ReplyStatus; approval: Approval; guestCount: number } | null;
}

export interface SaveTheDateReply {
  id: string;
  inviteId: string | null;
  fullName: string;
  email: string;
  phone: string;
  status: ReplyStatus;
  approval: Approval;
  guestCount: number;
  guestNames: string[];
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaveTheDateInput {
  fullName: string;
  email: string;
  phone: string;
  status: ReplyStatus;
  guestCount: number;
  guestNames: string[];
  note: string;
  inviteId?: string | null;
}
