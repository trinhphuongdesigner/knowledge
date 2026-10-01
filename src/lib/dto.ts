import type { Card, StudySet } from "@/generated/prisma/client";
import type { CardDTO, StudySetDTO, StudySetDetailDTO } from "./validators";

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

export function toSetDTO(set: StudySet, cardCount: number): StudySetDTO {
  return {
    id: set.id,
    title: set.title,
    description: set.description,
    category: set.category,
    level: set.level,
    cardCount,
    createdAt: set.createdAt.toISOString(),
    updatedAt: set.updatedAt.toISOString(),
  };
}

export function toSetDetailDTO(set: StudySet & { cards: Card[] }): StudySetDetailDTO {
  return { ...toSetDTO(set, set.cards.length), cards: set.cards.map(toCardDTO) };
}
