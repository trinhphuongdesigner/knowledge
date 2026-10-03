import "dotenv/config";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { ADMIN_EMAIL } from "../src/lib/auth/admin";
import { PrismaClient, type Level } from "../src/generated/prisma/client";
import { loadHandbook } from "./seed-data/handbook-loader";
import { loadVocabFiles } from "./seed-data/vocab-loader";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

type SeedCard = {
  question: string;
  answer: string;
  explanation?: string | null;
  phonetic?: string | null;
  partOfSpeech?: string | null;
};

/** Category key used in the seed JSON files; mapped to the admin's own categories. */
type SeedCategory = "IT" | "ENGLISH";

const DEFAULT_CATEGORIES = [
  { key: "IT", name: "IT", color: "BLUE", isEnglish: false },
  { key: "ENGLISH", name: "Tiếng Anh", color: "GREEN", isEnglish: true },
] as const;

type SeedSet = {
  title: string;
  description?: string | null;
  category: SeedCategory;
  level?: Level | null;
  source: string;
  cards: SeedCard[];
};

const DATA = path.join(__dirname, "seed-data");

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (email !== ADMIN_EMAIL) {
    throw new Error(`Seed cần ADMIN_EMAIL=${ADMIN_EMAIL} (tài khoản admin duy nhất). Ví dụ: ADMIN_EMAIL=${ADMIN_EMAIL} npm run db:seed`);
  }
  const name = process.env.ADMIN_NAME?.trim() || "Admin";
  const vocab = loadVocabFiles(path.join(DATA, "vocab"));
  const handbook = loadHandbook(path.join(DATA, "frontend-handbook.md"));

  // Display order on the home page is newest first, so the first set gets the latest createdAt.
  // Groups: Life & Work (order 1-10) -> HR (11-20) -> IT English (21+) -> Frontend interview.
  const group = (order: number) => (order <= 10 ? "Life & Work" : order <= 20 ? "HR" : "IT English");
  const ordered: SeedSet[] = [
    ...vocab.map((v) => ({
      title: v.title,
      description: v.description,
      category: v.category,
      level: v.level,
      source: group(v.order),
      cards: v.cards,
    })),
    ...handbook.map((h) => ({
      title: h.title,
      description: h.description,
      category: "IT" as const,
      level: h.level,
      source: "Frontend handbook",
      cards: h.cards,
    })),
  ];

  const admin = await db.user.upsert({
    where: { email },
    create: { email, name, role: "ADMIN", onboardedAt: new Date() },
    update: { name, role: "ADMIN", onboardedAt: new Date() },
  });
  console.log(`Admin: ${admin.email} (${admin.id})`);

  // Default categories for the admin (kept if they already exist, incl. user edits).
  const categoryIds = new Map<SeedCategory, string>();
  for (const c of DEFAULT_CATEGORIES) {
    const existing = await db.category.findUnique({ where: { userId_name: { userId: admin.id, name: c.name } } });
    const row =
      existing ??
      (await db.category.create({
        data: { userId: admin.id, name: c.name, color: c.color, isEnglish: c.isEnglish },
      }));
    categoryIds.set(c.key, row.id);
  }

  // Only the admin's own sets are replaced (cards cascade). Other users are untouched.
  console.log("Replacing admin's sets...");
  await db.studySet.deleteMany({ where: { userId: admin.id } });

  const base = Date.now();
  const totals = new Map<string, { sets: number; cards: number }>();
  for (const [i, s] of ordered.entries()) {
    const createdAt = new Date(base - i * 1000);
    await db.$transaction(async (tx) => {
      const set = await tx.studySet.create({
        data: {
          title: s.title,
          description: s.description || null,
          categoryId: categoryIds.get(s.category)!,
          level: s.level ?? null,
          userId: admin.id,
          // Bộ mẫu được xuất bản sẵn: hiện ở /library để mọi người lưu / sao chép.
          visibility: "PUBLIC",
          approved: true,
          publishedAt: createdAt,
          shareToken: randomBytes(16).toString("base64url"),
          createdAt,
          updatedAt: createdAt,
        },
      });
      await tx.card.createMany({
        data: s.cards.map((c, position) => ({
          setId: set.id,
          question: c.question,
          answer: c.answer,
          explanation: c.explanation || null,
          phonetic: c.phonetic || null,
          partOfSpeech: c.partOfSpeech || null,
          position,
        })),
      });
    });
    const t = totals.get(s.source) ?? { sets: 0, cards: 0 };
    t.sets += 1;
    t.cards += s.cards.length;
    totals.set(s.source, t);
  }

  console.log("\nSeeded:");
  let sets = 0;
  let cards = 0;
  for (const [source, t] of totals) {
    console.log(`  ${source.padEnd(18)} ${String(t.sets).padStart(3)} sets  ${String(t.cards).padStart(5)} cards`);
    sets += t.sets;
    cards += t.cards;
  }
  console.log(`  ${"TOTAL".padEnd(18)} ${String(sets).padStart(3)} sets  ${String(cards).padStart(5)} cards`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
