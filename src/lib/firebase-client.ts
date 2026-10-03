import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  browserPopupRedirectResolver,
  getAuth,
  inMemoryPersistence,
  initializeAuth,
  type Auth,
} from "firebase/auth";

/** Firebase chỉ dùng để chứng minh danh tính; phiên đăng nhập thật do server quản lý (cookie kn_session). */
function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) return getApp();
  return initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  });
}

let auth: Auth | undefined;

/** Lazy: chỉ khởi tạo ở trình duyệt khi cần đăng nhập. Không lưu phiên (in-memory). */
export function getFirebaseAuth(): Auth {
  if (auth) return auth;
  const app = getFirebaseApp();
  try {
    auth = initializeAuth(app, {
      persistence: inMemoryPersistence,
      popupRedirectResolver: browserPopupRedirectResolver,
    });
  } catch {
    // Đã khởi tạo (ví dụ Fast Refresh khi dev): dùng lại instance hiện có.
    auth = getAuth(app);
  }
  return auth;
}
