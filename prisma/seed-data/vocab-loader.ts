import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { z } from "zod";

const LEVELS = ["BASIC", "INTERMEDIATE", "ADVANCED"] as const;
const CATEGORIES = ["IT", "ENGLISH"] as const;

const optionalText = (max: number) => z.string().trim().max(max).nullish();

export const vocabCardSchema = z.object({
  question: z.string().trim().min(1).max(5000),
  answer: z.string().trim().min(1).max(5000),
  explanation: optionalText(5000),
  phonetic: optionalText(200),
  partOfSpeech: optionalText(200),
});

export const vocabFileSchema = z.object({
  slug: z.string().trim().min(1),
  order: z.number().int(),
  title: z.string().trim().min(1).max(200),
  description: optionalText(2000),
  category: z.enum(CATEGORIES),
  level: z.enum(LEVELS).nullish(),
  cards: z.array(vocabCardSchema).min(1).max(2000),
});

export type VocabFile = z.infer<typeof vocabFileSchema>;

/** Load + validate every `*.json` in `dir`. Missing/empty dir -> []. Invalid files warn and are skipped. */
export function loadVocabFiles(dir: string): VocabFile[] {
  if (!existsSync(dir)) {
    console.warn(`! Vocab folder not found: ${dir}`);
    return [];
  }
  const files = readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith(".json"))
    .sort();
  const out: VocabFile[] = [];
  const seen = new Set<string>();
  for (const file of files) {
    try {
      const raw = JSON.parse(readFileSync(path.join(dir, file), "utf8").replace(/^﻿/, ""));
      const parsed = vocabFileSchema.safeParse(raw);
      if (!parsed.success) {
        const issue = parsed.error.issues[0];
        console.warn(`! Skip ${file}: ${issue.path.join(".") || "(root)"} - ${issue.message}`);
        continue;
      }
      if (seen.has(parsed.data.slug)) {
        console.warn(`! Skip ${file}: duplicate slug "${parsed.data.slug}"`);
        continue;
      }
      seen.add(parsed.data.slug);
      out.push(parsed.data);
    } catch (e) {
      console.warn(`! Skip ${file}: ${(e as Error).message}`);
    }
  }
  return out.sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
}
