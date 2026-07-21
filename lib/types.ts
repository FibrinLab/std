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

export interface SaveTheDateReply {
  id: string;
  fullName: string;
  email: string;
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
  status: ReplyStatus;
  guestCount: number;
  guestNames: string[];
  note: string;
}
