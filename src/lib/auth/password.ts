import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";

// scrypt parameters per project spec: N=2^15, r=8, p=1, 64-byte key, 16-byte salt.
const N = 2 ** 15;
const R = 8;
const P = 1;
const KEYLEN = 64;
const SALT_BYTES = 16;

function derive(password: string, salt: Buffer, n: number, r: number, p: number, keylen: number) {
  return new Promise<Buffer>((resolve, reject) => {
    // scrypt needs ~128*N*r bytes; allow 2x headroom.
    const opts: ScryptOptions = { N: n, r, p, maxmem: 256 * n * r };
    scrypt(password.normalize("NFKC"), salt, keylen, opts, (err, key) => (err ? reject(err) : resolve(key)));
  });
}

/** Returns "scrypt$N$r$p$saltB64$hashB64". */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const key = await derive(password, salt, N, R, P, KEYLEN);
  return ["scrypt", N, R, P, salt.toString("base64"), key.toString("base64")].join("$");
}

/** Constant-time verify. Malformed hashes simply return false. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const parts = stored.split("$");
    if (parts.length !== 6 || parts[0] !== "scrypt") return false;
    const [n, r, p] = [Number(parts[1]), Number(parts[2]), Number(parts[3])];
    if (![n, r, p].every((v) => Number.isInteger(v) && v > 0)) return false;
    // Guard against absurd work factors from a tampered value.
    if (n > 2 ** 20 || r > 32 || p > 16 || (n & (n - 1)) !== 0) return false;
    const salt = Buffer.from(parts[4], "base64");
    const expected = Buffer.from(parts[5], "base64");
    if (salt.length === 0 || expected.length === 0) return false;
    const actual = await derive(password, salt, n, r, p, expected.length);
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

let dummyHash: Promise<string> | undefined;

/** Verify against a throwaway hash so unknown emails cost the same time as wrong passwords. */
export async function verifyDummyPassword(password: string): Promise<false> {
  dummyHash ??= hashPassword(randomBytes(16).toString("hex"));
  await verifyPassword(password, await dummyHash);
  return false;
}

/** Checks the "scrypt$N$r$p$saltB64$hashB64" shape (no password needed). */
export function isPasswordHash(value: string): boolean {
  const parts = value.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [n, r, p] = [Number(parts[1]), Number(parts[2]), Number(parts[3])];
  if (![n, r, p].every((v) => Number.isInteger(v) && v > 0)) return false;
  if (n > 2 ** 20 || r > 32 || p > 16 || (n & (n - 1)) !== 0) return false;
  const b64 = /^[A-Za-z0-9+/]+={0,2}$/;
  return b64.test(parts[4]) && b64.test(parts[5]);
}
