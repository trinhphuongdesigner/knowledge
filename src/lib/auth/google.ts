import "server-only";
import { createRemoteJWKSet, jwtVerify, type JWTPayload, type JWTVerifyGetKey } from "jose";

const JWKS_URL = "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

export type GoogleIdentity = { uid: string; email: string; name?: string; picture?: string };

let remoteJwks: JWTVerifyGetKey | undefined;
function defaultJwks(): JWTVerifyGetKey {
  remoteJwks ??= createRemoteJWKSet(new URL(JWKS_URL));
  return remoteJwks;
}

function projectIdFromEnv(): string {
  const id = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  if (!id) throw new Error("Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID: cannot verify Google sign-in");
  return id;
}

/** Kiểm tra các claim của Firebase ID token đã được xác minh chữ ký (hàm thuần, dễ test). */
export function identityFromClaims(payload: JWTPayload): GoogleIdentity {
  const uid = typeof payload.sub === "string" ? payload.sub : "";
  if (!uid) throw new Error("Token is missing sub");
  const firebase = payload.firebase as { sign_in_provider?: unknown } | undefined;
  if (firebase?.sign_in_provider !== "google.com") throw new Error("Token is not a Google sign-in");
  const email = payload.email;
  if (typeof email !== "string" || !email.trim()) throw new Error("Token is missing email");
  // Bắt buộc: vai trò admin được suy ra từ email nên email phải được Google xác minh.
  if (payload.email_verified !== true) throw new Error("Email is not verified");
  return {
    uid,
    email: email.trim().toLowerCase(),
    name: typeof payload.name === "string" && payload.name.trim() ? payload.name.trim() : undefined,
    picture: typeof payload.picture === "string" ? payload.picture : undefined,
  };
}

/**
 * Xác minh Firebase ID token (không dùng firebase-admin). Ném lỗi nếu token không hợp lệ.
 * `opts` cho phép test truyền khoá cục bộ.
 */
export async function verifyFirebaseIdToken(
  token: string,
  opts: { projectId?: string; jwks?: JWTVerifyGetKey } = {},
): Promise<GoogleIdentity> {
  const projectId = opts.projectId ?? projectIdFromEnv();
  const { payload } = await jwtVerify(token, opts.jwks ?? defaultJwks(), {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
    algorithms: ["RS256"],
  });
  return identityFromClaims(payload);
}
