-- Chỉ một tài khoản admin; mọi tài khoản khác là USER.
UPDATE "User" SET "role" = 'USER' WHERE lower("email") <> 'trinhphuong.dev@gmail.com';
UPDATE "User" SET "role" = 'ADMIN' WHERE lower("email") = 'trinhphuong.dev@gmail.com';

-- Mọi bộ thẻ hiện có được publish (PUBLIC + đã duyệt) để người dùng khác lưu / sao chép.
UPDATE "StudySet"
SET "visibility" = 'PUBLIC',
    "approved" = true,
    "publishedAt" = COALESCE("publishedAt", now()),
    "shareToken" = COALESCE("shareToken", replace(gen_random_uuid()::text, '-', ''))
WHERE "visibility" <> 'PUBLIC' OR "approved" = false OR "shareToken" IS NULL;
