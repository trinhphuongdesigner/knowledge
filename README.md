# Knowledge

Ứng dụng web học tập bằng **flashcard** (lấy cảm hứng từ Quizlet) cho hai lĩnh vực **Công nghệ (IT)** và **Tiếng Anh**. Giao diện tiếng Việt, tông xanh dương / trắng, tối giản và responsive (ưu tiên mobile).

## Tính năng

- Quản lý **bộ học** (tạo, sửa, xoá) theo lĩnh vực IT / Tiếng Anh; lọc theo lĩnh vực và tìm kiếm theo tên.
- Quản lý **thẻ** trong bộ học: thêm nhanh (Ctrl/Cmd + Enter), sửa trực tiếp, xoá có xác nhận.
- **Import** thẻ từ CSV, Excel (.xlsx/.xls), Markdown hoặc dán văn bản; xem trước, sửa/xoá từng dòng rồi mới lưu; chế độ *Thêm vào cuối* hoặc *Thay thế toàn bộ*.
- **Học flashcard**: lật thẻ 3D, xáo trộn, đổi mặt hiển thị, đánh dấu Đã thuộc / Chưa thuộc, thanh tiến độ, màn hình kết thúc, học lại thẻ chưa thuộc. Tiến độ lưu trong `localStorage` theo từng bộ học.
- **Phiên âm + phát âm (bộ Tiếng Anh)**: thẻ có thêm phiên âm IPA, từ loại và audio, hiển thị dạng `able (adjective) /ˈeɪbl/` kèm nút loa. Dữ liệu tra tự động từ [dictionaryapi.dev](https://dictionaryapi.dev) (miễn phí, không cần key) khi thêm thẻ, khi import, hoặc bấm **Tra phiên âm** ở trang bộ học; có nút **Tự tra** trong biểu mẫu thẻ. Không có audio thì dùng giọng đọc của trình duyệt (en-US).

> **Lưu ý:** chỉ tính năng tra phiên âm cần internet (server gọi dictionaryapi.dev, timeout 5 giây). Khi mất mạng hoặc từ không có trong từ điển, thẻ vẫn được tạo/import bình thường — bạn có thể nhập phiên âm thủ công. Phần còn lại của ứng dụng chạy hoàn toàn offline.

## Stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript strict
- Tailwind CSS v4, `lucide-react`
- PostgreSQL 16 (docker compose) + Prisma 7 (`@prisma/adapter-pg`)
- `zod` 4 (validate dùng chung client + server)
- `papaparse` (CSV), `xlsx` (SheetJS), parser Markdown tự viết
- `vitest` cho test parser import

## Yêu cầu

- Node.js 20.9 trở lên (khuyến nghị bản LTS mới nhất) và npm
- Docker + Docker Compose (để chạy PostgreSQL local)

## Cài đặt

```bash
# 1. Cài dependencies (tự chạy prisma generate)
npm install

# 2. Tạo file môi trường
cp .env.example .env

# 3. Khởi động PostgreSQL (cổng 5433)
npm run db:up

# 4. Tạo bảng (áp dụng migration `init`)
npx prisma migrate deploy      # hoặc: npm run db:migrate (prisma migrate dev)

# 5. Nạp dữ liệu mẫu (bộ từ vựng Tiếng Anh + bộ câu hỏi phỏng vấn Frontend)
npm run db:seed

# 6. Chạy ứng dụng
npm run dev
```

Mở http://localhost:3000. Chạy bản production: `npm run build` rồi `npm run start`.

## Cơ sở dữ liệu

- **Id là UUID v7** (`@default(uuid(7)) @db.Uuid`, sinh bởi Prisma, sắp xếp theo thời gian). Id sai định dạng ở API trả 404, ở trang trả trang 404.
- **Cấp độ**: `StudySet.level` (tuỳ chọn) là `BASIC` (Cơ bản) / `INTERMEDIATE` (Trung cấp) / `ADVANCED` (Nâng cao). Lọc ở `GET /api/sets?level=ADVANCED`.
- Dự án mới nên chỉ có **một migration `init`** (`prisma/migrations`). Sau khi sửa `schema.prisma` trong giai đoạn đầu, có thể xoá lại từ đầu như sau.

Reset toàn bộ DB và tạo lại migration `init`:

```bash
rm -rf prisma/migrations/2*            # giữ migration_lock.toml
docker exec knowledge-db psql -U knowledge -d knowledge -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
npx prisma migrate dev --name init     # tạo migration mới + sinh client
npm run db:seed
```

(Khi đã có migration, `npx prisma migrate reset --force` xoá DB, áp dụng lại migration và chạy seed.)

### Dùng Supabase thay Docker

Trong `.env`, comment `DATABASE_URL` local rồi bỏ comment khối Supabase, thay `[YOUR-PASSWORD]` (URL-encode nếu có ký tự đặc biệt):

- `DATABASE_URL`: Transaction pooler (cổng **6543**), dùng cho app lúc chạy (phù hợp serverless).
- `DIRECT_URL`: Session pooler (cổng **5432**), dùng cho Prisma CLI (`migrate`, `db seed`). `prisma.config.ts` ưu tiên `DIRECT_URL` nếu có.

Sau đó chạy `npx prisma migrate deploy` và `npm run db:seed` như bình thường (bỏ qua bước `npm run db:up`).

### Seed

`npm run db:seed` (cần `ADMIN_EMAIL`/`ADMIN_PASSWORD`, xem mục Đăng nhập) **xoá bộ học/thẻ của tài khoản admin** rồi tạo lại (chạy lại bao nhiêu lần cũng được). Nguồn dữ liệu:

1. `prisma/seed-data/vocab/*.json`: các bộ từ vựng / câu hỏi HR Tiếng Anh (mỗi file một bộ: `slug`, `order`, `title`, `description`, `category`, `level`, `cards[]` với `question`, `answer`, `explanation?`, `phonetic?`, `partOfSpeech?`). File không hợp lệ bị cảnh báo và bỏ qua; thư mục trống/thiếu vẫn chạy được.
2. `prisma/seed-data/frontend-handbook.md`: chỉ lấy **PHẦN II**, mỗi mục `## N. Tên` thành một bộ IT `Phỏng vấn Frontend · <Tên>` (parser Markdown kiểu "câu hỏi in đậm", xem bên dưới).

Thứ tự hiển thị trên trang chủ (mới nhất trước): Life & Work, Câu hỏi HR, IT English, Phỏng vấn Frontend (mỗi nhóm theo `order`). Seed in tổng số bộ/thẻ của từng nguồn.

## Đăng nhập & phân quyền dữ liệu

Mỗi bộ học/thẻ thuộc về đúng một user; user chỉ thấy và sửa dữ liệu của mình (bộ không thuộc user trả **404**, chưa đăng nhập ở API trả **401**).

- **Cách hoạt động**: email + mật khẩu tự xây (không dùng thư viện/dịch vụ auth). Mật khẩu băm bằng `node:crypto` scrypt (N=2^15, r=8, p=1) kèm salt, lưu dạng `scrypt$N$r$p$salt$hash`. Đăng nhập tạo session ngẫu nhiên 32 byte trong cookie `kn_session` (`httpOnly`, `sameSite=lax`, `secure` khi production, 30 ngày, gia hạn trượt khi còn < 15 ngày ở DB, và `src/proxy.ts` đặt lại cookie mỗi request); DB chỉ lưu `sha256(token)`. Đăng xuất xoá session trong DB và cookie.
- **Kiểm tra 2 lớp**: `src/proxy.ts` chỉ kiểm tra lạc quan sự có mặt của cookie (redirect `/login?next=…`, API không cookie → 401); kiểm tra thật nằm ở DAL `src/lib/auth/dal.ts` (`requireUser`, `requireApiUser`).
- **Chống lạm dụng**: rate limit lưu DB (đăng nhập sai ≥ 5 lần/15 phút theo email hoặc ≥ 20 lần theo IP; đăng ký ≥ 5 lần/giờ/IP), Route Handler ghi kiểm tra `Origin` trùng `Host` (CSRF), `?next=` chỉ nhận đường dẫn nội bộ, security headers trong `next.config.ts`.
- **`ALLOW_REGISTRATION`**: đặt `"false"` để tắt đăng ký tài khoản mới (mặc định bật).
- **Seed admin**: `npm run db:seed` cần `ADMIN_EMAIL` và `ADMIN_PASSWORD_HASH` (ưu tiên) hoặc `ADMIN_PASSWORD` (≥ 8 ký tự), tuỳ chọn `ADMIN_NAME` (mặc định "Admin"). Seed tạo/cập nhật tài khoản admin và **chỉ thay bộ học của admin** (36 bộ / 994 thẻ); dữ liệu user khác không bị đụng tới.

  ```bash
  ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD='mat-khau-manh' npm run db:seed
  ```

- **Mật khẩu admin dạng hash**: để không lưu mật khẩu thô trong `.env`, tạo hash bằng `npm run auth:hash` (nhập mật khẩu không hiện ký tự; hoặc qua pipe: `echo 'mat-khau-manh' | npm run -s auth:hash`), rồi đặt vào `.env` **trong nháy đơn** (Prisma CLI dùng dotenv, không expand `# Knowledge

Ứng dụng web học tập bằng **flashcard** (lấy cảm hứng từ Quizlet) cho hai lĩnh vực **Công nghệ (IT)** và **Tiếng Anh**. Giao diện tiếng Việt, tông xanh dương / trắng, tối giản và responsive (ưu tiên mobile).

## Tính năng

- Quản lý **bộ học** (tạo, sửa, xoá) theo lĩnh vực IT / Tiếng Anh; lọc theo lĩnh vực và tìm kiếm theo tên.
- Quản lý **thẻ** trong bộ học: thêm nhanh (Ctrl/Cmd + Enter), sửa trực tiếp, xoá có xác nhận.
- **Import** thẻ từ CSV, Excel (.xlsx/.xls), Markdown hoặc dán văn bản; xem trước, sửa/xoá từng dòng rồi mới lưu; chế độ *Thêm vào cuối* hoặc *Thay thế toàn bộ*.
- **Học flashcard**: lật thẻ 3D, xáo trộn, đổi mặt hiển thị, đánh dấu Đã thuộc / Chưa thuộc, thanh tiến độ, màn hình kết thúc, học lại thẻ chưa thuộc. Tiến độ lưu trong `localStorage` theo từng bộ học.
- **Phiên âm + phát âm (bộ Tiếng Anh)**: thẻ có thêm phiên âm IPA, từ loại và audio, hiển thị dạng `able (adjective) /ˈeɪbl/` kèm nút loa. Dữ liệu tra tự động từ [dictionaryapi.dev](https://dictionaryapi.dev) (miễn phí, không cần key) khi thêm thẻ, khi import, hoặc bấm **Tra phiên âm** ở trang bộ học; có nút **Tự tra** trong biểu mẫu thẻ. Không có audio thì dùng giọng đọc của trình duyệt (en-US).

> **Lưu ý:** chỉ tính năng tra phiên âm cần internet (server gọi dictionaryapi.dev, timeout 5 giây). Khi mất mạng hoặc từ không có trong từ điển, thẻ vẫn được tạo/import bình thường — bạn có thể nhập phiên âm thủ công. Phần còn lại của ứng dụng chạy hoàn toàn offline.

## Stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript strict
- Tailwind CSS v4, `lucide-react`
- PostgreSQL 16 (docker compose) + Prisma 7 (`@prisma/adapter-pg`)
- `zod` 4 (validate dùng chung client + server)
- `papaparse` (CSV), `xlsx` (SheetJS), parser Markdown tự viết
- `vitest` cho test parser import

## Yêu cầu

- Node.js 20.9 trở lên (khuyến nghị bản LTS mới nhất) và npm
- Docker + Docker Compose (để chạy PostgreSQL local)

## Cài đặt

```bash
# 1. Cài dependencies (tự chạy prisma generate)
npm install

# 2. Tạo file môi trường
cp .env.example .env

# 3. Khởi động PostgreSQL (cổng 5433)
npm run db:up

# 4. Tạo bảng (áp dụng migration `init`)
npx prisma migrate deploy      # hoặc: npm run db:migrate (prisma migrate dev)

# 5. Nạp dữ liệu mẫu (bộ từ vựng Tiếng Anh + bộ câu hỏi phỏng vấn Frontend)
npm run db:seed

# 6. Chạy ứng dụng
npm run dev
```

Mở http://localhost:3000. Chạy bản production: `npm run build` rồi `npm run start`.

## Cơ sở dữ liệu

- **Id là UUID v7** (`@default(uuid(7)) @db.Uuid`, sinh bởi Prisma, sắp xếp theo thời gian). Id sai định dạng ở API trả 404, ở trang trả trang 404.
- **Cấp độ**: `StudySet.level` (tuỳ chọn) là `BASIC` (Cơ bản) / `INTERMEDIATE` (Trung cấp) / `ADVANCED` (Nâng cao). Lọc ở `GET /api/sets?level=ADVANCED`.
- Dự án mới nên chỉ có **một migration `init`** (`prisma/migrations`). Sau khi sửa `schema.prisma` trong giai đoạn đầu, có thể xoá lại từ đầu như sau.

Reset toàn bộ DB và tạo lại migration `init`:

```bash
rm -rf prisma/migrations/2*            # giữ migration_lock.toml
docker exec knowledge-db psql -U knowledge -d knowledge -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
npx prisma migrate dev --name init     # tạo migration mới + sinh client
npm run db:seed
```

(Khi đã có migration, `npx prisma migrate reset --force` xoá DB, áp dụng lại migration và chạy seed.)

### Dùng Supabase thay Docker

Trong `.env`, comment `DATABASE_URL` local rồi bỏ comment khối Supabase, thay `[YOUR-PASSWORD]` (URL-encode nếu có ký tự đặc biệt):

- `DATABASE_URL`: Transaction pooler (cổng **6543**), dùng cho app lúc chạy (phù hợp serverless).
- `DIRECT_URL`: Session pooler (cổng **5432**), dùng cho Prisma CLI (`migrate`, `db seed`). `prisma.config.ts` ưu tiên `DIRECT_URL` nếu có.

Sau đó chạy `npx prisma migrate deploy` và `npm run db:seed` như bình thường (bỏ qua bước `npm run db:up`).

### Seed

`npm run db:seed` (cần `ADMIN_EMAIL`/`ADMIN_PASSWORD`, xem mục Đăng nhập) **xoá bộ học/thẻ của tài khoản admin** rồi tạo lại (chạy lại bao nhiêu lần cũng được). Nguồn dữ liệu:

1. `prisma/seed-data/vocab/*.json`: các bộ từ vựng / câu hỏi HR Tiếng Anh (mỗi file một bộ: `slug`, `order`, `title`, `description`, `category`, `level`, `cards[]` với `question`, `answer`, `explanation?`, `phonetic?`, `partOfSpeech?`). File không hợp lệ bị cảnh báo và bỏ qua; thư mục trống/thiếu vẫn chạy được.
2. `prisma/seed-data/frontend-handbook.md`: chỉ lấy **PHẦN II**, mỗi mục `## N. Tên` thành một bộ IT `Phỏng vấn Frontend · <Tên>` (parser Markdown kiểu "câu hỏi in đậm", xem bên dưới).

Thứ tự hiển thị trên trang chủ (mới nhất trước): Life & Work, Câu hỏi HR, IT English, Phỏng vấn Frontend (mỗi nhóm theo `order`). Seed in tổng số bộ/thẻ của từng nguồn.

## Đăng nhập & phân quyền dữ liệu

Mỗi bộ học/thẻ thuộc về đúng một user; user chỉ thấy và sửa dữ liệu của mình (bộ không thuộc user trả **404**, chưa đăng nhập ở API trả **401**).

- **Cách hoạt động**: email + mật khẩu tự xây (không dùng thư viện/dịch vụ auth). Mật khẩu băm bằng `node:crypto` scrypt (N=2^15, r=8, p=1) kèm salt, lưu dạng `scrypt$N$r$p$salt$hash`. Đăng nhập tạo session ngẫu nhiên 32 byte trong cookie `kn_session` (`httpOnly`, `sameSite=lax`, `secure` khi production, 30 ngày, gia hạn trượt khi còn < 15 ngày ở DB, và `src/proxy.ts` đặt lại cookie mỗi request); DB chỉ lưu `sha256(token)`. Đăng xuất xoá session trong DB và cookie.
- **Kiểm tra 2 lớp**: `src/proxy.ts` chỉ kiểm tra lạc quan sự có mặt của cookie (redirect `/login?next=…`, API không cookie → 401); kiểm tra thật nằm ở DAL `src/lib/auth/dal.ts` (`requireUser`, `requireApiUser`).
- **Chống lạm dụng**: rate limit lưu DB (đăng nhập sai ≥ 5 lần/15 phút theo email hoặc ≥ 20 lần theo IP; đăng ký ≥ 5 lần/giờ/IP), Route Handler ghi kiểm tra `Origin` trùng `Host` (CSRF), `?next=` chỉ nhận đường dẫn nội bộ, security headers trong `next.config.ts`.
- **`ALLOW_REGISTRATION`**: đặt `"false"` để tắt đăng ký tài khoản mới (mặc định bật).
- **Seed admin**: `npm run db:seed` cần `ADMIN_EMAIL` và `ADMIN_PASSWORD_HASH` (ưu tiên) hoặc `ADMIN_PASSWORD` (≥ 8 ký tự), tuỳ chọn `ADMIN_NAME` (mặc định "Admin"). Seed tạo/cập nhật tài khoản admin và **chỉ thay bộ học của admin** (36 bộ / 994 thẻ); dữ liệu user khác không bị đụng tới.

):

  ```
  ADMIN_PASSWORD_HASH='scrypt$32768$8$1$...$...'
  ```

  Khi có `ADMIN_PASSWORD_HASH`, seed bỏ qua `ADMIN_PASSWORD`.
- **Quản lý tài khoản**: menu avatar → "Quản lý tài khoản" (`/account`): tab *Thông tin* (đổi tên, email — đổi email cần mật khẩu hiện tại) và tab *Mật khẩu* (đổi mật khẩu; các thiết bị/phiên khác bị đăng xuất, phiên hiện tại giữ nguyên). Nhập sai mật khẩu hiện tại được tính vào rate limit đăng nhập.

- **Biến môi trường khi deploy (Supabase + Vercel)**: `DATABASE_URL` (Transaction pooler, 6543), `DIRECT_URL` (Session pooler, 5432; dùng cho migrate/seed), `ALLOW_REGISTRATION` (tuỳ chọn). `ADMIN_EMAIL` / `ADMIN_PASSWORD_HASH` / `ADMIN_PASSWORD` / `ADMIN_NAME` **chỉ cần khi chạy seed** (trên máy bạn), không cần đặt trên Vercel.

## Scripts

| Lệnh | Mô tả |
|---|---|
| `npm run dev` | Chạy dev server |
| `npm run build` / `npm run start` | Build và chạy production |
| `npm run lint` | ESLint |
| `npm test` | Vitest (test parser import) |
| `npm run db:up` | `docker compose up -d` (PostgreSQL) |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:seed` | Nạp lại dữ liệu mẫu cho tài khoản admin (cần `ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH` hoặc `ADMIN_PASSWORD`) |
| `npm run auth:hash` | Đọc mật khẩu từ stdin (TTY: không echo), in hash scrypt cho `ADMIN_PASSWORD_HASH` |
| `npm run db:studio` | Prisma Studio |
| `npm run db:generate` | Sinh Prisma Client vào `src/generated/prisma` |

## Cấu trúc thư mục

```
prisma/              schema, migration init, seed.ts, seed-data/ (vocab/*.json, frontend-handbook.md)
public/templates/    file mẫu import (csv, xlsx, md)
src/app/             trang (App Router) và API route handlers (src/app/api)
src/components/      ui (primitives), layout, sets, cards, import, study
src/lib/             db, validators (zod), api (fetch client), dto, import/ (parser)
```

## Định dạng import

Tải file mẫu ngay trong trang import hoặc ở `public/templates/`. Tối đa 2000 thẻ mỗi lần.

### CSV / XLSX

Dòng đầu là tiêu đề. Tên cột không phân biệt hoa thường và bỏ dấu:

| Trường | Tên cột nhận diện |
|---|---|
| Câu hỏi (bắt buộc) | `question`, `cau hoi`, `term`, `thuat ngu`, `front` |
| Đáp án (bắt buộc) | `answer`, `tra loi`, `dap an`, `definition`, `dinh nghia`, `back` |
| Giải thích (tuỳ chọn) | `explanation`, `giai thich`, `note`, `example`, `vi du` |
| Phiên âm (tuỳ chọn) | `phonetic`, `phien am`, `ipa`, `pronunciation` |
| Từ loại (tuỳ chọn) | `part of speech`, `pos`, `tu loai`, `type`, `word type` |

Không có tiêu đề khớp thì cột 1 = câu hỏi, cột 2 = đáp án, cột 3 = giải thích. CSV tự nhận dấu phân cách `,` `;` hoặc Tab. Dòng trống bị bỏ qua; dòng thiếu câu hỏi/đáp án được báo lỗi và bỏ qua. XLSX đọc sheet đầu tiên. Thẻ đã có phiên âm trong file thì không bị tra đè; thẻ thiếu phiên âm trong bộ Tiếng Anh sẽ được tra tự động sau khi lưu.

### Markdown (tự nhận 4 kiểu)

1. Heading: tiêu đề là câu hỏi, phần thân là đáp án; dòng bắt đầu bằng `> ` hoặc phần sau `---` là giải thích.

   ```markdown
   ## Closure trong JavaScript là gì?
   Hàm ghi nhớ phạm vi (scope) nơi nó được tạo ra.
   > Ví dụ: hàm đếm giữ biến count
   ```

2. Q/A (cũng nhận `Hỏi:` / `Đáp:` / `Giải thích:`), các thẻ cách nhau bằng dòng trống:

   ```markdown
   Q: HTTP 404 nghĩa là gì?
   A: Không tìm thấy tài nguyên.
   E: Server không có tài nguyên được yêu cầu.
   ```

   Bộ Tiếng Anh có thể thêm dòng phiên âm `P:` (hoặc `Phiên âm:`), ví dụ `P: /ˈeɪbl/`.

3. Bảng (header áp dụng quy tắc nhận diện như CSV):

   ```markdown
   | question | answer | explanation |
   |---|---|---|
   | ubiquitous | có mặt ở khắp nơi | Smartphones are ubiquitous. |
   ```

4. **Câu hỏi in đậm** (ưu tiên nếu có ít nhất một dòng `**…**` đứng riêng; dùng cho `prisma/seed-data/frontend-handbook.md`):

   ```markdown
   **1. What is a closure? / Closure là gì?**

   EN: A function that remembers the scope it was created in.

   VI: Hàm ghi nhớ scope nơi nó được tạo ra.
   ```

   - Dòng `**<số>. <câu hỏi>**` (số tuỳ chọn, được bỏ đi) bắt đầu một thẻ. Nội dung nằm giữa dòng câu hỏi và `EN:`/`VI:` đầu tiên (ví dụ code block) được nối vào câu hỏi.
   - Có `EN:` và `VI:`: **đáp án = phần `VI:`** (tới hết thẻ, gồm cả code/danh sách), **giải thích = phần `EN:`**. Không có nhãn thì toàn bộ nội dung là đáp án.
   - Heading `#`/`##`/`###` và đoạn văn trước câu hỏi đầu tiên bị bỏ qua.

## Phím tắt khi học

| Phím | Chức năng |
|---|---|
| `Space` | Lật thẻ |
| `←` / `→` | Thẻ trước / thẻ sau (mobile: vuốt trái/phải) |
| `J` | Đánh dấu "Chưa thuộc" và sang thẻ tiếp |
| `K` | Đánh dấu "Đã thuộc" và sang thẻ tiếp |
| `S` | Phát âm từ đang học (chỉ bộ Tiếng Anh) |

## API

Mọi endpoint yêu cầu đăng nhập (cookie `kn_session`) và chỉ thao tác trên dữ liệu của user hiện tại. Lỗi trả về dạng `{ "error": string, "details"?: unknown }` với status 400/401/403/404/500.

| Method | Path | Body | Kết quả |
|---|---|---|---|
| GET | `/api/sets?category=IT&level=ADVANCED&q=js` | – | Danh sách bộ học (mới nhất trước); `category`, `level`, `q` đều tuỳ chọn |
| POST | `/api/sets` | `{ title, description?, category, level? }` | Bộ học vừa tạo (201) |
| GET | `/api/sets/:id` | – | Bộ học kèm danh sách thẻ |
| PATCH | `/api/sets/:id` | Một phần của dữ liệu bộ học | Bộ học đã cập nhật |
| DELETE | `/api/sets/:id` | – | `{ ok: true }` |
| POST | `/api/sets/:id/cards` | `{ question, answer, explanation?, phonetic?, partOfSpeech?, audioUrl? }` | Thẻ vừa tạo (201) |
| POST | `/api/sets/:id/cards/bulk` | `{ mode: "append" \| "replace", cards: [...] }` | `{ created: number }` (201) |
| GET | `/api/dictionary?word=able` | – | `{ word, phonetic, partOfSpeech, audioUrl }`; 404 nếu không có từ, 502 nếu không kết nối được từ điển |
| POST | `/api/sets/:id/enrich` | – | Tra phiên âm cho tối đa 50 thẻ còn thiếu (bộ Tiếng Anh): `{ updated, notFound, remaining }`; gọi lặp tới khi `remaining = 0` |
| PATCH | `/api/cards/:id` | Một phần của dữ liệu thẻ | Thẻ đã cập nhật |
| DELETE | `/api/cards/:id` | – | `{ ok: true }` |

## Hướng phát triển

- Đăng nhập / tài khoản người dùng (hiện tiến độ học chỉ lưu trên trình duyệt)
- Lặp lại ngắt quãng (spaced repetition)
- Chế độ quiz (trắc nghiệm, điền từ)
- Dockerfile cho ứng dụng để triển khai trọn gói cùng PostgreSQL
