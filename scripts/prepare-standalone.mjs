import { cpSync, existsSync, mkdirSync } from "node:fs";

if (existsSync(new URL("../.next/standalone/", import.meta.url))) {
  mkdirSync(new URL("../.next/standalone/.next/", import.meta.url), { recursive: true });
  cpSync(new URL("../.next/static/", import.meta.url), new URL("../.next/standalone/.next/static/", import.meta.url), { recursive: true });
  if (existsSync(new URL("../public/", import.meta.url))) cpSync(new URL("../public/", import.meta.url), new URL("../.next/standalone/public/", import.meta.url), { recursive: true });
}
