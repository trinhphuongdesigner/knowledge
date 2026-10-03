"use client";

import { GoogleAuthProvider, getRedirectResult, signInWithPopup, signInWithRedirect, signOut, type User } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import { signInWithGoogle } from "@/app/(auth)/actions";
import { Button } from "@/components/ui";
import { getFirebaseAuth } from "@/lib/firebase-client";
import { FormError } from "./FormError";

const GENERIC_ERROR = "Không thể đăng nhập bằng Google. Vui lòng thử lại.";
const SILENT_CODES = new Set(["auth/popup-closed-by-user", "auth/cancelled-popup-request"]);

function errorCode(e: unknown): string {
  return typeof e === "object" && e !== null && typeof (e as { code?: unknown }).code === "string"
    ? (e as { code: string }).code
    : "";
}

function messageFor(e: unknown): string {
  switch (errorCode(e)) {
    case "auth/network-request-failed":
      return "Không có kết nối mạng. Hãy kiểm tra Internet rồi thử lại.";
    case "auth/too-many-requests":
      return "Thử lại sau ít phút";
    case "auth/unauthorized-domain":
      return "Tên miền này chưa được phép đăng nhập bằng Google.";
    case "auth/user-disabled":
      return "Tài khoản Google này đã bị vô hiệu hoá.";
    default:
      return typeof navigator !== "undefined" && navigator.onLine === false
        ? "Không có kết nối mạng. Hãy kiểm tra Internet rồi thử lại."
        : GENERIC_ERROR;
  }
}

/** Ứng dụng đã cài (PWA) không mở popup ổn định, nhất là trên iOS: dùng redirect. */
function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches === true ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

export function GoogleSignInButton({ next }: { next?: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const handledRedirect = useRef(false);

  async function finish(user: User) {
    const auth = getFirebaseAuth();
    try {
      const idToken = await user.getIdToken();
      const result = await signInWithGoogle(idToken, next);
      // Thành công thì server redirect; chỉ tới đây khi có lỗi.
      if (result?.error) {
        setError(result.error);
        setPending(false);
      }
    } catch (e) {
      setError(messageFor(e));
      setPending(false);
    } finally {
      await signOut(auth).catch(() => undefined);
    }
  }

  // Quay lại từ signInWithRedirect: lấy kết quả rồi đăng nhập vào server.
  useEffect(() => {
    if (handledRedirect.current) return;
    handledRedirect.current = true;
    (async () => {
      try {
        const result = await getRedirectResult(getFirebaseAuth());
        if (!result) return;
        setPending(true);
        setError(undefined);
        await finish(result.user);
      } catch (e) {
        if (!SILENT_CODES.has(errorCode(e))) setError(messageFor(e));
        setPending(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onClick() {
    setError(undefined);
    setPending(true);
    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      if (isStandalone()) {
        await signInWithRedirect(auth, provider);
        return; // trang sẽ được tải lại sau khi Google chuyển hướng về
      }
      const result = await signInWithPopup(auth, provider);
      await finish(result.user);
    } catch (e) {
      const code = errorCode(e);
      if (code === "auth/popup-blocked") {
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch (e2) {
          setError(messageFor(e2));
        }
      } else if (!SILENT_CODES.has(code)) {
        setError(messageFor(e));
      }
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <FormError message={error} />
      <Button type="button" variant="secondary" size="lg" loading={pending} onClick={onClick} className="w-full">
        {!pending && <GoogleIcon />}
        {pending ? "Đang đăng nhập…" : "Tiếp tục với Google"}
      </Button>
    </div>
  );
}
