import { getCurrentUser } from "@/lib/auth/dal";
import { HideOnAuthRoutes } from "@/components/layout/HideOnAuthRoutes";
import { Whiteboard } from "./Whiteboard";

/** Bảng viết tay nổi — chỉ cho user đã đăng nhập và hoàn tất hồ sơ. */
export async function BoardMount() {
  const user = await getCurrentUser();
  if (!user?.onboarded) return null;
  return (
    <HideOnAuthRoutes>
      <Whiteboard />
    </HideOnAuthRoutes>
  );
}
