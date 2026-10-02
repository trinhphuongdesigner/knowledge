import { aiEnabled, suggestCard } from "@/lib/ai";
import { AI_ERROR_MESSAGE, AI_ERROR_STATUS, AiError } from "@/lib/ai-core";
import { requireApiUser } from "@/lib/auth/dal";
import { todayVN } from "@/lib/dates";
import { db } from "@/lib/db";
import { badRequest, json, readJson, serverError, validationError } from "@/lib/http";
import { QUOTA } from "@/lib/quota";
import { aiSuggestInputSchema } from "@/lib/validators";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await requireApiUser(req);
    if (user instanceof Response) return user;
    if (!aiEnabled()) return json({ enabled: false });
    if (user.role === "ADMIN") return json({ enabled: true });
    const row = await db.aiUsage.findUnique({
      where: { userId_day: { userId: user.id, day: todayVN() } },
      select: { count: true },
    });
    return json({ enabled: true, remaining: Math.max(0, QUOTA.aiPerDay - (row?.count ?? 0)) });
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireApiUser(req);
    if (user instanceof Response) return user;
    if (!aiEnabled()) return NextResponse.json({ error: AI_ERROR_MESSAGE.disabled }, { status: 503 });

    const body = await readJson(req);
    if (body === undefined) return badRequest("Dữ liệu không hợp lệ");
    const parsed = aiSuggestInputSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const day = todayVN();
    const where = { userId_day: { userId: user.id, day } };
    const tracked = user.role !== "ADMIN";
    const giveBack = () => db.aiUsage.update({ where, data: { count: { decrement: 1 } } }).catch(() => {});
    if (tracked) {
      // Atomic reserve: increment first, then reject (and give back) if over the daily limit.
      const row = await db.aiUsage.upsert({
        where,
        create: { userId: user.id, day, count: 1 },
        update: { count: { increment: 1 } },
        select: { count: true },
      });
      if (row.count > QUOTA.aiPerDay) {
        await giveBack();
        return NextResponse.json({ error: "Bạn đã dùng hết lượt gợi ý AI hôm nay" }, { status: 429 });
      }
    }

    try {
      return json(await suggestCard(parsed.data));
    } catch (e) {
      if (tracked) await giveBack();
      if (e instanceof AiError) {
        return NextResponse.json({ error: AI_ERROR_MESSAGE[e.code] }, { status: AI_ERROR_STATUS[e.code] });
      }
      throw e;
    }
  } catch (e) {
    return serverError(e);
  }
}
