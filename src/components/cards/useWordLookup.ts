"use client";

import { useCallback, useRef, useState } from "react";
import { api } from "@/lib/api";
import { isLookupCandidate } from "@/lib/words";
import type { DictionaryEntryDTO } from "@/lib/validators";

/** Client wrapper around GET /api/dictionary with Vietnamese status messages. */
export function useWordLookup() {
  const [looking, setLooking] = useState(false);
  const [message, setMessage] = useState("");
  const seq = useRef(0);

  const lookup = useCallback(async (word: string, opts: { silent?: boolean } = {}) => {
    const w = word.trim();
    if (!isLookupCandidate(w)) {
      if (!opts.silent) setMessage("Chỉ tra được từ hoặc cụm 1–3 từ tiếng Anh.");
      return null;
    }
    const id = ++seq.current;
    setLooking(true);
    setMessage("");
    try {
      const entry: DictionaryEntryDTO = await api.lookupWord(w);
      if (id !== seq.current) return null;
      if (!entry.phonetic && !entry.partOfSpeech && !opts.silent) setMessage("Từ điển không có phiên âm cho từ này.");
      return entry;
    } catch (e) {
      if (id === seq.current && !opts.silent) {
        setMessage(e instanceof Error ? e.message : "Không tra được phiên âm.");
      }
      return null;
    } finally {
      if (id === seq.current) setLooking(false);
    }
  }, []);

  const reset = useCallback(() => {
    seq.current++;
    setLooking(false);
    setMessage("");
  }, []);

  return { looking, message, lookup, reset };
}
