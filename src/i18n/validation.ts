import "server-only";
import { MAX_AGE, MIN_AGE } from "@/lib/profile";
import { getT } from "./server";

const PREFIX = "validation.";

/** Dịch message zod dạng "validation.xxx" (lưu trong errors.validation); message khác giữ nguyên. */
export async function localizeMessage(msg: string): Promise<string> {
  if (!msg.startsWith(PREFIX)) return msg;
  const t = await getT("errors");
  return t(msg as Parameters<typeof t>[0], { min: MIN_AGE, max: MAX_AGE });
}

/** Dịch toàn bộ message trong `error.flatten().fieldErrors`. */
export async function localizeFieldErrors<T extends Record<string, string[] | undefined>>(fe: T): Promise<T> {
  const out: Record<string, string[] | undefined> = {};
  for (const [k, v] of Object.entries(fe)) out[k] = v ? await Promise.all(v.map(localizeMessage)) : v;
  return out as T;
}
