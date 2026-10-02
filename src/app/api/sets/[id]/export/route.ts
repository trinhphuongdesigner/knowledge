import { requireApiUser } from "@/lib/auth/dal";
import { getReadableSet } from "@/lib/access";
import { db } from "@/lib/db";
import { EXPORT_FORMATS, buildCsv, buildXlsx, slugify, type ExportFormat } from "@/lib/export";
import { badRequest, notFound, serverError } from "@/lib/http";
import { isUuid } from "@/lib/ids";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Ctx) {
  try {
    const user = await requireApiUser(req);
    if (user instanceof Response) return user;
    const { id } = await params;
    if (!isUuid(id)) return notFound();
    const format = (new URL(req.url).searchParams.get("format") ?? "csv").toLowerCase();
    if (!(EXPORT_FORMATS as readonly string[]).includes(format)) return badRequest("Định dạng không hỗ trợ (csv hoặc xlsx)");

    const readable = await getReadableSet(user.id, id);
    if (!readable) return notFound("Không tìm thấy nhóm thẻ");
    const { set } = readable;
    const cards = await db.card.findMany({
      where: { setId: id },
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    });
    const base = slugify(set.title);
    const headers = { "Cache-Control": "private, no-store" };
    if ((format as ExportFormat) === "xlsx") {
      const body = buildXlsx(cards, set.title);
      return new Response(new Uint8Array(body), {
        headers: {
          ...headers,
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${base}.xlsx"`,
        },
      });
    }
    return new Response(buildCsv(cards), {
      headers: {
        ...headers,
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${base}.csv"`,
      },
    });
  } catch (e) {
    return serverError(e);
  }
}
