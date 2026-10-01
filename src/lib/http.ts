import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export function json<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status: 400 });
}

export function validationError(error: ZodError) {
  return badRequest("Dữ liệu không hợp lệ", error.flatten());
}

export function notFound(message = "Không tìm thấy") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function serverError(error: unknown) {
  console.error(error);
  return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
}

/** Parse a JSON body; returns undefined when the body is missing/invalid. */
export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return undefined;
  }
}

/** Prisma "record not found" (P2025). */
export function isNotFoundError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2025"
  );
}
