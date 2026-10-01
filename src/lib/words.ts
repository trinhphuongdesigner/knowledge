const WORD_PATTERN = /^[A-Za-z][A-Za-z'’-]*(?:\s+[A-Za-z][A-Za-z'’-]*){0,2}$/;

/** True when the text looks like 1-3 English words (so a dictionary lookup makes sense). */
export function isLookupCandidate(text: string): boolean {
  return WORD_PATTERN.test(text.trim());
}
