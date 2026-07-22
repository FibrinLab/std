import { randomBytes } from "node:crypto";

// URL-safe, unambiguous alphabet (no 0/O, 1/l/i).
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

export function generateInviteCode(length = 10) {
  const bytes = randomBytes(length);
  let code = "";
  for (let i = 0; i < length; i++) code += ALPHABET[bytes[i] % ALPHABET.length];
  return code;
}
