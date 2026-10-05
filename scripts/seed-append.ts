/**
 * Thêm các bộ thẻ trong prisma/seed-data/vocab vào DB mà KHÔNG xoá dữ liệu cũ.
 * Bộ nào admin đã có (trùng title) thì bỏ qua, nên chạy lại nhiều lần vẫn an toàn.
 * Khác với `npm run db:seed` (xoá toàn bộ set của admin → mất tiến độ học / lượt lưu của người dùng).
 *
 *   npm run db:seed:append            # thêm các bộ còn thiếu
 *   npm run db:seed:append -- --dry   # chỉ liệt kê, không ghi
 */
import "dotenv/config";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { ADMIN_EMAIL } from "../src/lib/auth/admin";
import { PrismaClient } from "../src/generated/prisma/client";
import { loadVocabFiles } from "../prisma/seed-data/vocab-loader";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const CATEGORY_NAMES = { IT: "IT", ENGLISH: "Tiếng Anh" } as const;

async function main() {
  const dry = process.argv.includes("--dry");
  const admin = await db.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) throw new Error(`Không tìm thấy tài khoản admin ${ADMIN_EMAIL}. Hãy đăng nhập hoặc chạy db:seed trước.`);

  const categoryIds = new Map<string, string>();
  for (const [key, name] of Object.entries(CATEGORY_NAMES)) {
    const row = await db.category.findUnique({ where: { name } });
    if (!row) throw new Error(`Thiếu danh mục "${name}".`);
    categoryIds.set(key, row.id);
  }

  const existing = new Set(
    (await db.studySet.findMany({ where: { userId: admin.id }, select: { title: true } })).map((s) => s.title),
  );
  const vocab = loadVocabFiles(path.join(__dirname, "..", "prisma", "seed-data", "vocab"));
  const todo = vocab.filter((v) => !existing.has(v.title));
  console.log(`${vocab.length} bộ trong thư mục, ${todo.length} bộ mới cho ${admin.email}.`);

  // Trang chủ hiển thị mới nhất trước → bộ có order nhỏ nhận createdAt muộn nhất.
  const base = Date.now();
  let cards = 0;
  for (const [i, v] of todo.entries()) {
    console.log(`  + ${v.title} (${v.cards.length})`);
    cards += v.cards.length;
    if (dry) continue;
    const createdAt = new Date(base - i * 1000);
    await db.$transaction(async (tx) => {
      const set = await tx.studySet.create({
        data: {
          title: v.title,
          description: v.description || null,
          categoryId: categoryIds.get(v.category)!,
          level: v.level ?? null,
          userId: admin.id,
          visibility: "PUBLIC",
          approved: true,
          publishedAt: createdAt,
          shareToken: randomBytes(16).toString("base64url"),
          createdAt,
          updatedAt: createdAt,
        },
      });
      await tx.card.createMany({
        data: v.cards.map((c, position) => ({
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
  }
  console.log(`${dry ? "[dry] " : ""}Đã thêm ${todo.length} bộ, ${cards} thẻ.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
