import type { Card, Category, StudySet } from "@/generated/prisma/client";
import type { CardDTO, CategoryDTO, CategoryRefDTO, StudySetDTO, StudySetDetailDTO } from "./validators";

export type { CategoryDTO, CategoryRefDTO } from "./validators";

export function toCardDTO(card: Card): CardDTO {
  return {
    id: card.id,
    setId: card.setId,
    question: card.question,
    answer: card.answer,
    explanation: card.explanation,
    // "" is an internal "already looked up, nothing found" marker.
    phonetic: card.phonetic || null,
    partOfSpeech: card.partOfSpeech || null,
    audioUrl: card.audioUrl || null,
    position: card.position,
  };
}

export function toCategoryRefDTO(c: Category): CategoryRefDTO {
  return { id: c.id, name: c.name, color: c.color, isEnglish: c.isEnglish };
}

export function toCategoryDTO(c: Category, setCount: number): CategoryDTO {
  return { ...toCategoryRefDTO(c), setCount, createdAt: c.createdAt.toISOString() };
}

export type SetDTOOptions = {
  /** default true */
  isOwner?: boolean;
  ownerName?: string | null;
};

export function toSetDTO(
  set: StudySet & { category: Category },
  cardCount: number,
  opts: SetDTOOptions = {},
): StudySetDTO {
  const isOwner = opts.isOwner ?? true;
  return {
    id: set.id,
    title: set.title,
    description: set.description,
    category: toCategoryRefDTO(set.category),
    level: set.level,
    cardCount,
    visibility: set.visibility,
    isOwner,
    ownerName: opts.ownerName,
    // shareToken only ever leaves the server for the owner
    shareToken: isOwner ? set.shareToken : undefined,
    createdAt: set.createdAt.toISOString(),
    updatedAt: set.updatedAt.toISOString(),
  };
}

export function toSetDetailDTO(
  set: StudySet & { category: Category; cards: Card[] },
  opts: SetDTOOptions = {},
): StudySetDetailDTO {
  return { ...toSetDTO(set, set.cards.length, opts), cards: set.cards.map(toCardDTO) };
}
