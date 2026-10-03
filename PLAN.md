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
- [x] Supabase: reset init mới + seed admin ✅

## 12. Đợt 5 — Quản lý tài khoản & mật khẩu admin đã hash

- **Seed**: nhận `ADMIN_PASSWORD_HASH` (chuỗi scrypt `scrypt$N$r$p$salt$hash`, kiểm tra định dạng) — ưu tiên hơn `ADMIN_PASSWORD`. Script `npm run auth:hash` đọc mật khẩu từ stdin (không echo khi là TTY; đọc pipe khi không phải TTY), in ra hash. Trong `.env` đặt trong nháy đơn: `ADMIN_PASSWORD_HASH='scrypt$...'`. Prisma CLI dùng dotenv (không expand `$`).
- **Menu avatar** (UserMenu): thêm mục "Quản lý tài khoản" → `/account`, trên nút "Đăng xuất".
- **Trang `/account`** (requireUser), 2 tab qua `?tab=profile|password` (link, aria-current, mặc định profile):
  - *Thông tin*: sửa tên (tuỳ chọn, ≤ 80) và email. Đổi email cần nhập mật khẩu hiện tại; email lowercase + trim, trùng → lỗi "Email này đã được đăng ký".
  - *Mật khẩu*: mật khẩu hiện tại, mật khẩu mới (8–128, khác mật khẩu cũ), xác nhận. Sai mật khẩu hiện tại tính vào rate limit (dùng lại `rate-limit.ts` theo email). Thành công: hash mới, **xoá mọi session khác** của user (giữ session hiện tại), thông báo thành công.
- Server Actions trong `src/app/account/actions.ts` (`useActionState`), schema zod trong `src/lib/validators.ts`, test vitest cho schema mới. Không trả passwordHash ra client.

### Tiến độ đợt 5
- [x] W5 account + seed hash ✅ (99 test, build OK, E2E OK; .env dùng ADMIN_PASSWORD_HASH)
- [x] Supabase: reset init mới + seed admin (hash) ✅

## 13. Đợt 6 — Danh mục tuỳ chỉnh & dropdown mới

Yêu cầu: (1) danh mục do user tạo/sửa/xoá, IT và Tiếng Anh là 2 danh mục có sẵn (dữ liệu hiện tại được chuyển vào đó); có màn hình quản lý danh mục; xoá chỉ được khi danh mục **chưa có bộ học nào**. (2) dropdown khi mở ra phải đồng bộ UI (hiện là `<select>` gốc của trình duyệt, thô).

Quyết định: danh mục **thuộc từng user** (như bộ học). Dữ liệu hiện nằm trên Supabase nên dùng **migration thêm mới `add_categories` có chuyển đổi dữ liệu**, KHÔNG reset DB (khác đợt 3–5). `enum Category` bị bỏ.

### 13.1 Data model
```prisma
model Category {
  id         String   @id @default(uuid(7)) @db.Uuid
  userId     String   @db.Uuid
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name       String                      // 1–40 ký tự, trim
  color      CategoryColor @default(BLUE)
  isEnglish  Boolean  @default(false)    // true: bộ từ vựng tiếng Anh → hiện phiên âm/tra từ điển, nút phát âm
  sets       StudySet[]
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  @@unique([userId, name])               // trùng tên (không phân biệt hoa/thường, kiểm bằng code) → lỗi 409
  @@index([userId])
}
enum CategoryColor { BLUE GREEN AMBER PURPLE ROSE SLATE }
// StudySet: bỏ `category Category`; thêm
  categoryId String   @db.Uuid
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Restrict)
```
- Migration SQL tự viết (dùng `prisma migrate dev --create-only` rồi sửa): tạo bảng/enum mới, với **mỗi user có bộ học** tạo 2 danh mục "IT" (BLUE, isEnglish=false) và "Tiếng Anh" (GREEN, isEnglish=true), `UPDATE StudySet` gán `categoryId` theo enum cũ, đặt NOT NULL, rồi DROP cột và enum cũ. Thêm cả cho user chưa có bộ nào (mọi user đều có 2 danh mục mặc định). Phải chạy được trên DB đã có dữ liệu (kiểm thử: local seed bằng schema cũ → migrate → kiểm tra).
- Đăng ký mới (`register` action) và seed admin: tạo 2 danh mục mặc định "IT" và "Tiếng Anh" cho user. Seed vocab/handbook: `category` ENGLISH/IT trong JSON → tra danh mục theo `isEnglish`/tên "IT" của admin.
- Shared contract `src/lib/validators.ts`: bỏ `CATEGORIES`/`CATEGORY_LABELS`; thêm `CATEGORY_COLORS`, `categoryInputSchema = { name, color, isEnglish }`; `setInputSchema.categoryId` (uuid) thay `category`. `src/lib/dto.ts`: `CategoryDTO = { id, name, color, isEnglish, setCount, createdAt }`; `StudySetDTO.category: { id, name, color, isEnglish }` (thay enum); `src/lib/categories.ts` (server): `listCategories(userId)`, `getCategory(userId, id)`.
- API (đều qua `requireApiUser`, 404 khi không thuộc user, Origin check như cũ): `GET/POST /api/categories`, `PATCH/DELETE /api/categories/[id]`. DELETE khi còn bộ học → **409** `{ error: "Danh mục còn N bộ học, hãy chuyển hoặc xoá chúng trước" }`. `GET /api/sets?category=<categoryId>` (thay giá trị enum). Tạo/sửa set kiểm tra `categoryId` thuộc user (không thì 400).
- Đổi `english` flag (trang set/study/enrich/CardList) sang `set.category.isEnglish`.

### 13.2 UI
- **Dropdown mới**: component `src/components/ui/Select.tsx` viết lại thành listbox tuỳ chỉnh (không dùng popup gốc): nút trigger giống Input (chevron cách lề phải, xoay khi mở), popover bo góc `rounded-xl border shadow-lg`, mục hover xanh nhạt, mục đang chọn có dấu ✓ + nền xanh nhạt, bàn phím đầy đủ (↑ ↓ Home End Enter Space Esc Tab, gõ ký tự để nhảy), `role="listbox"`/`option`, `aria-activedescendant`, đóng khi click ngoài, popover tự lật lên trên khi thiếu chỗ phía dưới, trên mobile vẫn dễ chạm (mục cao ≥ 44px), cuộn khi nhiều mục, hỗ trợ `label`, `error`, `disabled`, `name` (input hidden để form gửi được), `value/onChange` kiểu event-like hoặc `onValueChange`. Giữ API tương thích cho 3 chỗ dùng hiện tại (ImportWizard, SetForm ×2) và thay `<select>` ở `SetFilters`. Có thể hiện chấm màu cho mục danh mục (prop `option.color`).
- **Quản lý danh mục**: trang `/categories` (requireUser). Danh sách thẻ: chấm màu + tên + badge "Tiếng Anh" nếu isEnglish + số bộ học; nút Sửa / Xoá. "Tạo danh mục" mở Modal (tên, màu chọn dạng swatch, switch "Bộ từ vựng tiếng Anh (hiện phiên âm, nút đọc)"); Sửa dùng cùng Modal; Xoá có confirm modal, nút Xoá bị khoá + giải thích khi còn bộ học (và hiện lỗi 409 từ server nếu có). Empty state, loading.tsx theo mẫu hiện có. Link vào trang: trong menu avatar ("Quản lý danh mục") và nút nhỏ cạnh bộ lọc danh mục ở trang chủ.
- SetFilters: tab danh mục sinh động từ DB (Tất cả + từng danh mục, cuộn ngang trên mobile). SetForm: Select danh mục (+ link "Quản lý danh mục"). SetCard / trang chi tiết: Badge dùng màu của danh mục. Tailwind v4 cần class đầy đủ → map `CATEGORY_COLORS` sang class tĩnh trong `src/components/categories/colors.ts`.

### 13.3 Phân công
- **W6-A (backend)**: `prisma/schema.prisma`, `prisma/migrations/*`, `prisma/seed.ts`+loaders, `src/lib/{validators,dto,api,categories}.ts`, `src/app/api/**`, `src/app/(auth)/actions.ts` (2 danh mục mặc định), **toàn bộ** `src/app/page.tsx`, `src/app/sets/[id]/**/page.tsx`, `src/app/categories/page.tsx` (data + nối props), README, vitest.
- **W6-B (UI)**: `src/components/ui/Select.tsx` (+ file con), `src/components/categories/*`, `src/components/sets/*`, `src/components/cards/*` khi đổi `english`, `src/components/study/*` nếu cần, `src/components/layout/UserMenu.tsx`, `src/app/categories/loading.tsx`.
- **Props hợp đồng giữa A và B** (A nối trong page, B cài trong component): `SetFilters({ categories: CategoryDTO[] })` (đọc `?category=<id>` từ URL); `SetForm({ categories: CategoryDTO[], set?: StudySetDTO, onCancel? })` và `CreateSetButton({ categories })`; `CategoryManager({ initialCategories: CategoryDTO[] })` (client, tự gọi API `/api/categories`, dùng router.refresh()); `SetCard`/`LevelBadge` đọc `set.category`. Component `english` flag của `CardList` giữ nguyên prop `english: boolean` (A truyền `set.category.isEnglish`).
- DB phát triển: chỉ Docker local (override env như đợt 4–5), KHÔNG chạm Supabase, không sửa `.env`. Orchestrator tự chạy `migrate deploy` lên Supabase cuối đợt (có xin phép user).

### Tiến độ đợt 6
- [x] W6-A backend/migration/seed ✅ (migration 20261002120000_add_categories, 107 test)
- [x] W6-B dropdown + quản lý danh mục UI ✅
- [x] W6-QA
- [x] Supabase: migrate deploy `add_categories` (đã chạy: 36 set/994 thẻ giữ nguyên, 0 orphan)

---

## 14. Đợt 7 — Học hiệu quả, thư viện chung, quota, thống kê, tiện ích, vận hành

Mục tiêu: triển khai 15 đề xuất: SRS, thư viện dùng chung, quota, thống kê/streak, mục tiêu ngày + nhắc nhở, chế độ nghe, cloze, đánh dấu sao/từ khó, tìm kiếm toàn cục, xuất dữ liệu, gợi ý AI, dark mode + offline, chia sẻ link, quên mật khẩu + xuất dữ liệu tài khoản, trang admin.

Nguyên tắc chung (mọi agent):
- **DB phát triển: chỉ Docker local** `postgresql://knowledge:knowledge@localhost:5433/knowledge`. Đặt `DATABASE_URL` và `DIRECT_URL` inline trên từng lệnh (dotenv không ghi đè biến đã có). **Không** sửa `.env`, **không** chạm Supabase. Orchestrator chạy `migrate deploy` lên Supabase cuối đợt (có xin phép user).
- **Một migration duy nhất** `learning_features`, chỉ thêm (additive), không mất dữ liệu. Chỉ W7-A sửa `schema.prisma` và migration.
- Chỉ sửa file mình sở hữu (bảng 14.3). Cần thay đổi file của người khác → ghi vào báo cáo, không tự sửa.
- Đợt song song (W2) **không** chạy `next dev`/`next build` (khoá `.next`). Kiểm bằng `npx tsc --noEmit`, `npx eslint <file của mình>`, `npx vitest run <test của mình>`. Lỗi tsc ở file người khác (đang làm dở) thì bỏ qua.
- Next 16: đọc `node_modules/next/dist/docs/` trước khi dùng API lạ; `params`/`searchParams` là Promise; middleware tên là `proxy`.
- Giữ phong cách code hiện có: route handler dùng `requireApiUser` + helpers `src/lib/http.ts`, thông báo lỗi tiếng Việt, test vitest cho logic thuần trong `__tests__`.
- Tiết kiệm dung lượng: không lưu log thô từng lượt ôn; dùng bảng tổng hợp theo ngày.
- "Hôm nay" tính theo `Asia/Ho_Chi_Minh` (`src/lib/dates.ts`).

### 14.1 Data model (W7-A)
```prisma
enum Visibility { PRIVATE LINK PUBLIC }   // LINK: ai có link xem được; PUBLIC: hiện ở thư viện khi approved
enum ReviewMode { FLASHCARD QUIZ TYPING MATCHING LISTEN CLOZE REVIEW }

// User: thêm
  dailyGoal       Int       @default(20)   // số thẻ/ngày, 5–500
  emailReminders  Boolean   @default(false)
  lastReminderAt  DateTime?

// StudySet: thêm
  visibility  Visibility @default(PRIVATE)
  shareToken  String?    @unique           // base64url ngẫu nhiên 22 ký tự, tạo khi bật LINK/PUBLIC
  approved    Boolean    @default(false)   // admin duyệt mới hiện ở /library
  publishedAt DateTime?
  @@index([visibility, approved, publishedAt])

model SetSubscription {   // "Thêm vào thư viện của tôi" = tham chiếu, không sao chép
  userId, setId (Cascade cả hai), createdAt
  @@id([userId, setId]) @@index([setId])
}

model CardReview {        // trạng thái SRS + sao của 1 user trên 1 thẻ (chỉ tạo khi user ôn/đánh sao)
  userId, cardId, setId (Cascade cả ba)
  ease Float @default(2.5); interval Int @default(0) /* ngày */; reps Int @default(0); lapses Int @default(0)
  due DateTime @default(now()); lastReviewedAt DateTime?; starred Boolean @default(false)
  @@id([userId, cardId]) @@index([userId, due]) @@index([userId, setId])
}

model StudyDay {          // tổng hợp theo ngày → thống kê, streak, mục tiêu
  userId (Cascade); day DateTime @db.Date; reviewed Int @default(0); correct Int @default(0); newCards Int @default(0)
  @@id([userId, day])
}

model PasswordResetToken { // id = sha256(token) hex; TTL 30 phút; dùng 1 lần
  id String @id; userId (Cascade); expiresAt DateTime; usedAt DateTime?; createdAt DateTime @default(now())
  @@index([userId])
}

model AiUsage { userId (Cascade); day DateTime @db.Date; count Int @default(0); @@id([userId, day]) }

model JobRun  { name String @id; lastRunAt DateTime; ok Boolean; result Json? }
```

### 14.2 Hợp đồng chung (W7-A tạo, các agent khác dùng)
- `src/lib/dates.ts`: `todayVN(now?) → Date` (UTC 00:00 của ngày VN, dùng cho cột `@db.Date`), `addDays`, `dayKey(date) → "YYYY-MM-DD"`.
- `src/lib/srs.ts` (thuần + test): `type Grade = 0|1|2|3` (Lại / Khó / Được / Dễ). `nextReview(state, grade, now) → { ease, interval, reps, lapses, due }` kiểu SM-2: grade 0 → lapses+1, reps=0, interval=0, due = now + 10 phút, ease −0.2 (tối thiểu 1.3); grade ≥ 1 → interval 1 → 3 → round(interval·ease·hệ số), hệ số 1.2 cho Dễ và 0.8 cho Khó, ease ±0.15 cho Dễ/Khó. `isHard(state)` = lapses ≥ 2 hoặc ease < 2.0. `gradeFromCorrect(correct) → Grade` (đúng → 2, sai → 0).
- `src/lib/quota.ts`: `QUOTA = { setsPerUser: 100, cardsPerUser: 5000, cardsPerSet: 2000, subscriptionsPerUser: 200, aiPerDay: 50 }` (ghi đè bằng env `QUOTA_*`), `getUsage(userId) → { sets, cards, subscriptions }`, `checkQuota(user, { sets?, cards?, setId?, subscriptions? }) → string | null` (thông báo lỗi tiếng Việt). ADMIN không bị giới hạn.
- `src/lib/access.ts`: `getOwnedSet(userId, setId)`, `getReadableSet(userId, setId) → { set, isOwner, subscribed } | null` (chủ sở hữu, hoặc đã subscribe một set PUBLIC+approved hay LINK), `getSetByShareToken(token)`. Route học (progress, reviews, star, export, trang study/quiz) dùng `getReadableSet`; route sửa dùng `getOwnedSet`.
- `src/lib/validators.ts` thêm: `VISIBILITIES`, `REVIEW_MODES`, `reviewInputSchema = { setId: uuid, mode, items: [{ cardId: uuid, grade: 0..3 }] (1..500) }`, `starInputSchema = { starred }`, `visibilityInputSchema = { visibility }`, `studySettingsSchema = { dailyGoal 5..500, emailReminders }`, `forgotPasswordSchema`, `resetPasswordSchema`, `aiSuggestInputSchema = { term 1..200, english }`, `searchQuerySchema`. DTO: `StudySetDTO` thêm `visibility`, `isOwner`, `ownerName?`, `shareToken?` (chỉ khi isOwner); `ReviewStateDTO = { cardId, due, interval, starred, hard }`; `DueSummaryDTO = { dueCount, newCount, goal, doneToday }`; `StudyStatsDTO = { streak, longestStreak, days: { day, reviewed, correct }[] (90 ngày), totalReviewed, accuracy }`; `SearchResultDTO = { cardId, setId, setTitle, question, answer }`; `AiSuggestionDTO = { answer, explanation, partOfSpeech, phonetic? }`; `PublicSetDTO = StudySetDTO & { ownerName, subscriberCount }`.
- `src/lib/api.ts` thêm client: `recordReviews(input)`, `starCard(cardId, starred)`, `getDue()`, `setVisibility(setId, v)`, `subscribe(setId)`, `unsubscribe(setId)`, `copySet(setId)`, `search(q)`, `aiStatus()`, `aiSuggest(input)`, `updateStudySettings(input)`. Đường dẫn API: `/api/reviews`, `/api/reviews/due`, `/api/cards/[id]/star`, `/api/sets/[id]/visibility`, `/api/sets/[id]/subscription` (POST/DELETE), `/api/sets/[id]/copy`, `/api/search?q=`, `/api/ai/suggest` (GET trạng thái, POST gợi ý), `/api/account/settings`.
- `src/proxy.ts`: cho qua không cần cookie `/api/cron/`, `/s/`, `/api/share/`; thêm `/forgot-password`, `/reset-password` vào nhóm trang auth (chưa đăng nhập vào được).
- **Stub** (W7-A tạo, chủ sở hữu viết thật): `src/components/review/DueTodayCard.tsx` (server, `{ userId }`, tạm `return null`), `src/components/stats/StreakCard.tsx` (server, `{ userId }`), `src/components/layout/ThemeToggle.tsx` (client, tạm `return null`).
- `CardList` thêm prop tuỳ chọn `starredIds?: string[]`, `hardIds?: string[]`, `readOnly?: boolean` (W7-A chỉ thêm vào kiểu props, W7-B cài đặt hành vi).
- `.env.example`: thêm `RESEND_API_KEY`, `EMAIL_FROM`, `ANTHROPIC_API_KEY`, `AI_MODEL` (mặc định `claude-haiku-4-5`), `QUOTA_*` (comment).

### 14.3 Phân công (file ownership)
| Agent | Tính năng | Sở hữu |
|---|---|---|
| **W7-A** foundation (chạy trước, chặn) | schema, migration, seed vẫn chạy được, hợp đồng 14.2 | `prisma/**`, `src/lib/{validators,dto,api,dates,srs,quota,access}.ts` + test, `src/proxy.ts`, `.env.example`, stub ở 14.2, kiểu props `CardList` |
| **W7-B** SRS & từ khó | #1 lặp lại ngắt quãng, #8 đánh dấu sao/từ khó, #5 (trang ôn theo mục tiêu ngày) | `src/app/api/reviews/**`, `src/app/api/cards/[id]/star/**`, `src/app/review/**`, `src/components/review/**`, `src/components/study/**`, `src/app/sets/[id]/study/**`, `src/app/api/sets/[id]/progress/**`, `src/components/cards/{CardList,CardItem}.tsx` |
| **W7-C** chế độ kiểm tra mới | #6 nghe rồi chọn/gõ, #7 điền chỗ trống (cloze), mọi chế độ quiz gửi kết quả vào SRS | `src/components/quiz/**`, `src/app/sets/[id]/quiz/**`, `src/lib/quiz.ts` + test |
| **W7-D** thư viện, chia sẻ, quota, xuất | #2 thư viện dùng chung (publish, subscribe, copy), #13 link chỉ xem `/s/[token]`, #3 áp quota ở mọi route tạo set/thẻ/import/subscribe, #10 xuất CSV/XLSX | `src/app/api/sets/**` (trừ `progress`), `src/app/api/cards/**` (trừ `star`), `src/app/api/share/**`, `src/app/api/library/**`, `src/app/page.tsx`, `src/app/sets/[id]/{page.tsx,edit/**,import/**}`, `src/app/sets/new/**` nếu có, `src/app/library/**`, `src/app/s/**`, `src/components/sets/**`, `src/components/library/**`, `src/components/import/**` |
| **W7-E** tài khoản, thống kê, vận hành | #4 thống kê + streak, #5 (cài đặt mục tiêu + email nhắc hằng ngày), #9 tìm kiếm toàn cục, #14 quên mật khẩu + xuất toàn bộ dữ liệu, #15 trang admin (user, dung lượng DB, JobRun, duyệt set PUBLIC) | `src/app/account/**`, `src/components/account/**`, `src/components/stats/**`, `src/app/(auth)/**`, `src/components/auth/**`, `src/app/admin/**`, `src/app/api/admin/**`, `src/app/api/account/**`, `src/app/api/search/**`, `src/app/search/**`, `src/components/search/**`, `src/app/api/cron/**`, `src/lib/{cleanup,email,stats}.ts` + test, `src/lib/auth/**`, `src/components/layout/{Header,UserMenu}.tsx`, `vercel.json` |
| **W7-F** gợi ý AI | #11 thêm từ nhanh: tra từ điển + Claude gợi ý nghĩa tiếng Việt, ví dụ, từ loại; giới hạn `QUOTA.aiPerDay` qua `AiUsage`; tắt êm khi thiếu `ANTHROPIC_API_KEY` | `src/lib/ai.ts` + test, `src/app/api/ai/**`, `src/components/cards/{CardForm.tsx,useWordLookup.ts}` |
| **W7-G** (đợt 3, sau W2) | #12 dark mode (token CSS, không nháy khi tải, `ThemeToggle` trong menu) + offline (SW cache trang/API của set đã mở, network-first) | `src/app/globals.css`, `src/app/layout.tsx`, `src/components/layout/ThemeToggle.tsx`, `src/components/pwa/**`, `public/sw.js`, `public/offline.html`; được sửa class màu ở mọi component (đợt này chạy một mình) |
| **W7-QA** (đợt 4, chạy ngầm) | tsc, lint, vitest, build, E2E Playwright trên prod build + DB local; sửa lỗi nhỏ, báo lỗi lớn; cập nhật README | toàn repo |

Ghép nối giữa các agent:
- D đặt `<DueTodayCard userId>` (B) và `<StreakCard userId>` (E) vào trang chủ; set đã subscribe hiện thành nhóm "Thư viện đã lưu" (chỉ đọc).
- D truyền `starredIds`, `hardIds`, `readOnly={!isOwner}` cho `CardList` ở trang chi tiết set (đọc `CardReview` của user, dùng `isHard`).
- C gọi `api.recordReviews({ setId, mode, items })` khi xong mỗi lượt quiz (ngoài `saveQuizResult` cũ). B làm `POST /api/reviews`: cập nhật `CardReview` theo `nextReview` và cộng `StudyDay` (reviewed; correct = grade ≥ 2; newCards = thẻ ôn lần đầu) trong một transaction.
- Flashcard (B): Đã thuộc → grade 2, Chưa thuộc → grade 0. Trang `/review` có 4 nút Lại/Khó/Được/Dễ, gom thẻ đến hạn từ mọi set đọc được, thêm thẻ mới tới khi đạt `dailyGoal`.
- E: `UserMenu` thêm `ThemeToggle` (stub, G làm thật), link "Ôn hôm nay" `/review`, "Thư viện" `/library`, "Tìm kiếm" `/search`, "Quản trị" (role ADMIN). Cron `cleanup` thêm: xoá `PasswordResetToken` hết hạn, `AiUsage` > 30 ngày, `StudyDay` > 400 ngày, ghi `JobRun`. Cron mới `reminders` (12:00 UTC = 19:00 VN) gửi email cho user bật nhắc nhở và còn thẻ đến hạn, tối đa 1 lần/ngày. Email gửi qua Resend bằng `fetch` (không thêm thư viện); thiếu `RESEND_API_KEY` → log link ra console. Trang quên mật khẩu luôn báo "Nếu email tồn tại, bạn sẽ nhận được link" (không lộ email có tồn tại hay không) và có rate limit.
- F: gọi Claude theo skill `claude-api`; model mặc định `claude-haiku-4-5`, timeout 10 s, kiểm JSON trả về bằng zod; không có key → `GET /api/ai/suggest` trả `{ enabled: false }` và CardForm ẩn nút.

### 14.4 Thứ tự chạy
1. W1: **W7-A** (chặn).
2. W2 song song: **B, C, D, E, F**.
3. W3: **W7-G**.
4. W4: **W7-QA** chạy ngầm; orchestrator xin phép rồi `migrate deploy` lên Supabase, nhắc user đặt env mới trên Vercel.

### Tiến độ đợt 7
- [x] W7-A foundation ✅ — migration `20261002200000_learning_features` (additive, đã deploy lên DB local), 181 test xanh (+25 mới: dates/srs/quota); tsc + eslint sạch
  - Ghi chú W7-A:
    - Phần thuần của quota nằm ở `src/lib/quota-limits.ts` (`QUOTA`, `DEFAULT_QUOTA`, `parseQuota`, `evaluateQuota`, kiểu `QuotaLimits/QuotaUsage/QuotaRequest`); `src/lib/quota.ts` re-export tất cả + thêm `getUsage(userId)`, `checkQuota(user:{id,role}, {sets?,cards?,setId?,subscriptions?})`. Import từ `@/lib/quota` như hợp đồng. `QUOTA.aiPerDay` dùng cho W7-F. Vitest không có alias `@/` nên test logic thuần không được import file kéo theo `db.ts`.
    - `checkQuota`: `cards` = số thẻ sắp thêm; truyền `setId` để kiểm thêm giới hạn mỗi bộ.
    - `src/lib/srs.ts` xuất: `Grade`, `SrsState {ease,interval,reps,lapses}`, `SrsResult` (= state + `due`), `nextReview(state, grade, now?)`, `isHard(state)`, `gradeFromCorrect(bool)`, `INITIAL_SRS_STATE`, `MIN_EASE`, `DEFAULT_EASE`. Interval dùng ease MỚI; luôn tăng ít nhất +1 ngày khi đạt; làm tròn ease 2 chữ số.
    - `src/lib/dates.ts`: `todayVN(now?)`, `addDays(date, n)`, `dayKey(date)` (YYYY-MM-DD theo UTC của giá trị Date).
    - `src/lib/access.ts`: `getOwnedSet(userId,setId)` (kèm category); `getReadableSet(userId,setId) → {set(+category,+user.name),isOwner,subscribed}|null` (không chủ sở hữu thì phải đã subscribe VÀ set là LINK hoặc PUBLIC+approved); `getSetByShareToken(token)` trả set + category + user.name + cards, hoặc null nếu PRIVATE (PUBLIC chưa duyệt vẫn xem được bằng link; approved chỉ quyết định hiện ở /library).
    - `toSetDTO(set, cardCount, opts?: {isOwner?, ownerName?})` và `toSetDetailDTO(set, opts?)`; shareToken chỉ được đưa vào DTO khi isOwner. `set` phải có đủ cột mới (Prisma type đã có).
    - validators: thêm `Visibility`, `ReviewModeValue` (kiểu), `ReviewInput`, `StudySettingsInput`, `AiSuggestInput`, `DAILY_GOAL_MIN/MAX`; `resetPasswordSchema = { token, password, confirmPassword }`; `forgotPasswordSchema = { email }`; `searchQuerySchema = { q }`.
    - api client: `recordReviews → {ok,recorded}`, `starCard` dùng PUT `/api/cards/[id]/star` body `{starred}` → `{ok,starred}`, `setVisibility` dùng PUT body `{visibility}` → StudySetDTO, `subscribe` POST / `unsubscribe` DELETE → `{ok}`, `copySet` POST → StudySetDTO, `aiStatus` GET → `{enabled, remaining?}`, `updateStudySettings` PUT `/api/account/settings` → `{dailyGoal,emailReminders}`, `getDue` → DueSummaryDTO, `search` → SearchResultDTO[]. Route handler của các agent khác phải khớp method/response này.
    - proxy: `/s/` và `/api/share/` bỏ qua kiểm cookie; `/reset-password` cho qua kể cả khi đã đăng nhập; `/forgot-password` chuyển về / khi đã đăng nhập.
    - Seed đã chạy lại trên DB local (36 bộ, 994 thẻ). Migration được tạo bằng `prisma migrate diff` (migrate dev không chạy được ở môi trường không tương tác).
- [x] W7-B SRS & từ khó ✅ — POST /api/reviews, GET /api/reviews/due, PUT cards/[id]/star, trang /review, DueTodayCard, study ?only=, CardList sao/khó/readOnly; +9 test (session.ts); tsc + eslint sạch
- [x] W7-C chế độ kiểm tra mới ✅ — Nghe (chọn/gõ) + Điền chỗ trống (cloze), mọi chế độ gửi kết quả vào SRS (`recordReviews`, batch ≤500); trang quiz dùng `getReadableSet`; helper + 26 test trong `src/lib/quiz.ts`
- [x] W7-D thư viện / chia sẻ / quota / xuất ✅ — quota ở mọi route tạo, visibility/subscription/copy/library/share/export API, trang /library /s/[token], modal Chia sẻ, nhóm "Thư viện đã lưu", export CSV/XLSX + test round-trip
- [x] W7-E tài khoản / thống kê / vận hành ✅ — stats+streak, cài đặt học + cron reminders, cleanup mở rộng + JobRun, tìm kiếm, quên/đặt lại mật khẩu, export dữ liệu, /admin, UserMenu; 247 test xanh
- [x] W7-F gợi ý AI ✅ — `lib/ai.ts` + `ai-core.ts` (thuần, 11 test), `GET/POST /api/ai/suggest` (fetch Messages API, không thêm dependency, hoàn lượt khi lỗi), nút "✨ Gợi ý bằng AI" trong CardForm
- [x] W7-G dark mode + offline ✅ — token CSS dark (data-theme + prefers-color-scheme, cookie kn_theme + script chống nháy), ThemeToggle 3 chế độ trong UserMenu, SW v2 (cache pages/api network-first, xoá khi đăng xuất), OfflineBanner
- [x] W7-QA ✅ (tsc/eslint/vitest/build sạch; E2E 15 tính năng đạt; sửa shareToken, layout StreakCard, hydration quiz, số "Mới")
- [x] Supabase: migrate deploy `learning_features` + `single_admin_publish_sets` (2026-10-03: 37 set/994 thẻ giữ nguyên; 1 ADMIN; mọi set PUBLIC + approved)

## 15. Đợt 8 — Thông báo đẩy thay email

Bỏ hoàn toàn email (Resend). Thay bằng Web Push (VAPID, thư viện `web-push`) + trung tâm thông báo trong app (chuông ở header).

- Env mới: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (mặc định `mailto:admin@example.com`); tạo key: `npm run push:keys`. Bỏ `RESEND_API_KEY`, `EMAIL_FROM`.
- Migration `20261003100000_notifications`: đổi tên `User.emailReminders` → `pushReminders` (giữ dữ liệu), thêm `Notification` (enum `NotificationType`) và `PushSubscription`.
- `src/lib/notify.ts`: `notify()` (lưu + push) và `sendPushOnly()` (chỉ push, dùng cho link đặt lại mật khẩu); 404/410 xoá subscription; lỗi push không ném ra ngoài.

### Tiến độ đợt 8
- [x] Migration + schema (`pushReminders`, `Notification`, `PushSubscription`)
- [x] `notify.ts`, `site.ts` (`siteUrl`), xoá `email.ts`
- [x] Cron nhắc học dùng `notify`; cleanup xoá thông báo cũ (đã đọc > 30 ngày, tất cả > 90 ngày)
- [x] Quên mật khẩu gửi link qua push; admin tạo link đặt lại mật khẩu ở `/admin` (hiệu lực 30 phút)
- [x] Thông báo khi admin duyệt/từ chối bộ, và khi có người lưu bộ của bạn (chống spam 24 giờ)
- [x] API: `/api/push/subscribe`, `/api/notifications` (+ `unread-count`, `[id]/read`, `read-all`)
- [x] UI: `NotificationBell` (poll 60 giây, focus, SW postMessage), trang `/notifications`, điều khiển push trong cài đặt học
- [x] Service worker v3: `push` + `notificationclick`
- [x] Supabase: migrate deploy `notifications` (2026-10-03)
- [ ] Đặt biến VAPID trên Vercel + redeploy, thử push thật trên thiết bị

## 16. Đăng nhập Google (Firebase Auth) + onboarding

Thay email/mật khẩu bằng **Google sign-in qua Firebase Auth là phương thức đăng nhập duy nhất**; thêm màn hình onboarding bắt buộc.

- Kiến trúc: Firebase chỉ chứng minh danh tính. Client `signInWithPopup` (PWA/popup bị chặn: `signInWithRedirect`) → ID token → Server Action `signInWithGoogle` → `jose` xác minh (JWKS securetoken, `iss`/`aud` = project id, RS256, `sign_in_provider = google.com`, `email_verified = true`) → tìm/tạo User theo **email** → `createSession` (cookie `kn_session` giữ nguyên). Không dùng firebase-admin.
- Migration `20261004000000_google_auth_onboarding`: bỏ `User.passwordHash` và bảng `PasswordResetToken`; thêm `firebaseUid` (unique, tham khảo), `fullName`, `birthYear`, `nativeLanguage` (ISO 639-1), `onboardedAt` (null = phải onboard; tài khoản cũ onboard một lần).
- `/welcome`: tên hiển thị, họ tên, năm sinh (hiện tuổi ≈), ngôn ngữ mẹ đẻ (combobox tìm kiếm, mặc định `vi`). `requireUser()` chuyển tới `/welcome?next=…` khi chưa onboard (proxy gắn header nội bộ `x-kn-path`); `requireApiUser()` trả 403.
- `/account`: bỏ tab mật khẩu; sửa được tên/họ tên/năm sinh/ngôn ngữ, email chỉ đọc. Bỏ đăng ký, quên/đặt lại mật khẩu, công cụ link đặt lại của admin, `auth:hash`, `ADMIN_PASSWORD*`.
- Safari/iOS PWA: `next.config.ts` rewrite `/__/auth/*` và `/__/firebase/*` sang `<project>.firebaseapp.com`; `X-Frame-Options: SAMEORIGIN` cho `/__/*`; proxy.ts loại `__/` khỏi matcher. Production đặt `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` = domain site.
- Test: xác minh claim bằng khoá RS256 sinh cục bộ (hợp lệ, sai aud/iss, hết hạn, email chưa xác minh, provider khác, thiếu email), `onboardingSchema`, danh sách ngôn ngữ, `ageFromBirthYear`.

### Tiến độ đợt 9
- [x] Code + migration viết tay (chưa áp vào DB production)
- [ ] `prisma migrate deploy` lên Supabase (thủ công)
- [ ] Vercel env `NEXT_PUBLIC_FIREBASE_*` (AUTH_DOMAIN = domain site), Authorized domains + OAuth redirect URI `https://knowledge.gutanembroidery.com/__/auth/handler`
