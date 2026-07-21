export const MAX_PARTY_SIZE = 8;

export type ReplyStatus = "celebrating" | "from_afar";
export type Audience = "all" | ReplyStatus;

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
