/** Địa chỉ gốc của site (không có dấu "/" cuối), dùng để dựng link tuyệt đối. */
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
}
