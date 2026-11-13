'use strict';
/*
 * Vibra sunucusu — sıfır bağımlılık (sadece Node.js >= 22.5 yerleşik modülleri)
 * HTTP + WebSocket + SQLite (node:sqlite) + kayıt kodu + dosya yükleme + ses sinyalleşmesi
 */
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { DatabaseSync } = require('node:sqlite');
const CAT = require('./public/catalog.js');

const PORT = +process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const BASE = (process.env.BASE_URL || `http://localhost:${PORT}`).replace(/\/$/, '');
const MAX_UPLOAD = (+process.env.MAX_UPLOAD_MB || 100) * 1024 * 1024;
const DATA = process.env.DATA_DIR || path.join(__dirname, 'data');
const UPLOADS = path.join(DATA, 'uploads');
const PUBLIC = path.join(__dirname, 'public');
fs.mkdirSync(UPLOADS, { recursive: true });

/* ------------------------------------------------------------------ DB */
const db = new DatabaseSync(path.join(DATA, 'vibra.db'));
db.exec(`
PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY, username TEXT NOT NULL UNIQUE COLLATE NOCASE, hash TEXT NOT NULL, created INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, user_id INTEGER NOT NULL, created INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS servers(
  id INTEGER PRIMARY KEY, name TEXT NOT NULL, owner_id INTEGER NOT NULL, invite TEXT NOT NULL UNIQUE, created INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS members(server_id INTEGER NOT NULL, user_id INTEGER NOT NULL, PRIMARY KEY(server_id,user_id));
CREATE TABLE IF NOT EXISTS channels(
  id INTEGER PRIMARY KEY, server_id INTEGER NOT NULL, name TEXT NOT NULL, type TEXT NOT NULL, created INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS files(id TEXT PRIMARY KEY, name TEXT NOT NULL, mime TEXT NOT NULL, size INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS messages(
  id INTEGER PRIMARY KEY, channel_id INTEGER NOT NULL, user_id INTEGER NOT NULL, content TEXT NOT NULL DEFAULT '',
  file_id TEXT, created INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS idx_msg_chan ON messages(channel_id,id);
`);
// Eski sürümden (e-postalı) geçiş: email/verified/vtoken sütunlarını kaldır
if (db.prepare("SELECT 1 FROM pragma_table_info('users') WHERE name='email'").get()) {
  db.exec(`
    BEGIN;
    CREATE TABLE users_new(id INTEGER PRIMARY KEY, username TEXT NOT NULL UNIQUE COLLATE NOCASE, hash TEXT NOT NULL, created INTEGER NOT NULL);
    INSERT INTO users_new(id,username,hash,created) SELECT id,username,hash,created FROM users;
    DROP TABLE users; ALTER TABLE users_new RENAME TO users;
    COMMIT;`);
}
// Profil sütunları (eski veritabanlarına da eklenir)
for (const [col, def] of [['color', "TEXT NOT NULL DEFAULT ''"], ['banner', "TEXT NOT NULL DEFAULT ''"], ['banner2', "TEXT NOT NULL DEFAULT ''"],
  ['bio', "TEXT NOT NULL DEFAULT ''"], ['status', "TEXT NOT NULL DEFAULT ''"], ['av', 'INTEGER NOT NULL DEFAULT 0'], ['avmime', "TEXT NOT NULL DEFAULT ''"], ['outfit', "TEXT NOT NULL DEFAULT ''"],
  ['coins', 'INTEGER NOT NULL DEFAULT 100'], ['owned', "TEXT NOT NULL DEFAULT ''"]]) {
  if (!db.prepare("SELECT 1 FROM pragma_table_info('users') WHERE name=?").get(col)) db.exec(`ALTER TABLE users ADD COLUMN ${col} ${def}`);
}
const q = {
  userById: db.prepare('SELECT id,username,color,banner,banner2,bio,status,av,outfit,coins,owned FROM users WHERE id=?'),
  setOutfit: db.prepare('UPDATE users SET outfit=? WHERE id=?'),
  setProfile: db.prepare('UPDATE users SET color=?,banner=?,banner2=?,bio=?,status=? WHERE id=?'),
  setAvatar: db.prepare('UPDATE users SET av=?,avmime=? WHERE id=?'),
  setCoins: db.prepare('UPDATE users SET coins=? WHERE id=?'),
  setOwned: db.prepare('UPDATE users SET owned=? WHERE id=?'),
  addCoins: db.prepare('UPDATE users SET coins = coins + ? WHERE id=?'),
  avatarOf: db.prepare('SELECT av,avmime FROM users WHERE id=?'),
  userByName: db.prepare('SELECT * FROM users WHERE username=?'),
  insUser: db.prepare('INSERT INTO users(username,hash,created) VALUES(?,?,?)'),
  insSession: db.prepare('INSERT INTO sessions(token,user_id,created) VALUES(?,?,?)'),
  sessionUser: db.prepare('SELECT u.id,u.username,u.color,u.banner,u.banner2,u.bio,u.status,u.av,u.outfit,u.coins,u.owned FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=?'),
  delSession: db.prepare('DELETE FROM sessions WHERE token=?'),
  insServer: db.prepare('INSERT INTO servers(name,owner_id,invite,created) VALUES(?,?,?,?)'),
  serverByInvite: db.prepare('SELECT * FROM servers WHERE invite=?'),
  serverById: db.prepare('SELECT * FROM servers WHERE id=?'),
  addMember: db.prepare('INSERT OR IGNORE INTO members(server_id,user_id) VALUES(?,?)'),
  delMember: db.prepare('DELETE FROM members WHERE server_id=? AND user_id=?'),
  userServers: db.prepare('SELECT s.* FROM servers s JOIN members m ON m.server_id=s.id WHERE m.user_id=? ORDER BY s.id'),
  serverChannels: db.prepare('SELECT id,server_id,name,type FROM channels WHERE server_id=? ORDER BY type DESC,id'),
  serverMembers: db.prepare('SELECT u.id,u.username,u.color,u.banner,u.banner2,u.bio,u.status,u.av,u.outfit,u.coins,u.owned FROM members m JOIN users u ON u.id=m.user_id WHERE m.server_id=? ORDER BY u.username'),
  memberIds: db.prepare('SELECT user_id FROM members WHERE server_id=?'),
  insChannel: db.prepare('INSERT INTO channels(server_id,name,type,created) VALUES(?,?,?,?)'),
  channelById: db.prepare('SELECT * FROM channels WHERE id=?'),
  isMember: db.prepare('SELECT 1 FROM members WHERE server_id=? AND user_id=?'),
  insFile: db.prepare('INSERT INTO files(id,name,mime,size) VALUES(?,?,?,?)'),
  insMsg: db.prepare('INSERT INTO messages(channel_id,user_id,content,file_id,created) VALUES(?,?,?,?,?)'),
  msgById: db.prepare('SELECT * FROM messages WHERE id=?'),
  delMsg: db.prepare('DELETE FROM messages WHERE id=?'),
  delFile: db.prepare('DELETE FROM files WHERE id=?'),
  msgsLatest: db.prepare(`SELECT m.id,m.channel_id,m.user_id,u.username,m.content,m.created,f.id fid,f.name fname,f.mime fmime,f.size fsize
    FROM messages m JOIN users u ON u.id=m.user_id LEFT JOIN files f ON f.id=m.file_id
    WHERE m.channel_id=? ORDER BY m.id DESC LIMIT 50`),
  msgsBefore: db.prepare(`SELECT m.id,m.channel_id,m.user_id,u.username,m.content,m.created,f.id fid,f.name fname,f.mime fmime,f.size fsize
    FROM messages m JOIN users u ON u.id=m.user_id LEFT JOIN files f ON f.id=m.file_id
    WHERE m.channel_id=? AND m.id<? ORDER BY m.id DESC LIMIT 50`),
  msgFull: db.prepare(`SELECT m.id,m.channel_id,m.user_id,u.username,m.content,m.created,f.id fid,f.name fname,f.mime fmime,f.size fsize
    FROM messages m JOIN users u ON u.id=m.user_id LEFT JOIN files f ON f.id=m.file_id WHERE m.id=?`),
  fileAccess: db.prepare(`SELECT f.*,c.server_id FROM files f JOIN messages m ON m.file_id=f.id JOIN channels c ON c.id=m.channel_id WHERE f.id=?`),
};
const now = () => Date.now();
const rid = n => crypto.randomBytes(n).toString('hex');
const toMsg = r => ({
  id: r.id, channelId: r.channel_id, userId: r.user_id, username: r.username, content: r.content, created: r.created,
  file: r.fid ? { id: r.fid, name: r.fname, mime: r.fmime, size: r.fsize } : null,
});
const memberOf = (uid, serverId) => !!q.isMember.get(serverId, uid);
const chanAccess = (uid, chanId) => {
  const ch = q.channelById.get(chanId);
  return ch && memberOf(uid, ch.server_id) ? ch : null;
};

/* ------------------------------------------------------------ helpers */
const hashPw = pw => { const s = crypto.randomBytes(16); return s.toString('hex') + ':' + crypto.scryptSync(pw, s, 64).toString('hex'); };
const checkPw = (pw, stored) => {
  const [s, h] = stored.split(':');
  const a = crypto.scryptSync(pw, Buffer.from(s, 'hex'), 64), b = Buffer.from(h, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};
const parseCookies = h => Object.fromEntries((h || '').split(';').map(c => c.trim().split('=')).filter(p => p[0]).map(([k, ...v]) => [k, v.join('=')]));
const userFromReq = req => { const sid = parseCookies(req.headers.cookie).sid; return sid ? (q.sessionUser.get(sid) || null) : null; };
const json = (res, code, obj, headers = {}) => {
  const b = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(b), 'Cache-Control': 'no-store', ...headers });
  res.end(b);
};
const readJson = (req, limit = 100 * 1024) => new Promise((resolve, reject) => {
  let n = 0; const chunks = [];
  req.on('data', c => { n += c.length; if (n > limit) { reject(new Error('too large')); req.destroy(); } else chunks.push(c); });
  req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString() || '{}')); } catch { reject(new Error('bad json')); } });
  req.on('error', reject);
});
const hits = new Map();
const limited = (key, max = 12, win = 60000) => {
  const t = now(); const a = (hits.get(key) || []).filter(x => t - x < win);
  a.push(t); hits.set(key, a); return a.length > max;
};
setInterval(() => { const t = now(); for (const [k, v] of hits) if (!v.some(x => t - x < 60000)) hits.delete(k); }, 60000).unref();
const clean = (s, max) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max);
const ipOf = req => req.socket.remoteAddress || '';

/* -------------------------------------------------------- kayıt kodu */
// Tek, sabit kayıt kodu. Değiştirmek için: REG_CODE=baska-kod node server.js
const REG_CODE = String(process.env.REG_CODE || '12345678').trim();
const codeOk = x => {
  const a = Buffer.from(String(x || '').trim()), b = Buffer.from(REG_CODE);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

/* ---------------------------------------------------------- profil */
const HEX = /^#[0-9a-f]{6}$/i;
const hexOr = v => { v = String(v || '').trim(); return HEX.test(v) ? v.toLowerCase() : ''; };

// ---- Mağaza / sahiplik ----
const ownedOf = r => { try { const a = JSON.parse(r.owned || '[]'); return Array.isArray(a) ? a.filter(x => typeof x === 'string').slice(0, 400) : []; } catch { return []; } };
const hasItem = (r, slot, i) => i === 0 || CAT.isFree(slot, i) || ownedOf(r).includes(slot + ':' + i);
// eski kullanıcılar: o an giydikleri eşyaları bedavaya sahip say (eski sistemden kalan)
for (const r of db.prepare("SELECT id,outfit,owned FROM users WHERE owned='' AND outfit<>''").all()) {
  try { const o = JSON.parse(r.outfit), own = [];
    for (const slot of ['hat', 'glasses']) { const i = o[slot] | 0; if (i > 0 && !CAT.isFree(slot, i) && CAT.priceOf(slot, i) >= 0) own.push(slot + ':' + i); }
    q.setOwned.run(JSON.stringify(own), r.id); } catch {}
}
const profileOf = r => ({ color: r.color || '', banner: r.banner || '', banner2: r.banner2 || '', bio: r.bio || '', status: r.status || '', av: r.av || 0, outfit: r.outfit || '', coins: r.coins ?? 100 });
function syncProfile(uid) {
  sendUser(uid, { t: 'sync' });
  for (const s of q.userServers.all(uid)) syncServer(s.id);
}
const AV_DIR = path.join(DATA, 'avatars');
fs.mkdirSync(AV_DIR, { recursive: true });
function sniffImage(b) {
  if (b.length > 12 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b.length > 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (b.length > 12 && b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP') return 'image/webp';
  if (b.length > 10 && /^GIF8[79]a/.test(b.subarray(0, 6).toString('latin1'))) return 'image/gif';
  return null;
}
const readRaw = (req, limit) => new Promise((resolve, reject) => {
  let n = 0; const chunks = [];
  req.on('data', c => { n += c.length; if (n > limit) { reject(new Error('too large')); req.destroy(); } else chunks.push(c); });
  req.on('end', () => resolve(Buffer.concat(chunks))); req.on('error', reject);
});
function serveAvatar(req, res, id) {
  const r = q.avatarOf.get(+id);
  if (!r || !r.av) { res.writeHead(404); return res.end(); }
  let data; try { data = fs.readFileSync(path.join(AV_DIR, String(+id))); } catch { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': r.avmime, 'Content-Length': data.length, 'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'private, max-age=31536000, immutable', 'Content-Security-Policy': "default-src 'none'; sandbox" });
  res.end(data);
}

/* --------------------------------------------------- state payloads */
function stateFor(uid) {
  return q.userServers.all(uid).map(s => ({
    id: s.id, name: s.name, ownerId: s.owner_id, invite: s.invite,
    channels: q.serverChannels.all(s.id).map(c => ({ id: c.id, name: c.name, type: c.type })),
    members: q.serverMembers.all(s.id).map(m => ({ id: m.id, username: m.username, ...profileOf(m) })),
  }));
}
function makeServer(name, uid) {
  const invite = crypto.randomBytes(5).toString('base64url').replace(/[-_]/g, 'x').slice(0, 8);
  const id = q.insServer.run(name, uid, invite, now()).lastInsertRowid;
  q.addMember.run(id, uid);
  q.insChannel.run(id, 'genel', 'text', now());
  q.insChannel.run(id, 'Sohbet', 'voice', now());
  return id;
}

/* ----------------------------------------------------------- HTTP API */
const SESSION_AGE = 30 * 24 * 3600;
const secureCookie = BASE.startsWith('https') ? '; Secure' : '';
const setSession = uid => {
  const token = rid(32); q.insSession.run(token, uid, now());
  return { 'Set-Cookie': `sid=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_AGE}${secureCookie}` };
};

const routes = {
  // Sadece isimle giriş: isim varsa o hesaba girer, yoksa yeni hesap açar (şifre / kayıt kodu yok)
  async 'POST /api/login'(req, res) {
    if (limited('lg' + ipOf(req), 20)) return json(res, 429, { error: 'Çok fazla deneme, biraz bekle.' });
    const b = await readJson(req);
    const username = clean(b.username, 32);
    if (username.length < 2) return json(res, 400, { error: 'İsim en az 2 karakter olmalı.' });
    if (!/^[\p{L}\p{N}_.\-]+$/u.test(username)) return json(res, 400, { error: 'İsim sadece harf, rakam, _ . - içerebilir.' });
    let u = q.userByName.get(username);
    const uid = u ? u.id : Number(q.insUser.run(username, hashPw(crypto.randomBytes(24).toString('hex')), now()).lastInsertRowid);
    json(res, 200, { ok: true }, setSession(uid));
  },
  async 'POST /api/register'(req, res) { return routes['POST /api/login'](req, res); },
  async 'POST /api/logout'(req, res) {
    const sid = parseCookies(req.headers.cookie).sid; if (sid) q.delSession.run(sid);
    json(res, 200, { ok: true }, { 'Set-Cookie': 'sid=; HttpOnly; Path=/; Max-Age=0' });
  },
  async 'GET /api/me'(req, res, user) {
    json(res, 200, { user: { id: user.id, username: user.username, ...profileOf(user), owned: ownedOf(user) }, servers: stateFor(user.id) });
  },
  async 'POST /api/profile'(req, res, user) {
    const b = await readJson(req);
    const bio = String(b.bio ?? '').replace(/\r\n/g, '\n').replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, '').trim().slice(0, 190);
    q.setProfile.run(hexOr(b.color), hexOr(b.banner), hexOr(b.banner2), bio, clean(b.status, 60), user.id);
    syncProfile(user.id);
    json(res, 200, { ok: true });
  },
  async 'POST /api/outfit'(req, res, user) {
    const b = await readJson(req); const o = {}; const src = b.outfit || {};
    for (const [k, max] of Object.entries({ gender: 1, botT: 1, skin: 9, face: 9, hair: 13, hairC: 13, top: 29, topT: 6, topPat: 10, bottom: 29, botPat: 10, shoes: 13, hat: CAT.SLOTS.hat.length - 1, glasses: CAT.SLOTS.glasses.length - 1, back: CAT.SLOTS.back.length - 1, suit: CAT.SLOTS.suit.length - 1 })) o[k] = Math.max(0, Math.min(max, Math.floor(+src[k]) || 0));
    for (const slot of ['hat', 'glasses', 'back', 'suit']) if (!hasItem(user, slot, o[slot])) return json(res, 400, { error: 'Bu eşya sende yok: ' + CAT.SLOTS[slot][o[slot]][0] + ' (önce satın al)' });
    // optional custom t-shirt image (data URL, resized client-side)
    const img = src.topImg;
    if (typeof img === 'string' && img.startsWith('data:image/') && img.length < 90000) o.topImg = img;
    else o.topImg = '';
    q.setOutfit.run(JSON.stringify(o), user.id); syncProfile(user.id); json(res, 200, { ok: true });
  },
  async 'POST /api/market/buy'(req, res, user) {
    if (limited('mk' + user.id, 40)) return json(res, 429, { error: 'Çok hızlı, biraz bekle.' });
    const b = await readJson(req), i = Math.floor(+b.i), MP = [5, 12, 25, 6, 10, 15, 18, 8, 20, 3]; if (!(i >= 0 && i < MP.length)) return json(res, 400, { error: 'Böyle bir ürün yok.' });
    const row = q.userById.get(user.id), coins = row.coins ?? 100; if (coins < MP[i]) return json(res, 400, { error: `Yetersiz bakiye: ${MP[i]} 💰 gerekli, sende ${coins} 💰 var.` });
    q.setCoins.run(coins - MP[i], user.id); syncProfile(user.id); json(res, 200, { ok: true, coins: coins - MP[i] });
  },
  async 'POST /api/car/buy'(req, res, user) {
    if (limited('car' + user.id, 20)) return json(res, 429, { error: 'Çok hızlı, biraz bekle.' });
    const b = await readJson(req), i = Math.floor(+b.i); const CP = [0, 150, 300, 500, 900, 2000, 220, 380, 650, 800, 1400, 1800, 3500, 5000];
    if (!(i >= 0 && i < CP.length)) return json(res, 400, { error: 'Böyle bir araba yok.' });
    const row = q.userById.get(user.id); const own = ownedOf(row), key = 'car:' + i, coins = row.coins ?? 100;
    if (i === 0 || own.includes(key)) return json(res, 200, { ok: true, coins, owned: own });
    if (coins < CP[i]) return json(res, 400, { error: `Yetersiz bakiye: ${CP[i]} 💰 gerekli, sende ${coins} 💰 var.` });
    own.push(key); q.setCoins.run(coins - CP[i], user.id); q.setOwned.run(JSON.stringify(own), user.id);
    syncProfile(user.id); json(res, 200, { ok: true, coins: coins - CP[i], owned: own });
  },
  async 'POST /api/car/fuel'(req, res, user) {
    if (limited('fuel' + user.id, 30)) return json(res, 429, { error: 'Çok hızlı, biraz bekle.' });
    const b = await readJson(req); const units = Math.max(1, Math.min(100, Math.floor(+b.units) || 0)), cost = Math.ceil(units / 20);
    const row = q.userById.get(user.id), coins = row.coins ?? 100;
    if (coins < cost) return json(res, 400, { error: `Benzin için ${cost} 💰 lazım, sende ${coins} 💰 var.` });
    q.setCoins.run(coins - cost, user.id); syncProfile(user.id); json(res, 200, { ok: true, coins: coins - cost, units, cost });
  },
  async 'POST /api/shop/buy'(req, res, user) {
    if (limited('shop' + user.id, 30)) return json(res, 429, { error: 'Çok hızlı, biraz bekle.' });
    const b = await readJson(req); const slot = String(b.slot || ''), i = Math.floor(+b.i);
    const price = CAT.priceOf(slot, i); if (price < 0) return json(res, 400, { error: 'Böyle bir eşya yok.' });
    const row = q.userById.get(user.id); const own = ownedOf(row), key = slot + ':' + i;
    if (i === 0 || price === 0 || own.includes(key)) return json(res, 200, { ok: true, coins: row.coins ?? 100, owned: own });
    const coins = row.coins ?? 100;
    if (coins < price) return json(res, 400, { error: `Yetersiz bakiye: ${price} 💰 gerekli, sende ${coins} 💰 var.` });
    own.push(key); q.setCoins.run(coins - price, user.id); q.setOwned.run(JSON.stringify(own), user.id);
    syncProfile(user.id); json(res, 200, { ok: true, coins: coins - price, owned: own });
  },
  async 'POST /api/game/reward'(req, res, user) {
    if (limited('gm' + user.id, 8)) return json(res, 429, { error: 'Çok hızlı ödül istemi, biraz bekle.' });
    const b = await readJson(req); const g = CAT.GAMES[String(b.game)]; if (!g) return json(res, 400, { error: 'Bilinmeyen oyun.' });
    const bonus = Math.max(0, Math.min(60, Math.floor(+b.bonus) || 0));
    const mul = [.6, 1, 1.6][Math.max(0, Math.min(2, Math.floor(+b.diff) || 0))] ?? 1;
    const reward = Math.round((b.won ? g.win : g.play) * mul) + bonus;
    q.addCoins.run(reward, user.id); const row = q.userById.get(user.id);
    json(res, 200, { ok: true, reward, coins: row?.coins ?? 100 });
  },
  async 'POST /api/profile/avatar'(req, res, user) {
    if (limited('av' + user.id, 10)) { req.resume(); return json(res, 429, { error: 'Çok fazla deneme, biraz bekle.' }); }
    let buf; try { buf = await readRaw(req, 2 * 1024 * 1024); } catch { return json(res, 413, { error: 'Görsel en fazla 2 MB olabilir.' }); }
    const mime = sniffImage(buf);
    if (!mime) return json(res, 400, { error: 'Sadece PNG, JPEG, WebP veya GIF yükleyebilirsin.' });
    fs.writeFileSync(path.join(AV_DIR, String(user.id)), buf);
    q.setAvatar.run(now(), mime, user.id);
    syncProfile(user.id);
    json(res, 200, { ok: true });
  },
  async 'POST /api/profile/avatar/remove'(req, res, user) {
    q.setAvatar.run(0, '', user.id); fs.unlink(path.join(AV_DIR, String(user.id)), () => {});
    syncProfile(user.id);
    json(res, 200, { ok: true });
  },
  async 'POST /api/parkour/reward'(req, res, user) {
    if (limited('pk' + user.id, 6)) return json(res, 429, { error: 'Çok hızlı ödül istemi, biraz bekle.' });
    const b = await readJson(req);
    const course = Math.max(0, Math.min(CAT.COURSES.length - 1, Math.floor(+b.course || 0)));
    const time = Math.max(4, Math.min(900, +b.time || 999));
    const C = CAT.COURSES[course], base = C.base;
    const bonus = time <= C.target ? Math.round(base * 0.5 * (1 - time / C.target)) : 0;
    const coinBonus = Math.max(0, Math.min(40, Math.floor(+b.coins) || 0)) * 2;   // yolda toplanan altınlar
    const reward = base + bonus + coinBonus;
    q.addCoins.run(reward, user.id);
    const row = q.userById.get(user.id);
    json(res, 200, { ok: true, reward, coins: row?.coins ?? 100 });
  },
  async 'POST /api/servers'(req, res, user) {
    const b = await readJson(req); const name = clean(b.name, 48);
    if (name.length < 2) return json(res, 400, { error: 'Sunucu adı en az 2 karakter olmalı.' });
    if (q.userServers.all(user.id).length >= 50) return json(res, 400, { error: 'En fazla 50 sunucuya üye olabilirsin.' });
    const id = makeServer(name, user.id); refreshClient(user.id);
    json(res, 200, { ok: true, id: Number(id) });
  },
  async 'POST /api/servers/join'(req, res, user) {
    const b = await readJson(req); const code = clean(b.code, 64).split('/').pop();
    const s = q.serverByInvite.get(code);
    if (!s) return json(res, 404, { error: 'Geçersiz davet kodu.' });
    q.addMember.run(s.id, user.id); refreshClient(user.id); syncServer(s.id);
    json(res, 200, { ok: true, id: s.id });
  },
  async 'POST /api/servers/leave'(req, res, user) {
    const b = await readJson(req); const s = q.serverById.get(+b.serverId);
    if (!s || !memberOf(user.id, s.id)) return json(res, 404, { error: 'Sunucu bulunamadı.' });
    if (s.owner_id === user.id) return json(res, 400, { error: 'Sunucu sahibi ayrılamaz.' });
    q.delMember.run(s.id, user.id); refreshClient(user.id); syncServer(s.id);
    json(res, 200, { ok: true });
  },
  async 'POST /api/channels'(req, res, user) {
    const b = await readJson(req); const s = q.serverById.get(+b.serverId);
    if (!s || s.owner_id !== user.id) return json(res, 403, { error: 'Sadece sunucu sahibi kanal oluşturabilir.' });
    const type = b.type === 'voice' ? 'voice' : 'text';
    let name = clean(b.name, 32);
    if (type === 'text') name = name.toLowerCase().replace(/\s+/g, '-');
    if (!name) return json(res, 400, { error: 'Kanal adı gerekli.' });
    const id = q.insChannel.run(s.id, name, type, now()).lastInsertRowid; syncServer(s.id);
    json(res, 200, { ok: true, id: Number(id) });
  },
  async 'GET /api/messages'(req, res, user, url) {
    const cid = +url.searchParams.get('channelId'); const before = +url.searchParams.get('before') || 0;
    if (!chanAccess(user.id, cid)) return json(res, 403, { error: 'Erişim yok.' });
    const rows = before ? q.msgsBefore.all(cid, before) : q.msgsLatest.all(cid);
    json(res, 200, { messages: rows.reverse().map(toMsg), more: rows.length === 50 });
  },
  async 'POST /api/upload'(req, res, user) {
    const cid = +req.headers['x-channel'];
    const ch = chanAccess(user.id, cid);
    if (!ch || ch.type !== 'text') { req.resume(); return json(res, 403, { error: 'Erişim yok.' }); }
    const len = +req.headers['content-length'] || 0;
    if (len > MAX_UPLOAD) { req.resume(); return json(res, 413, { error: `Dosya çok büyük (en fazla ${MAX_UPLOAD / 1048576} MB).` }); }
    let name = 'dosya';
    try { name = clean(decodeURIComponent(req.headers['x-filename'] || ''), 150).replace(/[\\/]/g, '_') || 'dosya'; } catch {}
    let text = ''; try { text = clean(decodeURIComponent(req.headers['x-text'] || ''), 4000); } catch {}
    const mime = clean(req.headers['content-type'] || 'application/octet-stream', 100) || 'application/octet-stream';
    const id = rid(16), fp = path.join(UPLOADS, id), out = fs.createWriteStream(fp);
    let size = 0, aborted = false;
    req.on('data', c => {
      size += c.length;
      if (size > MAX_UPLOAD && !aborted) {
        aborted = true; req.unpipe(out); out.destroy(); fs.unlink(fp, () => {});
        json(res, 413, { error: 'Dosya çok büyük.' }); req.resume();
      }
    });
    req.on('aborted', () => { aborted = true; out.destroy(); fs.unlink(fp, () => {}); });
    req.pipe(out);
    out.on('finish', () => {
      if (aborted) return;
      q.insFile.run(id, name, mime, size);
      const mid = q.insMsg.run(cid, user.id, text, id, now()).lastInsertRowid;
      const m = toMsg(q.msgFull.get(mid));
      broadcastServer(ch.server_id, { t: 'msg', m });
      json(res, 200, { ok: true });
    });
    out.on('error', () => { if (!res.headersSent) json(res, 500, { error: 'Yükleme başarısız.' }); });
  },
};

const INLINE = /^(image\/(png|jpe?g|gif|webp|avif|bmp)|video\/(mp4|webm|ogg)|audio\/(mpeg|ogg|wav|webm|mp4|aac|flac|x-m4a))$/i;
function serveFile(req, res, user, id) {
  const f = q.fileAccess.get(id);
  if (!f || !memberOf(user.id, f.server_id)) return json(res, 404, { error: 'Bulunamadı.' });
  const fp = path.join(UPLOADS, f.id);
  let st; try { st = fs.statSync(fp); } catch { return json(res, 404, { error: 'Bulunamadı.' }); }
  const url = new URL(req.url, 'http://x');
  const inline = INLINE.test(f.mime) && !url.searchParams.has('dl');
  const h = {
    'Content-Type': inline ? f.mime : 'application/octet-stream',
    'Content-Disposition': `${inline ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(f.name)}`,
    'X-Content-Type-Options': 'nosniff', 'Accept-Ranges': 'bytes', 'Cache-Control': 'private, max-age=86400',
    'Content-Security-Policy': "default-src 'none'; sandbox",
  };
  const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
  if (range && (range[1] || range[2])) {
    let s = range[1] ? +range[1] : Math.max(0, st.size - +range[2]);
    let e = range[1] && range[2] ? +range[2] : st.size - 1;
    if (s > e || s >= st.size) { res.writeHead(416, { 'Content-Range': `bytes */${st.size}` }); return res.end(); }
    e = Math.min(e, st.size - 1);
    res.writeHead(206, { ...h, 'Content-Range': `bytes ${s}-${e}/${st.size}`, 'Content-Length': e - s + 1 });
    return fs.createReadStream(fp, { start: s, end: e }).pipe(res);
  }
  res.writeHead(200, { ...h, 'Content-Length': st.size });
  fs.createReadStream(fp).pipe(res);
}

const MIMES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json' };
function serveStatic(req, res, pathname) {
  let p = pathname === '/' ? '/index.html' : pathname;
  const fp = path.normalize(path.join(PUBLIC, p));
  if (!fp.startsWith(PUBLIC + path.sep)) { res.writeHead(403); return res.end(); }
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('Bulunamadı'); }
    res.writeHead(200, { 'Content-Type': MIMES[path.extname(fp)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
    res.end(data);
  });
}

async function handler(req, res) {
  try {
    const url = new URL(req.url, 'http://x');
    const key = `${req.method} ${url.pathname}`;
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/files/') || url.pathname.startsWith('/avatars/')) {
      const user = userFromReq(req);
      const isPublic = key === 'POST /api/register' || key === 'POST /api/login' || key === 'POST /api/logout';
      if (!user && !isPublic) return json(res, 401, { error: 'Giriş yapmalısın.' });
      if (url.pathname.startsWith('/avatars/') && req.method === 'GET') return serveAvatar(req, res, url.pathname.slice(9));
      if (url.pathname.startsWith('/files/') && req.method === 'GET') return serveFile(req, res, user, url.pathname.slice(7));
      const fn = routes[key];
      if (!fn) return json(res, 404, { error: 'Bulunamadı.' });
      return await fn(req, res, user, url);
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
    serveStatic(req, res, decodeURIComponent(url.pathname));
  } catch (e) {
    if (!res.headersSent) json(res, e.message === 'too large' ? 413 : 400, { error: 'Geçersiz istek.' });
    else res.end();
  }
}

/* ---------------------------------------------------------- WebSocket */
const clients = new Set(); const byUser = new Map();
const voice = new Map();      // channelId -> Map(userId -> state)
const userVoice = new Map();  // userId -> channelId
const { Okey } = require('./okey');
const okeys = new Map();      // channelId -> Okey (ses kanalı başına bir okey masası)
const botTimers = new Map();   // channelId -> timeout (bot hamlesi)
const okeyBot = chId => {
  clearTimeout(botTimers.get(chId)); const g = okeys.get(chId);
  if (!g || g.phase !== 'play' || !g.isBot(g.turn)) return;
  botTimers.set(chId, setTimeout(() => {
    const g2 = okeys.get(chId); if (!g2 || g2.phase !== 'play' || !g2.isBot(g2.turn)) return;
    let ok = false; try { ok = g2.botStep(); } catch (e) { console.error('okey bot:', e); }
    if (ok) { okeySend(chId); okeyBot(chId); }
  }, g.tp === 'draw' ? 1100 : 1500));
};
const okeySend = chId => {
  const room = voice.get(chId), g = okeys.get(chId); if (!room || !g) return;
  const pub = { t: 'okey', ...g.pub() };
  for (const [uid, s] of room) { send(s.client, pub); const i = g.seatOf(uid); send(s.client, { t: 'okey:hand', hand: i >= 0 ? g.hands[i] : [] }); }
};
const WS_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

function frame(str, op = 1) {
  const p = Buffer.from(str); let h;
  if (p.length < 126) h = Buffer.from([0x80 | op, p.length]);
  else if (p.length < 65536) { h = Buffer.alloc(4); h[0] = 0x80 | op; h[1] = 126; h.writeUInt16BE(p.length, 2); }
  else { h = Buffer.alloc(10); h[0] = 0x80 | op; h[1] = 127; h.writeBigUInt64BE(BigInt(p.length), 2); }
  return Buffer.concat([h, p]);
}
const send = (c, obj) => { if (!c.dead) try { c.sock.write(frame(JSON.stringify(obj))); } catch {} };
const sendUser = (uid, obj) => { for (const c of byUser.get(uid) || []) send(c, obj); };
function broadcastServer(serverId, obj, exceptUid) {
  for (const c of clients) if (c.serverIds.has(serverId) && c.user.id !== exceptUid) send(c, obj);
}
function syncServer(serverId) { broadcastServer(serverId, { t: 'sync' }); }
function refreshClient(uid) {
  for (const c of byUser.get(uid) || []) { c.serverIds = new Set(q.userServers.all(uid).map(s => s.id)); send(c, { t: 'sync' }); }
}
const onlineIds = () => [...byUser.keys()];
const voiceList = chId => [...(voice.get(chId) || new Map())].map(([id, s]) => ({ id, muted: s.muted, deaf: s.deaf, sharing: s.sharing, speaking: s.speaking }));
function broadcastVoice(chId) {
  const ch = q.channelById.get(chId); if (!ch) return;
  broadcastServer(ch.server_id, { t: 'voice', channelId: chId, users: voiceList(chId) });
}
/* ---- TV (ev, TV odası): link / ekran paylaşımı, ses kanalı başına ortak durum ---- */
const tvs = new Map();
const tvMsg = tv => ({ t: 'tv', kind: tv.kind, url: tv.url, owner: tv.owner, playing: tv.playing, pos: tv.playing ? tv.pos + (Date.now() - tv.ts) / 1000 : tv.pos, seek: tv.seek ? 1 : 0, by: tv.by });
function tvBroadcast(chId, by = 0) {
  const room = voice.get(chId); if (!room) return;
  const m = tvs.has(chId) ? tvMsg(tvs.get(chId)) : { t: 'tv', kind: 'off', url: '', owner: 0, playing: false, pos: 0, seek: 0, by };
  for (const s of room.values()) send(s.client, m);
}

function leaveVoice(uid) {
  const chId = userVoice.get(uid); if (chId == null) return;
  userVoice.delete(uid);
  const room = voice.get(chId); if (!room) return;
  room.delete(uid);
  { const tv0 = tvs.get(chId); if (tv0 && tv0.kind === 'screen' && tv0.owner === uid) { tvs.delete(chId); tvBroadcast(chId, uid); } }
  for (const [oid, s] of room) send(s.client, { t: 'voice:left', id: uid });
  const og = okeys.get(chId); if (og && og.leave(uid)) { okeySend(chId); okeyBot(chId); }
    if (!room.size) { voice.delete(chId); tvs.delete(chId); okeys.delete(chId); clearTimeout(botTimers.get(chId)); botTimers.delete(chId); }
  broadcastVoice(chId);
}

function onMessage(c, raw) {
  let d; try { d = JSON.parse(raw); } catch { return; }
  const uid = c.user.id;
  switch (d.t) {
    case 'msg': {
      const ch = chanAccess(uid, +d.channelId); const text = String(d.content || '').replace(/\r\n/g, '\n').trim().slice(0, 4000);
      if (!ch || ch.type !== 'text' || !text) return;
      if (limited('m' + uid, 30, 10000)) return;
      const id = q.insMsg.run(ch.id, uid, text, null, now()).lastInsertRowid;
      broadcastServer(ch.server_id, { t: 'msg', m: toMsg(q.msgFull.get(id)) }); break;
    }
    case 'typing': {
      const ch = chanAccess(uid, +d.channelId); if (!ch) return;
      broadcastServer(ch.server_id, { t: 'typing', channelId: ch.id, userId: uid, username: c.user.username }, uid); break;
    }
    case 'del': {
      const m = q.msgById.get(+d.id); if (!m || m.user_id !== uid) return;
      const ch = q.channelById.get(m.channel_id);
      q.delMsg.run(m.id);
      if (m.file_id) { q.delFile.run(m.file_id); fs.unlink(path.join(UPLOADS, m.file_id), () => {}); }
      broadcastServer(ch.server_id, { t: 'del', id: m.id, channelId: m.channel_id }); break;
    }
    case 'voice:join': {
      const ch = chanAccess(uid, +d.channelId); if (!ch || ch.type !== 'voice') return;
      leaveVoice(uid);
      let room = voice.get(ch.id); if (!room) voice.set(ch.id, room = new Map());
      const peers = [...room.keys()];
      room.set(uid, { client: c, muted: !!d.muted, deaf: !!d.deaf, sharing: false, speaking: false });
      userVoice.set(uid, ch.id);
      send(c, { t: 'voice:peers', channelId: ch.id, peers });
      if (tvs.has(ch.id)) send(c, tvMsg(tvs.get(ch.id)));
      broadcastVoice(ch.id);
      if (okeys.has(ch.id)) okeySend(ch.id);
      break;
    }
    case 'voice:leave': leaveVoice(uid); break;
    case 'voice:state': {
      const s = voice.get(userVoice.get(uid))?.get(uid); if (!s || s.client !== c) return;
      s.muted = !!d.muted; s.deaf = !!d.deaf; s.sharing = !!d.sharing;
      if (s.muted || s.deaf) s.speaking = false;
      { const cid = userVoice.get(uid), tv = tvs.get(cid); if (tv && tv.kind === 'screen' && tv.owner === uid && !s.sharing) { tvs.delete(cid); tvBroadcast(cid, uid); } }
      broadcastVoice(userVoice.get(uid)); break;
    }
    case 'speaking': {
      const s = voice.get(userVoice.get(uid))?.get(uid); if (!s || s.client !== c) return;
      const v = !!d.v && !s.muted && !s.deaf; if (v === s.speaking) return;
      s.speaking = v; broadcastVoice(userVoice.get(uid)); break;
    }
    case 'tv:set': {
      const chId = userVoice.get(uid); const room = voice.get(chId); if (!room || !room.has(uid)) return;
      const kind = d.kind === 'link' || d.kind === 'screen' ? d.kind : 'off';
      if (kind === 'off') { tvs.delete(chId); tvBroadcast(chId, uid); break; }
      let url = '', owner = 0;
      if (kind === 'link') { url = String(d.url || '').trim().slice(0, 600); if (!/^https?:\/\/[^\s]+$/i.test(url)) return; }
      else { owner = d.owner | 0; const os = room.get(owner); if (!os || !os.sharing) return; }
      const pos = Math.max(0, Math.min(86400, +d.pos || 0));
      tvs.set(chId, { kind, url, owner, playing: !!d.playing, pos, ts: Date.now(), seek: !!d.seek, by: uid });
      tvBroadcast(chId, uid); break;
    }
    case 'world': {
      const chId = userVoice.get(uid); const room = voice.get(chId); if (!room || !room.has(uid)) return;
      const n = (v, m) => Math.max(-m, Math.min(m, +v || 0));
      const msg = { t: 'world', id: uid, x: n(d.x, 520), z: n(d.z, 520), y: n(d.y, 300), ry: n(d.ry, 10), a: (d.a | 0) & 7, room: (d.room | 0) & 3, g: Math.max(0, Math.min(999, d.g | 0)), seat: d.seat == null ? -1 : (d.seat | 0), em: String(d.em || '').slice(0, 4) };
      for (const [oid, s] of room) if (oid !== uid) send(s.client, msg); break;
    }
    case 'mg': {   // mini oyun mesajları (Para Avı çok oyunculu): kanaldaki herkese iletilir
      const chId = userVoice.get(uid); const room = voice.get(chId); if (!room || !room.has(uid)) return;
      const nn = (v, m) => Math.max(-m, Math.min(m, Math.round((+v || 0) * 100) / 100));
      const msg = { t: 'mg', id: uid, g: String(d.g || '').slice(0, 8), k: String(d.k || '').slice(0, 8), i: nn(d.i, 1e6), s: nn(d.s, 1e5), seed: nn(d.seed, 1e9), diff: nn(d.diff, 2) };
      if (Array.isArray(d.b)) msg.b = d.b.slice(0, 8).map(a => Array.isArray(a) ? a.slice(0, 5).map(v => nn(v, 500)) : []);
      if (Array.isArray(d.c)) msg.c = d.c.slice(0, 40).map(v => nn(v, 1e6));
      for (const [oid, sck] of room) if (oid !== uid) send(sck.client, msg); break;
    }
    case 'okey:sit': case 'okey:leave': case 'okey:bots': case 'okey:unbots': case 'okey:start': case 'okey:draw': case 'okey:discard': case 'okey:finish': {
      const chId = userVoice.get(uid); if (!voice.get(chId)?.has(uid)) return;
      let g = okeys.get(chId); if (!g) okeys.set(chId, g = new Okey());
      let ok = false; const id = d.id | 0;
      switch (d.t) {
        case 'okey:sit': ok = g.sit(uid, d.seat | 0); break;
        case 'okey:leave': ok = g.leave(uid); break;
        case 'okey:bots': ok = g.fillBots(uid); if (ok && d.start) g.start(uid); break;
        case 'okey:unbots': ok = g.removeBots(uid); break;
        case 'okey:start': ok = g.start(uid); if (!ok) send(c, { t: 'okey:err', msg: g.seats.some(s => s == null) ? 'Başlamak için 4 oyuncu gerekli.' : 'Oyun başlatılamadı.' }); break;
        case 'okey:draw': ok = g.draw(uid, d.from === 'discard' ? 'discard' : 'deck'); break;
        case 'okey:discard': ok = g.discard(uid, id); break;
        case 'okey:finish': ok = g.finish(uid, id); if (!ok) send(c, { t: 'okey:err', msg: 'Elin henüz bitmiyor: 14 taş per/serilere ayrılmalı.' }); break;
      }
      if (ok) { okeySend(chId); okeyBot(chId); } break;
    }
    case 'signal': {
      const chId = userVoice.get(uid); const room = voice.get(chId); const target = room?.get(+d.to);
      if (!target || !room.has(uid)) return;
      send(target.client, { t: 'signal', from: uid, data: d.data }); break;
    }
  }
}

function onUpgrade(req, socket) {
  const user = userFromReq(req);
  const origin = req.headers.origin;
  let originOk = true;
  if (origin) { try { originOk = new URL(origin).host === req.headers.host; } catch { originOk = false; } }
  if (req.url !== '/ws' || !user || !originOk || !req.headers['sec-websocket-key']) { socket.write('HTTP/1.1 403 Forbidden\r\n\r\n'); return socket.destroy(); }
  const accept = crypto.createHash('sha1').update(req.headers['sec-websocket-key'] + WS_GUID).digest('base64');
  socket.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`);
  socket.setNoDelay(true); socket.setTimeout(0);
  const c = { sock: socket, user, buf: Buffer.alloc(0), frag: [], dead: false, alive: true,
    serverIds: new Set(q.userServers.all(user.id).map(s => s.id)) };
  clients.add(c);
  if (!byUser.has(user.id)) byUser.set(user.id, new Set());
  byUser.get(user.id).add(c);
  const voiceState = {};
  for (const [chId, room] of voice) { const ch = q.channelById.get(chId); if (ch && c.serverIds.has(ch.server_id)) voiceState[chId] = voiceList(chId); }
  send(c, { t: 'hello', online: onlineIds(), voice: voiceState });
  for (const o of clients) send(o, { t: 'presence', online: onlineIds() });

  const close = () => {
    if (c.dead) return; c.dead = true; clients.delete(c);
    const set = byUser.get(user.id); set?.delete(c); if (set && !set.size) byUser.delete(user.id);
    const s = voice.get(userVoice.get(user.id))?.get(user.id); if (s && s.client === c) leaveVoice(user.id);
    for (const o of clients) send(o, { t: 'presence', online: onlineIds() });
    try { socket.destroy(); } catch {}
  };
  socket.on('close', close); socket.on('error', close);
  socket.on('data', chunk => {
    c.buf = Buffer.concat([c.buf, chunk]);
    for (;;) {
      const b = c.buf; if (b.length < 2) return;
      const fin = !!(b[0] & 0x80), op = b[0] & 15, masked = !!(b[1] & 0x80); let len = b[1] & 0x7f, off = 2;
      if (len === 126) { if (b.length < 4) return; len = b.readUInt16BE(2); off = 4; }
      else if (len === 127) { if (b.length < 10) return; len = Number(b.readBigUInt64BE(2)); off = 10; }
      if (len > 1024 * 1024 || !masked) return close();
      if (b.length < off + 4 + len) return;
      const mask = b.subarray(off, off + 4); const payload = Buffer.from(b.subarray(off + 4, off + 4 + len));
      for (let i = 0; i < payload.length; i++) payload[i] ^= mask[i & 3];
      c.buf = b.subarray(off + 4 + len);
      if (op === 8) { try { socket.write(Buffer.from([0x88, 0])); } catch {} return close(); }
      if (op === 9) { try { socket.write(Buffer.concat([Buffer.from([0x8a, payload.length]), payload])); } catch {} continue; }
      if (op === 10) { c.alive = true; continue; }
      if (op === 1 || op === 0) {
        c.frag.push(payload);
        if (fin) { const text = Buffer.concat(c.frag).toString('utf8'); c.frag = []; onMessage(c, text); }
      }
    }
  });
}
setInterval(() => {
  for (const c of clients) {
    if (!c.alive) { c.sock.destroy(); continue; }
    c.alive = false; try { c.sock.write(Buffer.from([0x89, 0])); } catch {}
  }
}, 30000).unref();

/* -------------------------------------------------------------- start */
const server = process.env.SSL_CERT && process.env.SSL_KEY
  ? https.createServer({ cert: fs.readFileSync(process.env.SSL_CERT), key: fs.readFileSync(process.env.SSL_KEY) }, handler)
  : http.createServer(handler);
server.on('upgrade', onUpgrade);
server.requestTimeout = 0; // büyük dosya yüklemeleri için
server.listen(PORT, HOST, () => {
  console.log(`\n  Vibra çalışıyor → ${BASE}`);
  console.log('  Giriş: sadece isimle (kayıt kodu / şifre yok)');
  console.log();
});
module.exports = { server };
