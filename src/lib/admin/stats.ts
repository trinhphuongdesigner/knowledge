import "server-only";
import { addDays, dayKey, todayVN } from "@/lib/dates";
import { db } from "@/lib/db";
import { DEFAULT_QUOTA, effectiveLimits } from "@/lib/quota-limits";

export type DayPoint = { day: string; value: number };

/** Danh sách `n` ngày (YYYY-MM-DD, giờ VN) kết thúc hôm nay, cũ → mới. */
export function lastDays(n: number, now = new Date()): string[] {
  const today = todayVN(now);
  return Array.from({ length: n }, (_, i) => dayKey(addDays(today, i - (n - 1))));
}

/** Điền 0 cho ngày thiếu. */
export function fillDays(keys: string[], rows: { day: string; value: number }[]): DayPoint[] {
  const map = new Map(rows.map((r) => [r.day, r.value]));
  return keys.map((day) => ({ day, value: map.get(day) ?? 0 }));
}

export function formatBytes(n: number): string {
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 ** 3).toFixed(2)} GB`;
}

export async function getDashboardStats() {
  const now = new Date();
  const today = todayVN(now);
  const days30 = lastDays(30, now);
  const since30 = days30[0];
  const since7 = dayKey(addDays(today, -6));

  const [users, new7, new30, active7, setsByVis, cards, pending, disabled, dbSize, signups, reviews, categories] =
    await Promise.all([
      db.user.count(),
      db.user.count({ where: { createdAt: { gte: addDays(now, -7) } } }),
      db.user.count({ where: { createdAt: { gte: addDays(now, -30) } } }),
      db.$queryRaw<{ n: number }[]>`
        SELECT COUNT(DISTINCT "userId")::int AS n FROM "StudyDay"
        WHERE day >= ${since7}::date AND reviewed > 0`,
      db.studySet.groupBy({ by: ["visibility"], _count: { _all: true } }),
      db.card.count(),
      db.studySet.count({ where: { visibility: "PUBLIC", approved: false } }),
      db.user.count({ where: { disabledAt: { not: null } } }),
      db.$queryRaw<{ bytes: bigint }[]>`SELECT pg_database_size(current_database()) AS bytes`,
      db.$queryRaw<{ day: string; value: number }[]>`
        SELECT to_char(("createdAt" AT TIME ZONE 'Asia/Ho_Chi_Minh')::date, 'YYYY-MM-DD') AS day, COUNT(*)::int AS value
        FROM "User"
        WHERE ("createdAt" AT TIME ZONE 'Asia/Ho_Chi_Minh')::date >= ${since30}::date
        GROUP BY 1`,
      db.$queryRaw<{ day: string; value: number }[]>`
        SELECT to_char(day, 'YYYY-MM-DD') AS day, COALESCE(SUM(reviewed), 0)::int AS value
        FROM "StudyDay" WHERE day >= ${since30}::date GROUP BY 1`,
      db.$queryRaw<{ id: string; name: string; sets: number; cards: number }[]>`
        SELECT c.id, c.name, COUNT(DISTINCT s.id)::int AS sets, COUNT(cd.id)::int AS cards
        FROM "Category" c
        LEFT JOIN "StudySet" s ON s."categoryId" = c.id
        LEFT JOIN "Card" cd ON cd."setId" = s.id
        GROUP BY c.id ORDER BY c."position", c."createdAt"`,
    ]);

  const vis = Object.fromEntries(setsByVis.map((r) => [r.visibility, r._count._all])) as Record<string, number>;
  return {
    users,
    new7,
    new30,
    active7: active7[0]?.n ?? 0,
    setsPrivate: vis.PRIVATE ?? 0,
    setsLink: vis.LINK ?? 0,
    setsPublic: vis.PUBLIC ?? 0,
    cards,
    pending,
    disabled,
    dbBytes: Number(dbSize[0]?.bytes ?? 0),
    signups: fillDays(days30, signups),
    reviews: fillDays(days30, reviews),
    categories,
  };
}

export async function getAiStats() {
  const now = new Date();
  const today = todayVN(now);
  const days30 = lastDays(30, now);
  const since30 = days30[0];
  const todayKey = dayKey(today);

  const [perDay, topToday, top30] = await Promise.all([
    db.$queryRaw<{ day: string; value: number }[]>`
      SELECT to_char(day, 'YYYY-MM-DD') AS day, SUM(count)::int AS value
      FROM "AiUsage" WHERE day >= ${since30}::date GROUP BY 1`,
    db.$queryRaw<TopRow[]>`
      SELECT u.id, u.email, u."quotaAiPerDay", a.count::int AS total
      FROM "AiUsage" a JOIN "User" u ON u.id = a."userId"
      WHERE a.day = ${todayKey}::date ORDER BY a.count DESC LIMIT 10`,
    db.$queryRaw<TopRow[]>`
      SELECT u.id, u.email, u."quotaAiPerDay", SUM(a.count)::int AS total
      FROM "AiUsage" a JOIN "User" u ON u.id = a."userId"
      WHERE a.day >= ${since30}::date GROUP BY u.id ORDER BY total DESC LIMIT 10`,
  ]);
  const withLimit = (rows: TopRow[]) =>
    rows.map((r) => ({ ...r, limit: effectiveLimits(DEFAULT_QUOTA, { quotaAiPerDay: r.quotaAiPerDay }).aiPerDay }));
  const series = fillDays(days30, perDay);
  return {
    series,
    totalToday: series[series.length - 1]?.value ?? 0,
    total30: series.reduce((s, p) => s + p.value, 0),
    topToday: withLimit(topToday),
    top30: withLimit(top30),
  };
}
type TopRow = { id: string; email: string; quotaAiPerDay: number | null; total: number };

export async function getSystemStats() {
  const now = new Date();
  const since = addDays(now, -1);
  const [dbSize, tables, jobs, byIp, byEmail] = await Promise.all([
    db.$queryRaw<{ bytes: bigint }[]>`SELECT pg_database_size(current_database()) AS bytes`,
    db.$queryRaw<{ name: string; bytes: bigint | number }[]>`
      SELECT c.relname AS name, pg_total_relation_size(c.oid) AS bytes
      FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'r'
      ORDER BY pg_total_relation_size(c.oid) DESC LIMIT 10`,
    db.jobRun.findMany({ orderBy: { name: "asc" } }),
    db.$queryRaw<{ key: string | null; n: number }[]>`
      SELECT ip AS key, COUNT(*)::int AS n FROM "LoginAttempt"
      WHERE success = false AND "createdAt" >= ${since} GROUP BY ip ORDER BY n DESC LIMIT 10`,
    db.$queryRaw<{ key: string | null; n: number }[]>`
      SELECT email AS key, COUNT(*)::int AS n FROM "LoginAttempt"
      WHERE success = false AND "createdAt" >= ${since} GROUP BY email ORDER BY n DESC LIMIT 10`,
  ]);
  return {
    dbBytes: Number(dbSize[0]?.bytes ?? 0),
    tables: tables.map((t) => ({ name: t.name, bytes: Number(t.bytes) })),
    jobs,
    failedByIp: byIp,
    failedByEmail: byEmail,
  };
}
