import "server-only";
import { Prisma } from "@/generated/prisma/client";
import { ADMIN_EMAIL } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { addDays, dayKey, todayVN } from "@/lib/dates";
import { effectiveAvatarUrl } from "@/lib/profile";
import { QUOTA, effectiveLimits, type QuotaLimits } from "@/lib/quota-limits";
import { computeStreak } from "@/lib/stats";
import {
  INACTIVE_DAYS,
  NEAR_LIMIT_PERCENT,
  USERS_PAGE_SIZE,
  escapeLike,
  usagePercent,
  type UserListQuery,
  type UserRow,
} from "./users";

type RawRow = {
  id: string;
  email: string;
  name: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  useGoogleAvatar: boolean;
  gender: UserRow["gender"];
  role: "USER" | "ADMIN";
  createdAt: Date;
  onboardedAt: Date | null;
  lastLoginAt: Date | null;
  disabledAt: Date | null;
  quotaSets: number | null;
  quotaCards: number | null;
  lastStudyDay: Date | null;
  sets: number;
  cards: number;
  saved: number;
  reviews: number;
  total: number;
};

const BACKSLASH_ESCAPE = Prisma.raw("ESCAPE E'\\\\'");

/** Một query tổng hợp (JOIN các bảng đã GROUP BY) — không N+1. */
export async function listUsers(q: UserListQuery): Promise<{ rows: UserRow[]; total: number; pageSize: number }> {
  const effSets = Prisma.sql`COALESCE(u."quotaSets", ${QUOTA.setsPerUser}::int)`;
  const effCards = Prisma.sql`COALESCE(u."quotaCards", ${QUOTA.cardsPerUser}::int)`;

  const where: Prisma.Sql[] = [];
  if (q.q) {
    const pattern = `%${escapeLike(q.q)}%`;
    where.push(
      Prisma.sql`(u."email" ILIKE ${pattern} ${BACKSLASH_ESCAPE} OR u."name" ILIKE ${pattern} ${BACKSLASH_ESCAPE} OR u."fullName" ILIKE ${pattern} ${BACKSLASH_ESCAPE})`,
    );
  }
  switch (q.filter) {
    case "unonboarded":
      where.push(Prisma.sql`u."onboardedAt" IS NULL`);
      break;
    case "disabled":
      where.push(Prisma.sql`u."disabledAt" IS NOT NULL`);
      break;
    case "inactive":
      where.push(
        Prisma.sql`COALESCE(GREATEST(st.last_study::timestamp, u."lastLoginAt"), u."createdAt") < now() - make_interval(days => ${INACTIVE_DAYS}::int)`,
      );
      break;
    case "nearlimit":
      where.push(
        Prisma.sql`((${effSets} > 0 AND COALESCE(sc.sets, 0) * 100 >= ${NEAR_LIMIT_PERCENT}::int * ${effSets}) OR (${effCards} > 0 AND COALESCE(cc.cards, 0) * 100 >= ${NEAR_LIMIT_PERCENT}::int * ${effCards}))`,
      );
      break;
  }
  const whereSql = where.length ? Prisma.sql`WHERE ${Prisma.join(where, " AND ")}` : Prisma.empty;

  const dirSql = q.dir === "asc" ? Prisma.raw("ASC") : Prisma.raw("DESC");
  const sortCol = {
    createdAt: Prisma.raw('u."createdAt"'),
    lastLoginAt: Prisma.raw('u."lastLoginAt"'),
    cards: Prisma.raw("COALESCE(cc.cards, 0)"),
    sets: Prisma.raw("COALESCE(sc.sets, 0)"),
  }[q.sort];
  const orderSql = Prisma.sql`ORDER BY ${sortCol} ${dirSql} NULLS LAST, u."id" ASC`;

  const offset = (q.page - 1) * USERS_PAGE_SIZE;

  const raw = await db.$queryRaw<RawRow[]>`
    SELECT u."id", u."email", u."name", u."fullName", u."avatarUrl", u."useGoogleAvatar", u."gender"::text AS "gender",
           u."role"::text AS "role", u."createdAt", u."onboardedAt", u."lastLoginAt", u."disabledAt", u."quotaSets", u."quotaCards",
           st.last_study AS "lastStudyDay",
           COALESCE(sc.sets, 0)::int AS "sets",
           COALESCE(cc.cards, 0)::int AS "cards",
           COALESCE(sub.saved, 0)::int AS "saved",
           COALESCE(st.reviews, 0)::int AS "reviews",
           count(*) OVER()::int AS "total"
    FROM "User" u
    LEFT JOIN (SELECT "userId", count(*) AS sets FROM "StudySet" GROUP BY "userId") sc ON sc."userId" = u."id"
    LEFT JOIN (
      SELECT s."userId", count(*) AS cards FROM "Card" c JOIN "StudySet" s ON s."id" = c."setId" GROUP BY s."userId"
    ) cc ON cc."userId" = u."id"
    LEFT JOIN (SELECT "userId", count(*) AS saved FROM "SetSubscription" GROUP BY "userId") sub ON sub."userId" = u."id"
    LEFT JOIN (
      SELECT "userId", max("day") AS last_study, sum("reviewed") AS reviews FROM "StudyDay" GROUP BY "userId"
    ) st ON st."userId" = u."id"
    ${whereSql}
    ${orderSql}
    LIMIT ${USERS_PAGE_SIZE}::int OFFSET ${offset}::int`;

  const rows: UserRow[] = raw.map((r) => {
    const lim = effectiveLimits(QUOTA, { quotaSets: r.quotaSets, quotaCards: r.quotaCards });
    return {
      id: r.id,
      email: r.email,
      name: r.name,
      fullName: r.fullName,
      avatarUrl: effectiveAvatarUrl(r),
      gender: r.gender,
      role: r.role,
      createdAt: r.createdAt,
      onboardedAt: r.onboardedAt,
      lastLoginAt: r.lastLoginAt,
      lastStudyDay: r.lastStudyDay,
      disabledAt: r.disabledAt,
      sets: r.sets,
      cards: r.cards,
      saved: r.saved,
      reviews: r.reviews,
      setsPct: usagePercent(r.sets, lim.setsPerUser),
      cardsPct: usagePercent(r.cards, lim.cardsPerUser),
    };
  });
  return { rows, total: raw[0]?.total ?? 0, pageSize: USERS_PAGE_SIZE };
}

export type UserDetail = NonNullable<Awaited<ReturnType<typeof getUserDetail>>>;

export async function getUserDetail(id: string) {
  const user = await db.user.findUnique({ where: { id } });
  if (!user) return null;

  const today = todayVN();
  const since30 = addDays(today, -29);

  const [sets, studyDays, aiUsage, sessions, pushCount, logs, counts, impact] = await Promise.all([
    db.studySet.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        title: true,
        visibility: true,
        approved: true,
        createdAt: true,
        category: { select: { name: true } },
        _count: { select: { cards: true, subscribers: true } },
      },
    }),
    db.studyDay.findMany({ where: { userId: id }, orderBy: { day: "asc" }, select: { day: true, reviewed: true, correct: true } }),
    db.aiUsage.findMany({ where: { userId: id, day: { gte: since30 } }, orderBy: { day: "asc" }, select: { day: true, count: true } }),
    db.session.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, userAgent: true, createdAt: true, expiresAt: true },
    }),
    db.pushSubscription.count({ where: { userId: id } }),
    db.adminAuditLog.findMany({
      where: { targetType: "user", targetId: id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, action: true, summary: true, createdAt: true },
    }),
    Promise.all([
      db.studySet.count({ where: { userId: id } }),
      db.card.count({ where: { set: { userId: id } } }),
      db.setSubscription.count({ where: { userId: id } }),
    ]),
    publicSetImpact(id),
  ]);

  const [setCount, cardCount, savedCount] = counts;
  const limits: QuotaLimits = effectiveLimits(QUOTA, user);
  const byDay = new Map(studyDays.map((d) => [dayKey(d.day), d]));
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const key = dayKey(addDays(since30, i));
    const d = byDay.get(key);
    return { day: key, reviewed: d?.reviewed ?? 0, correct: d?.correct ?? 0 };
  });
  const streak = computeStreak(studyDays.map((d) => dayKey(d.day)), today);
  const totalReviews = studyDays.reduce((s, d) => s + d.reviewed, 0);
  const aiByDay = new Map(aiUsage.map((a) => [dayKey(a.day), a.count]));
  const ai30 = Array.from({ length: 30 }, (_, i) => {
    const key = dayKey(addDays(since30, i));
    return { day: key, count: aiByDay.get(key) ?? 0 };
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      fullName: user.fullName,
      avatarUrl: effectiveAvatarUrl(user),
      gender: user.gender,
      role: user.role,
      birthYear: user.birthYear,
      nativeLanguage: user.nativeLanguage,
      createdAt: user.createdAt,
      onboardedAt: user.onboardedAt,
      lastLoginAt: user.lastLoginAt,
      disabledAt: user.disabledAt,
      disabledReason: user.disabledReason,
      quotaSets: user.quotaSets,
      quotaCards: user.quotaCards,
      quotaAiPerDay: user.quotaAiPerDay,
      isAdmin: isAdminAccount(user),
    },
    limits,
    defaults: { sets: QUOTA.setsPerUser, cards: QUOTA.cardsPerUser, ai: QUOTA.aiPerDay },
    counts: { sets: setCount, cards: cardCount, saved: savedCount, reviews: totalReviews },
    sets,
    last30,
    streak,
    ai30,
    sessions,
    pushCount,
    logs,
    impact,
  };
}

/** Số bộ PUBLIC của user và số người KHÁC đang lưu chúng (sẽ mất khi xoá tài khoản). */
export async function publicSetImpact(userId: string): Promise<{ publicSets: number; savers: number }> {
  const [publicSets, savers] = await Promise.all([
    db.studySet.count({ where: { userId, visibility: "PUBLIC" } }),
    db.setSubscription.count({ where: { set: { userId, visibility: "PUBLIC" }, userId: { not: userId } } }),
  ]);
  return { publicSets, savers };
}

export function isAdminAccount(u: { role: string; email: string }): boolean {
  return u.role === "ADMIN" || u.email.trim().toLowerCase() === ADMIN_EMAIL;
}

/** Tìm user đích cho API; từ chối tài khoản admin. `error` là key trong namespace errors. */
export async function findManageableUser(
  id: string,
): Promise<{ user: { id: string; email: string; disabledAt: Date | null } } | { status: number; error: "userNotFound" | "adminTarget" }> {
  const user = await db.user.findUnique({ where: { id }, select: { id: true, email: true, role: true, disabledAt: true } });
  if (!user) return { status: 404, error: "userNotFound" };
  if (isAdminAccount(user)) return { status: 403, error: "adminTarget" };
  return { user };
}
