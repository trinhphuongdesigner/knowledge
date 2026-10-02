// Service worker: ngoại tuyến cho các trang học của người dùng.
//
// Chính sách cache (có chủ ý):
// - /_next/static/*, /icons/*, font: cache-first (bất biến theo hash), cache "static".
// - Điều hướng tới /, /sets/<id>, /sets/<id>/study, /sets/<id>/quiz, /review: network-first,
//   lưu HTML thành công vào cache "pages"; mất mạng -> bản đã lưu -> /offline.html.
// - GET /api/sets/* và /api/reviews/due: network-first, lưu vào cache "api".
// - KHÔNG BAO GIỜ cache: method khác GET, /api/auth*, /api/cron/*, /api/account/*, /api/admin/*,
//   /api/ai/*, /login, /register, /forgot-password, /reset-password, /admin, phản hồi không ok/redirect.
// - Trang và API là dữ liệu RIÊNG của từng người dùng: cache "pages"/"api" bị xoá khi nhận message
//   {type:"CLEAR_USER_CACHE"} (client gửi lúc đăng xuất) và khi tải được trang /login (đã đăng xuất / hết phiên).
//   Cache-Control: no-store của Next trên HTML động KHÔNG được coi là lý do bỏ qua, vì cơ chế xoá ở trên đã bảo vệ.
// - Web Push: sự kiện "push" hiện thông báo hệ thống và báo cho các tab đang mở làm mới chuông; "notificationclick"
//   mở/điều hướng tới data.href (đường dẫn tương đối trong app).
const VERSION = "v3";
const STATIC_CACHE = `knowledge-static-${VERSION}`;
const PAGES_CACHE = `knowledge-pages-${VERSION}`;
const API_CACHE = `knowledge-api-${VERSION}`;
const CURRENT = [STATIC_CACHE, PAGES_CACHE, API_CACHE];
const OFFLINE_URL = "/offline.html";
const PRECACHE = [OFFLINE_URL, "/icons/icon-192.png", "/icons/icon-512.png", "/icons/apple-touch-icon.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      // addAll thất bại nếu một file thiếu: tải từng file để không chặn cài đặt.
      .then((cache) => Promise.all(PRECACHE.map((u) => cache.add(u).catch(() => {}))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("knowledge-") && !CURRENT.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

function clearUserCaches() {
  return Promise.all([caches.delete(PAGES_CACHE), caches.delete(API_CACHE)]);
}

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CLEAR_USER_CACHE") event.waitUntil(clearUserCaches());
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    /\.(?:woff2?|ttf|otf)$/.test(url.pathname)
  );
}

const NEVER_PAGE = /^\/(?:login|register|forgot-password|reset-password|admin|api)(?:\/|$)/;
const PAGE_ROUTES = [/^\/$/, /^\/sets\/[^/]+$/, /^\/sets\/[^/]+\/(?:study|quiz)$/, /^\/review$/];
const NEVER_API = /^\/api\/(?:auth|cron|account|admin|ai)(?:\/|$)/;

function isCacheablePage(url) {
  return !NEVER_PAGE.test(url.pathname) && PAGE_ROUTES.some((r) => r.test(url.pathname));
}

function isCacheableApi(url) {
  if (NEVER_API.test(url.pathname)) return false;
  return url.pathname === "/api/reviews/due" || url.pathname === "/api/sets" || url.pathname.startsWith("/api/sets/");
}

/** Network-first; chỉ lưu phản hồi 200 (không redirect). */
async function networkFirst(req, cacheName, fallback) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res.ok && !res.redirected && res.type === "basic") cache.put(req, res.clone()).catch(() => {});
    return res;
  } catch {
    const hit = await cache.match(req, { ignoreSearch: false });
    if (hit) return hit;
    return fallback ? fallback() : Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname === "/sw.js") return;

  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(STATIC_CACHE).then((c) => c.put(req, copy));
            }
            return res;
          }),
      ),
    );
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    if (isCacheableApi(url)) event.respondWith(networkFirst(req, API_CACHE));
    return;
  }

  if (req.mode === "navigate") {
    const offline = () => caches.match(OFFLINE_URL).then((r) => r || Response.error());
    if (isCacheablePage(url)) {
      event.respondWith(networkFirst(req, PAGES_CACHE, offline));
      return;
    }
    if (url.pathname === "/login") {
      // Tới được trang đăng nhập = chưa/không còn phiên: bỏ dữ liệu riêng đã lưu.
      event.respondWith(
        fetch(req)
          .then((res) => {
            if (res.ok && !res.redirected) event.waitUntil(clearUserCaches());
            return res;
          })
          .catch(offline),
      );
      return;
    }
    event.respondWith(fetch(req).catch(offline));
  }
});

// ---- Web Push ----
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "Knowledge";
  const href = typeof data.href === "string" && data.href.startsWith("/") && !data.href.startsWith("//") ? data.href : "/";
  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, {
        body: data.body || "",
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        tag: data.tag || href,
        data: { href },
      }),
      // Tab đang mở: làm mới chuông thông báo ngay.
      self.clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((list) => list.forEach((c) => c.postMessage({ type: "PUSH_RECEIVED" }))),
    ]),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const href = (event.notification.data && event.notification.data.href) || "/";
  const target = new URL(href, self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(async (list) => {
      const existing = list.find((c) => new URL(c.url).origin === self.location.origin);
      if (existing) {
        try {
          await existing.focus();
          if ("navigate" in existing) return await existing.navigate(target);
        } catch {
          // rơi xuống openWindow
        }
      }
      return self.clients.openWindow(target);
    }),
  );
});
