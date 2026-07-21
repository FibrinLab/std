import { z } from "zod";

export const replyStatusSchema = z.enum(["celebrating", "from_afar"]);

export const saveTheDateSchema = z
  .object({
    fullName: z.string().trim().min(1).max(120),
    email: z.email().max(254).transform((value) => value.toLowerCase()),
    status: replyStatusSchema,
    guestCount: z.coerce.number().int().min(1).max(10),
    guestNames: z.array(z.string().trim().min(1).max(120)).max(9).default([]),
    note: z.string().trim().max(500).default(""),
  })
  .superRefine((data, ctx) => {
    const expected = data.status === "celebrating" ? data.guestCount - 1 : 0;
    if (data.guestNames.length !== expected) {
      ctx.addIssue({ code: "custom", path: ["guestNames"], message: `Expected ${expected} guest name(s).` });
    }
  });

export const adminLoginSchema = z.object({ email: z.email().transform((v) => v.toLowerCase()) });

export type SaveTheDateFormInput = z.infer<typeof saveTheDateSchema>;
