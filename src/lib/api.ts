import type {
  AiSuggestInput,
  AiSuggestionDTO,
  BulkCardsInput,
  CardDTO,
  CardInput,
  CategoryDTO,
  CategoryInput,
  DictionaryEntryDTO,
  DueSummaryDTO,
  EnrichResultDTO,
  Level,
  NotificationsPageDTO,
  PushSubscribeInput,
  QuizResultInput,
  ReviewInput,
  SearchResultDTO,
  StudySettingsInput,
  Visibility,
  SetInput,
  StudySetDTO,
  StudyProgressInput,
  StudySetDetailDTO,
} from "./validators";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error ?? `Request failed (${res.status})`);
  }
  return data as T;
}

const send = (method: string, body?: unknown): RequestInit => ({
  method,
  body: body === undefined ? undefined : JSON.stringify(body),
});

export const api = {
  listSets(params: { category?: string; level?: Level | ""; q?: string } = {}) {
    const search = new URLSearchParams();
    if (params.category) search.set("category", params.category);
    if (params.level) search.set("level", params.level);
    if (params.q) search.set("q", params.q);
    const qs = search.toString();
    return request<StudySetDTO[]>(`/api/sets${qs ? `?${qs}` : ""}`);
  },
  listCategories: () => request<CategoryDTO[]>("/api/categories"),
  createCategory: (input: CategoryInput) => request<CategoryDTO>("/api/admin/categories", send("POST", input)),
  updateCategory: (id: string, input: Partial<CategoryInput>) =>
    request<CategoryDTO>(`/api/admin/categories/${id}`, send("PATCH", input)),
  deleteCategory: (id: string) => request<{ ok: true }>(`/api/admin/categories/${id}`, send("DELETE")),
  createSet: (input: SetInput) => request<StudySetDTO>("/api/sets", send("POST", input)),
  getSet: (id: string) => request<StudySetDetailDTO>(`/api/sets/${id}`),
  updateSet: (id: string, input: Partial<SetInput>) =>
    request<StudySetDTO>(`/api/sets/${id}`, send("PATCH", input)),
  deleteSet: (id: string) => request<{ ok: true }>(`/api/sets/${id}`, send("DELETE")),
  createCard: (setId: string, input: CardInput) =>
    request<CardDTO>(`/api/sets/${setId}/cards`, send("POST", input)),
  bulkCreateCards: (setId: string, input: BulkCardsInput) =>
    request<{ created: number }>(`/api/sets/${setId}/cards/bulk`, send("POST", input)),
  updateCard: (id: string, input: Partial<CardInput>) =>
    request<CardDTO>(`/api/cards/${id}`, send("PATCH", input)),
  deleteCard: (id: string) => request<{ ok: true }>(`/api/cards/${id}`, send("DELETE")),
  lookupWord: (word: string) =>
    request<DictionaryEntryDTO>(`/api/dictionary?word=${encodeURIComponent(word)}`),
  enrichSet: (setId: string) => request<EnrichResultDTO>(`/api/sets/${setId}/enrich`, send("POST")),

  // ── Đợt 7 ──
  /** Ghi kết quả ôn (cập nhật SRS + thống kê ngày). */
  recordReviews: (input: ReviewInput) => request<{ ok: true; recorded: number }>("/api/reviews", send("POST", input)),
  starCard: (cardId: string, starred: boolean) =>
    request<{ ok: true; starred: boolean }>(`/api/cards/${cardId}/star`, send("PUT", { starred })),
  getDue: () => request<DueSummaryDTO>("/api/reviews/due"),
  setVisibility: (setId: string, visibility: Visibility) =>
    request<StudySetDTO>(`/api/sets/${setId}/visibility`, send("PUT", { visibility })),
  subscribe: (setId: string) => request<{ ok: true }>(`/api/sets/${setId}/subscription`, send("POST")),
  unsubscribe: (setId: string) => request<{ ok: true }>(`/api/sets/${setId}/subscription`, send("DELETE")),
  copySet: (setId: string) => request<StudySetDTO>(`/api/sets/${setId}/copy`, send("POST")),
  search: (q: string) => request<SearchResultDTO[]>(`/api/search?q=${encodeURIComponent(q)}`),
  aiStatus: () => request<{ enabled: boolean; remaining?: number }>("/api/ai/suggest"),
  aiSuggest: (input: AiSuggestInput) => request<AiSuggestionDTO>("/api/ai/suggest", send("POST", input)),
  updateStudySettings: (input: StudySettingsInput) =>
    request<StudySettingsInput>("/api/account/settings", send("PUT", input)),
  listNotifications: (cursor?: string | null) =>
    request<NotificationsPageDTO>(`/api/notifications${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`),
  unreadNotificationCount: () => request<{ unreadCount: number }>("/api/notifications/unread-count"),
  markNotificationRead: (id: string) => request<{ ok: true }>(`/api/notifications/${id}/read`, send("POST")),
  markAllNotificationsRead: () => request<{ ok: true; updated: number }>("/api/notifications/read-all", send("POST")),
  pushSubscribe: (sub: PushSubscribeInput) => request<{ ok: true }>("/api/push/subscribe", send("POST", sub)),
  pushUnsubscribe: (endpoint: string) => request<{ ok: true }>("/api/push/subscribe", send("DELETE", { endpoint })),
};

export type EnrichSummary = {
  updated: number;
  notFound: number;
  remaining: number;
  /** True when the loop stopped early (offline / dictionary unreachable). */
  interrupted: boolean;
};

/**
 * Calls the enrich endpoint repeatedly until no card is left without a lookup.
 * Never throws: network problems stop the loop and are reported via `interrupted`.
 * `onProgress(done, total)` counts cards processed out of those missing at the start.
 */
export async function enrichSetFully(
  setId: string,
  onProgress?: (done: number, total: number) => void,
): Promise<EnrichSummary> {
  let updated = 0;
  let notFound = 0;
  let remaining = 0;
  let total = 0;
  try {
    for (;;) {
      const r = await api.enrichSet(setId);
      updated += r.updated;
      notFound += r.notFound;
      remaining = r.remaining;
      if (total === 0) total = r.updated + r.notFound + r.remaining;
      onProgress?.(Math.min(updated + notFound, total), total);
      if (remaining === 0) return { updated, notFound, remaining, interrupted: false };
      if (r.updated + r.notFound === 0) return { updated, notFound, remaining, interrupted: true };
    }
  } catch {
    return { updated, notFound, remaining, interrupted: true };
  }
}

/** Saves study progress. `keepalive` lets the request outlive the page (pagehide). */
export async function saveStudyProgress(
  setId: string,
  input: StudyProgressInput,
  opts: { keepalive?: boolean } = {},
): Promise<void> {
  await request<{ ok: true }>(`/api/sets/${setId}/progress`, { ...send("PUT", input), keepalive: opts.keepalive });
}

export async function saveQuizResult(setId: string, input: QuizResultInput): Promise<void> {
  await request<{ ok: true }>(`/api/sets/${setId}/progress`, send("PATCH", input));
}
