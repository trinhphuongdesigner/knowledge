# Admin / Management System — Kế hoạch triển khai

> Nguồn sự thật cho các agent làm khu vực `/admin`. Mỗi wave có **quyền sở hữu file** riêng — KHÔNG sửa file ngoài phạm vi của mình
> (nếu bắt buộc, ghi lại trong báo cáo cuối). Xong việc thì tick vào mục **Tiến độ** cuối file.
>
> Bắt buộc: đây là **Next.js 16** (middleware = `src/proxy.ts`, params là Promise, …) và **Prisma 7** (client ở `src/generated/prisma`).
> Đọc docs trong `node_modules/next/dist/docs/` trước khi viết API/route mới. Bắt chước style code hiện có
> (UI tiếng Việt, Tailwind tokens `ink-*`/`brand-*`/`accent`, components trong `src/components/ui`, helper trong `src/lib/http.ts`).

## Quyết định đã chốt

- Chỉ **1 admin** (email cố định trong `src/lib/auth/admin.ts`) — giữ nguyên.
- Người không phải admin vào `/admin/**` hoặc `/api/admin/**` → **404** (như thể không tồn tại).
- **Category dùng chung toàn hệ thống**, chỉ admin tạo/sửa/xoá. Gộp category cũ theo `lower(trim(name))`, **giữ bản cũ nhất** (createdAt nhỏ nhất; bằng nhau thì id nhỏ nhất).
- Có **khoá** và **xoá** tài khoản. Không được khoá/xoá chính admin.
- Không làm impersonate.
- Không thêm thư viện chart — vẽ bằng SVG/CSS.

## Thay đổi schema (Wave A, 1 migration duy nhất `20261005000000_admin_management`)

```prisma
model Category {
  id        String        @id @default(uuid(7)) @db.Uuid
  name      String        @unique            // + unique index lower(name) bằng SQL thô
  color     CategoryColor @default(BLUE)
  isEnglish Boolean       @default(false)
  position  Int           @default(0)       // admin sắp xếp
  sets      StudySet[]
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
}

model User {
  ...
  lastLoginAt     DateTime?   // cập nhật mỗi lần đăng nhập Google thành công
  disabledAt      DateTime?   // != null → bị khoá: không đăng nhập, mọi session bị từ chối
  disabledReason  String?
  quotaSets       Int?        // override hạn mức (null = dùng mặc định QUOTA)
  quotaCards      Int?
  quotaAiPerDay   Int?
  adminLogs       AdminAuditLog[]
}

model StudySet { ... featured Boolean @default(false) ... }   // bộ nổi bật ở /library

model AdminAuditLog {
  id         String   @id @default(uuid(7)) @db.Uuid
  adminId    String?  @db.Uuid
  admin      User?    @relation(fields: [adminId], references: [id], onDelete: SetNull)
  action     String   // vd "user.disable", "user.delete", "category.create", "set.unpublish", "notify.broadcast"
  targetType String   // "user" | "category" | "set" | "system"
  targetId   String?
  summary    String   // mô tả ngắn tiếng Việt (giữ được kể cả khi target đã bị xoá)
  meta       Json?
  createdAt  DateTime @default(now())
  @@index([createdAt])
  @@index([targetType, targetId])
}
```

SQL migration dữ liệu category (trong cùng migration, trước khi drop `userId`):
1. Tạo bảng tạm map `old_id → keep_id` với keep = bản cũ nhất của mỗi `lower(trim(name))`.
2. `UPDATE "StudySet" SET "categoryId" = keep_id` theo map.
3. `DELETE FROM "Category"` các bản không phải keep.
4. Trim tên, drop index/unique `(userId,name)`, drop FK + cột `userId`, thêm `UNIQUE(name)` + `CREATE UNIQUE INDEX ... ON "Category"(lower(name))`, set `position` theo thứ tự createdAt.

Backup trước migration: `scratchpad/knowledge-before-admin.dump` (pg_dump -Fc).

## Cấu trúc route

```
/admin                     Dashboard (KPI + biểu đồ 30 ngày + thống kê category)
/admin/users               Danh sách tài khoản (search/sort/filter/paginate server-side)
/admin/users/[id]          Chi tiết + thao tác (đăng xuất mọi thiết bị, khoá/mở, xoá, override hạn mức)
/admin/categories          CRUD category toàn hệ thống + sắp xếp + chuyển set rồi xoá
/admin/sets                Duyệt bộ PUBLIC chờ + quản lý bộ đã public (gỡ, nổi bật, số người lưu)
/admin/notifications       Gửi thông báo hệ thống (tất cả / user cụ thể / user hoạt động N ngày)
/admin/ai                  Thống kê dùng AI theo ngày + top user
/admin/audit               Nhật ký thao tác admin (phân trang, lọc theo action)
/admin/system              Cron jobs, dung lượng DB/bảng, chạy cleanup thủ công, LoginAttempt thất bại
```

API mới đều nằm dưới `/api/admin/**`, mỗi handler gọi `requireApiAdmin(req)`. Mọi thao tác ghi (POST/PATCH/DELETE) đều gọi `logAdminAction(...)`.

## Wave A — Nền tảng (1 agent, tuần tự) ✅ phải xong trước Wave B

Sở hữu: `prisma/**`, `src/lib/auth/**`, `src/app/(auth)/**`, `src/lib/categories.ts`, `src/lib/copy-set.ts`, `src/lib/library.ts`,
`src/lib/dto.ts`, `src/lib/validators.ts`, `src/lib/api.ts`, `src/app/api/categories/**`, `src/app/api/sets/**`, `src/app/categories/**`,
`src/app/library/**`, `src/app/page.tsx`, `src/app/sets/**`, `src/components/sets/**`, `src/components/layout/**`,
`src/components/categories/**` (chỉ sửa để bỏ phụ thuộc userId; CategoryManager sẽ được Wave B3 chuyển sang admin),
`src/lib/admin/**` (mới), `src/app/admin/layout.tsx`, `src/components/admin/AdminNav.tsx`, `src/lib/quota*.ts`, `src/app/api/ai/**`, `src/lib/ai*.ts`.

1. Schema + migration như trên (`npx prisma migrate dev --create-only --name admin_management`, sửa SQL, rồi `npx prisma migrate dev`). Cập nhật `prisma/seed.ts` để seed 2 category mặc định global (upsert theo name).
2. Auth:
   - `requireAdmin()` (page: không phải admin → `notFound()`), `requireApiAdmin(req)` (trả 404 Response) trong `src/lib/auth/dal.ts`.
   - `SessionUser` thêm gì cần thiết; `validateSession` từ chối user có `disabledAt`.
   - Đăng nhập Google: user bị khoá → trả lỗi "Tài khoản đã bị khoá" và không tạo session; thành công → set `lastLoginAt = now()`.
   - Bỏ tạo category mặc định khi đăng ký.
3. Category global: `listCategories()` không tham số (order by position, createdAt), `getCategory(id)`, `categoryExists(id)` thay `userOwnsCategory`, `findDuplicateCategory(name, exceptId?)`. `copy-set` giữ nguyên `categoryId` của bộ gốc (xoá `pickCategoryFor`). Library lọc theo category **id** (giữ tương thích nếu query là tên cũ thì map tên → id). Sửa test `src/lib/__tests__/categories.test.ts` nếu cần.
4. API category: `GET /api/categories` cho mọi user; **xoá** POST/PATCH/DELETE khỏi `/api/categories` (chuyển sang `/api/admin/categories` ở Wave B3). `/categories` page: admin → redirect `/admin/categories`, người khác → redirect `/`. Bỏ link "Quản lý danh mục" cho user thường trong UserMenu / SetFilters / SetForm (admin thì trỏ tới `/admin/categories`).
5. Quota override: `checkQuota` dùng `quotaSets/quotaCards` của user nếu khác null; AI dùng `quotaAiPerDay`. Thêm hàm thuần `effectiveLimits(base, overrides)` + test vitest.
6. `src/lib/admin/audit.ts`: `logAdminAction(adminId, { action, targetType, targetId?, summary, meta? })` — không ném lỗi ra ngoài (log console).
7. `src/app/admin/layout.tsx` gọi `requireAdmin()`; `src/components/admin/AdminNav.tsx` có **đủ** 9 mục route ở trên (sidebar ≥ lg, thanh tab cuộn ngang trên mobile, highlight mục active). Mỗi page vẫn phải tự gọi `requireAdmin()`.
8. Giữ `src/app/admin/page.tsx` hiện tại chạy được (Wave B1 sẽ viết lại). Chuyển `PendingSets.tsx` thành `src/components/admin/PendingSets.tsx`.
9. Kiểm tra: `npx tsc --noEmit`, `npm test`, `npm run lint` đều sạch.

## Wave B — Song song 3 agent (file tách biệt, KHÔNG chạy `npm run build`, chỉ `npx tsc --noEmit` + `npm test`)

### B1 — Dashboard, AI, Audit, System
Sở hữu: `src/app/admin/page.tsx`, `src/app/admin/ai/**`, `src/app/admin/audit/**`, `src/app/admin/system/**`,
`src/app/api/admin/system/**`, `src/components/admin/charts/**`, `src/components/admin/dashboard/**`, `src/lib/admin/stats.ts`.
- Dashboard: KPI (tổng user, mới 7/30 ngày, hoạt động 7 ngày từ `StudyDay`, bộ theo visibility, tổng thẻ, chờ duyệt, bị khoá, dung lượng DB); biểu đồ cột 30 ngày: đăng ký/ngày và lượt ôn/ngày (SVG, có tooltip `<title>`, dark mode OK); bảng category (số bộ, số thẻ). Link nhanh tới các trang khác.
- `/admin/ai`: lượt AI/ngày 30 ngày, top 10 user hôm nay & 30 ngày, hạn mức hiệu lực.
- `/admin/audit`: bảng log phân trang 50/trang, lọc theo `action` prefix (user/category/set/notify/system).
- `/admin/system`: cron (`JobRun`), dung lượng DB + top bảng (chuyển từ dashboard cũ), nút "Chạy cleanup ngay" (`POST /api/admin/system/cleanup` gọi hàm trong `src/lib/cleanup.ts`, có audit log), LoginAttempt thất bại 24h theo IP/email (top 10).

### B2 — Quản lý tài khoản
Sở hữu: `src/app/admin/users/**`, `src/app/api/admin/users/**`, `src/components/admin/users/**`, `src/lib/admin/users.ts`.
- Danh sách: avatar, tên, email, ngày đăng ký, onboard, lần đăng nhập cuối (`lastLoginAt`), lần học cuối (max `StudyDay.day`), số bộ, số thẻ (+% hạn mức hiệu lực), số bộ đã lưu, tổng lượt ôn, trạng thái khoá. Search email/tên, sort (createdAt, lastLoginAt, cards, sets), filter (chưa onboard, không hoạt động >30 ngày, gần chạm hạn mức ≥80%, bị khoá), phân trang 25/trang qua searchParams. Một query SQL tổng hợp (không N+1).
- Chi tiết `/admin/users/[id]`: hồ sơ, danh sách bộ (link), streak/lịch sử 30 ngày, AI usage, phiên đăng nhập (userAgent, createdAt, expiresAt), số thiết bị push, log audit liên quan user.
- Thao tác (API dưới `/api/admin/users/[id]/...`, có audit log, có modal xác nhận):
  - Đăng xuất mọi thiết bị (xoá `Session`).
  - Khoá (nhập lý do) / mở khoá — khoá thì xoá luôn session.
  - Xoá tài khoản: modal bắt gõ lại email; cảnh báo số bộ PUBLIC & số người đang lưu sẽ mất.
  - Override hạn mức (sets/cards/AI/ngày; để trống = mặc định).
  - Chặn mọi thao tác trên chính tài khoản admin (server-side).

### B3 — Category, Thư viện, Thông báo
Sở hữu: `src/app/admin/categories/**`, `src/app/admin/sets/**`, `src/app/admin/notifications/**`, `src/app/api/admin/categories/**`,
`src/app/api/admin/sets/**`, `src/app/api/admin/notifications/**`, `src/components/admin/categories/**`, `src/components/admin/sets/**`,
`src/components/admin/notifications/**`, `src/components/admin/PendingSets.tsx`, `src/components/categories/CategoryManager.tsx`, `src/components/categories/CategoryFormModal.tsx`, `src/lib/admin/broadcast.ts`.
- `/admin/categories`: dùng lại CategoryManager/CategoryFormModal (gọi `/api/admin/categories`), thêm sắp xếp lên/xuống (position), số bộ + số thẻ, xoá: nếu còn bộ → chọn category đích để chuyển toàn bộ bộ rồi xoá (1 transaction). Trùng tên không phân biệt hoa/thường → 409.
- `/admin/sets`: tab "Chờ duyệt" (PendingSets hiện có, PATCH approve giữ nguyên) + tab "Đã public": tìm kiếm, số thẻ, số người lưu, chủ bộ, nút **Gỡ khỏi thư viện** (approved=false, visibility=LINK, notify chủ bộ) và toggle **Nổi bật** (`featured`). Hiển thị bộ nổi bật trước trong `/library` — sửa tối thiểu `src/lib/library.ts` (orderBy featured desc) + badge "Nổi bật" trong `src/app/library/page.tsx` (được phép sửa 2 file này ở B3).
- `/admin/notifications`: form tiêu đề/nội dung/href (href phải là đường dẫn tương đối bắt đầu bằng `/`), đối tượng: tất cả / hoạt động trong N ngày / 1 email. Gửi qua `notify()` (type SYSTEM) theo lô (vd 50/lô), trả về số đã gửi; xem trước số người nhận trước khi gửi; audit log. Lịch sử 20 lần broadcast gần nhất lấy từ audit log.

## Wave C — Kiểm tra & hoàn thiện (agent chính)
- `npx tsc --noEmit`, `npm test`, `npm run lint`, `npm run build`.
- Chạy app, kiểm tra từng trang admin bằng trình duyệt (desktop + mobile 390px, light/dark), kiểm tra user thường bị 404.
- Review diff, sửa lỗi, cập nhật Tiến độ.

## Tiến độ
- [x] Wave A — Nền tảng
- [x] Wave B1 — Dashboard / AI / Audit / System
- [x] Wave B2 — Tài khoản
- [x] Wave B3 — Category / Thư viện / Thông báo
- [x] Wave C — Kiểm tra (tsc, lint, 382 test, build, smoke test API trên DB local)
