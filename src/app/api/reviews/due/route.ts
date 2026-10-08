import { requireApiUser } from "@/lib/auth/dal";
import { json, serverError } from "@/lib/http";
import { getDueSummary } from "@/components/review/queries";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await requireApiUser(req);
    if (user instanceof Response) return user;
    const { dueCount, goal, doneToday } = await getDueSummary(user.id);
    return json({ dueCount, goal, doneToday });
  } catch (e) {
    return serverError(e);
  }
}
