import { NextResponse } from "next/server";
import type { ZodError } from "zod";
import { getT } from "@/i18n/server";
import { localizeFieldErrors } from "@/i18n/validation";
import type { MessageKey, Messages } from "@/i18n/messages/types";
import type { TParams } from "@/i18n/translate";

/** Key trong namespace `errors` (en là nguồn chuẩn). */
export type ErrorKey = MessageKey<Messages["errors"]>;

export function json<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

/** Trả `{ error }` đã dịch theo locale của request. */
export async function apiError(key: ErrorKey, status: number, params?: TParams, details?: unknown) {
  const t = await getT("errors");
  return NextResponse.json(details === undefined ? { error: t(key, params) } : { error: t(key, params), details }, { status });
}

export function badRequest(key: ErrorKey = "invalidData", details?: unknown, params?: TParams) {
  return apiError(key, 400, params, details);
}

export async function validationError(error: ZodError) {
  const flat = error.flatten();
  return apiError("invalidData", 400, undefined, {
    formErrors: flat.formErrors,
    fieldErrors: await localizeFieldErrors(flat.fieldErrors as Record<string, string[] | undefined>),
  });
}

export function notFound(key: ErrorKey = "notFound") {
  return apiError(key, 404);
}

/** Vượt hạn mức (QuotaViolation từ checkQuota) → 400 với thông báo đã dịch. */
export function quotaExceeded(v: { key: ErrorKey; limit: number }) {
  return apiError(v.key, 400, { limit: v.limit });
}

export function conflict(key: ErrorKey, params?: TParams) {
  return apiError(key, 409, params);
}

export async function serverError(error: unknown) {
  console.error(error);
  return apiError("serverError", 500);
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
