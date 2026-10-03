/** Shared auth types — no "use server"/"server-only" so client components can import them. */
import type { Gender } from "@/lib/profile";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
  /** false = chưa hoàn tất hồ sơ ở /welcome */
  onboarded: boolean;
  /** Ảnh đại diện hiệu lực (đã tính useGoogleAvatar); null = dùng ảnh mặc định theo giới tính */
  avatarUrl: string | null;
  gender: Gender | null;
};

export const SESSION_COOKIE = "kn_session";

export type ProfileField = "name" | "fullName" | "birthYear" | "nativeLanguage" | "gender";

/** Trạng thái form hồ sơ (onboarding + trang tài khoản). */
export type ProfileFormState =
  | {
      error?: string;
      success?: string;
      fieldErrors?: Partial<Record<ProfileField, string[]>>;
      values?: { name?: string; fullName?: string; birthYear?: string; nativeLanguage?: string; gender?: string; useGoogleAvatar?: boolean };
    }
  | undefined;

export type AccountFormState = ProfileFormState;
