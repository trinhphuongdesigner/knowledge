import { requireApiUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { todayVN } from "@/lib/dates";
import { json, readJson, serverError, validationError } from "@/lib/http";
import { studySettingsSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function PUT(req: Request) {
  try {
    const user = await requireApiUser(req);
    if (user instanceof Response) return user;
    const parsed = studySettingsSchema.safeParse(await readJson(req));
    if (!parsed.success) return validationError(parsed.error);
    const [updated] = await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: parsed.data,
        select: { dailyGoal: true, pushReminders: true },
      }),
      // Streak của hôm nay xét theo mục tiêu cuối ngày → đồng bộ luôn dòng StudyDay hôm nay (nếu đã học).
      db.studyDay.updateMany({ where: { userId: user.id, day: todayVN() }, data: { goal: parsed.data.dailyGoal } }),
    ]);
    return json(updated);
  } catch (e) {
    return serverError(e);
  }
}
