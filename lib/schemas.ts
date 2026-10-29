import { z } from "zod";
import { MAX_PARTY_SIZE } from "./types";

export const replyStatusSchema = z.enum(["celebrating", "from_afar"]);

export const saveTheDateSchema = z
  .object({
    fullName: z.string().trim().min(1).max(120).refine((v) => v.split(/\s+/).length >= 2, "Please give a first and last name."),
    email: z.email().max(254).transform((value) => value.toLowerCase()),
    phone: z.string().trim().regex(/^\+?[0-9][0-9 ()-]{6,19}$/, "Please enter a valid phone number."),
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

/** A guest reserving a gift on /gifts. The gift id is checked against lib/content.ts by the route. */
export const giftReserveSchema = z.object({
  giftId: z.string().trim().min(1).max(80),
  guestName: z.string().trim().min(2).max(120),
  email: z.union([z.literal(""), z.email().max(254).transform((value) => value.toLowerCase())]).default(""),
  message: z.string().trim().max(300).default(""),
});
export type GiftReserveInput = z.infer<typeof giftReserveSchema>;
