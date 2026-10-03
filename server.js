// ============================================================================
// Mock API Backend cho Game Tiệm Nét Cỏ – Ông Chủ Quán Nét
// ============================================================================
// Thay thế hoàn toàn Supabase + Firebase + Netlify Functions.
// Zero-dependency: chỉ dùng node:http, node:crypto, node:sqlite (Node 22+).
// ============================================================================

import http from 'node:http';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8080;

// ---------------------------------------------------------------------------
// 1. DATABASE SETUP (SQLite – file-based, persistent)
// ---------------------------------------------------------------------------
const DB_PATH = path.join(__dirname, 'data', 'netco.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new DatabaseSync(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          TEXT PRIMARY KEY,
    account_kind TEXT NOT NULL DEFAULT 'guest',
    display_name TEXT DEFAULT '',
    shop_name   TEXT DEFAULT '',
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS saves (
    user_id     TEXT PRIMARY KEY REFERENCES users(id),
    save_json   TEXT NOT NULL DEFAULT '{}',
    revision    INTEGER NOT NULL DEFAULT 0,
    receipt     TEXT NOT NULL DEFAULT '',
    synced_at   TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS leaderboard (
    user_id     TEXT NOT NULL REFERENCES users(id),
    type        TEXT NOT NULL DEFAULT 'revenue',
    shop_name   TEXT DEFAULT '',
    day         INTEGER DEFAULT 0,
    score       REAL DEFAULT 0,
    updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, type)
  );

  CREATE TABLE IF NOT EXISTS notices (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL DEFAULT '',
    body        TEXT NOT NULL DEFAULT '',
    kind        TEXT NOT NULL DEFAULT 'info',
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS social_messages (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id),
    shop_name   TEXT DEFAULT '',
    day         INTEGER DEFAULT 0,
    content     TEXT NOT NULL DEFAULT '',
    kind        TEXT NOT NULL DEFAULT 'chat',
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Insert a welcome notice if empty
const noticeCount = db.prepare('SELECT COUNT(*) as cnt FROM notices').get();
if (noticeCount.cnt === 0) {
  db.prepare(`INSERT INTO notices (title, body, kind) VALUES (?, ?, ?)`).run(
    'Chào mừng đến Server Riêng!',
    'Backend đang chạy ở chế độ Local. Dữ liệu lưu trong data/netco.db.',
    'info'
  );
}

// ---------------------------------------------------------------------------
// 2. AUTH HELPERS (Simple JWT-like tokens using HMAC-SHA256)
// ---------------------------------------------------------------------------
const JWT_SECRET = process.env.JWT_SECRET || 'netco-local-secret-' + crypto.randomBytes(8).toString('hex');
let jwtSecretSaved = JWT_SECRET; // Keep stable across requests in same process

function makeToken(userId) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days
  })).toString('base64url');
  const sig = crypto.createHmac('sha256', jwtSecretSaved)
    .update(header + '.' + payload).digest('base64url');
  return header + '.' + payload + '.' + sig;
}

function verifyToken(token) {
  if (!token) return null;
  // Support "dev:username" for development mode
  if (token.startsWith('dev:')) {
    const name = decodeURIComponent(token.slice(4));
    return ensureUser(name, 'dev');
  }
  try {
    const [header, payload, sig] = token.split('.');
    const expected = crypto.createHmac('sha256', jwtSecretSaved)
      .update(header + '.' + payload).digest('base64url');
    if (sig !== expected) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (data.exp && data.exp < Date.now() / 1000) return null;
    return data.sub || null;
  } catch {
    return null;
  }
}

function ensureUser(userId, kind = 'guest') {
  const existing = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
  if (!existing) {
    db.prepare('INSERT INTO users (id, account_kind, display_name) VALUES (?, ?, ?)').run(userId, kind, kind === 'guest' ? 'Khách' : userId);
  }
  return userId;
}

function getUserIdFromRequest(req) {
  const auth = req.headers['authorization'] || '';
  const token = auth.replace(/^Bearer\s+/i, '');
  return verifyToken(token);
}

// ---------------------------------------------------------------------------
// 3. UTILITY HELPERS
// ---------------------------------------------------------------------------
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      try {
        const text = Buffer.concat(chunks).toString();
        resolve(text ? JSON.parse(text) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

function json(res, data, status = 200) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-dev-shop, x-dev-day',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  });
  res.end(body);
}

function errorJson(res, message, status = 400, code = 'BAD_REQUEST') {
  json(res, { error: message, code }, status);
}

function generateReceipt() {
  return crypto.randomBytes(16).toString('hex');
}

function nowISO() {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// 4. STATIC FILE SERVER (serves the game files)
// ---------------------------------------------------------------------------
const STATIC_ROOT = __dirname;
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
  '.mp3': 'audio/mpeg',
  '.pack': 'application/octet-stream',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.md': 'text/markdown; charset=utf-8',
  '.db': null, // block
};

function serveStatic(req, res) {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';

  // Block data directory access
  if (reqPath.startsWith('/data/') || reqPath.startsWith('/RECON/')) {
    res.writeHead(403); res.end('Forbidden'); return true;
  }

  const filePath = path.join(STATIC_ROOT, reqPath);
  if (!filePath.startsWith(STATIC_ROOT)) {
    res.writeHead(403); res.end('Forbidden'); return true;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    if (MIME_TYPES[ext] === null) { res.writeHead(403); res.end('Forbidden'); return true; }
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=86400',
    });
    fs.createReadStream(filePath).pipe(res);
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// 5. API ROUTES
// ---------------------------------------------------------------------------

// --- AUTH ---
async function handleAuth(req, res, urlPath) {
  // POST /api/auth/guest → create guest account, return tokens
  if (urlPath === '/api/auth/guest' && req.method === 'POST') {
    const userId = 'guest_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    ensureUser(userId, 'guest');
    const accessToken = makeToken(userId);
    return json(res, {
      access_token: accessToken,
      refresh_token: makeToken(userId + ':refresh'),
      token_type: 'bearer',
      expires_in: 86400 * 30,
      expires_at: Math.floor(Date.now() / 1000) + 86400 * 30,
      user: { id: userId, account_kind: 'guest' },
    });
  }

  // POST /api/auth/v1/token?grant_type=refresh_token (Supabase compat)
  if (urlPath.startsWith('/auth/v1/token') && req.method === 'POST') {
    const body = await readBody(req);
    const userId = verifyToken(body.refresh_token?.replace(':refresh', ''));
    if (!userId) return errorJson(res, 'Invalid refresh token', 401, 'INVALID_TOKEN');
    const accessToken = makeToken(userId);
    return json(res, {
      access_token: accessToken,
      refresh_token: makeToken(userId + ':refresh'),
      token_type: 'bearer',
      expires_in: 86400 * 30,
      expires_at: Math.floor(Date.now() / 1000) + 86400 * 30,
    });
  }

  // POST /api/auth/v1/signup (Supabase compat – anonymous)
  if (urlPath === '/auth/v1/signup' && req.method === 'POST') {
    const userId = 'anon_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    ensureUser(userId, 'guest');
    const accessToken = makeToken(userId);
    return json(res, {
      access_token: accessToken,
      refresh_token: makeToken(userId + ':refresh'),
      token_type: 'bearer',
      expires_in: 86400 * 30,
      expires_at: Math.floor(Date.now() / 1000) + 86400 * 30,
      user: { id: userId },
    });
  }

  return null; // not handled
}

// --- BOOTSTRAP ---
function handleBootstrap(userId) {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  const save = db.prepare('SELECT * FROM saves WHERE user_id = ?').get(userId);

  const profile = user ? {
    shop_name: user.shop_name || save?.save_json ? (JSON.parse(save?.save_json || '{}').shopName || '') : '',
    account_kind: user.account_kind,
  } : null;

  return {
    cloud: save ? {
      save: JSON.parse(save.save_json),
      revision: save.revision,
      receipt: save.receipt,
      syncedAt: save.synced_at,
    } : null,
    profile,
    userId,
  };
}

// --- SYNC ---
function handleSync(userId, body) {
  const now = nowISO();
  const existing = db.prepare('SELECT revision FROM saves WHERE user_id = ?').get(userId);

  // Check revision conflict
  if (existing && body.revision !== undefined && body.revision !== existing.revision) {
    // Allow if client has newer data (conflict resolution: client wins)
  }

  const newRevision = (existing?.revision || 0) + 1;
  const receipt = generateReceipt();

  const saveData = body.save || body;
  const saveJson = typeof saveData === 'string' ? saveData : JSON.stringify(saveData);

  if (existing) {
    db.prepare('UPDATE saves SET save_json = ?, revision = ?, receipt = ?, synced_at = ? WHERE user_id = ?')
      .run(saveJson, newRevision, receipt, now, userId);
  } else {
    db.prepare('INSERT INTO saves (user_id, save_json, revision, receipt, synced_at) VALUES (?, ?, ?, ?, ?)')
      .run(userId, saveJson, newRevision, receipt, now);
  }

  // Update user shop_name from save
  try {
    const parsed = JSON.parse(saveJson);
    if (parsed.shopName) {
      db.prepare('UPDATE users SET shop_name = ?, updated_at = ? WHERE id = ?')
        .run(parsed.shopName, now, userId);

      // Update leaderboard
      const day = parsed.day || 0;
      const revenue = parsed.stats?.totalRevenue || parsed.totalRevenue || 0;
      const fame = parsed.fame || 0;

      for (const [type, score] of [['revenue', revenue], ['fame', fame], ['day', day]]) {
        const existingLB = db.prepare('SELECT user_id FROM leaderboard WHERE user_id = ? AND type = ?').get(userId, type);
        if (existingLB) {
          db.prepare('UPDATE leaderboard SET shop_name = ?, day = ?, score = ?, updated_at = ? WHERE user_id = ? AND type = ?')
            .run(parsed.shopName, day, score, now, userId, type);
        } else {
          db.prepare('INSERT INTO leaderboard (user_id, type, shop_name, day, score, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
            .run(userId, type, parsed.shopName, day, score, now);
        }
      }
    }
  } catch { /* ignore parse errors */ }

  return {
    revision: newRevision,
    receipt,
    syncedAt: now,
  };
}

// --- RESET ---
function handleReset(userId, body) {
  const now = nowISO();
  const receipt = generateReceipt();

  // Create minimal new save
  const newSave = {
    shopName: body.shopName || 'Tiệm Mới',
    day: 0,
    money: 500000,
    savedAt: Date.now(),
  };

  db.prepare('INSERT OR REPLACE INTO saves (user_id, save_json, revision, receipt, synced_at) VALUES (?, ?, 1, ?, ?)')
    .run(userId, JSON.stringify(newSave), receipt, now);

  db.prepare('UPDATE users SET shop_name = ?, updated_at = ? WHERE id = ?')
    .run(newSave.shopName, now, userId);

  return {
    save: newSave,
    revision: 1,
    receipt,
    syncedAt: now,
  };
}

// --- DELETE SAVE ---
function handleDeleteSave(userId) {
  db.prepare('DELETE FROM saves WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM leaderboard WHERE user_id = ?').run(userId);
  const user = db.prepare('SELECT shop_name FROM users WHERE id = ?').get(userId);
  return { shopName: user?.shop_name || '' };
}

// --- LEADERBOARD ---
function handleLeaderboard(query) {
  const type = query.get('type') || 'revenue';
  const rows = db.prepare(
    'SELECT user_id, shop_name, day, score FROM leaderboard WHERE type = ? ORDER BY score DESC LIMIT 100'
  ).all(type);
  return {
    type,
    rows: rows.map((r, i) => ({
      rank: i + 1,
      userId: r.user_id,
      shopName: r.shop_name,
      day: r.day,
      score: r.score,
    })),
  };
}

// --- NOTICES ---
function handleNotices(query) {
  const since = query.get('since') || '1970-01-01';
  const rows = db.prepare(
    'SELECT id, title, body, kind, created_at FROM notices WHERE created_at > ? ORDER BY created_at DESC LIMIT 50'
  ).all(since);
  return { rows };
}

// --- OPERATIONS (heartbeat) ---
function handleOperations(userId) {
  return {
    heartbeatMs: 300000,
    announcements: [],
  };
}

// --- REALTIME SESSION ---
function handleRealtimeSession(userId) {
  return {
    sessionId: crypto.randomUUID(),
    userId,
    createdAt: nowISO(),
  };
}

// --- SOCIAL ---
async function handleSocial(req, res, subPath, userId) {
  const method = req.method;
  const query = new URL(req.url, 'http://localhost').searchParams;

  // GET /api/social/feed
  if (subPath.startsWith('feed') && method === 'GET') {
    const rows = db.prepare(
      'SELECT m.*, u.display_name FROM social_messages m LEFT JOIN users u ON m.user_id = u.id ORDER BY m.created_at DESC LIMIT 50'
    ).all();
    return json(res, {
      messages: rows.map(r => ({
        id: r.id,
        userId: r.user_id,
        displayName: r.display_name || r.shop_name,
        shopName: r.shop_name,
        day: r.day,
        content: r.content,
        kind: r.kind,
        createdAt: r.created_at,
      })),
    });
  }

  // POST /api/social/message
  if (subPath.startsWith('message') && method === 'POST') {
    const body = await readBody(req);
    const msgId = crypto.randomUUID();
    const shopName = req.headers['x-dev-shop'] ? decodeURIComponent(req.headers['x-dev-shop']) : '';
    const day = parseInt(req.headers['x-dev-day'] || '0', 10);

    db.prepare('INSERT INTO social_messages (id, user_id, shop_name, day, content, kind) VALUES (?, ?, ?, ?, ?, ?)')
      .run(msgId, userId, shopName || body.shopName || '', day || body.day || 0, body.content || '', body.kind || 'chat');

    return json(res, { id: msgId, ok: true });
  }

  // POST /api/social/visit (visit another shop)
  if (subPath.startsWith('visit') && method === 'POST') {
    const body = await readBody(req);
    const targetId = body.targetId || subPath.split('/')[1] || '';
    const targetSave = db.prepare('SELECT save_json, revision FROM saves WHERE user_id = ?').get(targetId);
    if (!targetSave) return errorJson(res, 'Không tìm thấy quán.', 404, 'NOT_FOUND');
    return json(res, {
      save: JSON.parse(targetSave.save_json),
      revision: targetSave.revision,
    });
  }

  // POST /api/social/dev/publish (dev)
  if (subPath.startsWith('dev/publish') && method === 'POST') {
    return json(res, { ok: true });
  }

  // Catch-all for unimplemented social endpoints
  return json(res, { ok: true, stub: true, path: subPath });
}

// --- AUDIO PACKS (proxy or serve from local) ---
function handleAudioPack(req, res, packName) {
  const packPath = path.join(STATIC_ROOT, 'assets', 'audio', 'packs', packName);
  if (fs.existsSync(packPath)) {
    res.writeHead(200, {
      'Content-Type': 'application/octet-stream',
      'Access-Control-Allow-Origin': '*',
    });
    fs.createReadStream(packPath).pipe(res);
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// 6. REQUEST ROUTER
// ---------------------------------------------------------------------------
const server = http.createServer(async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-dev-shop, x-dev-day',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Max-Age': '86400',
    });
    return res.end();
  }

  const parsed = new URL(req.url, 'http://localhost');
  const urlPath = parsed.pathname;

  try {
    // ----- AUTH ROUTES -----
    if (urlPath.startsWith('/api/auth/') || urlPath.startsWith('/auth/v1/')) {
      const result = await handleAuth(req, res, urlPath);
      if (result !== null) return;
    }

    // Supabase anon signup compat
    if (urlPath === '/auth/v1/signup') {
      return await handleAuth(req, res, urlPath);
    }

    // ----- API ROUTES (require auth) -----
    if (urlPath.startsWith('/api/')) {
      const userId = getUserIdFromRequest(req);

      // Guest auto-register endpoint
      if (urlPath === '/api/auth/guest') {
        return; // Already handled above
      }

      if (!userId) {
        // For bootstrap, auto-create guest if no token
        if (urlPath === '/api/bootstrap' && req.method === 'GET') {
          return json(res, { cloud: null, profile: null, userId: null });
        }
        return errorJson(res, 'Chưa đăng nhập.', 401, 'UNAUTHORIZED');
      }

      const query = parsed.searchParams;

      // GET /api/bootstrap
      if (urlPath === '/api/bootstrap' && req.method === 'GET') {
        return json(res, handleBootstrap(userId));
      }

      // POST /api/sync
      if (urlPath === '/api/sync' && req.method === 'POST') {
        const body = await readBody(req);
        return json(res, handleSync(userId, body));
      }

      // POST /api/reset
      if (urlPath === '/api/reset' && req.method === 'POST') {
        const body = await readBody(req);
        return json(res, handleReset(userId, body));
      }

      // POST /api/delete-save
      if (urlPath === '/api/delete-save' && req.method === 'POST') {
        return json(res, handleDeleteSave(userId));
      }

      // GET /api/leaderboard
      if (urlPath === '/api/leaderboard') {
        return json(res, handleLeaderboard(query));
      }

      // GET /api/notices
      if (urlPath === '/api/notices') {
        return json(res, handleNotices(query));
      }

      // POST /api/operations
      if (urlPath === '/api/operations' && req.method === 'POST') {
        return json(res, handleOperations(userId));
      }

      // POST /api/realtime-session
      if (urlPath === '/api/realtime-session' && req.method === 'POST') {
        return json(res, handleRealtimeSession(userId));
      }

      // /api/social/*
      if (urlPath.startsWith('/api/social/')) {
        const subPath = urlPath.slice('/api/social/'.length);
        return await handleSocial(req, res, subPath, userId);
      }

      // /api/packs/*.pack (audio pack proxy)
      if (urlPath.startsWith('/api/packs/')) {
        const packName = urlPath.slice('/api/packs/'.length);
        if (handleAudioPack(req, res, packName)) return;
        return errorJson(res, 'Pack not found', 404);
      }

      // Catch-all API
      return json(res, { ok: true, stub: true, path: urlPath });
    }

    // Supabase auth compat routes
    if (urlPath.startsWith('/auth/v1/')) {
      const result = await handleAuth(req, res, urlPath);
      if (result !== null) return;
    }

    // ----- STATIC FILES -----
    if (serveStatic(req, res)) return;

    // 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found: ' + urlPath);

  } catch (err) {
    console.error('[ERROR]', req.method, urlPath, err);
    errorJson(res, 'Internal Server Error: ' + err.message, 500, 'INTERNAL_ERROR');
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('');
  console.log('==========================================================');
  console.log('  🎮  TIỆM NÉT CỎ – PRIVATE SERVER');
  console.log('==========================================================');
  console.log(`  🌐  Game:       http://localhost:${PORT}/`);
  console.log(`  🔌  API:        http://localhost:${PORT}/api/`);
  console.log(`  💾  Database:   ${DB_PATH}`);
  console.log(`  🔑  JWT Secret: ${jwtSecretSaved.slice(0, 20)}...`);
  console.log('----------------------------------------------------------');
  console.log('  Endpoints:');
  console.log('    POST /api/auth/guest       → Tạo tài khoản khách');
  console.log('    GET  /api/bootstrap        → Tải dữ liệu cloud');
  console.log('    POST /api/sync             → Đồng bộ save lên server');
  console.log('    POST /api/reset            → Tạo game mới');
  console.log('    POST /api/delete-save      → Xóa save');
  console.log('    GET  /api/leaderboard      → Bảng xếp hạng');
  console.log('    GET  /api/notices          → Thông báo');
  console.log('    POST /api/operations       → Heartbeat');
  console.log('    POST /api/realtime-session → Phiên realtime');
  console.log('    *    /api/social/*         → Chat & bạn bè');
  console.log('==========================================================');
  console.log('');
});
