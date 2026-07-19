import { z } from "zod";

export const replyStatusSchema = z.enum(["celebrating", "from_afar"]);

export const saveTheDateSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  email: z.email().max(254).transform((value) => value.toLowerCase()),
  status: replyStatusSchema,
  guestCount: z.coerce.number().int().min(1).max(10),
  note: z.string().trim().max(500).default(""),
});

export const adminLoginSchema = z.object({ email: z.email().transform((v) => v.toLowerCase()) });

export type SaveTheDateFormInput = z.infer<typeof saveTheDateSchema>;
