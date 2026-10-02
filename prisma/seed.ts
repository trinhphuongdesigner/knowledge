import "dotenv/config";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword, isPasswordHash } from "../src/lib/auth/password";
import { PrismaClient, type Category, type Level } from "../src/generated/prisma/client";
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

type SeedSet = {
  title: string;
  description?: string | null;
  category: Category;
  level?: Level | null;
  source: string;
  cards: SeedCard[];
};

const DATA = path.join(__dirname, "seed-data");

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const hashEnv = process.env.ADMIN_PASSWORD_HASH?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!email) {
    throw new Error("Seed cần ADMIN_EMAIL trong env. Ví dụ: ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=... npm run db:seed");
  }
  if (hashEnv && !isPasswordHash(hashEnv)) {
    throw new Error(
      "ADMIN_PASSWORD_HASH sai định dạng (cần scrypt$N$r$p$salt$hash). Tạo bằng `npm run auth:hash` và đặt trong nháy đơn '...' trong .env.",
    );
  }
  if (!hashEnv && (!password || password.length < 8)) {
    throw new Error(
      "Seed cần ADMIN_PASSWORD_HASH (ưu tiên) hoặc ADMIN_PASSWORD (>= 8 ký tự) trong env. Tạo hash: `npm run auth:hash`.",
    );
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

  const passwordHash = hashEnv ?? (await hashPassword(password!));
  const admin = await db.user.upsert({
    where: { email },
    create: { email, name, passwordHash, role: "ADMIN" },
    update: { name, passwordHash, role: "ADMIN" },
  });
  console.log(`Admin: ${admin.email} (${admin.id})`);

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
          category: s.category,
          level: s.level ?? null,
          userId: admin.id,
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
