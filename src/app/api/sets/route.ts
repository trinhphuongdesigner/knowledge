import type { Prisma } from "@/generated/prisma/client";
import { requireApiUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { toSetDTO } from "@/lib/dto";
import { json, readJson, serverError, validationError } from "@/lib/http";
import { CATEGORIES, LEVELS, setInputSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await requireApiUser(req);
    if (user instanceof Response) return user;
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const level = searchParams.get("level");
    const q = searchParams.get("q")?.trim();

    const where: Prisma.StudySetWhereInput = { userId: user.id };
    if (category && (CATEGORIES as readonly string[]).includes(category)) {
      where.category = category as (typeof CATEGORIES)[number];
    }
    if (level && (LEVELS as readonly string[]).includes(level)) {
      where.level = level as (typeof LEVELS)[number];
    }
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    const sets = await db.studySet.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { cards: true } } },
    });
    return json(sets.map((s) => toSetDTO(s, s._count.cards)));
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireApiUser(req);
    if (user instanceof Response) return user;
    const parsed = setInputSchema.safeParse(await readJson(req));
    if (!parsed.success) return validationError(parsed.error);
    const { title, description, category, level } = parsed.data;
    const set = await db.studySet.create({
      data: { title, description: description || null, category, level: level ?? null, userId: user.id },
    });
    return json(toSetDTO(set, 0), 201);
  } catch (e) {
    return serverError(e);
  }
}
