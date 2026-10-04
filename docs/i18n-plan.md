# Plan: Đa ngữ giao diện (i18n)

## 1. Yêu cầu

- Ngôn ngữ giao diện hỗ trợ: `en` (mặc định / fallback), `vi`, `zh`, `ja`, `ko`, `ru`, `fr`, `th`.
- Hai khái niệm tách biệt trên `User`:
  - `nativeLanguage` (đã có, ISO 639-1, chọn ở `/welcome`) — ngôn ngữ mẹ đẻ, dùng cho học tập.
  - `uiLanguage` (mới) — ngôn ngữ hiển thị, chọn bằng dropdown có cờ trong **Cài đặt tài khoản**.
- Lần đầu (hoàn tất onboarding): `uiLanguage = nativeLanguage` nếu thuộc 8 ngôn ngữ hỗ trợ, ngược lại `en`.
- Chưa đăng nhập (login, about, privacy, terms, /s/[token]): cookie `kn_locale` nếu có, ngược lại `en`.
- Chỉ dịch giao diện. Nội dung người dùng (bộ thẻ, thẻ, danh mục) giữ nguyên.

## 2. Kiến trúc (không thêm thư viện)

Không dùng URL prefix (`/vi/...`) vì ngôn ngữ là cài đặt cá nhân, không phải SEO. Tự làm lớp mỏng, typed — giống `gutan-shop/shop/i18n` nhưng có kiểm tra kiểu:

```
src/i18n/
  config.ts          LOCALES, DEFAULT_LOCALE="en", isLocale(), resolveLocale(user, cookie)
  flags.ts           cờ 8 nước (copy từ gutan-shop/shop/i18n/flags.ts, key "en" = cờ Anh)
  messages/
    en/<namespace>.ts   ← nguồn chuẩn, định nghĩa kiểu
    vi/<namespace>.ts   ← chuỗi hiện có trong code
    zh|ja|ko|ru|fr|th/<namespace>.ts   ← `satisfies Messages<"namespace">`
    index.ts         loadMessages(locale) — dynamic import theo locale
  server.ts          getLocale() (cache theo request), getT(namespace) cho Server Component / action / route
  client.tsx         <I18nProvider locale messages> + useT(namespace), useLocale()
  format.ts          formatDate/number/relative theo locale (thay các chỗ "vi-VN" hard-code — 21 chỗ)
```

- `t("key", { count, name })`: nội suy `{name}`, số nhiều qua `Intl.PluralRules` với key dạng `{ one, other }`.
- Kiểu: key và tham số được suy ra từ `messages/en`; thiếu key ở locale khác → lỗi `tsc`. Runtime fallback về `en`.
- Namespace chia theo khu vực để mỗi sub-agent sở hữu file riêng, không đụng nhau:
  `common, layout, auth, account, sets, cards, study, quiz, review, library, search, categories, import, notifications, stats, errors (API + validators), admin, legal`.

### Xác định locale mỗi request
1. Đã đăng nhập: `user.uiLanguage` (đọc qua `getCurrentUser()` đã `cache`).
2. Ngược lại: cookie `kn_locale`.
3. Ngược lại: `en`.

Khi đăng nhập / đổi ngôn ngữ → ghi cookie `kn_locale` để trang công khai và `proxy.ts` (API 401) cũng đúng ngôn ngữ.

### Layout & font
- `<html lang={locale}>`, `generateMetadata` theo locale (OG `locale`).
- Be Vietnam Pro / Lexend không có Cyrillic/CJK/Thai → thêm `subsets: ["latin","vietnamese","cyrillic"?]` nếu có, và font-stack fallback hệ thống: `"Noto Sans", "PingFang SC", "Hiragino Sans", "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans Thai", "Leelawadee UI", system-ui`. Không tải web-font CJK (quá nặng).

### Dữ liệu
- Prisma migration: `User.uiLanguage String? // một trong LOCALES`.
- Backfill user cũ: `uiLanguage = nativeLanguage` nếu thuộc LOCALES, ngược lại `'en'`.
- `completeOnboarding`: set `uiLanguage` theo quy tắc ở mục 1.
- `StudySettingsForm` / `ProfileForm`: thêm `UiLanguageSelect` (dropdown có cờ, tên ngôn ngữ viết bằng chính ngôn ngữ đó: English, Tiếng Việt, 中文, 日本語, 한국어, Русский, Français, ไทย). Lưu → server action cập nhật DB + cookie + `revalidatePath("/", "layout")`.
- Validator zod: `uiLanguage: z.enum(LOCALES)`.

### Phía server khác
- API route / server action trả lỗi: dùng `getT("errors")`.
- Thông báo push / nhắc học (cron) gửi cho người khác: dùng `uiLanguage` của **người nhận**, không phải cookie.
- `LanguageCombobox` (chọn tiếng mẹ đẻ): `languageOptions(locale)` thay vì `"vi"` cố định.
- Trang legal (privacy, terms): dịch đầy đủ cả 8 ngôn ngữ.
- Trang admin: chỉ `en` + `vi`; locale khác fallback `en` (namespace `admin` miễn kiểm tra parity).
- `/welcome`: tiếng mẹ đẻ mặc định vẫn là `vi` (`DEFAULT_NATIVE_LANGUAGE`).

## 3. Chia task cho sub-agent (Sonnet)

Mỗi agent sở hữu file/namespace riêng → chạy song song không xung đột.

| Pha | Agent | Việc | Phụ thuộc |
|---|---|---|---|
| **P0** | 1 agent | `src/i18n/*` (config, server, client, format, flags, loader, kiểu), migration + backfill, `<html lang>`, font fallback, cookie, `resolveLocale` + unit test | — |
| **P1** | 1 agent | `uiLanguage` trong onboarding, dropdown cờ ở cài đặt tài khoản, action lưu, validator | P0 |
| **P2** (song song, 4 agent) | A | `layout, common, auth, account, notifications` | P0 |
| | B | `sets, cards, library, search, categories, import` | P0 |
| | C | `study, quiz, review, stats` + `format.ts` thay `vi-VN` | P0 |
| | D | `errors` (API routes, validators, proxy, cron/push) + `admin` | P0 |
| | | Mỗi agent: thay chuỗi hard-code bằng `t()`, viết `en` + `vi` cho namespace của mình | |
| **P3** (song song, 3 agent) | E | dịch `zh`, `ja` | P2 |
| | F | dịch `ko`, `th` | P2 |
| | G | dịch `ru`, `fr` | P2 |
| | E/F/G dịch mọi namespace kể cả `legal`, bỏ qua `admin` | |
| **P4** | tôi (Opus) | review, chạy kiểm thử, sửa sót | P3 |

## 4. Kiểm thử (chạy ngầm, không mở trình duyệt)

- **Unit (vitest)**:
  - `resolveLocale`: user có uiLanguage / native ngoài danh sách / chưa đăng nhập + cookie / không gì cả → `en`.
  - Parity: mọi locale có đúng bộ key của `en`, không chuỗi rỗng, placeholder `{x}` khớp.
  - `t()`: nội suy, số nhiều (ru có few/many), fallback `en`.
- **Lint chuỗi sót**: script `scripts/check-i18n.ts` grep ký tự có dấu tiếng Việt trong `src/**/*.tsx|ts` ngoài `src/i18n/messages/vi` và comment → fail nếu còn.
- **Tĩnh**: `tsc --noEmit`, `npm run lint`, `npm run build`.
- **Smoke HTTP headless**: chạy `next start` nền, `curl` với cookie `kn_locale=ja|th|ru` vào `/login`, `/about` → kiểm tra `<html lang="…">` và một chuỗi mong đợi; gọi API không cookie → message 401 đúng ngôn ngữ.

## 5. Ngoài phạm vi
- Dịch nội dung bộ thẻ / dữ liệu seed.
- URL theo locale, hreflang, SEO đa ngữ.
- RTL (không có ngôn ngữ RTL trong danh sách).
