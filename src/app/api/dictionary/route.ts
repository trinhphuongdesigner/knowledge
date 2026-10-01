import { lookupWordDetailed } from "@/lib/dictionary";
import { badRequest, json, notFound } from "@/lib/http";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const word = new URL(req.url).searchParams.get("word")?.trim() ?? "";
  if (!word) return badRequest("Thiếu tham số word");
  const r = await lookupWordDetailed(word);
  switch (r.status) {
    case "ok":
      return json(r.info);
    case "notfound":
      return notFound("Không tìm thấy từ này trong từ điển");
    case "ineligible":
      return badRequest("Chỉ tra được từ hoặc cụm 1–3 từ tiếng Anh");
    default:
      return NextResponse.json(
        { error: "Không kết nối được từ điển (cần có internet). Bạn vẫn có thể nhập phiên âm thủ công." },
        { status: 502 },
      );
  }
}
