import { aiEnabled, suggestCard } from "@/lib/ai";
import { AI_ERROR_KEY, AI_ERROR_STATUS, AiError } from "@/lib/ai-core";
import { requireApiUser } from "@/lib/auth/dal";
import { todayVN } from "@/lib/dates";
import { db } from "@/lib/db";
import { apiError, badRequest, json, readJson, serverError, validationError } from "@/lib/http";
import { getUserLimits } from "@/lib/quota";
import { aiSuggestInputSchema } from "@/lib/validators";
import { getLocale } from "@/i18n/server";

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
    const { aiPerDay } = await getUserLimits(user.id);
    return json({ enabled: true, remaining: Math.max(0, aiPerDay - (row?.count ?? 0)) });
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireApiUser(req);
    if (user instanceof Response) return user;
    if (!aiEnabled()) return apiError(AI_ERROR_KEY.disabled, 503);

    const body = await readJson(req);
    if (body === undefined) return badRequest("invalidData");
    const parsed = aiSuggestInputSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const day = todayVN();
    const where = { userId_day: { userId: user.id, day } };
    const tracked = user.role !== "ADMIN";
    const giveBack = () => db.aiUsage.update({ where, data: { count: { decrement: 1 } } }).catch(() => {});
    const aiPerDay = tracked ? (await getUserLimits(user.id)).aiPerDay : 0;
    if (tracked) {
      // Atomic reserve: increment first, then reject (and give back) if over the daily limit.
      const row = await db.aiUsage.upsert({
        where,
        create: { userId: user.id, day, count: 1 },
        update: { count: { increment: 1 } },
        select: { count: true },
      });
      if (row.count > aiPerDay) {
        await giveBack();
        return apiError("aiQuotaExhausted", 429);
      }
    }

    try {
      return json(await suggestCard({ ...parsed.data, locale: await getLocale() }));
    } catch (e) {
      if (tracked) await giveBack();
      if (e instanceof AiError) {
        return apiError(AI_ERROR_KEY[e.code], AI_ERROR_STATUS[e.code]);
      }
      throw e;
    }
  } catch (e) {
    return serverError(e);
  }
}
