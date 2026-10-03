/** Shared auth types — no "use server"/"server-only" so client components can import them. */
export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
  /** false = chưa hoàn tất hồ sơ ở /welcome */
  onboarded: boolean;
};

export const SESSION_COOKIE = "kn_session";

export type ProfileField = "name" | "fullName" | "birthYear" | "nativeLanguage";

/** Trạng thái form hồ sơ (onboarding + trang tài khoản). */
export type ProfileFormState =
  | {
      error?: string;
      success?: string;
      fieldErrors?: Partial<Record<ProfileField, string[]>>;
      values?: { name?: string; fullName?: string; birthYear?: string; nativeLanguage?: string };
    }
  | undefined;

export type AccountFormState = ProfileFormState;
