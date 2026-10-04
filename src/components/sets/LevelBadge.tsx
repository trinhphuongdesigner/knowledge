import { Badge } from "@/components/ui";
import { getT } from "@/i18n/server";
import type { Level } from "@/lib/validators";

export async function LevelBadge({ level }: { level: Level | null | undefined }) {
  if (!level) return null;
  const t = await getT("sets");
  return <Badge tone="gray">{t(`levels.${level}`)}</Badge>;
}
