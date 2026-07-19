import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional().or(z.literal("")),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("Akan & Doyin <onboarding@resend.dev>"),
  ADMIN_EMAILS: z.string().default("planner@example.com"),
  ADMIN_ALERT_EMAIL: z.string().email().default("planner@example.com"),
  DEMO_MODE: z.enum(["true", "false"]).default("true"),
});

export const env = schema.parse(process.env);
export const isDemoMode = env.DEMO_MODE === "true" || !env.NEXT_PUBLIC_SUPABASE_URL;
