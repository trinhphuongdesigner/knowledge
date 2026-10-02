# Knowledge — Kế hoạch triển khai (MVP)

Web app học tập dạng flashcard (lấy cảm hứng từ Quizlet). Lĩnh vực: **IT** và **Tiếng Anh**.
UI tiếng Việt, tông **xanh dương / trắng**, tối giản, responsive (mobile-first).

> File này là nguồn sự thật cho mọi agent. Khi xong một phase, agent cập nhật mục **Tiến độ** ở cuối file.
> Nếu bị gián đoạn: đọc mục Tiến độ, chạy lại phase chưa ✅.

---

## 1. Stack

| Lớp | Lựa chọn |
|---|---|
| Framework | Next.js (App Router, bản mới nhất), TypeScript strict, `src/` dir |
| UI | React + Tailwind CSS (bản đi kèm create-next-app), `lucide-react` cho icon |
| Backend | Route Handlers trong Next.js (`src/app/api/**/route.ts`) |
| DB | PostgreSQL 16 chạy bằng **docker compose** (offline, volume local) |
| ORM | Prisma (theo đúng docs của bản đã cài — nếu Prisma 7 thì dùng `prisma.config.ts` + generator output theo docs) |
| Validate | `zod` (dùng chung client + server) |
| Import | `papaparse` (CSV), `xlsx` / SheetJS (XLSX), parser Markdown tự viết |
| Test | `vitest` cho parser import |

Package manager: **npm**. Port app: 3000. Port Postgres: **5433** (tránh đụng Postgres cài sẵn).

## 2. Cấu trúc thư mục (quyền sở hữu file theo phase)

```
knowledge/
├─ docker-compose.yml          [P1]  service `db` (postgres:16-alpine, volume pgdata, port 5433:5432)
├─ .env / .env.example         [P1]  DATABASE_URL=postgresql://knowledge:knowledge@localhost:5433/knowledge
├─ prisma/schema.prisma        [P1]
├─ prisma/seed.ts              [P1]  2 bộ mẫu: "JavaScript cơ bản" (IT), "Từ vựng IELTS" (ENGLISH)
├─ public/templates/           [P2-C] mau-import.csv, mau-import.xlsx, mau-import.md
├─ src/
│  ├─ lib/
│  │  ├─ db.ts                 [P1]  Prisma client singleton
│  │  ├─ validators.ts         [P1]  zod schemas + types dùng chung
│  │  ├─ api.ts                [P1]  helper fetch phía client (typed)
│  │  └─ import/               [P2-C]
│  │     ├─ types.ts           ParsedCard, ParseResult
│  │     ├─ csv.ts  xlsx.ts  markdown.ts  index.ts (parseFile theo đuôi file)
│  │     └─ __tests__/*.test.ts
│  ├─ app/
│  │  ├─ layout.tsx, globals.css, page.tsx                 [P2-B]
│  │  ├─ api/sets/route.ts                                 [P1]  GET (list, ?category=&q=), POST
│  │  ├─ api/sets/[id]/route.ts                            [P1]  GET (kèm cards), PATCH, DELETE
│  │  ├─ api/sets/[id]/cards/route.ts                      [P1]  POST (1 thẻ)
│  │  ├─ api/sets/[id]/cards/bulk/route.ts                 [P1]  POST (nhiều thẻ, mode append|replace)
│  │  ├─ api/cards/[id]/route.ts                           [P1]  PATCH, DELETE
│  │  ├─ sets/new/page.tsx                                 [P2-B]
│  │  ├─ sets/[id]/page.tsx                                [P2-B] chi tiết + danh sách thẻ + nút Import/Học
│  │  ├─ sets/[id]/edit/page.tsx                           [P2-B]
│  │  ├─ sets/[id]/import/page.tsx                         [P2-C]
│  │  └─ sets/[id]/study/page.tsx                          [P2-D]
│  └─ components/
│     ├─ ui/        Button, Input, Textarea, Select, Card, Badge, Modal, EmptyState, Spinner   [P1]
│     ├─ layout/    Header, Container                                                          [P2-B]
│     ├─ sets/      SetCard, SetForm, SetFilters                                               [P2-B]
│     ├─ cards/     CardList, CardItem (sửa inline), CardForm                                  [P2-B]
│     ├─ import/    FileDropzone, ImportPreview, ImportWizard                                  [P2-C]
│     └─ study/     Flashcard (lật 3D), StudyControls, StudyProgress, StudySession             [P2-D]
```

Quy tắc: agent **chỉ tạo/sửa file thuộc phase của mình**. Cần thứ gì ngoài phạm vi → dùng contract dưới đây, không tự sửa file của phase khác.

## 3. Data model (Prisma)

```prisma
enum Category { IT ENGLISH }

model StudySet {            // "Chương trình học"
  id          String   @id @default(cuid())
  title       String
  description String?
  category    Category
  cards       Card[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Card {                // Câu hỏi / trả lời
  id          String   @id @default(cuid())
  setId       String
  set         StudySet @relation(fields: [setId], references: [id], onDelete: Cascade)
  question    String   // mặt trước (thuật ngữ / câu hỏi)
  answer      String   // mặt sau (định nghĩa / đáp án)
  explanation String?  // giải thích / ví dụ (tuỳ chọn)
  position    Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@index([setId, position])
}
```

## 4. Contract dùng chung — `src/lib/validators.ts`

```ts
export const CATEGORIES = ["IT", "ENGLISH"] as const;
export const CATEGORY_LABELS = { IT: "Công nghệ (IT)", ENGLISH: "Tiếng Anh" };
export const setInputSchema   = z.object({ title: z.string().trim().min(1).max(200), description: z.string().trim().max(2000).optional().nullable(), category: z.enum(CATEGORIES) });
export const cardInputSchema  = z.object({ question: z.string().trim().min(1).max(5000), answer: z.string().trim().min(1).max(5000), explanation: z.string().trim().max(5000).optional().nullable() });
export const bulkCardsSchema  = z.object({ mode: z.enum(["append","replace"]).default("append"), cards: z.array(cardInputSchema).min(1).max(2000) });
export type SetInput, CardInput, BulkCardsInput
export type StudySetDTO = { id, title, description, category, cardCount, createdAt, updatedAt }
export type CardDTO     = { id, setId, question, answer, explanation, position }
export type StudySetDetailDTO = StudySetDTO & { cards: CardDTO[] }
```

### API (JSON; lỗi trả `{ error: string, details?: unknown }` với status 400/404/500)

| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/api/sets?category=IT&q=js` | – | `StudySetDTO[]` (mới nhất trước) |
| POST | `/api/sets` | `SetInput` | `StudySetDTO` (201) |
| GET | `/api/sets/:id` | – | `StudySetDetailDTO` (cards theo position) |
| PATCH | `/api/sets/:id` | `Partial<SetInput>` | `StudySetDTO` |
| DELETE | `/api/sets/:id` | – | `{ ok: true }` |
| POST | `/api/sets/:id/cards` | `CardInput` | `CardDTO` (201, position = max+1) |
| POST | `/api/sets/:id/cards/bulk` | `BulkCardsInput` | `{ created: number }` (201, transaction; replace = xoá cũ rồi tạo) |
| PATCH | `/api/cards/:id` | `Partial<CardInput>` | `CardDTO` |
| DELETE | `/api/cards/:id` | – | `{ ok: true }` |

`src/lib/api.ts` export: `api.listSets(params)`, `api.createSet`, `api.getSet`, `api.updateSet`, `api.deleteSet`, `api.createCard`, `api.bulkCreateCards(setId, input)`, `api.updateCard`, `api.deleteCard` — ném `Error(message)` khi !ok.

Trang server component có thể đọc thẳng Prisma qua `src/lib/db.ts` (nhớ `export const dynamic = "force-dynamic"`); mutation phía client đi qua `api.ts`.

### UI primitives (`src/components/ui`, P1) — props tối thiểu
- `Button`: `variant: "primary"|"secondary"|"ghost"|"danger"`, `size: "sm"|"md"|"lg"`, `loading?`, mọi props của `<button>`; có `ButtonLink` (Next `Link`) cùng style.
- `Input`, `Textarea`, `Select`: có `label?`, `error?`, forwardRef.
- `Card` (container bo góc, viền nhẹ), `Badge` (`tone: "blue"|"green"|"gray"`), `Modal` (`open`, `onClose`, `title`, children), `EmptyState` (`icon`, `title`, `description`, `action?`), `Spinner`.
- Export gom ở `src/components/ui/index.ts`.

### Thiết kế
- Màu chính `blue-600` (hover `blue-700`), nền `white` / `slate-50`, chữ `slate-900/600`, viền `slate-200`. Bo góc `rounded-xl`, shadow nhẹ. Font: Be Vietnam Pro (next/font/google, subsets latin + vietnamese).
- Mobile-first; vùng chạm ≥ 44px; không cuộn ngang ở 360px.

## 5. Import — `src/lib/import` (P2-C)

```ts
export type ParsedCard  = { question: string; answer: string; explanation?: string };
export type ParseResult = { cards: ParsedCard[]; errors: { row: number; message: string }[] };
export async function parseFile(file: File): Promise<ParseResult>   // chọn parser theo .csv/.xlsx/.xls/.md
export function parseCsv(text: string): ParseResult
export function parseXlsx(buf: ArrayBuffer): ParseResult            // sheet đầu tiên
export function parseMarkdown(text: string): ParseResult
```

Định dạng hỗ trợ:
- **CSV / XLSX**: dòng đầu là header. Nhận diện cột (không phân biệt hoa thường, bỏ dấu): question ∈ {question, cau hoi, term, thuat ngu, front}, answer ∈ {answer, tra loi, dap an, definition, dinh nghia, back}, explanation ∈ {explanation, giai thich, note, example, vi du}. Không có header khớp → cột 1 = question, cột 2 = answer, cột 3 = explanation. Bỏ dòng trống; dòng thiếu question/answer → đưa vào `errors`. CSV tự nhận `,` `;` hoặc tab.
- **Markdown** (3 kiểu, tự nhận):
  1. Heading: `## Câu hỏi` → phần thân tới heading kế tiếp là đáp án; dòng bắt đầu `> ` hoặc khối sau `---` trong thân là explanation.
  2. Q/A: `Q: ...` / `A: ...` (cũng nhận `Hỏi:` / `Đáp:`), optional `E: ...`/`Giải thích:`; cách nhau bởi dòng trống.
  3. Bảng markdown `| question | answer | explanation |` (header áp dụng quy tắc nhận diện như CSV).
- Parse ở **client** (preview trước khi lưu), server validate lại bằng `bulkCardsSchema`.
- Wizard 3 bước: chọn file (drag & drop + link tải file mẫu) → preview bảng (sửa/xoá từng dòng, hiện lỗi) + chọn mode Thêm vào / Thay thế → lưu và chuyển về `/sets/:id`.
- Có thêm tab **Dán văn bản** (paste CSV/MD) dùng chung parser.

## 6. Học flashcard (P2-D)

`/sets/[id]/study`: lật thẻ (click/Space), trước/sau (←/→ và vuốt trên mobile), xáo trộn, đổi mặt hiển thị trước (hỏi/đáp), đánh dấu "Đã thuộc"/"Chưa thuộc" (K / J); thanh tiến độ; màn kết thúc hiện số đã thuộc + nút "Học lại thẻ chưa thuộc" / "Học lại tất cả". Trạng thái lưu trong `localStorage` theo setId (MVP chưa có user). Hiển thị explanation ở mặt sau. Giữ xuống dòng (`whitespace-pre-wrap`).

## 7. Phase & agent

| Phase | Agent (Sonnet) | Phụ thuộc | Nội dung |
|---|---|---|---|
| P1 | foundation | – | Scaffold Next.js, Tailwind, docker compose, Prisma schema + migrate + seed, `lib/*`, toàn bộ API, UI primitives. Chạy `docker compose up -d`, migrate, seed, `npm run build` pass, curl thử API. |
| P2-B | crud-ui | P1 | Layout/Header, trang chủ (danh sách bộ học + lọc category + tìm kiếm), tạo/sửa/xoá bộ học, trang chi tiết với CRUD thẻ (thêm nhanh, sửa inline, xoá có xác nhận), nút dẫn tới `/sets/:id/import` và `/sets/:id/study`. |
| P2-C | import | P1 | `lib/import/*` + tests vitest, components import, trang import, file mẫu trong `public/templates`. |
| P2-D | study | P1 | Components study + trang study. |
| P3 | qa | P2-* | `npm run lint`, `tsc --noEmit`, `npm test`, `npm run build`; chạy app, kiểm tra luồng end-to-end bằng curl/Playwright; sửa lỗi; viết README (setup, scripts, định dạng import). |

P2-B, P2-C, P2-D chạy song song (file tách biệt).

## 8. Tiến độ

- [x] P1 foundation ✅
  - Versions: Next 16.3.8 (Turbopack, React 19.2), Tailwind v4 (CSS-first, no tailwind.config), Prisma **7.10** (pinned `prisma@7`; npm `latest` is an 8.0 rc — don't upgrade), zod 4, vitest 5, lucide-react 1.x.
  - Prisma 7: client generated to `src/generated/prisma` (gitignored; `npm run db:generate`, also on `postinstall`). Import from `@/generated/prisma/client` (not `@prisma/client`). `src/lib/db.ts` exports `db` (uses `@prisma/adapter-pg`). DB url + seed command live in `prisma.config.ts`.
  - Scripts: dev, build, lint, test (vitest run), db:up, db:migrate, db:seed, db:studio, db:generate. DB container `knowledge-db` on port 5433; migration `init` applied; seed loaded (2 sets x 8 cards).
  - Extra helpers: `src/lib/dto.ts` (toSetDTO/toCardDTO/toSetDetailDTO), `src/lib/http.ts` (API response helpers), `src/lib/utils.ts` (`cn`). ui also exports `buttonStyles()`. `Category` type exported from validators.
  - Next 16: route `params` is a Promise; global `LayoutProps<"/">`/`PageProps` helpers exist. Docs in `node_modules/next/dist/docs/` (see AGENTS.md).
  - `BulkCardsInput` = `z.input` (mode optional). Empty description/explanation stored as null. 400 body: `{ error, details: zod.flatten() }`.
  - Verified: tsc, lint, build pass; all API endpoints curl-tested (200/201/400/404).
- [x] P2-B crud-ui ✅
  - Added extra `src/components/sets/DeleteSetButton.tsx`. Pages read Prisma directly (force-dynamic); client mutations via api.ts + router.refresh(). Verified tsc + eslint clean, dev server 200 on /, /sets/new, /sets/:id, /sets/:id/edit, 404 on unknown id.
- [x] P2-C import ✅
  - `src/lib/import/{types,table,csv,xlsx,markdown,index}.ts` (`table.ts` = shared header-alias/row logic; `index.ts` also exports `ACCEPTED_EXTENSIONS`). `.txt` accepted (markdown tried first, else CSV). 22 vitest tests pass.
  - Components in `src/components/import/`; page `src/app/sets/[id]/import/page.tsx`. Preview blocks save while a card has empty question/answer or >2000 cards. Templates in `public/templates/` (md template shows heading style only).
  - Verified: tsc + lint clean; `/sets/<id>/import` 200, unknown id 404.
- [x] P2-D study ✅
  - `src/components/study/{Flashcard,StudyControls,StudyProgress,StudySession,utils}` + `src/app/sets/[id]/study/page.tsx`. Progress in localStorage `knowledge:study:${setId}`; restored via useSyncExternalStore (avoids set-state-in-effect lint). Page `params` typed inline (PageProps route types only generated after dev/build). tsc + lint clean for study files; /sets/<id>/study 200, unknown id 404.
- [ ] P2-D study
- [x] P3 qa + README ✅
  - lint, tsc, 22 vitest, build all pass; E2E (Playwright, prod build) covered home filter/search, set CRUD, card CRUD, import csv/xlsx/md/paste/replace, study (keys, shuffle, finish, restore), 375px layout, no console errors. Fixes: "Trả lời" -> "Đáp án" copy, page titles for import/study. README.md written.

---

## 9. Đợt 2 — Phiên âm, favicon, page loader

### 9.1 Phiên âm + phát âm cho thẻ Tiếng Anh (agent W2-A)
- Nguồn dữ liệu: **Free Dictionary API** `https://api.dictionaryapi.dev/api/v2/entries/en/{word}` (miễn phí, không cần key). Không dùng Google Translate (không có API free chính thức).
- Prisma `Card` thêm: `phonetic String?` (vd `/ˈeɪbl/`), `partOfSpeech String?` (vd `adjective`, nhiều loại nối bằng `, `), `audioUrl String?`. Migration `add_card_phonetics`. Validators/DTO/api.ts cập nhật (optional, nullable, max 200 / 200 / 1000).
- `src/lib/dictionary.ts` (server): `lookupWord(word)` → `{ word, phonetic, partOfSpeech, audioUrl } | null`; chỉ tra khi question là 1–3 từ tiếng Anh; timeout 5s; cache in-memory (Map, cả kết quả null); chọn phonetic có text, ưu tiên audio `-us`.
- API: `GET /api/dictionary?word=` → kết quả hoặc 404. `POST /api/sets/:id/enrich` → điền cho tối đa 50 thẻ còn thiếu phonetic (concurrency 5, chỉ set ENGLISH), trả `{ updated, notFound, remaining }`; client lặp tới khi `remaining = 0` (helper `enrichSetFully(setId, onProgress)` trong api.ts).
- Tự động: POST thẻ đơn trong set ENGLISH → server tra nếu thiếu phonetic (best-effort, lỗi mạng không làm fail). Bulk import: sau khi lưu, ImportWizard gọi enrich lặp, hiện tiến độ "Đang tra phiên âm x/y".
- Import: cột tuỳ chọn `phonetic` ∈ {phonetic, phien am, ipa, pronunciation}, `partOfSpeech` ∈ {part of speech, pos, tu loai, type, word type}; Markdown Q/A nhận `P:`/`Phiên âm:`. Có dữ liệu sẵn thì không tra đè.
- UI (chỉ set ENGLISH): hiển thị `able (adjective) /ˈeɪbl/` + nút loa `SpeakButton` ở CardItem và mặt trước Flashcard (mặt sau cũng hiện phiên âm nhỏ). CardForm/CardItem edit có ô Phiên âm + Từ loại + nút "Tự tra" (cũng tự tra khi blur question nếu trống). Set detail có nút "Tra phiên âm" (điền thẻ còn thiếu).
- `SpeakButton`: phát `audioUrl` bằng `Audio`; không có/lỗi → `speechSynthesis` `en-US` (rate 0.9). Không lan click lên thẻ (stopPropagation để không lật thẻ). Phím tắt `S` khi học = phát âm.
- Seed: thêm phonetic/partOfSpeech cho bộ "Từ vựng IELTS".

### 9.2 Favicon + page loader (agent W2-B)
- Favicon: `src/app/icon.svg` vẽ lại icon BookOpen (lucide) trắng trên nền vuông bo góc blue-600; `apple-icon.png` 180px; xoá `favicon.ico` mặc định.
- Page loader: port hiệu ứng lật trang sách từ `D:\Work\CODE\resume\src\components\PdfLoadingOverlay.tsx` + CSS `.pdf-loader-*` trong `resume/src/app/globals.css` (chỉ bản light), đổi tên `.book-loader-*`, tông blue/white (không overlay tối toàn màn hình; dạng khối giữa vùng nội dung). Component `src/components/ui/PageLoader.tsx` (`label?` mặc định "Đang tải…", role=status), tôn trọng prefers-reduced-motion.
- Thay **mọi loading cấp trang**: thêm `loading.tsx` cho `app/`, `sets/[id]`, `sets/[id]/edit`, `sets/[id]/import`, `sets/[id]/study`, `sets/new` (nếu cần); thay Spinner cấp trang trong `StudySession.tsx`. **Giữ nguyên** loading trong Button và các loading inline nhỏ.

Quyền sở hữu file: W2-B chỉ sửa `src/app/icon*`, `favicon.ico`, `src/app/**/loading.tsx`, `src/components/ui/PageLoader.tsx` + `index.ts` (thêm export), `globals.css`, `StudySession.tsx` (chỉ phần Spinner). W2-A sửa mọi thứ còn lại liên quan, **không** sửa `StudySession.tsx` (phím `S` đặt trong `Flashcard.tsx`/`StudyControls.tsx` hoặc nhờ W2-B — nếu bắt buộc phải sửa StudySession thì chỉ sửa sau khi W2-B xong; ghi chú lại).

### Tiến độ đợt 2
- [x] W2-A phiên âm ✅ (migration `add_card_phonetics`; `lib/dictionary.ts` + `lib/words.ts`, GET /api/dictionary, POST /api/sets/:id/enrich, `enrichSetFully` in api.ts; SpeakButton/PhoneticLine/useWordLookup in components/cards; "" in Card.phonetic = internal "looked up, not found" marker, DTO maps to null; S key lives in Flashcard.tsx, StudySession only passes `english`/`speech` props; 31 vitest tests; dictionaryapi.dev was very slow (~20s) / returned 522 for unknown words during testing, 404 path covered by mocked unit test)
- [x] W2-B favicon + loader ✅ (icon.svg + apple-icon.png 180px, favicon.ico removed; PageLoader `.book-loader-*` + loading.tsx for app, sets/new, sets/[id], edit, import, study; StudySession Spinner -> PageLoader)
- [x] W2-QA ✅ (lint/tsc/31 tests/build pass; Playwright E2E on prod build OK; fixes: SpeakButton no longer stops keydown so arrows/S work after clicking the speaker (Flashcard onKeyDown ignores nested targets), ImportPreview shows phonetic/pos, dictionary timeout 5s -> 25s because dictionaryapi.dev consistently takes ~20s)

---

## 10. Đợt 3 — UUID, header, modal, bộ từ vựng, bộ câu hỏi Frontend

Bối cảnh: đây vẫn là phiên bản đầu tiên → **xoá toàn bộ migration + DB, tạo lại 1 migration `init` duy nhất**.

### 10.1 Data model (agent W3-A)
- Mọi `id` dùng `@default(uuid(7)) @db.Uuid` (UUID v7, sắp xếp theo thời gian); `Card.setId` cũng `@db.Uuid`.
- `StudySet` thêm `level Level?` với `enum Level { BASIC INTERMEDIATE ADVANCED }`.
- Contract trong `src/lib/validators.ts`: `LEVELS = ["BASIC","INTERMEDIATE","ADVANCED"] as const`, `LEVEL_LABELS = { BASIC: "Cơ bản", INTERMEDIATE: "Trung cấp", ADVANCED: "Nâng cao" }`, `setInputSchema.level: z.enum(LEVELS).optional().nullable()`, `StudySetDTO.level: Level | null`. `GET /api/sets` nhận thêm `?level=`.
- `src/lib/ids.ts`: `isUuid(id: string): boolean`. Mọi route handler / page nhận `:id` phải kiểm tra → id sai định dạng trả 404 (không để Prisma ném lỗi 500).
- Xoá `prisma/migrations/*`, reset DB (`prisma migrate reset --force` hoặc xoá volume), tạo migration `init` mới.

### 10.2 Seed (agent W3-A)
- Bỏ 2 bộ demo cũ. Seed đọc:
  1. `prisma/seed-data/vocab/*.json` (bộ từ vựng — xem 10.5), validate bằng zod, bỏ qua file lỗi kèm cảnh báo.
  2. `prisma/seed-data/frontend-handbook.md` (copy từ `public/templates/Bí kíp luyện công – Frontend Middle Senior (JS, TS, React, Next.js).md`): chỉ lấy **PHẦN II**, mỗi `## N. Tên` → 1 bộ `category IT`, title `Phỏng vấn Frontend · <Tên>`, description = đoạn "Mẹo: …" của mục nếu có, ngược lại 1 câu mô tả ngắn; level: Database Basics → BASIC; JS/TS/React/Next.js/HTML-CSS/IQ → INTERMEDIATE; Senior/Performance/Security → ADVANCED.
- Seed idempotent (xoá hết rồi tạo lại), `createdAt` gán giảm dần theo thứ tự mong muốn để trang chủ (mới nhất trước) hiện đúng thứ tự: Life & Work → Câu hỏi HR → IT English → Phỏng vấn Frontend (mỗi nhóm theo `order`).
- In ra tổng số bộ/thẻ mỗi nguồn.

### 10.3 Import Markdown kiểu "câu hỏi in đậm" (agent W3-A)
Thêm kiểu thứ 4 vào `parseMarkdown` (ưu tiên khi có ≥1 dòng dạng `**…**` đứng riêng):
- Dòng `**<số>. <câu hỏi>**` (số tuỳ chọn) bắt đầu 1 thẻ; question = nội dung bỏ `**` và tiền tố số. Nội dung (vd code block) giữa dòng câu hỏi và `EN:`/`VI:` đầu tiên được nối vào question.
- Có `EN:` và `VI:` → answer = phần `VI:` (bỏ nhãn, tới hết thẻ, gồm cả code/list), explanation = phần `EN:` (bỏ nhãn). Không có nhãn → toàn bộ thân là answer.
- Heading `#`/`##`/`###` và đoạn văn trước câu hỏi đầu tiên bị bỏ qua. Seed tách theo mục `##` rồi gọi parser này cho từng mục. Thêm vitest.

### 10.4 UI (agent W3-B)
1. **Header**: bỏ link "Trang chủ" và nút "Tạo bộ học"; bên phải là nút icon user tròn (lucide `CircleUserRound`), `aria-label="Tài khoản"`, title "Tài khoản — sắp ra mắt", chưa có chức năng. Logo vẫn link về `/`.
2. **Modal cho thao tác thêm**:
   - Trang chủ có nút "Tạo bộ học" (thanh công cụ cạnh bộ lọc) → `Modal` chứa `SetForm` → tạo xong chuyển tới `/sets/:id`. Xoá route `/sets/new` (+ loading.tsx), cập nhật mọi link (EmptyState…).
   - Trang chi tiết: bỏ section "thêm thẻ" ở đầu trang; nút "Thêm thẻ" (cạnh Import/Học) → `Modal` chứa `CardForm` (giữ phiên âm/từ loại/Tự tra cho bộ ENGLISH); 2 nút "Thêm" và "Thêm & tiếp tục" (giữ modal, xoá form, focus lại ô câu hỏi); Ctrl/Cmd+Enter = "Thêm & tiếp tục".
   - Sửa thẻ cũng mở cùng modal (bỏ sửa inline) để nhất quán.
   - Modal trên mobile dạng bottom sheet / full-width, cuộn được, nút hành động luôn thấy.
3. **Level**: `SetForm` có select Cấp độ (tuỳ chọn); `SetCard` + trang chi tiết hiện Badge cấp độ; trang chủ có bộ lọc cấp độ (`?level=`) cạnh lọc category.
4. **Hiển thị Markdown** cho question/answer/explanation (CardItem, Flashcard): `src/components/ui/Markdown.tsx` dùng `react-markdown` + `remark-gfm` + `remark-breaks` (giữ xuống dòng), style gọn (inline code nền slate-100, code block cuộn ngang trong khung, không tràn trang ở 360px). Không render HTML thô.

### 10.5 Bộ từ vựng (research: Opus — tạo nội dung: agent V1–V4)
Tất cả là `category ENGLISH`. Mỗi file `prisma/seed-data/vocab/<slug>.json`:
```json
{ "slug": "life-work-01-personal", "order": 1, "title": "…", "description": "…", "category": "ENGLISH", "level": "BASIC",
  "cards": [ { "question": "reliable", "partOfSpeech": "adjective", "phonetic": "/rɪˈlaɪəbəl/",
               "answer": "đáng tin cậy",
               "explanation": "My manager says I'm very reliable.\n→ Quản lý nói tôi rất đáng tin cậy." } ] }
```
Thẻ từ vựng: `question` = từ/cụm từ tiếng Anh (chữ thường trừ danh từ riêng/viết tắt); `partOfSpeech` ∈ noun, verb, adjective, adverb, phrasal verb, phrase, idiom, collocation; `phonetic` = IPA **giọng Mỹ** trong `/…/` (bắt buộc với từ đơn và cụm ≤ 4 từ); `answer` = nghĩa tiếng Việt ngắn gọn (1–2 nghĩa phổ biến nhất trong ngữ cảnh chủ đề); `explanation` = 1 câu ví dụ tiếng Anh tự nhiên trong bối cảnh dev/công sở + dòng `→ ` dịch tiếng Việt; có thể thêm dòng `Lưu ý:` (collocation, từ dễ nhầm). 30–40 thẻ/bộ, không trùng từ giữa các bộ cùng chủ đề.

Thẻ **câu hỏi HR**: `question` = câu hỏi tiếng Anh; `partOfSpeech`/`phonetic` = null; `answer` = bản dịch tiếng Việt + dòng `Ý nhà tuyển dụng: …`; `explanation` = `Gợi ý trả lời:` + câu trả lời mẫu 2–4 câu tiếng Anh cho một lập trình viên (tự nhiên, không sáo rỗng) + dòng `→ ` tóm tắt tiếng Việt + dòng `Mẹo: …`. 20–25 thẻ/bộ.

**Chủ đề 1 — Life & Work (giao tiếp với HR, câu hỏi ngoài chuyên môn)**
| # | Title | Level | Trọng tâm / từ gợi ý |
|---|---|---|---|
| 1 | Life & Work 1 · Bản thân & gia đình | BASIC (A1–A2) | introduce, hometown, grow up, sibling, married, single, live with, graduate, major, background |
| 2 | Life & Work 2 · Thói quen & sở thích | BASIC | routine, commute, hobby, work out, hang out, travel, cook, weekend, relax, volunteer |
| 3 | Life & Work 3 · Nơi làm việc cơ bản | BASIC | colleague, manager, office, meeting, schedule, deadline, task, report, day off, overtime, full-time, part-time, salary |
| 4 | Life & Work 4 · Tính cách, điểm mạnh & điểm yếu | INTERMEDIATE (B1) | reliable, proactive, detail-oriented, adaptable, self-motivated, curious, patient, perfectionist, impatient, introverted, open-minded |
| 5 | Life & Work 5 · Sự nghiệp & mục tiêu | INTERMEDIATE | career path, promotion, ambition, goal, responsibility, skill set, experience, switch jobs, long-term, growth, mentor |
| 6 | Life & Work 6 · Giao tiếp & làm việc nhóm | INTERMEDIATE (B1–B2) | collaborate, conflict, compromise, feedback, clarify, misunderstanding, align, support, persuade, cross-functional |
| 7 | Life & Work 7 · Tuyển dụng & phỏng vấn | ADVANCED (B2) | recruiter, job description, shortlist, notice period, probation, onboarding, offer letter, benefits, reference check, culture fit, hybrid, relocate |
| 8 | Life & Work 8 · Thành tựu & giải quyết vấn đề | ADVANCED (B2–C1) | accomplish, spearhead, streamline, overcome, take the initiative, prioritize, resolve, setback, measurable impact, lessons learned |
| 9 | Life & Work 9 · Đàm phán lương & phúc lợi | ADVANCED (C1) | negotiate, compensation package, salary expectation, gross, net, bonus, equity, counteroffer, competitive, perks, raise |
| 10 | Life & Work 10 · Thành ngữ & cụm từ công sở | ADVANCED (C1) | on the same page, touch base, circle back, go the extra mile, hit the ground running, wear many hats, steep learning curve, bandwidth, heads-up, think outside the box |
| 11 | Câu hỏi HR 1 · Làm quen & giới thiệu | INTERMEDIATE | Tell me about yourself; Why are you looking for a new job?; Why do you want to work here?; What do you know about our company?; How did you hear about this position?; What do you do in your free time?; Are you open to hybrid/relocation? |
| 12 | Câu hỏi HR 2 · Hành vi & tình huống (STAR) | ADVANCED | strengths/weaknesses; a time you disagreed with a teammate; a tight deadline; a failure/mistake; handling criticism; where do you see yourself in 5 years; why should we hire you; salary expectation; why did you leave |
| 13 | Câu hỏi HR 3 · Hỏi lại nhà tuyển dụng & câu nói hữu ích | INTERMEDIATE | What does a typical day look like?; How big is the team?; What are the next steps?; growth/learning opportunities; + câu đệm: Could you repeat the question?, That's a good question, Let me think for a moment, To be honest…, What I mean is… (câu đệm: question = câu, answer = nghĩa + khi nào dùng, explanation = ví dụ hội thoại) |

**Chủ đề 2 — IT English (tiếng Anh chuyên ngành)**
| # | Title | Level | Trọng tâm / từ gợi ý |
|---|---|---|---|
| 1 | IT English 1 · Máy tính & phần mềm | BASIC (A2) | hardware, software, install, update, file, folder, browser, download, upload, password, log in, settings, crash |
| 2 | IT English 2 · Lập trình cơ bản | BASIC | variable, function, loop, condition, array, string, integer, boolean, syntax, compile, execute, bug, debug, return, parameter |
| 3 | IT English 3 · Web & Internet | BASIC (A2–B1) | website, domain, server, client, request, response, URL, host, cookie, cache, bandwidth, protocol, DNS |
| 4 | IT English 4 · Quy trình Agile/Scrum | INTERMEDIATE | sprint, backlog, user story, stand-up, retrospective, estimate, story point, requirement, stakeholder, release, milestone, blocker, acceptance criteria |
| 5 | IT English 5 · Frontend & UI/UX | INTERMEDIATE | responsive, layout, component, render, state, accessibility, wireframe, prototype, user flow, usability, viewport, breakpoint, dropdown |
| 6 | IT English 6 · Backend, API & Database | INTERMEDIATE | endpoint, payload, authentication, authorization, query, schema, index, migration, transaction, latency, throughput, rate limit |
| 7 | IT English 7 · Git & cộng tác code | INTERMEDIATE | repository, branch, commit, merge, rebase, conflict, pull request, code review, approve, revert, cherry-pick, stash, upstream |
| 8 | IT English 8 · DevOps & Cloud | ADVANCED (B2) | deploy, pipeline, container, orchestration, provision, scalability, load balancer, downtime, rollback, monitoring, incident, on-call |
| 9 | IT English 9 · Bảo mật | ADVANCED | vulnerability, exploit, encryption, hash, injection, breach, mitigate, patch, least privilege, sanitize, token, phishing |
| 10 | IT English 10 · Kiến trúc & System design | ADVANCED (C1) | trade-off, bottleneck, decouple, microservice, monolith, consistency, availability, redundancy, sharding, idempotent, fault-tolerant |
| 11 | IT English 11 · Testing & chất lượng | ADVANCED | unit test, integration test, regression, coverage, edge case, flaky, mock, assertion, reproduce, test case, smoke test |
| 12 | IT English 12 · Cụm từ trong meeting kỹ thuật | ADVANCED (C1) | technical debt, scope creep, ship, roll out, sanity check, ballpark estimate, deep dive, workaround, root cause, post-mortem, out of scope, nice-to-have |
| 13 | IT English 13 · AI & Dữ liệu | ADVANCED | dataset, model, train, inference, prompt, accuracy, bias, hallucination, fine-tune, embedding, data pipeline, visualization |

Phân công: V1 = Life & Work 1–7 · V2 = Life & Work 8–10 + Câu hỏi HR 1–3 · V3 = IT English 1–7 · V4 = IT English 8–13. Slug: `life-work-NN-…`, `hr-NN-…`, `it-english-NN-…`. `order`: Life & Work 1–10 → 1–10, HR 1–3 → 11–13, IT English 1–13 → 21–33.

### 10.6 Quyền sở hữu file
- **W3-A**: `prisma/**` (trừ `prisma/seed-data/vocab/`), `src/lib/{validators,dto,api,ids}.ts`, `src/lib/import/**`, `src/app/api/**`, guard id trong `src/app/sets/[id]/{edit,import,study}/page.tsx`, README (phần DB/seed/import).
- **W3-B**: `src/components/layout/**`, `src/components/sets/**`, `src/components/cards/**`, `src/components/ui/Markdown.tsx` (+ export index), `src/components/study/Flashcard.tsx` (chỉ phần render text), `src/app/page.tsx`, `src/app/sets/new/**` (xoá), `src/app/sets/[id]/page.tsx` (dùng `isUuid` từ `@/lib/ids`), cài `react-markdown remark-gfm remark-breaks`.
- **V1–V4**: chỉ file JSON của mình trong `prisma/seed-data/vocab/`.

### Tiến độ đợt 3
- [x] W3-A data/seed/import ✅ (UUID v7, 1 migration init, Level, isUuid, import kiểu 4, seed 36 bộ / 994 thẻ)
- [x] W3-B UI ✅ (header user icon, modal tạo bộ / thêm-sửa thẻ, level filter, Markdown)
- [x] V1 Life & Work 1–7
- [x] V2 Life & Work 8–10 + HR 1–3
- [x] V3 IT English 1–7
- [x] V4 IT English 8–13 ✅ (V5: khử 24 câu trùng; 26 bộ / 875 thẻ)
- [x] W3-QA ✅ (lint/tsc/37 test/build OK; E2E 1280 + 375 OK; DB 36 bộ / 994 thẻ, id UUID v7)

## 11. Đợt 4 — Đăng nhập & dữ liệu theo user

Quyết định của user: **email + mật khẩu tự xây** (không thư viện auth, không dịch vụ ngoài); **36 bộ seed thuộc về 1 tài khoản admin**, user khác bắt đầu trống. Mọi bộ học/thẻ thuộc về đúng 1 user; user chỉ thấy/sửa dữ liệu của mình.

Tài liệu Next 16 bắt buộc đọc: `node_modules/next/dist/docs/01-app/02-guides/authentication.md` (Database Sessions, DAL, Proxy), `01-app/01-getting-started/16-proxy.md` (Next 16 dùng **`proxy.ts`**, không phải middleware.ts), `02-guides/data-security.md`.

### 11.1 Data model (thay migration bằng **một `init` mới**, như đợt 3)
```prisma
enum Role { USER ADMIN }
model User {
  id           String   @id @default(uuid(7)) @db.Uuid
  email        String   @unique          // luôn lưu lowercase + trim
  name         String?
  passwordHash String                    // "scrypt$N$r$p$saltB64$hashB64"
  role         Role     @default(USER)
  sets         StudySet[]
  sessions     Session[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
model Session {
  id        String   @id                 // sha256(token) hex — KHÔNG lưu token thô
  userId    String   @db.Uuid
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())
  userAgent String?
  @@index([userId])
}
model LoginAttempt {                     // rate limit dùng DB (serverless nhiều instance)
  id        String   @id @default(uuid(7)) @db.Uuid
  email     String
  ip        String?
  success   Boolean
  createdAt DateTime @default(now())
  @@index([email, createdAt])
  @@index([ip, createdAt])
}
// StudySet thêm:
  userId String @db.Uuid
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId, createdAt])
```

### 11.2 Bảo mật (bắt buộc)
- Mật khẩu: `node:crypto` **scrypt** (N=2^15, r=8, p=1, keylen 64, `maxmem` đủ lớn), salt 16 byte, so sánh `timingSafeEqual`. Độ dài 8–128 ký tự. Email không tồn tại vẫn chạy verify với hash giả (chống dò email theo thời gian). Lỗi chung: "Email hoặc mật khẩu không đúng".
- Session: token 32 byte random (base64url) trong cookie **`kn_session`**: `httpOnly`, `sameSite: "lax"`, `secure` khi production, `path: "/"`, 30 ngày. DB lưu `sha256(token)`. Gia hạn trượt khi còn < 15 ngày. Logout xoá session trong DB + cookie. Đăng nhập tạo session mới (không tái sử dụng).
- Rate limit đăng nhập: thất bại ≥ 5 lần / 15 phút cho cùng email, hoặc ≥ 20 lần / 15 phút cho cùng IP (`x-forwarded-for` phần đầu, rồi `x-real-ip`) → từ chối "Thử lại sau ít phút". Đăng ký: ≥ 5 lần / giờ / IP. Dọn bản ghi > 1 ngày tùy dịp (khi ghi).
- Đăng ký bật mặc định; `ALLOW_REGISTRATION="false"` tắt.
- `?next=` sau login chỉ nhận đường dẫn nội bộ: bắt đầu bằng `/`, không bắt đầu bằng `//` hoặc `/\`; sai → `/`.
- Route Handler ghi (POST/PATCH/PUT/DELETE): kiểm tra header `Origin` (nếu có) trùng `Host` → không trùng trả 403 (CSRF). Server Actions đã được Next kiểm tra sẵn.
- Không thuộc user → **404** (không 403, tránh lộ tồn tại). Chưa đăng nhập ở API → **401** `{ error: "Chưa đăng nhập" }`.
- `/api/dictionary` cũng yêu cầu đăng nhập.
- `next.config.ts` headers cho mọi route: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
- Không bao giờ trả `passwordHash`/session id ra client; DTO user chỉ `{ id, email, name, role }`.

### 11.3 Hợp đồng chung (A và B code song song theo đây)
- `src/lib/auth/dal.ts` (`import "server-only"`):
  - `type SessionUser = { id: string; email: string; name: string | null; role: "USER" | "ADMIN" }`
  - `getCurrentUser(): Promise<SessionUser | null>` (bọc `cache` của React)
  - `requireUser(): Promise<SessionUser>`: chưa đăng nhập → `redirect("/login")`
  - `requireApiUser(req: Request): Promise<SessionUser | Response>`: trả `Response` 401/403 (CSRF) để handler `return` ngay.
- `src/app/(auth)/actions.ts` (`"use server"`):
  - `type AuthFormState = { error?: string; fieldErrors?: Partial<Record<"email" | "password" | "name" | "confirmPassword", string[]>>; values?: { email?: string; name?: string } } | undefined`
  - `login(prev: AuthFormState, formData: FormData): Promise<AuthFormState>`: fields `email`, `password`, `next` (hidden). Thành công → `redirect(next an toàn)`.
  - `register(prev, formData)`: fields `name` (tuỳ chọn), `email`, `password`, `confirmPassword`. Thành công → tạo session + `redirect("/")`.
  - `logout(): Promise<void>` → xoá session, `redirect("/login")`.
  - Type `AuthFormState` export từ `src/lib/auth/types.ts` (file không "use server") để client import được.
- `proxy.ts` (gốc project): kiểm tra **lạc quan** chỉ theo sự có mặt của cookie `kn_session`: không có cookie + trang cần login → redirect `/login?next=<path>`; có cookie + `/login` hoặc `/register` → redirect `/`; `/api/*` không cookie → 401 JSON. Bỏ qua `_next`, file tĩnh, `icon.svg`, `apple-icon.png`, `templates/`. Kiểm tra thật nằm ở DAL.

### 11.4 Seed
- Cần `ADMIN_EMAIL` và `ADMIN_PASSWORD` (≥ 8 ký tự) trong env; thiếu → seed báo lỗi rõ và dừng. `ADMIN_NAME` tuỳ chọn (mặc định "Admin").
- Upsert admin (role ADMIN, cập nhật hash mật khẩu theo env), **chỉ xoá bộ học của admin** rồi tạo lại 36 bộ / 994 thẻ gán `userId` admin. Không động tới user khác.

### 11.5 UI
- Route group `src/app/(auth)/` với `layout.tsx` riêng: không Header app, card trắng giữa màn hình trên nền xanh nhạt, logo BookOpen "Knowledge". Trang `login/page.tsx`, `register/page.tsx`. Form dùng `useActionState`, ô có `autoComplete` đúng (`email`, `current-password`, `new-password`), nút có trạng thái pending (Spinner trong Button như cũ), hiện lỗi chung + lỗi từng ô, nút hiện/ẩn mật khẩu, link qua lại Đăng nhập ↔ Đăng ký. Trang register khi `ALLOW_REGISTRATION=false` hiện thông báo đã tắt đăng ký.
- Header: nút user icon mở **menu nhỏ** (popover, đóng bằng Esc/click ngoài) hiện tên/email + nút "Đăng xuất" (form gọi `logout`). Header là Server Component lấy `getCurrentUser()`; phần menu là client component nhỏ.
- Mọi trang cũ (`/`, `/sets/[id]`, edit, import, study) gọi `requireUser()` và lọc theo `userId`.

### 11.6 Phân công (file ownership)
- **W4-A (backend)**: `prisma/schema.prisma`, `prisma/migrations/*`, `prisma/seed.ts` (+ loader nếu cần), `src/lib/auth/*` (password, session, dal, rate-limit, redirect, types), `src/app/(auth)/actions.ts`, `proxy.ts`, `next.config.ts`, mọi `src/app/api/**`, phần lấy dữ liệu trong `src/app/page.tsx` và `src/app/sets/[id]/**/page.tsx` (chỉ thêm `requireUser` + lọc `userId`, không đổi JSX), `src/lib/validators.ts` (schema login/register), `.env.example`, README, test vitest `src/lib/auth/__tests__/*` (hash/verify, safe next, token hash, rate-limit logic thuần).
- **W4-B (UI)**: `src/app/(auth)/layout.tsx`, `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`, `src/components/auth/*`, `src/components/layout/Header.tsx` + `UserMenu.tsx`. Import hợp đồng 11.3; nếu file của A chưa có thì tạo stub tạm **trong scratchpad của mình**, không ghi đè file của A.
- **DB khi phát triển**: `.env` đang trỏ **Supabase**. Agent **không được** chạm Supabase: mọi lệnh prisma/seed/dev đặt env ghi đè ở đầu lệnh, ví dụ `DATABASE_URL="postgresql://knowledge:knowledge@localhost:5433/knowledge" DIRECT_URL="postgresql://knowledge:knowledge@localhost:5433/knowledge" npx prisma ...` (dotenv không ghi đè env đã có). Không sửa `.env`. Orchestrator tự reset + seed Supabase cuối đợt.
- Không commit, không sửa PLAN.md.

### Tiến độ đợt 4
- [x] W4-A backend/auth/seed ✅ (migration 20261002024207_init, proxy ở src/proxy.ts, 89 test, build OK)
- [x] W4-B UI login/register/header ✅
- [x] W4-QA ✅ (E2E admin + user B chéo 404, rate limit, safeNext; sửa cookie trượt, vòng lặp redirect cookie hết hạn)
- [ ] Supabase: reset init mới + seed admin

## 12. Đợt 5 — Quản lý tài khoản & mật khẩu admin đã hash

- **Seed**: nhận `ADMIN_PASSWORD_HASH` (chuỗi scrypt `scrypt$N$r$p$salt$hash`, kiểm tra định dạng) — ưu tiên hơn `ADMIN_PASSWORD`. Script `npm run auth:hash` đọc mật khẩu từ stdin (không echo khi là TTY; đọc pipe khi không phải TTY), in ra hash. Trong `.env` đặt trong nháy đơn: `ADMIN_PASSWORD_HASH='scrypt$...'`. Prisma CLI dùng dotenv (không expand `$`).
- **Menu avatar** (UserMenu): thêm mục "Quản lý tài khoản" → `/account`, trên nút "Đăng xuất".
- **Trang `/account`** (requireUser), 2 tab qua `?tab=profile|password` (link, aria-current, mặc định profile):
  - *Thông tin*: sửa tên (tuỳ chọn, ≤ 80) và email. Đổi email cần nhập mật khẩu hiện tại; email lowercase + trim, trùng → lỗi "Email này đã được đăng ký".
  - *Mật khẩu*: mật khẩu hiện tại, mật khẩu mới (8–128, khác mật khẩu cũ), xác nhận. Sai mật khẩu hiện tại tính vào rate limit (dùng lại `rate-limit.ts` theo email). Thành công: hash mới, **xoá mọi session khác** của user (giữ session hiện tại), thông báo thành công.
- Server Actions trong `src/app/account/actions.ts` (`useActionState`), schema zod trong `src/lib/validators.ts`, test vitest cho schema mới. Không trả passwordHash ra client.

### Tiến độ đợt 5
- [ ] W5 account + seed hash
- [ ] Supabase: reset init mới + seed admin (hash)
