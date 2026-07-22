import { z } from "zod";
import { MAX_PARTY_SIZE } from "./types";

export const replyStatusSchema = z.enum(["celebrating", "from_afar"]);

export const saveTheDateSchema = z
  .object({
    fullName: z.string().trim().min(1).max(120),
    email: z.email().max(254).transform((value) => value.toLowerCase()),
    status: replyStatusSchema,
    guestCount: z.coerce.number().int().min(1).max(MAX_PARTY_SIZE),
    guestNames: z.array(z.string().trim().min(1).max(120)).max(MAX_PARTY_SIZE - 1).default([]),
    note: z.string().trim().max(500).default(""),
    inviteCode: z.string().trim().min(1).max(40).optional(),
  })
  .superRefine((data, ctx) => {
    const expected = data.status === "celebrating" ? data.guestCount - 1 : 0;
    if (data.guestNames.length !== expected) {
      ctx.addIssue({ code: "custom", path: ["guestNames"], message: `Expected ${expected} guest name(s).` });
    }
  });

export type SaveTheDateFormInput = z.infer<typeof saveTheDateSchema>;
