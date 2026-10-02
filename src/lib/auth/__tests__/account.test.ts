import { describe, expect, it } from "vitest";
import { hashPassword, isPasswordHash } from "../password";
import { changePasswordSchema, updateProfileSchema } from "../../validators";

describe("isPasswordHash", () => {
  it("accepts a real hash", async () => {
    expect(isPasswordHash(await hashPassword("password-123"))).toBe(true);
  });

  it("rejects malformed values", () => {
    const bad = [
      "",
      "plain-password",
      "scrypt$1$2$3",
      "bcrypt$32768$8$1$AAAA$AAAA",
      "scrypt$x$8$1$AAAA$AAAA",
      "scrypt$32768$8$1$$",
      "scrypt$3$8$1$AAAA$AAAA",
      "scrypt$99999999$8$1$AAAA$AAAA",
      "scrypt$32768$8$1$AA AA$AAAA",
      "scrypt$32768$8$1$AAAA$AAAA$extra",
    ];
    for (const b of bad) expect(isPasswordHash(b)).toBe(false);
  });
});

describe("updateProfileSchema", () => {
  it("normalises email and trims name", () => {
    const r = updateProfileSchema.parse({ name: "  An  ", email: "  A@B.COM " });
    expect(r.name).toBe("An");
    expect(r.email).toBe("a@b.com");
  });

  it("allows an empty name", () => {
    expect(updateProfileSchema.safeParse({ name: "", email: "a@b.com" }).success).toBe(true);
  });

  it("rejects names over 80 chars and bad emails", () => {
    expect(updateProfileSchema.safeParse({ name: "x".repeat(81), email: "a@b.com" }).success).toBe(false);
    expect(updateProfileSchema.safeParse({ email: "nope" }).success).toBe(false);
    expect(updateProfileSchema.safeParse({ email: "" }).success).toBe(false);
  });
});

describe("changePasswordSchema", () => {
  const ok = { currentPassword: "old-password", newPassword: "new-password", confirmPassword: "new-password" };

  it("accepts a valid change", () => {
    expect(changePasswordSchema.safeParse(ok).success).toBe(true);
  });

  it("requires the current password", () => {
    expect(changePasswordSchema.safeParse({ ...ok, currentPassword: "" }).success).toBe(false);
  });

  it("enforces 8-128 characters for the new password", () => {
    const short = { ...ok, newPassword: "short", confirmPassword: "short" };
    expect(changePasswordSchema.safeParse(short).success).toBe(false);
    const long = "x".repeat(129);
    expect(changePasswordSchema.safeParse({ ...ok, newPassword: long, confirmPassword: long }).success).toBe(false);
    const max = "x".repeat(128);
    expect(changePasswordSchema.safeParse({ ...ok, newPassword: max, confirmPassword: max }).success).toBe(true);
  });

  it("flags a mismatched confirmation on confirmPassword", () => {
    const r = changePasswordSchema.safeParse({ ...ok, confirmPassword: "different-1" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.flatten().fieldErrors.confirmPassword).toBeDefined();
  });

  it("rejects a new password equal to the current one", () => {
    const r = changePasswordSchema.safeParse({
      currentPassword: "same-password",
      newPassword: "same-password",
      confirmPassword: "same-password",
    });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.flatten().fieldErrors.newPassword).toBeDefined();
  });
});
