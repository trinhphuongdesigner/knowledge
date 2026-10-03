import "server-only";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { addDays, todayVN } from "@/lib/dates";
import { db } from "@/lib/db";
import { notify } from "@/lib/notify";

const BATCH = 50;

/** href phải là đường dẫn tương đối trong app: bắt đầu bằng "/" nhưng không phải "//" hay "/\". */
export function isRelativeHref(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//") && !href.startsWith("/\\") && !/[\s\u0000-\u001f]/.test(href);
}

export const audienceSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("all") }),
  z.object({ type: z.literal("active"), days: z.number().int().min(1).max(365) }),
  z.object({ type: z.literal("email"), email: z.string().trim().toLowerCase().email().max(254) }),
]);
export type Audience = z.infer<typeof audienceSchema>;

export const messageSchema = z.object({
  title: z.string().trim().min(1, "Vui lòng nhập tiêu đề").max(100, "Tiêu đề tối đa 100 ký tự"),
  body: z.string().trim().min(1, "Vui lòng nhập nội dung").max(500, "Nội dung tối đa 500 ký tự"),
  href: z
    .string()
    .trim()
    .max(300)
    .refine(isRelativeHref, 'Đường dẫn phải bắt đầu bằng "/" (đường dẫn trong app)'),
});
export type BroadcastMessage = z.infer<typeof messageSchema>;

function audienceWhere(a: Audience): Prisma.UserWhereInput {
  const base: Prisma.UserWhereInput = { disabledAt: null };
  if (a.type === "all") return base;
  if (a.type === "email") return { ...base, email: { equals: a.email, mode: "insensitive" } };
  return { ...base, studyDays: { some: { day: { gte: addDays(todayVN(), -(a.days - 1)) } } } };
}

/** Số người sẽ nhận (không tính tài khoản bị khoá). */
export async function countAudience(a: Audience): Promise<number> {
  return db.user.count({ where: audienceWhere(a) });
}

/** Gửi thông báo hệ thống theo lô ~50 đồng thời; trả số người đã nhận. */
export async function sendBroadcast(a: Audience, msg: BroadcastMessage): Promise<{ recipients: number }> {
  const users = await db.user.findMany({ where: audienceWhere(a), select: { id: true } });
  for (let i = 0; i < users.length; i += BATCH) {
    await Promise.all(
      users.slice(i, i + BATCH).map((u) => notify(u.id, { type: "SYSTEM", title: msg.title, body: msg.body, href: msg.href })),
    );
  }
  return { recipients: users.length };
}
