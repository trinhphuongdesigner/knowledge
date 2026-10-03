import { requireApiUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { serverError } from "@/lib/http";

export const dynamic = "force-dynamic";

/** Tải toàn bộ dữ liệu của chính user (không có session). */
export async function GET(req: Request) {
  try {
    const user = await requireApiUser(req);
    if (user instanceof Response) return user;
    const [profile, categories, sets, progress, cardReviews, studyDays, subscriptions] = await Promise.all([
      db.user.findUnique({
        where: { id: user.id },
        select: { id: true, email: true, name: true, fullName: true, birthYear: true, nativeLanguage: true, gender: true, avatarUrl: true, useGoogleAvatar: true, onboardedAt: true, role: true, dailyGoal: true, pushReminders: true, createdAt: true },
      }),
      db.category.findMany({ orderBy: [{ position: "asc" }, { createdAt: "asc" }] }),
      db.studySet.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "asc" },
        include: { cards: { orderBy: { position: "asc" } } },
      }),
      db.studyProgress.findMany({ where: { userId: user.id } }),
      db.cardReview.findMany({ where: { userId: user.id } }),
      db.studyDay.findMany({ where: { userId: user.id }, orderBy: { day: "asc" } }),
      db.setSubscription.findMany({ where: { userId: user.id }, select: { setId: true, createdAt: true } }),
    ]);
    const body = JSON.stringify(
      { exportedAt: new Date().toISOString(), profile, categories, sets, progress, cardReviews, studyDays, subscriptions },
      null,
      2,
    );
    const stamp = new Date().toISOString().slice(0, 10);
    return new Response(body, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="knowledge-data-${stamp}.json"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return serverError(e);
  }
}
