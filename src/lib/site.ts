/** Địa chỉ gốc của site (không có dấu "/" cuối), dùng để dựng link tuyệt đối (vd link đặt lại mật khẩu). */
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
}
