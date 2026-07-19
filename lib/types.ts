export type ReplyStatus = "celebrating" | "from_afar";

export interface SaveTheDateReply {
  id: string;
  fullName: string;
  email: string;
  status: ReplyStatus;
  guestCount: number;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaveTheDateInput {
  fullName: string;
  email: string;
  status: ReplyStatus;
  guestCount: number;
  note: string;
}
