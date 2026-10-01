import { isLookupCandidate } from "./words";

/**
 * Server-side lookup against the free Dictionary API (https://dictionaryapi.dev).
 * Needs internet; every failure mode is reported as a status, never thrown.
 */

export type WordInfo = {
  word: string;
  phonetic: string | null;
  partOfSpeech: string | null;
  audioUrl: string | null;
};

export type LookupResult =
  | { status: "ok"; info: WordInfo }
  | { status: "notfound" }
  | { status: "ineligible" }
  | { status: "error" };

const ENDPOINT = "https://api.dictionaryapi.dev/api/v2/entries/en/";
const TIMEOUT_MS = 25000; // dictionaryapi.dev is sometimes slow (~20s)

// Only definitive answers (found / not found) are cached; network errors are retried.
const cache = new Map<string, WordInfo | null>();

type RawPhonetic = { text?: string; audio?: string };
type RawEntry = {
  word?: string;
  phonetic?: string;
  phonetics?: RawPhonetic[];
  meanings?: { partOfSpeech?: string }[];
};

function normalizeAudio(url: string): string {
  return url.startsWith("//") ? `https:${url}` : url;
}

function toWordInfo(word: string, entries: RawEntry[]): WordInfo {
  const phonetics = entries.flatMap((e) => e.phonetics ?? []);
  const withAudio = phonetics.filter((p) => p.audio?.trim());
  const audio = withAudio.find((p) => /-us\./i.test(p.audio ?? "")) ?? withAudio[0];
  const usWithText = withAudio.find((p) => /-us\./i.test(p.audio ?? "") && p.text?.trim());
  const text =
    usWithText?.text ??
    phonetics.find((p) => p.text?.trim())?.text ??
    entries.find((e) => e.phonetic?.trim())?.phonetic ??
    null;
  const pos = [
    ...new Set(
      entries.flatMap((e) => (e.meanings ?? []).map((m) => m.partOfSpeech?.trim()).filter((v): v is string => !!v)),
    ),
  ].join(", ");
  return {
    word: entries[0]?.word ?? word,
    phonetic: text ? text.trim().slice(0, 200) : null,
    partOfSpeech: pos ? pos.slice(0, 200) : null,
    audioUrl: audio?.audio ? normalizeAudio(audio.audio.trim()).slice(0, 1000) : null,
  };
}

export async function lookupWordDetailed(raw: string): Promise<LookupResult> {
  const word = raw.trim().replace(/\s+/g, " ");
  if (!isLookupCandidate(word)) return { status: "ineligible" };
  const key = word.toLowerCase();
  if (cache.has(key)) {
    const hit = cache.get(key) ?? null;
    return hit ? { status: "ok", info: hit } : { status: "notfound" };
  }
  try {
    const res = await fetch(ENDPOINT + encodeURIComponent(key), {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    if (res.status === 404) {
      cache.set(key, null);
      return { status: "notfound" };
    }
    if (!res.ok) return { status: "error" };
    const data: unknown = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      cache.set(key, null);
      return { status: "notfound" };
    }
    const info = toWordInfo(key, data as RawEntry[]);
    cache.set(key, info);
    return { status: "ok", info };
  } catch {
    return { status: "error" };
  }
}

/** Returns word info, or null when the word is unknown / ineligible / the service is unreachable. */
export async function lookupWord(word: string): Promise<WordInfo | null> {
  const r = await lookupWordDetailed(word);
  return r.status === "ok" ? r.info : null;
}
