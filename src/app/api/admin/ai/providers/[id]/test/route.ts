import { testAiProvider } from "@/lib/ai";
import { requireApiAdmin } from "@/lib/auth/dal";
import { isUuid } from "@/lib/ids";
import { json, notFound, serverError } from "@/lib/http";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** Gọi thử một key với một từ mẫu → { ok, ms, reason?, error? }; kết quả cũng cập nhật trạng thái key. */
export async function POST(req: Request, { params }: Ctx) {
  try {
    const admin = await requireApiAdmin(req);
    if (admin instanceof Response) return admin;
    const { id } = await params;
    if (!isUuid(id)) return notFound();
    const result = await testAiProvider(id);
    return result ? json(result) : notFound();
  } catch (e) {
    return serverError(e);
  }
}
