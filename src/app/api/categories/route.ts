import { requireApiUser } from "@/lib/auth/dal";
import { findDuplicateCategory, listCategories } from "@/lib/categories";
import { db } from "@/lib/db";
import { toCategoryDTO } from "@/lib/dto";
import { json, readJson, serverError, validationError } from "@/lib/http";
import { categoryInputSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

const DUPLICATE_NAME_MESSAGE = "Đã có danh mục trùng tên";

export async function GET(req: Request) {
  try {
    const user = await requireApiUser(req);
    if (user instanceof Response) return user;
    return json(await listCategories(user.id));
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireApiUser(req);
    if (user instanceof Response) return user;
    const parsed = categoryInputSchema.safeParse(await readJson(req));
    if (!parsed.success) return validationError(parsed.error);
    if (await findDuplicateCategory(user.id, parsed.data.name)) {
      return json({ error: DUPLICATE_NAME_MESSAGE }, 409);
    }
    const created = await db.category.create({ data: { ...parsed.data, userId: user.id } });
    return json(toCategoryDTO(created, 0), 201);
  } catch (e) {
    if ((e as { code?: string } | null)?.code === "P2002") return json({ error: DUPLICATE_NAME_MESSAGE }, 409);
    return serverError(e);
  }
}
