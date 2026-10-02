/** Tài khoản admin duy nhất của hệ thống. Mọi tài khoản khác luôn là USER, bất kể giá trị `role` trong DB. */
export const ADMIN_EMAIL = "trinhphuong.dev@gmail.com";

export function roleForEmail(email: string): "USER" | "ADMIN" {
  return email.trim().toLowerCase() === ADMIN_EMAIL ? "ADMIN" : "USER";
}
