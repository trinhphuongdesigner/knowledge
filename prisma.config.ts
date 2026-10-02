import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Prisma CLI (migrate/seed) needs a session connection. On Supabase the app's
    // DATABASE_URL is the transaction pooler, so DIRECT_URL takes precedence.
    url: process.env.DIRECT_URL || env("DATABASE_URL"),
  },
});
