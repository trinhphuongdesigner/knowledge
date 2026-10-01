import { Badge } from "@/components/ui";
import { LEVEL_LABELS, type Level } from "@/lib/validators";

export function LevelBadge({ level }: { level: Level | null | undefined }) {
  if (!level) return null;
  return <Badge tone="gray">{LEVEL_LABELS[level]}</Badge>;
}
