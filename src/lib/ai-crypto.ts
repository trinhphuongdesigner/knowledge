/** Mã hoá API key AI lưu trong DB (AES-256-GCM). Thuần — nhận secret qua tham số để test được. */
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const VERSION = "v1";

/** Secret dạng chuỗi bất kỳ (khuyên dùng `openssl rand -hex 32`) → khoá 32 byte. */
function keyFrom(secret: string): Buffer {
  return createHash("sha256").update(secret, "utf8").digest();
}

export function encryptSecret(plain: string, secret: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyFrom(secret), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [VERSION, iv.toString("base64"), tag.toString("base64"), data.toString("base64")].join(":");
}

/** Ném lỗi nếu sai secret hoặc dữ liệu bị sửa. */
export function decryptSecret(payload: string, secret: string): string {
  const [version, iv, tag, data] = payload.split(":");
  if (version !== VERSION || !iv || !tag || data === undefined) throw new Error("Malformed encrypted secret");
  const decipher = createDecipheriv("aes-256-gcm", keyFrom(secret), Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(data, "base64")), decipher.final()]).toString("utf8");
}

/** 4 ký tự cuối của key để admin nhận diện (không lộ key). */
export function keyHint(key: string): string {
  return key.trim().slice(-4);
}
