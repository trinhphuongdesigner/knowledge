/** Shared auth types — no "use server"/"server-only" so client components can import them. */
export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
};

export type AuthFormState =
  | {
      error?: string;
      fieldErrors?: Partial<Record<"email" | "password" | "name" | "confirmPassword", string[]>>;
      values?: { email?: string; name?: string };
    }
  | undefined;

export const SESSION_COOKIE = "kn_session";

export type AccountFormState =
  | {
      error?: string;
      success?: string;
      fieldErrors?: Partial<
        Record<"name" | "email" | "currentPassword" | "newPassword" | "confirmPassword", string[]>
      >;
      values?: { name?: string; email?: string };
    }
  | undefined;

export type ResetFormState =
  | {
      error?: string;
      success?: string;
      fieldErrors?: Partial<Record<"email" | "password" | "confirmPassword", string[]>>;
      values?: { email?: string };
    }
  | undefined;
