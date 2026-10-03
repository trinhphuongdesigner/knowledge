import { SignJWT, createLocalJWKSet, exportJWK, generateKeyPair, type JWK } from "jose";
import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { identityFromClaims, verifyFirebaseIdToken } from "../google";

const PROJECT = "demo-project";
const ISS = `https://securetoken.google.com/${PROJECT}`;

let privateKey: CryptoKey;
let jwks: ReturnType<typeof createLocalJWKSet>;

beforeAll(async () => {
  const pair = await generateKeyPair("RS256");
  privateKey = pair.privateKey;
  const jwk: JWK = { ...(await exportJWK(pair.publicKey)), kid: "k1", alg: "RS256", use: "sig" };
  jwks = createLocalJWKSet({ keys: [jwk] });
});

type Claims = Record<string, unknown>;
const goodClaims = (): Claims => ({
  email: " Person@Example.COM ",
  email_verified: true,
  name: "Nguyen Van A",
  picture: "https://example.com/a.png",
  firebase: { sign_in_provider: "google.com", identities: {} },
});

async function sign(
  claims: Claims = goodClaims(),
  o: { iss?: string; aud?: string; sub?: string | null; exp?: string | number } = {},
) {
  let jwt = new SignJWT(claims)
    .setProtectedHeader({ alg: "RS256", kid: "k1" })
    .setIssuer(o.iss ?? ISS)
    .setAudience(o.aud ?? PROJECT)
    .setIssuedAt()
    .setExpirationTime(o.exp ?? "1h");
  if (o.sub !== null) jwt = jwt.setSubject(o.sub ?? "uid-123");
  return jwt.sign(privateKey);
}

const verify = (token: string) => verifyFirebaseIdToken(token, { projectId: PROJECT, jwks });

describe("verifyFirebaseIdToken", () => {
  it("accepts a valid Google token and normalises the email", async () => {
    expect(await verify(await sign())).toEqual({
      uid: "uid-123",
      email: "person@example.com",
      name: "Nguyen Van A",
      picture: "https://example.com/a.png",
    });
  });

  it("rejects a wrong audience", async () => {
    await expect(verify(await sign(goodClaims(), { aud: "other" }))).rejects.toThrow();
  });

  it("rejects a wrong issuer", async () => {
    await expect(verify(await sign(goodClaims(), { iss: "https://securetoken.google.com/other" }))).rejects.toThrow();
  });

  it("rejects an expired token", async () => {
    const past = Math.floor(Date.now() / 1000) - 3600;
    await expect(verify(await sign(goodClaims(), { exp: past }))).rejects.toThrow();
  });

  it("rejects an unverified email", async () => {
    await expect(verify(await sign({ ...goodClaims(), email_verified: false }))).rejects.toThrow(/xác minh/);
  });

  it("rejects when email_verified is missing", async () => {
    const claims = goodClaims();
    delete claims.email_verified;
    await expect(verify(await sign(claims))).rejects.toThrow();
  });

  it("rejects a provider other than google.com", async () => {
    await expect(
      verify(await sign({ ...goodClaims(), firebase: { sign_in_provider: "password" } })),
    ).rejects.toThrow(/Google/);
  });

  it("rejects a missing email", async () => {
    const claims = goodClaims();
    delete claims.email;
    await expect(verify(await sign(claims))).rejects.toThrow(/email/);
  });

  it("rejects a missing subject", async () => {
    await expect(verify(await sign(goodClaims(), { sub: null }))).rejects.toThrow();
  });

  it("rejects a token signed with a different key", async () => {
    const other = await generateKeyPair("RS256");
    const forged = await new SignJWT(goodClaims())
      .setProtectedHeader({ alg: "RS256", kid: "k1" })
      .setIssuer(ISS)
      .setAudience(PROJECT)
      .setSubject("uid-123")
      .setExpirationTime("1h")
      .sign(other.privateKey);
    await expect(verify(forged)).rejects.toThrow();
  });

  it("throws clearly when the project id is not configured", async () => {
    const prev = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    try {
      await expect(verifyFirebaseIdToken(await sign(), { jwks })).rejects.toThrow(/NEXT_PUBLIC_FIREBASE_PROJECT_ID/);
    } finally {
      if (prev !== undefined) process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = prev;
    }
  });
});

describe("identityFromClaims", () => {
  it("omits empty optional fields", () => {
    const id = identityFromClaims({
      sub: "u",
      email: "a@b.com",
      email_verified: true,
      name: "  ",
      firebase: { sign_in_provider: "google.com" },
    });
    expect(id).toEqual({ uid: "u", email: "a@b.com", name: undefined, picture: undefined });
  });
});
