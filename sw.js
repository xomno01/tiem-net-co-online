'use strict';
// Build ghi mã bản vào đây; mỗi lần deploy đổi cache code/ảnh. Âm thanh dùng cache riêng ổn định.
const VERSION = 'netco-pwa-20261003-f32ff34125';
// v2: âm thanh đã nén lại (.m4a) — bản v1 (~24 MB) bị xóa khi kích hoạt.
const AUDIO = 'netco-audio-v3';
const BUILT = !VERSION.endsWith('-v4');   // build production gắn mã bản vào VERSION
const CORE = ["./","./index.html","./manifest.webmanifest","./assets/icons/icon-192.png","./assets/icons/icon-512.png"];

self.addEventListener('install', event => {
  // Only activate a complete release. An interrupted download must keep the previous working cache.
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('netco-pwa-') && k !== VERSION || k.startsWith('netco-audio-') && k !== AUDIO).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Hiệu ứng được lấy bằng fetch nên có thể lưu cả khi pack được host trên Cloudflare khác origin.
  // Các URL gói có tên kèm hash, vì vậy cache-first không giữ nhầm bản mới.
  if (url.pathname.includes('/assets/audio/packs/')) {
    event.respondWith(caches.open(AUDIO).then(cache => cache.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok && res.status === 200) event.waitUntil(cache.put(req, res.clone()));
      return res;
    }))));
    return;
  }
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/') || url.pathname.startsWith('/.netlify/') || url.pathname.endsWith('/version.json')) return;
  // Nhạc nền phát stream bằng <audio> (yêu cầu Range): để trình duyệt tự lấy qua mạng/HTTP cache (file bất biến),
  // Safari iOS cần phản hồi 206 thật, không trả bản đầy đủ từ cache.
  if (req.destination === 'audio' || req.destination === 'video' || req.headers.has('range')) return;
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); event.waitUntil(caches.open(VERSION).then(c => c.put('./index.html', copy))); }
      return res;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  const save = res => {
    if (res.ok && ['script', 'style', 'image', 'audio', 'font', 'manifest'].includes(req.destination)) {
      const copy = res.clone(); event.waitUntil(caches.open(VERSION).then(c => c.put(req, copy)));
    }
    return res;
  };
  // Bản build gắn ?v=<mã nội dung> cho mọi JS/CSS: URL đổi khi nội dung đổi → lấy thẳng từ cache, không hỏi mạng.
  if (BUILT && ['script', 'style'].includes(req.destination) && url.searchParams.has('v')) {
    event.respondWith(caches.match(req).then(hit => hit || fetch(req).then(save)));
  } else if (['script', 'style', 'manifest'].includes(req.destination)) {
    // Mã game không có mã phiên bản (bản dev) lấy bản mới trước để không giữ JavaScript cũ.
    event.respondWith(fetch(req).then(save).catch(() => caches.match(req)));
  } else if (url.pathname.includes('/assets/audio/')) {
    // Âm thanh còn lại tải bằng fetch, bất biến: giữ qua các bản deploy.
    event.respondWith(caches.open(AUDIO).then(c => c.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok && res.status === 200) event.waitUntil(c.put(req, res.clone()));
      return res;
    }))));
  } else {
    // URL ảnh nội bộ được quản lý theo phiên bản build; dùng cache-first để tránh request lại
    // mỗi lần mở game. Mã SW đổi theo build nên ảnh cũ tự được dọn khi bản mới hoạt động.
    event.respondWith(caches.open(VERSION).then(cache => cache.match(req).then(hit => hit || fetch(req).then(save))));
  }
});
