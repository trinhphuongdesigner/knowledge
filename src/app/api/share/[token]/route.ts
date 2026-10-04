import { getSetByShareToken } from "@/lib/access";
import { toCardDTO, toSetDetailDTO } from "@/lib/dto";
import { json, notFound, serverError } from "@/lib/http";
import type { StudySetDetailDTO } from "@/lib/validators";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ token: string }> };

/** Public (no auth) read-only JSON of a shared (LINK / PUBLIC) set. */
export async function GET(_req: Request, { params }: Ctx) {
  try {
    const { token } = await params;
    const set = await getSetByShareToken(token);
    if (!set) return notFound("shareNotFound");
    const dto: StudySetDetailDTO = toSetDetailDTO(set, { isOwner: false, ownerName: set.user.name });
    return json({ ...dto, cards: set.cards.map(toCardDTO) });
  } catch (e) {
    return serverError(e);
  }
}
