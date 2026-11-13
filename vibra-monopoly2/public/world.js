'use strict';
/* =====================================================================
   Vibra 3D Dünya: ses efektleri + karakter editörü + kamp ateşi lobisi + ev (TV odası)
   three.js ilk açılışta cdnjs'ten yüklenir.
   ===================================================================== */
(() => {
/* ------------------------------------------------------------- SES EFEKTLERİ */
let AC, master;
const ac = () => {
  if (!AC) { AC = new (window.AudioContext || window.webkitAudioContext)(); master = AC.createGain(); master.gain.value = 0.6; master.connect(AC.destination); }
  if (AC.state === 'suspended') AC.resume(); return AC;
};
const tone = (f, at, dur, type = 'sine', vol = 0.2, f2) => {
  const a = ac(), t = a.currentTime + at, o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
};
let noiseBuf;
const noiseBuffer = () => { if (!noiseBuf) { const a = ac(); noiseBuf = a.createBuffer(1, a.sampleRate * 2, a.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; } return noiseBuf; };
const burst = (at, dur, vol, freq, type = 'lowpass', q = 1) => {
  const a = ac(), t = a.currentTime + at, s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  s.buffer = noiseBuffer(); f.type = type; f.frequency.value = freq; f.Q.value = q;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random()); s.stop(t + dur + 0.05);
};
const FX = {
  join: () => { tone(520, 0, .14, 'sine', .22); tone(780, .09, .2, 'sine', .22); tone(1040, .18, .24, 'sine', .16); },
  leave: () => { tone(780, 0, .14, 'sine', .22); tone(520, .09, .2, 'sine', .2); tone(330, .18, .24, 'sine', .14); },
  mute: () => { tone(420, 0, .13, 'square', .09, 220); },
  unmute: () => { tone(260, 0, .06, 'square', .08); tone(520, .06, .12, 'square', .09); },
  deaf: () => { tone(380, 0, .12, 'square', .09, 160); tone(240, .1, .16, 'square', .08, 120); },
  undeaf: () => { tone(200, 0, .07, 'square', .08); tone(400, .07, .07, 'square', .08); tone(600, .14, .12, 'square', .08); },
  msg: () => { tone(1250, 0, .08, 'triangle', .18); tone(1750, .07, .13, 'triangle', .16); },
  shareOn: () => { [400, 500, 600, 800].forEach((f, i) => tone(f, i * .07, .14, 'triangle', .17)); },
  shareOff: () => { [800, 600, 500, 400].forEach((f, i) => tone(f, i * .07, .14, 'triangle', .15)); },
  step: () => { burst(0, .07, .22, 380 + Math.random() * 200); },
  sit: () => { burst(0, .16, .35, 260); tone(110, 0, .14, 'sine', .22, 70); },
  stand: () => { burst(0, .12, .25, 520); tone(160, 0, .1, 'sine', .14, 240); },
  jump: () => {
    tone(220, 0, .06, 'sine', .15, 480);
    tone(380, .04, .12, 'triangle', .2, 920);
    tone(620, .1, .16, 'sine', .12, 1400);
    burst(0, .12, .35, 500, 'bandpass', 1.4);
    burst(.02, .08, .2, 1800, 'highpass', 1);
  },
  land: () => {
    burst(0, .1, .4, 280, 'lowpass', .8);
    tone(90, 0, .12, 'sine', .18, 40);
    burst(.02, .08, .25, 900, 'bandpass', 1.2);
  },
  wave: () => { tone(880, 0, .1, 'triangle', .16); tone(1100, .1, .1, 'triangle', .16); tone(880, .2, .12, 'triangle', .16); },
  dance: () => { [523, 659, 784, 1046, 784, 659].forEach((f, i) => tone(f, i * .09, .12, 'square', .09)); },
  clap: () => { for (let i = 0; i < 4; i++) burst(i * .13, .06, .5, 1800, 'bandpass', 1.2); },
  tvOn: () => { burst(0, .5, .35, 3500, 'highpass'); tone(2000, 0, .05, 'square', .1); tone(900, .08, .2, 'sine', .12, 1400); },
  tvOff: () => { tone(900, 0, .25, 'sine', .15, 60); burst(0, .15, .2, 4000, 'highpass'); },
  door: () => { tone(180, 0, .18, 'sawtooth', .12, 120); burst(.05, .25, .25, 700); tone(540, .2, .25, 'sine', .14, 820); },
  pop: () => { tone(700, 0, .08, 'sine', .2, 1300); },
  tile: () => { burst(0, .05, .55, 900, 'bandpass', 3); tone(240, 0, .05, 'square', .06, 180); },
  turn: () => { tone(880, 0, .12, 'sine', .2); tone(1320, .1, .2, 'sine', .2); },
  swing: () => { burst(0, .14, .3, 2400, 'bandpass', 1.5); tone(520, 0, .12, 'sawtooth', .05, 200); },
  hit: () => { burst(0, .09, .55, 700); tone(150, 0, .12, 'square', .12, 70); },
  growl: () => { tone(95, 0, .4, 'sawtooth', .13, 55); burst(0, .35, .1, 300); },
  hurt: () => { tone(230, 0, .22, 'sawtooth', .18, 90); burst(0, .12, .3, 500); },
  die: () => { tone(220, 0, .6, 'sine', .2, 40); },
};
window.__sfx = n => { try { ac(); FX[n]?.(); } catch {} };

/* ambiyans: ateş çıtırtısı + TV uğultusu (mesafeye göre ses) */
const amb = { on: false, fire: null, tv: null, t: null };
function ambStart() {
  const a = ac(); if (amb.on) return; amb.on = true;
  const mk = (freq, type) => { const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = noiseBuffer(); s.loop = true; f.type = type; f.frequency.value = freq; g.gain.value = 0; s.connect(f); f.connect(g); g.connect(master); s.start(); return { s, g }; };
  amb.fire = mk(700, 'lowpass'); amb.tv = mk(5000, 'highpass');
  amb.t = setInterval(() => { if (amb.fire.g.gain.value > .02 && Math.random() < .7) burst(0, .04 + Math.random() * .05, .35 * Math.min(1, amb.fire.g.gain.value * 6), 1500 + Math.random() * 2500, 'bandpass', 2); }, 150);
}
function ambStop() { if (!amb.on) return; amb.on = false; clearInterval(amb.t); try { amb.fire.s.stop(); amb.tv.s.stop(); } catch {} }
const ambVol = (fire, tv) => { if (!amb.on) return; amb.fire.g.gain.value = fire * .12; amb.tv.g.gain.value = tv * .02; };

/* ------------------------------------------------------------- KARAKTER VERİSİ */
const SKIN = ['#f2c9a0', '#e0a878', '#c68642', '#8d5524', '#ffdbac', '#f1a37a', '#6b4226', '#ffcc99', '#f5d0c5', '#d4a574'];
const HAIRC = ['#2b1b12', '#5a3825', '#a0522d', '#e6c36a', '#d9d9d9', '#e8453c', '#3b82f6', '#a855f7', '#ec4899', '#10b981', '#f97316', '#06b6d4', '#84cc16', '#f43f5e'];
const CLOTH = ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6', '#ecf0f1', '#34495e', '#e67e22', '#1abc9c', '#ff6b9d', '#7f8c8d', '#111827',
  '#0ea5e9', '#ef4444', '#22c55e', '#eab308', '#a855f7', '#f8fafc', '#1e293b', '#fb923c', '#14b8a6', '#f472b6', '#64748b', '#020617',
  '#6366f1', '#f43f5e', '#84cc16', '#fbbf24', '#c084fc', '#fef3c7'];
const SHOES = ['#ecf0f1', '#111827', '#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22', '#ff6b9d', '#7f8c8d', '#0ea5e9', '#f97316', '#a3e635', '#c026d3'];
const NAMES = {
  face: ['Mutlu', 'Sakin', 'Havalı', 'Şaşkın', 'Sırıtan', 'Uykulu', 'Kızgın', 'Göz Kırp', 'Cool', 'Utangaç'],
  hair: ['Yok', 'Kısa', 'Uzun', 'Dikenli', 'Topuz', 'Afro', 'Mohawk', 'Dalgalı', 'Kakül', 'Örgü', '👧 Uzun Düz', '👧 Bob', '👧 At Kuyruğu', '👧 Çift Kuyruk'],
  topT: ['Tişört', 'Uzun Kol', 'Atlet', 'Çizgili', 'Kapüşonlu', 'Ceket', 'Gömlek'],
  pat: ['Düz', 'Çizgi', 'Nokta', 'Kareli', 'Kamuflaj', 'Zigzag', 'Yıldız', 'Dalga', 'Kalp', 'Şimşek', 'Geometri'],
  hat: ['Yok', '🐸 Kurbağa', '🚧 Koni', '🍄 Mantar', '🧢 Kep', '🐰 Tavşan', '🎩 Silindir', '🎅 Noel', '🤠 Kovboy', '👑 Taç', '🚁 Pervane', '👨‍🍳 Aşçı', '📺 TV',
    '🥷 Ninja', '🚀 Astronot', '🤖 Robot', '🎃 Balkabağı', '🦄 Unicorn', '🎧 Kulaklık', '🧙 Büyücü', '🦁 Aslan', '🎓 Mezuniyet', '⛑️ Kask', '🪖 Asker'],
  glasses: ['Yok', 'Yuvarlak', 'Güneş', 'Pembe Vizör', 'Monokl', '🕶️ Siyah', '🥽 VR', '👓 Nerd', '🔵 Mavi', '🟣 Neon'],
};
const defOutfit = id => { id = Math.abs(+id) || 0; return { skin: id % 10, face: 0, hair: 1 + id % 9, hairC: id % 14, top: (id * 5) % 30, topT: 0, topPat: 0, bottom: (id * 7 + 6) % 30, botPat: 0, shoes: id % 14, hat: 0, glasses: 0, back: 0, suit: 0, gender: 0, botT: 0, topImg: '' }; };

// Kıyafet desen texture üretici
const patCache = {};
function clothPat(baseHex, pat) {
  const key = baseHex + ':' + (pat | 0);
  if (patCache[key]) return patCache[key];
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d');
  x.fillStyle = baseHex; x.fillRect(0, 0, 64, 64);
  const dark = (() => { const n = parseInt(baseHex.slice(1), 16); const f = v => Math.max(0, Math.min(255, (v * .55) | 0)); return '#' + [n >> 16 & 255, n >> 8 & 255, n & 255].map(f).map(v => v.toString(16).padStart(2, '0')).join(''); })();
  const light = (() => { const n = parseInt(baseHex.slice(1), 16); const f = v => Math.max(0, Math.min(255, (v + (255 - v) * .35) | 0)); return '#' + [n >> 16 & 255, n >> 8 & 255, n & 255].map(f).map(v => v.toString(16).padStart(2, '0')).join(''); })();
  x.fillStyle = dark;
  if (pat === 1) { // çizgi
    for (let i = 0; i < 64; i += 8) x.fillRect(0, i, 64, 4);
  } else if (pat === 2) { // nokta
    for (let y = 4; y < 64; y += 12) for (let xx = 4; xx < 64; xx += 12) { x.beginPath(); x.arc(xx, y, 3, 0, 7); x.fill(); }
  } else if (pat === 3) { // kareli
    for (let y = 0; y < 64; y += 16) for (let xx = 0; xx < 64; xx += 16) if (((xx / 16) + (y / 16)) % 2) x.fillRect(xx, y, 16, 16);
  } else if (pat === 4) { // kamuflaj
    x.fillStyle = dark; for (let i = 0; i < 18; i++) { x.beginPath(); x.ellipse(Math.random() * 64, Math.random() * 64, 8 + Math.random() * 10, 6 + Math.random() * 8, Math.random() * 3, 0, 7); x.fill(); }
    x.fillStyle = light; for (let i = 0; i < 10; i++) { x.beginPath(); x.ellipse(Math.random() * 64, Math.random() * 64, 5 + Math.random() * 6, 4 + Math.random() * 5, Math.random() * 3, 0, 7); x.fill(); }
  } else if (pat === 5) { // zigzag
    x.strokeStyle = dark; x.lineWidth = 3;
    for (let y = 0; y < 64; y += 10) { x.beginPath(); for (let xx = 0; xx <= 64; xx += 8) x.lineTo(xx, y + ((xx / 8) % 2 ? 5 : 0)); x.stroke(); }
  } else if (pat === 6) { // yıldız
    x.fillStyle = light;
    for (let i = 0; i < 12; i++) { const px = Math.random() * 64, py = Math.random() * 64; x.beginPath(); for (let k = 0; k < 5; k++) { const a = k * 2.513 - .3; x.lineTo(px + Math.cos(a) * 4, py + Math.sin(a) * 4); } x.fill(); }
  } else if (pat === 7) { // dalga
    x.strokeStyle = dark; x.lineWidth = 3;
    for (let y = 6; y < 64; y += 12) { x.beginPath(); for (let xx = 0; xx <= 64; xx++) x.lineTo(xx, y + Math.sin(xx * .2) * 4); x.stroke(); }
  } else if (pat === 8) { // kalp
    x.fillStyle = light;
    for (let i = 0; i < 10; i++) {
      const px = 8 + Math.random() * 48, py = 8 + Math.random() * 48, s = 3 + Math.random() * 3;
      x.beginPath(); x.moveTo(px, py + s * .3); x.bezierCurveTo(px, py, px - s, py, px - s, py + s * .3); x.bezierCurveTo(px - s, py + s * .7, px, py + s * 1.1, px, py + s * 1.2);
      x.bezierCurveTo(px, py + s * 1.1, px + s, py + s * .7, px + s, py + s * .3); x.bezierCurveTo(px + s, py, px, py, px, py + s * .3); x.fill();
    }
  } else if (pat === 9) { // şimşek
    x.strokeStyle = light; x.lineWidth = 3; x.lineJoin = 'miter';
    for (let i = 0; i < 6; i++) {
      const px = 6 + Math.random() * 52, py = 4 + Math.random() * 40;
      x.beginPath(); x.moveTo(px, py); x.lineTo(px - 4, py + 10); x.lineTo(px + 2, py + 10); x.lineTo(px - 6, py + 22); x.stroke();
    }
  } else if (pat === 10) { // geometri
    x.strokeStyle = dark; x.lineWidth = 2;
    for (let y = 0; y < 64; y += 16) for (let xx = 0; xx < 64; xx += 16) {
      x.strokeRect(xx + 2, y + 2, 12, 12); x.beginPath(); x.moveTo(xx + 2, y + 2); x.lineTo(xx + 14, y + 14); x.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(3, 3); tex.needsUpdate = true;
  patCache[key] = tex; return tex;
}
const outfitOf = id => { const p = PROF[id]; if (p?.outfit) { try { const raw = JSON.parse(p.outfit); return { ...defOutfit(id), ...raw, topImg: typeof raw.topImg === 'string' ? raw.topImg : '' }; } catch {} } return defOutfit(id); };

/* ------------------------------------------------------------- THREE yükleme */
let threeP;
const loadThree = () => window.THREE ? Promise.resolve() : (threeP ||= new Promise((res, rej) => {
  const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  s.onload = res; s.onerror = () => { threeP = null; rej(new Error('3D motoru yüklenemedi (internet bağlantısı gerekli).')); }; document.head.appendChild(s);
}));

/* ------------------------------------------------------------- KARAKTER MODELİ */
const buildChar = o => window.VCHAR.build(o, { SKIN, HAIRC, CLOTH, SHOES, clothPat });
const poseChar = (...a) => window.VCHAR.pose(...a);

/* ------------------------------------------------------------- KARAKTER EDİTÖRÜ (v2 tam ekran stüdyo görünümü + v3 kostüm/cinsiyet/satın alma) */
function editor() {
  try { document.exitPointerLock?.(); } catch {}
  if (document.getElementById('avs')) return;
  loadThree().then(() => {
    const T = THREE, me = S.me.id, CAT = window.VCAT, RAR = CAT.RAR;
    let o = { ...outfitOf(me) }; const base = { ...o };
    let tab = 'suit'; try { const rw = JSON.parse(PROF[me]?.outfit || '{}'); if (rw.gender === undefined) tab = 'body'; } catch { tab = 'body'; }
    let pending = null, busy = false, mode = 'idle';
    const TABS = [['body', 'Cinsiyet', '🚻'], ['suit', 'Kostüm', '🥷'], ['hat', 'Şapka', '🎩'], ['glasses', 'Gözlük', '🕶️'], ['back', 'Sırt', '🪽'], ['face', 'Yüz', '😊'], ['hair', 'Saç', '💇'], ['top', 'Üst', '👕'], ['bottom', 'Alt', '👖'], ['shoes', 'Ayakkabı', '👟']];
    const CAMS = { full: [1.1, 5.2, .92, 32], head: [1.5, 2.4, 1.46, 30], hat: [1.78, 3.2, 1.76, 30], top: [1.1, 3.0, 1.04, 30], legs: [.55, 2.8, .5, 30], feet: [.38, 1.9, .26, 30], back: [1.1, 3.7, 1.04, 30] };
    const TAB_CAM = { body: 'full', suit: 'full', hat: 'hat', glasses: 'head', back: 'back', face: 'head', hair: 'head', top: 'top', bottom: 'legs', shoes: 'feet' };
    const CAT_CAM = { suit: 'full', hat: 'hat', glasses: 'head', back: 'back', face: 'head', hair: 'head', topT: 'top' };
    const RI = { c: 0, k: 1, e: 2, l: 3 };
    const owned = () => new Set(S.me.owned || []);
    const coins = () => (S.me.coins != null ? S.me.coins : 100);
    const has = (slot, i) => i === 0 || CAT.isFree(slot, i) || owned().has(slot + ':' + i);

    /* ---- küçük 3D önizleme resimleri (v2'deki gibi) ---- */
    const TH = editor._th || (editor._th = { cache: {}, R: null });
    const thumbOf = (cat, i) => {
      const g = o.gender | 0, key = cat + ':' + i + ':' + (o.skin | 0) + ':' + g;
      if (TH.cache[key]) return TH.cache[key];
      if (!TH.R) {
        const cv = document.createElement('canvas'); cv.width = cv.height = 128;
        TH.R = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, preserveDrawingBuffer: true }); TH.R.setPixelRatio(1); TH.R.setSize(128, 128, false);
        TH.S = new T.Scene(); TH.C = new T.PerspectiveCamera(30, 1, .1, 50);
        TH.S.add(new T.HemisphereLight('#ffffff', '#7a6bd6', 1.25)); const dl = new T.DirectionalLight('#ffffff', .95); dl.position.set(2, 4, 3); TH.S.add(dl);
      }
      const t = { ...defOutfit(0), skin: o.skin | 0, hair: g === 1 ? 10 : 1, hairC: 1, top: 5, bottom: 12, shoes: 0, face: 0, gender: g, topT: 0, topPat: 0, botPat: 0, botT: 0, hat: 0, glasses: 0, back: 0, suit: 0, topImg: '' };
      t[cat] = i;
      const ch = buildChar(t), cm = CAMS[CAT_CAM[cat] || 'head'];
      TH.C.position.set(0, cm[0], cm[1]); TH.C.lookAt(0, cm[2], 0); TH.C.fov = cm[3]; TH.C.updateProjectionMatrix();
      ch.rotation.y = CAT_CAM[cat] === 'back' ? Math.PI + .5 : .5; poseChar(ch, 0, 1.7, '', 9, 0, 0, 0); TH.S.add(ch);
      TH.R.setClearColor(0x000000, 0); TH.R.render(TH.S, TH.C); TH.S.remove(ch);
      let url = ''; try { url = TH.R.domElement.toDataURL('image/png'); } catch {}
      ch.traverse(m => { if (m.geometry) m.geometry.dispose(); });
      return (TH.cache[key] = url);
    };

    const root = document.createElement('div'); root.id = 'avs';
    root.innerHTML = `<div class="avbg"></div>
      <div class="avl"><canvas id="avcv"></canvas>
        <div class="avname"><b></b><small>sürükle: döndür · tekerlek: yakınlaştır</small></div>
        <div class="avpose" id="avpose">${[['idle', '🧍 Dur'], ['walk', '🚶 Yürü'], ['dance', '💃 Dans'], ['wave', '👋 Selam'], ['sit', '🪑 Otur']].map(([k, n]) => `<button data-pose="${k}" class="${k === 'idle' ? 'on' : ''}">${n}</button>`).join('')}</div></div>
      <div class="avr">
        <div class="avh"><b>🧑‍🎤 Karakterini Tasarla</b><span class="avcoin">💰 <i id="avcoin">0</i></span><button id="avx" title="Kapat">✕</button></div>
        <div class="avtabs" id="avtabs"></div><div class="avbody" id="avbody"></div><div class="avbuy" id="avbuy"></div>
        <div class="avf"><button class="sec" id="avrnd">🎲 Rastgele</button><span style="flex:1"></span><button class="sec" id="avcancel">Vazgeç</button><button id="avsave">💾 Kaydet</button></div>
      </div>`;
    document.body.appendChild(root);
    const $ = s => root.querySelector(s);
    $('.avname b').textContent = S.me.username;

    /* ---- 3D sahne ---- */
    const cv = $('#avcv'), R = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }), sc = new T.Scene(), cam = new T.PerspectiveCamera(32, 1, .1, 60);
    R.setPixelRatio(Math.min(devicePixelRatio, 2)); R.shadowMap.enabled = true; R.toneMapping = T.ACESFilmicToneMapping; R.toneMappingExposure = 1.15;
    sc.add(new T.HemisphereLight('#fff3e0', '#6b5bd6', 1.05));
    const key = new T.DirectionalLight('#ffffff', .9); key.position.set(2.5, 4.5, 3.5); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); sc.add(key);
    const rim = new T.PointLight('#7c5cff', 1.3, 12); rim.position.set(-2.5, 2, -2.5); sc.add(rim);
    const rim2 = new T.PointLight('#ff9ad5', .9, 12); rim2.position.set(2.5, 1.2, -2); sc.add(rim2);
    const stage = new T.Group(); sc.add(stage);
    const disc = new T.Mesh(new T.CylinderGeometry(1.25, 1.35, .12, 48), new T.MeshStandardMaterial({ color: '#1d1840', roughness: .5, metalness: .35 })); disc.position.y = -.06; disc.receiveShadow = true; stage.add(disc);
    const ringM = new T.MeshBasicMaterial({ color: '#7c5cff' }), ring = new T.Mesh(new T.TorusGeometry(1.3, .03, 8, 64), ringM); ring.rotation.x = Math.PI / 2; stage.add(ring);
    let ch = null, spin = .35, drag = false, lx = 0, userSpun = 0, dist = 1;
    const camT = { y: 1.1, z: 5.2, ly: .92, fov: 32 }, camC = { ...camT };
    const rebuild = () => { if (ch) stage.remove(ch); ch = buildChar(o); ch.rotation.y = spin; stage.add(ch); };
    cv.addEventListener('pointerdown', e => { drag = true; lx = e.clientX; cv.setPointerCapture?.(e.pointerId); });
    cv.addEventListener('pointerup', () => { drag = false; userSpun = performance.now(); });
    cv.addEventListener('pointermove', e => { if (drag) { spin += (e.clientX - lx) * .012; lx = e.clientX; } });
    cv.addEventListener('wheel', e => { e.preventDefault(); dist = Math.max(.55, Math.min(1.5, dist + e.deltaY * .001)); }, { passive: false });
    const setCam = () => { const c = CAMS[TAB_CAM[tab]] || CAMS.full; camT.y = c[0]; camT.z = c[1]; camT.ly = c[2]; camT.fov = c[3]; };
    let alive = true, last = performance.now();
    const loop = now => {
      if (!alive) return; if (!root.isConnected) { alive = false; try { R.dispose(); } catch {} return; }
      requestAnimationFrame(loop); const dt = Math.min(.05, (now - last) / 1000); last = now; const t = now / 1000;
      const w = cv.clientWidth, h = cv.clientHeight;
      if (w && h && (cv.width !== Math.round(w * R.getPixelRatio()) || cv.height !== Math.round(h * R.getPixelRatio()))) { R.setSize(w, h, false); cam.aspect = w / h; }
      const k = Math.min(1, dt * 5); for (const f of ['y', 'z', 'ly', 'fov']) camC[f] += (camT[f] - camC[f]) * k;
      const narrow = cam.aspect < .9 ? 1.25 : 1; cam.fov = camC.fov; cam.updateProjectionMatrix();
      cam.position.set(0, camC.y + (dist - 1) * .3, camC.z * dist * narrow); cam.lookAt(0, camC.ly, 0);
      if (!drag && now - userSpun > 1500) {
        if (tab === 'back') { let df = Math.PI - spin; df = Math.atan2(Math.sin(df), Math.cos(df)); spin += df * Math.min(1, dt * 3); }
        else spin += dt * .35;
      }
      if (ch) {
        ch.rotation.y = spin;
        const sit = mode === 'sit';
        poseChar(ch, sit ? 2 : mode === 'walk' ? 1 : 0, t, mode === 'dance' ? '💃' : mode === 'wave' ? '👋' : '', 0, 0, 0, 0);
        ch.position.y = sit ? -.12 : 0;
      }
      ring.rotation.z = t * .3; R.render(sc, cam);
    };
    rebuild(); setCam(); requestAnimationFrame(loop);

    /* ---- arayüz ---- */
    const sw = (arr, k) => arr.map((c, i) => `<button class="avsw${(o[k] | 0) === i ? ' on' : ''}" data-k="${k}" data-i="${i}" style="background:${c}" title="${i + 1}"></button>`).join('');
    const tx = (arr, k) => arr.map((n, i) => `<button class="${(o[k] | 0) === i ? 'on' : ''}" data-k="${k}" data-i="${i}">${n}</button>`).join('');
    const sec = (t, h, cls = '') => `<div class="avsec"><h4>${t}</h4>${cls ? `<div class="${cls}">${h}</div>` : h}</div>`;
    const shopCard = (slot, i, it) => {
      const ok = has(slot, i), on = (o[slot] | 0) === i, r = RAR[it[1]], price = CAT.priceOf(slot, i);
      const lab = i === 0 ? '' : ok ? (on ? '✔ Giyili' : 'Sahipsin') : `💰 ${price}`;
      return `<button class="avit r${RI[it[1]]}${on ? ' on' : ''}${ok ? '' : ' lock'}" data-slot="${slot}" data-i="${i}" title="${it[0]}"><img data-th="${slot}:${i}" alt=""><span class="n">${it[0]}</span>${i ? `<span class="rr" style="color:${r.col}">${r.n}</span>` : ''}${lab ? `<span class="pr${ok ? ' ok' : ''}">${lab}</span>` : ''}</button>`;
    };
    const shop = slot => {
      const list = CAT.SLOTS[slot], own = list.filter((_, i) => has(slot, i)).length;
      return `<p class="avnote" style="background:#ffffff0d;border-color:#ffffff1f;color:#fff9">Koleksiyon: <b>${own}/${list.length}</b> · Kilitli eşyaya tıkla → karakterinde dene, beğenirsen satın al. 💰 kazanmak için parkur ve mini oyunları oyna!</p>` + `<div class="avgrid">${list.map((it, i) => shopCard(slot, i, it)).join('')}</div>`;
    };
    const catCard = (cat, k, i, name) => `<button class="avit r0${(o[k] | 0) === i ? ' on' : ''}" data-k="${k}" data-i="${i}" data-cat="${cat}"><img data-th="${cat}:${i}" alt=""><span class="n">${name}</span></button>`;
    const faceN = ['😊 Mutlu', '😐 Sakin', '😎 Havalı', '😮 Şaşkın', '😁 Sırıtan', '😴 Uykulu', '😠 Kızgın', '😉 Göz Kırp', '🕶️ Cool', '😳 Utangaç'];
    const photoBtn = () => sec('Fotoğraflı tişört', `<div class="avphoto"><label class="avbtn">📷 Fotoğraf yükle<input type="file" id="topPhoto" accept="image/*" hidden></label>${o.topImg ? '<button class="avbtn sec" id="clrTopImg">Fotoğrafı kaldır</button><small>✓ Tişörtte fotoğraf var</small>' : '<small>PNG/JPEG yükle, tişört olur (kostümsüzken)</small>'}</div>`);
    const body = () => ({
      body: `<p class="avnote" style="background:#ffffff0d;border-color:#ffffff1f;color:#fff9">Karakterin kız mı erkek mi olsun? İstediğin zaman değiştirebilirsin. Kız seçince etek, uzun saçlar ve elbiseler de açılır.</p>` + sec('Cinsiyet', ['👦 Erkek', '👧 Kız'].map((n, i) => `<button class="${(o.gender | 0) === i ? 'on' : ''}" data-k="gender" data-i="${i}">${n}</button>`).join(''), 'avpats') + sec('Ten rengi', sw(SKIN, 'skin'), 'avsws'),
      suit: (o.suit ? '' : '<p class="avnote">Kostüm seçmezsen üst/alt/ayakkabı sekmelerindeki renkler kullanılır.</p>') + shop('suit'),
      hat: shop('hat'), glasses: shop('glasses'), back: shop('back'),
      face: sec('Ten rengi', sw(SKIN, 'skin'), 'avsws') + sec('Yüz ifadesi', `<div class="avgrid">${faceN.map((n, i) => catCard('face', 'face', i, n)).join('')}</div>`),
      hair: sec('Saç stili', `<div class="avgrid">${NAMES.hair.map((n, i) => catCard('hair', 'hair', i, n)).join('')}</div>`) + sec('Saç rengi', sw(HAIRC, 'hairC'), 'avsws'),
      top: (o.suit ? '<p class="avnote">Kostüm giyiliyken üst renk/model kullanılmaz. Kostümü "Yok" yap.</p>' : '') + sec('Model', `<div class="avgrid">${NAMES.topT.map((n, i) => catCard('topT', 'topT', i, n)).join('')}</div>`) + sec('Renk', sw(CLOTH, 'top'), 'avsws') + sec('Desen', tx(NAMES.pat, 'topPat'), 'avpats') + photoBtn(),
      bottom: (o.suit ? '<p class="avnote">Kostüm giyiliyken pantolon rengi kostümden gelir.</p>' : '') + ((o.gender | 0) === 1 ? sec('Alt model', ['👖 Pantolon', '👗 Etek'].map((n, i) => `<button class="${(o.botT | 0) === i ? 'on' : ''}" data-k="botT" data-i="${i}">${n}</button>`).join(''), 'avpats') : '') + sec('Renk', sw(CLOTH, 'bottom'), 'avsws') + sec('Desen', tx(NAMES.pat, 'botPat'), 'avpats'),
      shoes: sec('Ayakkabı rengi', sw(SHOES, 'shoes'), 'avsws'),
    }[tab]);
    const paintBuy = () => {
      const b = $('#avbuy'); $('#avcoin').textContent = coins();
      if (pending) {
        const it = CAT.SLOTS[pending.slot][pending.i], r = RAR[it[1]], p = CAT.priceOf(pending.slot, pending.i), can = coins() >= p;
        b.innerHTML = `<div class="avbuyi"><span style="color:${r.col};font-weight:800">${r.n}</span> <b>👀 ${it[0]}</b><small>${can ? 'Denemek ücretsiz, kullanmak için satın al.' : `Yetersiz bakiye: ${p - coins()} 💰 eksik. Mini oyunlardan kazan!`}</small></div><button class="avbuybtn" id="buyNow" ${can ? '' : 'disabled'}>🛒 Satın Al · 💰 ${p}</button><button class="avbtn sec" id="buyCancel">İptal</button>`;
        b.classList.add('show');
        $('#buyNow').onclick = async () => {
          if (busy || !pending) return; busy = true; const { slot, i } = pending, nm = CAT.SLOTS[slot][i][0];
          try { const rr = await api('/api/shop/buy', 'POST', { slot, i }); S.me.coins = rr.coins; S.me.owned = rr.owned; updateCoinsUIGlobal(); sfx('join'); toast('Satın alındı: ' + nm + ' 🎉'); pending = null; }
          catch (err) { toast(err.message); }
          busy = false; paint();
        };
        $('#buyCancel').onclick = () => { o[pending.slot] = pending.prev; pending = null; rebuild(); paint(); sfx('pop'); };
      } else { b.classList.remove('show'); b.innerHTML = ''; }
    };
    let thumbTimer = 0;
    const fillThumbs = () => {
      clearTimeout(thumbTimer); const imgs = [...root.querySelectorAll('img[data-th]')].filter(im => !im.src); let n = 0;
      const step = () => { if (!root.isConnected) return; const im = imgs[n++]; if (!im) return; const [c, i] = im.dataset.th.split(':'); try { const u = thumbOf(c, +i); if (u) im.src = u; } catch (er) { console.warn(er); } thumbTimer = setTimeout(step, 0); };
      step();
    };
    const paint = () => {
      $('#avtabs').innerHTML = TABS.map(([k, n, ic]) => `<button data-tab="${k}" class="${tab === k ? 'on' : ''}"><i>${ic}</i>${n}</button>`).join('');
      const bd = $('#avbody'), st = bd.scrollTop; bd.innerHTML = body(); bd.scrollTop = st; paintBuy(); fillThumbs();
      const fi = $('#topPhoto');
      if (fi) fi.onchange = ev => {
        const f = ev.target.files?.[0]; if (!f) return; if (f.size > 1.5e6) { toast('Görsel en fazla 1.5 MB olmalı'); return; }
        const rd = new FileReader();
        rd.onload = () => {
          const img = new Image();
          img.onload = () => {
            const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), s2 = Math.max(img.width, img.height);
            x.fillStyle = '#fff'; x.fillRect(0, 0, 128, 128); x.drawImage(img, (img.width - s2) / 2, (img.height - s2) / 2, s2, s2, 0, 0, 128, 128);
            o.topImg = c.toDataURL('image/jpeg', .72); o.topPat = 0; o.topT = 0; o.suit = 0; rebuild(); paint(); sfx('pop'); toast('Fotoğraf tişörte uygulandı!');
          };
          img.onerror = () => toast('Görsel okunamadı'); img.src = rd.result;
        };
        rd.readAsDataURL(f);
      };
      const clr = $('#clrTopImg'); if (clr) clr.onclick = () => { o.topImg = ''; rebuild(); paint(); sfx('pop'); };
    };
    paint();
    root.addEventListener('click', e => {
      const p = e.target.closest('[data-pose]'); if (p) { mode = p.dataset.pose; root.querySelectorAll('[data-pose]').forEach(b => b.classList.toggle('on', b === p)); sfx('pop'); return; }
      const t = e.target.closest('[data-tab]'); if (t) { tab = t.dataset.tab; setCam(); if (tab !== 'back') userSpun = 0; paint(); sfx('pop'); return; }
      const it = e.target.closest('.avit');
      if (it && it.dataset.slot) {   // mağaza eşyası
        const slot = it.dataset.slot, i = +it.dataset.i;
        if (!has(slot, i)) {   // kilitli: önce karakter üstünde dene, sonra satın al
          if (pending && pending.slot === slot) pending = { slot, i, prev: pending.prev };
          else { if (pending) o[pending.slot] = pending.prev; pending = { slot, i, prev: o[slot] | 0 }; }
          o[slot] = i; if (slot === 'suit') o.topImg = ''; const r = RAR[CAT.SLOTS[slot][i][1]]; ringM.color.set(r.col); sfx(RI[CAT.SLOTS[slot][i][1]] >= 2 ? 'join' : 'pop'); rebuild(); paint(); return;
        }
        if (pending && pending.slot === slot) pending = null;
        o[slot] = i; if (slot === 'suit' && i) o.topImg = ''; ringM.color.set('#7c5cff'); rebuild(); paint(); sfx('pop'); return;
      }
      const b = it || e.target.closest('[data-k]');
      if (b && b.dataset.k) {
        const k = b.dataset.k, i = +b.dataset.i; o[k] = i;
        if (k === 'gender') { const f = o.gender === 1; if (f && [1, 3, 6, 8].includes(o.hair | 0)) o.hair = 10; if (!f) { if ((o.hair | 0) >= 10) o.hair = 1; o.botT = 0; } }
        if (k === 'topPat' || k === 'top' || k === 'topT') o.topImg = '';
        rebuild(); paint(); sfx('pop');
      }
    });
    const finish = () => { alive = false; clearTimeout(thumbTimer); try { R.dispose(); } catch {} root.remove(); };
    $('#avx').onclick = $('#avcancel').onclick = finish;
    $('#avrnd').onclick = () => {
      const rn = n => Math.floor(Math.random() * n), pick = slot => { const l = CAT.SLOTS[slot].map((_, i) => i).filter(i => has(slot, i)); return l[rn(l.length)]; };
      o = { ...o, skin: rn(10), face: rn(10), hair: (o.gender | 0) === 1 ? [2, 4, 5, 7, 10, 11, 12, 13][rn(8)] : rn(10), hairC: rn(14), top: rn(30), bottom: rn(30), shoes: rn(14), topT: rn(7), hat: pick('hat'), glasses: pick('glasses'), back: pick('back'), suit: rn(2) ? pick('suit') : 0, topImg: '' };
      pending = null; rebuild(); paint();
    };
    $('#avsave').onclick = async () => {
      let stripped = false;
      for (const slot of ['hat', 'glasses', 'back', 'suit']) if (!has(slot, o[slot] | 0)) { o[slot] = has(slot, base[slot] | 0) ? base[slot] | 0 : 0; stripped = true; }
      if (stripped) { pending = null; rebuild(); toast('Satın almadığın ön izlemeler çıkarıldı'); }
      try { await api('/api/outfit', 'POST', { outfit: o }); finish(); await resync(); toast('Karakterin kaydedildi!'); sfx('join'); }
      catch (err) { toast(err.message); }
    };
    window.addEventListener('keydown', function esc_(e) { if (!root.isConnected) return window.removeEventListener('keydown', esc_, true); if (e.key === 'Escape') { e.stopPropagation(); finish(); } }, true);
  }).catch(e => toast(e.message));
}
const updateCoinsUIGlobal = () => { const e = document.getElementById('wcoins'); if (e) e.textContent = '💰 ' + (S.me.coins != null ? S.me.coins : 100); };

/* ------------------------------------------------------------- 3D DÜNYA */
let W = null;
const seatsDef = [];
/* ------------------------------------------------------------- OKEY (istemci: durum + arayüz) */
const OK = { askOff: false, s: null, hand: [], slots: Array(30).fill(null), sel: null, err: '', fresh: null };
const OCOL = ['#d99a00', '#1f6bd6', '#1b1b1b', '#d62828'], OCN = ['Sarı', 'Mavi', 'Siyah', 'Kırmızı'];
const tInfo = id => id >= 104 ? { fake: true, c: -1, n: 0 } : { fake: false, c: ((id % 52) / 13) | 0, n: (id % 13) + 1 };
const isJoker = id => { const w = OK.s?.wild; if (!w || id >= 104) return false; const t = tInfo(id); return t.c === w.c && t.n === w.n; };
const okMe = () => OK.s ? OK.s.seats.indexOf(S.me.id) : -1;
const okTileHtml = (id, extra = '') => {
  const t = tInfo(id), w = OK.s?.wild;
  if (t.fake) return `<div class="ot fk ${extra}" data-id="${id}"><b>✦</b><i></i></div>`;
  return `<div class="ot ${isJoker(id) ? 'jk' : ''} ${extra}" data-id="${id}" style="color:${OCOL[t.c]}"><b>${t.n}</b><i style="background:${OCOL[t.c]}"></i></div>`;
};
function okReconcile() {
  const set = new Set(OK.hand); OK.slots = OK.slots.map(id => set.has(id) ? id : null);
  if (OK.sel != null && !set.has(OK.sel)) OK.sel = null;
  const have = new Set(OK.slots.filter(x => x != null)); const fresh = OK.hand.filter(id => !have.has(id));
  if (!have.size && fresh.length) { okSort(); return; }
  if (have.size && fresh.length === 1) OK.fresh = fresh[0]; else if (!fresh.length) OK.fresh = OK.fresh; else OK.fresh = null;
  for (const id of fresh) {
    let L = -1; OK.slots.forEach((x, i) => { if (x != null && i < 15) L = i; });
    let k = OK.slots.findIndex((x, i) => x == null && i > L && i < 15); if (k < 0) k = OK.slots.findIndex(x => x == null); OK.slots[k] = id;
  }
}
function okSort() {
  const key = id => { const t = tInfo(id); return t.fake ? 999 : isJoker(id) ? 998 : t.c * 20 + t.n; };
  const ids = [...OK.hand].sort((a, b) => key(a) - key(b)); const slots = Array(30).fill(null); let k = 0, last = -1;
  for (const id of ids) { const c = key(id) >= 998 ? 9 : tInfo(id).c; if (last !== -1 && c !== last) k++; slots[k++] = id; last = c; }
  OK.slots = slots;
}
function okSortNum() {
  const key = id => { const t = tInfo(id); return t.fake ? 999 : isJoker(id) ? 998 : t.n * 4 + t.c; };
  const ids = [...OK.hand].sort((a, b) => key(a) - key(b)); const slots = Array(30).fill(null); let k = 0, last = -1;
  for (const id of ids) { const n = key(id) >= 998 ? 99 : tInfo(id).n; if (last !== -1 && n !== last) k++; slots[k++] = id; last = n; }
  OK.slots = slots;
}
/* Bir grup (>=3 taş) geçerli per/seri mi? (okey = joker, sahte okey = okey taşının yüzü) */
function okValidGroup(ids) {
  const w = OK.s?.wild; if (!w || ids.length < 3 || ids.length > 13) return false;
  let jk = 0; const real = [];
  for (const id of ids) { const t = tInfo(id); if (t.fake) real.push({ c: w.c, n: w.n }); else if (t.c === w.c && t.n === w.n) jk++; else real.push({ c: t.c, n: t.n }); }
  if (!real.length) return true;
  const L = ids.length;
  if (L <= 4 && real.every(t => t.n === real[0].n) && new Set(real.map(t => t.c)).size === real.length) return true; // per
  if (real.every(t => t.c === real[0].c)) {                                                                           // seri
    const nums = real.map(t => t.n); if (new Set(nums).size !== nums.length) return false;
    for (let st = 1; st + L - 1 <= 14; st++) { const pos = new Set(); for (let q = st; q < st + L; q++) pos.add(q === 14 ? 1 : q); if (pos.size === L && nums.every(n => pos.has(n))) return true; }
  }
  return false;
}
/* Rafta yan yana duran taşları en çok taşı kapsayacak şekilde geçerli gruplara böler → { ok:Set(slot), n } */
function okCover() {
  const ok = new Set();
  for (const base of [0, 15]) {
    let i = 0;
    while (i < 15) {
      if (OK.slots[base + i] == null) { i++; continue; }
      let j = i; while (j < 15 && OK.slots[base + j] != null) j++;
      const run = OK.slots.slice(base + i, base + j), n = run.length, best = Array(n + 1).fill(0), from = Array(n + 1).fill(-1);
      for (let e = 1; e <= n; e++) {
        best[e] = best[e - 1]; from[e] = -1;
        for (let b = 0; b <= e - 3; b++) if (best[b] + (e - b) > best[e] && okValidGroup(run.slice(b, e))) { best[e] = best[b] + (e - b); from[e] = b; }
      }
      for (let e = n; e > 0;) { if (from[e] >= 0) { for (let q = from[e]; q < e; q++) ok.add(base + i + q); e = from[e]; } else e--; }
      i = j;
    }
  }
  return ok;
}
function okUI() {
  const w = W; if (!w) return; const p = w.el.querySelector('#okp'); if (!p) return;
  const s = OK.s, me = S.me.id, mi = okMe();
  if (w.myP.seat < 30 || !s) { p.style.display = 'none'; return; }
  p.style.display = 'block';
  const myTurn = s.phase === 'play' && s.turn === mi, canDraw = myTurn && s.tp === 'draw', canDisc = myTurn && s.tp === 'discard';
  const nm = i => s.seats[i] == null ? '— boş —' : (s.seats[i] === me ? 'Sen' : (s.bots?.[s.seats[i]]?.name || userName(s.seats[i])));
  const nSeat = s.seats.filter(x => x != null).length, hasBots = s.seats.some(x => typeof x === 'string');
  const ask = s.phase === 'lobby' && mi >= 0 && nSeat < 4 && !OK.askOff ? `<div class="okAsk"><div>🤖 Masada <b>${nSeat}/4</b> koltuk dolu. Eksik <b>${4 - nSeat}</b> koltuk <b>botlarla</b> doldurulsun mu?</div><div class="okAskB"><button class="btn sm ok" id="okBots">🤖 Botlarla Başlat</button><button class="btn sm sec" id="okWait">⏳ Arkadaş Bekle</button></div></div>` : '';
  const chips = [0, 1, 2, 3].map(i => { const last = s.discards[i].slice(-1)[0];
    return `<div class="okPl${s.phase === 'play' && s.turn === i ? ' turn' : ''}${i === mi ? ' me' : ''}${s.phase === 'end' && s.winner === i ? ' won' : ''}"><b>${esc(nm(i))}</b><span>${s.seats[i] != null ? '🏆 ' + (s.wins[s.seats[i]] || 0) : ''}${s.phase === 'play' ? ' · 🀫 ' + s.counts[i] : ''}</span>${s.phase !== 'lobby' && last != null ? `<div class="okLast" title="Son attığı taş">${okTileHtml(last)}</div>` : ''}</div>`; }).join('');
  const prev = mi >= 0 ? (mi + 3) % 4 : -1; const sideTop = prev >= 0 ? s.discards[prev].slice(-1)[0] : null;
  let msg = '';
  if (s.phase === 'lobby') msg = s.note || `Masada ${nSeat}/4 oyuncu${hasBots ? ' (botlar dahil)' : ''}. ${nSeat < 4 ? 'Arkadaşlarını bekle ya da botlarla doldur.' : '<b>Başlat</b>\'a bas.'}`;
  else if (s.phase === 'play') msg = canDraw ? '🎯 Sıra sende: <b>desteden çek</b> ya da soldaki taşı al' : canDisc ? '🎯 Bir taş seç → <b>At</b> (çift tık) ya da <b>Bitir</b>' : `⏳ Sıra: <b>${esc(nm(s.turn))}</b>`;
  else msg = s.winner >= 0 ? `🎉 <b>${esc(nm(s.winner))}</b> kazandı!` : (s.note || 'Oyun bitti.');
  if (OK.err) msg += `<div class="okErr">${esc(OK.err)}</div>`;
  const wid = s.wild ? s.wild.c * 13 + s.wild.n - 1 : null;
  const info = s.phase === 'lobby' ? '' : `<div class="okInd"><span>Gösterge</span>${okTileHtml(s.ind)}<span>Okey</span>${okTileHtml(wid, 'wild')}</div>`;
  const mid = s.phase === 'play' ? `<button class="okPile${canDraw ? ' go' : ''}" id="okDeck">Deste<br><b>${s.deck}</b></button>
    <button class="okPile${canDraw && sideTop != null ? ' go' : ''}" id="okSide" ${sideTop == null ? 'disabled' : ''}>Soldan<br>${sideTop != null ? okTileHtml(sideTop) : '<b>—</b>'}</button>` : '';
  const hasHand = mi >= 0 && s.phase === 'play';
  const cover = hasHand ? okCover() : new Set(), placed = OK.slots.filter(x => x != null).length;
  const loose = hasHand ? OK.slots.map((id, i) => id != null && !cover.has(i) ? i : -1).filter(i => i >= 0) : [];
  const canWin = canDisc && placed === 15 && loose.length === 1;   // 14 taş gruplu, 1 taş artık → bitirilebilir
  const finIdx = canWin ? loose[0] : -1;
  const hint = hasHand ? `<div class="okHint${canWin ? ' win' : ''}">${canWin ? '🏁 El hazır! Parlayan taşı seçip <b>Bitir</b>\'e bas' : `✔ ${cover.size} taş grupta${placed ? ` · ${placed - cover.size} taş boşta` : ''}`}</div>` : '';
  const slots = OK.slots.map((id, i) => `<div class="okS${id != null && OK.sel === id ? ' sel' : ''}${i === 15 ? ' r2' : ''}${cover.has(i) ? ' grp' : ''}${i === finIdx ? ' fin' : ''}${id != null && id === OK.fresh ? ' new' : ''}" data-s="${i}" ${id != null ? 'draggable="true"' : ''}>${id != null ? okTileHtml(id) : ''}</div>`).join('');
  const full = s.seats.every(x => x != null);
  const btns = `${s.phase !== 'play' && mi >= 0 ? `<button class="btn sm" id="okStart" ${full ? '' : 'disabled'}>${s.phase === 'end' ? '🔄 Yeni El' : '▶ Başlat'}</button>` : ''}
    ${hasHand ? `<button class="btn sm sec" id="okSort" title="Renge göre diz (G)">🎨 Seri Diz</button><button class="btn sm sec" id="okSortN" title="Sayıya göre diz (H)">🔢 Per Diz</button><button class="btn sm" id="okDisc" title="Enter" ${canDisc && OK.sel != null ? '' : 'disabled'}>At</button><button class="btn sm ok${canWin ? ' pulse' : ''}" id="okFin" ${canDisc && OK.sel != null ? '' : 'disabled'}>🏁 Bitir</button>` : ''}
    ${s.phase !== 'play' && mi >= 0 && nSeat < 4 && OK.askOff ? '<button class="btn sm sec" id="okBots2">🤖 Botlarla Doldur</button>' : ''}${s.phase !== 'play' && mi >= 0 && hasBots ? '<button class="btn sm sec" id="okUnbots">🙅 Botları Çıkar</button>' : ''}
    <button class="btn sm sec" id="okLeave">Masadan Kalk</button>`;
  const rackHtml = hasHand ? `${hint}<div class="okRack">${slots}</div><div class="okKeys">C deste · V soldan · Enter at · G/H diz · çift tık = at</div>` : '';
  const reveal = s.phase === 'end' && s.hands && s.winner >= 0 ? `<div class="okReveal"><span>${esc(nm(s.winner))} eli:</span>${[...s.hands[s.winner]].sort((a, b) => { const k = id => { const t = tInfo(id); return t.fake ? 999 : isJoker(id) ? 998 : t.c * 20 + t.n; }; return k(a) - k(b); }).map(id => okTileHtml(id)).join('')}</div>` : '';
  p.innerHTML = `<div class="okTop">${chips}</div><div class="okMid">${info}${mid}<div class="okMsg">${msg}</div></div>${ask}${reveal}${rackHtml}<div class="okBtns">${btns}</div>`;
}
function okSend(o) { wsSend(o); }
function okBind(el) {
  const root = el.querySelector('#okp');
  root.addEventListener('click', e => {
    const s = OK.s; if (!s) return; const mi = okMe(), myTurn = s.phase === 'play' && s.turn === mi;
    const slot = e.target.closest('.okS');
    if (slot && slot.querySelector('.ot')) { const id = +slot.querySelector('.ot').dataset.id; OK.sel = OK.sel === id ? null : id; sfx('pop'); okUI(); return; }
    const b = e.target.closest('button'); if (!b) return;
    if (b.id === 'okDeck' && myTurn && s.tp === 'draw') { okSend({ t: 'okey:draw', from: 'deck' }); sfx('tile'); }
    else if (b.id === 'okSide' && myTurn && s.tp === 'draw') { okSend({ t: 'okey:draw', from: 'discard' }); sfx('tile'); }
    else if (b.id === 'okDisc' && OK.sel != null) { okSend({ t: 'okey:discard', id: OK.sel }); sfx('tile'); }
    else if (b.id === 'okFin' && OK.sel != null) { okSend({ t: 'okey:finish', id: OK.sel }); }
    else if (b.id === 'okStart') { okSend({ t: 'okey:start' }); }
    else if (b.id === 'okBots' || b.id === 'okBots2') { okSend({ t: 'okey:bots', start: b.id === 'okBots' }); sfx('join'); }
    else if (b.id === 'okWait') { OK.askOff = true; okUI(); }
    else if (b.id === 'okUnbots') { okSend({ t: 'okey:unbots' }); }
    else if (b.id === 'okSort') { okSort(); okUI(); sfx('pop'); }
    else if (b.id === 'okSortN') { okSortNum(); okUI(); sfx('pop'); }
    else if (b.id === 'okLeave') { W?.act(); }
  });
  root.addEventListener('dblclick', e => {
    const s = OK.s; const t = e.target.closest('.okS .ot'); if (!s || !t) return;
    if (s.phase === 'play' && s.turn === okMe() && s.tp === 'discard') { okSend({ t: 'okey:discard', id: +t.dataset.id }); sfx('tile'); }
  });
  if (!OK.keys) { OK.keys = true;
    window.addEventListener('keydown', e => {
      const rt = W?.el.querySelector('#okp'); if (!W || !rt || rt.style.display !== 'block' || e.target.closest?.('input,textarea') || e.ctrlKey || e.metaKey || e.altKey) return;
      const s = OK.s; if (!s) return; const k = e.key.toLowerCase(), myTurn = s.phase === 'play' && s.turn === okMe();
      if (k === 'c' && myTurn && s.tp === 'draw') { okSend({ t: 'okey:draw', from: 'deck' }); sfx('tile'); }
      else if (k === 'v' && myTurn && s.tp === 'draw') { okSend({ t: 'okey:draw', from: 'discard' }); sfx('tile'); }
      else if (k === 'enter' && myTurn && s.tp === 'discard' && OK.sel != null) { okSend({ t: 'okey:discard', id: OK.sel }); sfx('tile'); }
      else if (k === 'g' && s.phase === 'play') { okSort(); okUI(); sfx('pop'); }
      else if (k === 'h' && s.phase === 'play') { okSortNum(); okUI(); sfx('pop'); }
    });
  }
  let from = -1;
  root.addEventListener('dragstart', e => { const sl = e.target.closest('.okS'); if (!sl) return; from = +sl.dataset.s; e.dataTransfer.setData('text/plain', String(from)); e.dataTransfer.effectAllowed = 'move'; });
  root.addEventListener('dragover', e => { if (e.target.closest('.okS')) e.preventDefault(); });
  root.addEventListener('drop', e => {
    const sl = e.target.closest('.okS'); if (!sl || from < 0) return; e.preventDefault(); const to = +sl.dataset.s;
    if (to !== from) { const a = OK.slots[from]; OK.slots[from] = OK.slots[to]; OK.slots[to] = a; sfx('tile'); } from = -1; okUI();
  });
}
function onOkey(d) {
  if (d.t === 'okey:hand') { OK.hand = d.hand; okReconcile(); }
  else if (d.t === 'okey:err') { OK.err = d.msg; clearTimeout(OK.et); OK.et = setTimeout(() => { OK.err = ''; okUI(); }, 3500); }
  else if (d.t === 'okey') {
    const prev = OK.s; const pm = prev ? prev.seats.indexOf(S.me.id) : -1; OK.s = d; OK.err = '';
    if (pm < 0 && okMe() >= 0) OK.askOff = false;   // yeni oturdum → botlu doldurma sorusunu göster
    if (!prev || prev.phase !== d.phase) { if (d.phase === 'play') { OK.slots = Array(30).fill(null); OK.sel = null; sfx('join'); } else if (d.phase === 'end' && d.winner >= 0) sfx('clap'); }
    if (d.phase === 'play' && d.turn === okMe() && (!prev || prev.turn !== d.turn)) sfx('turn');
    else if (prev && prev.phase === 'play' && prev.turn !== d.turn) sfx('tile');
    if (d.phase === 'lobby') { OK.hand = []; OK.slots = Array(30).fill(null); OK.sel = null; }
  }
  if (W) { try { W.okeyRender?.(); } catch (e) { console.error('okey 3D:', e); } okUI(); }
}

function open() {
  if (!call.chanId) return toast('Önce bir ses kanalına katıl.');
  if (W) return;
  toast('3D Dünya yükleniyor...');
  loadThree().then(start).catch(e => { console.error(e); try { close(); } catch {} document.getElementById('world')?.remove(); W = null; ambStop(); toast('3D Dünya açılamadı: ' + e.message); });
}
function close() {
  if (!W) return; const w = W; W = null; if (w.myP?.seat >= 30) wsSend({ t: 'okey:leave' }); try { document.exitPointerLock?.(); } catch {} cancelAnimationFrame(w.raf); clearInterval(w.hb);
  clearInterval(w.winTimer); window.removeEventListener('keydown', w.kd); window.removeEventListener('keyup', w.ku); window.removeEventListener('keydown', w.ckd); try { w.eng?.(); } catch {} window.removeEventListener('resize', w.rs); window.removeEventListener('mouseup', w.mu);
  try { w.tvEl && (w.tvEl.tagName === 'IFRAME' ? (w.tvEl.src = 'about:blank') : (w.tvEl.pause(), w.tvEl.srcObject = null)); const rv = call.videos?.get(TVS.owner); if (rv) rv.volume = 1; } catch {}
  try { w.R.dispose(); } catch {} w.el.remove(); ambStop(); sfx('door');
}
/* ---------- TV: ortak durum + link çözümleyici ---------- */
let TVS = { kind: 'off', url: '', owner: 0, playing: false, pos: 0, at: 0, rev: 0, seek: false, by: 0 };
const tvEmbed = (url, pos) => {
  let u; try { u = new URL(url); } catch { return null; }
  if (!/^https?:$/.test(u.protocol)) return null;
  const h = u.hostname.replace(/^(www|m)\./, ''), st = Math.max(0, Math.floor(pos || 0)); let id = null;
  if (h === 'youtu.be') id = u.pathname.slice(1).split('/')[0];
  else if (/(^|\.)youtube(-nocookie)?\.com$/.test(h)) id = u.searchParams.get('v') || (u.pathname.match(/^\/(?:shorts|live|embed)\/([\w-]{6,})/) || [])[1];
  if (id && /^[\w-]{6,15}$/.test(id)) return { type: 'yt', src: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0&enablejsapi=1&start=${st}` };
  const vm = h === 'vimeo.com' && u.pathname.match(/^\/(?:video\/)?(\d+)/); if (vm) return { type: 'vimeo', src: `https://player.vimeo.com/video/${vm[1]}?autoplay=1#t=${st}s` };
  const tw = h === 'twitch.tv' && u.pathname.match(/^\/(\w+)\/?$/); if (tw) return { type: 'frame', src: `https://player.twitch.tv/?channel=${tw[1]}&parent=${location.hostname}&autoplay=true` };
  if (/\.(mp4|webm|ogv|ogg|mov|m4v|mp3|m4a)$/i.test(u.pathname)) return { type: 'video', src: url };
  if (/\.m3u8$/i.test(u.pathname) && document.createElement('video').canPlayType('application/vnd.apple.mpegurl')) return { type: 'video', src: url };
  return { type: 'frame', src: url };
};
const tvStartOf = u => { const m = u.match(/[?&#](?:t|start)=(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?(?=&|$|#)/i); return m ? (+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0) : 0; };
// dikdörtgen (1280x720) -> 4 ekran noktası (sol-üst, sağ-üst, sağ-alt, sol-alt) için CSS matrix3d
const tvHomog = p => {
  const sw = 1280, sh = 720, src = [[0, 0], [sw, 0], [sw, sh], [0, sh]], A = [], b = [];
  for (let i = 0; i < 4; i++) { const [x, y] = src[i], [u, v] = p[i]; A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u); A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v); }
  for (let i = 0; i < 8; i++) {
    let m = i; for (let r = i + 1; r < 8; r++) if (Math.abs(A[r][i]) > Math.abs(A[m][i])) m = r;
    [A[i], A[m]] = [A[m], A[i]]; [b[i], b[m]] = [b[m], b[i]]; const d = A[i][i]; if (Math.abs(d) < 1e-9) return null;
    for (let r = 0; r < 8; r++) if (r !== i) { const f = A[r][i] / d; for (let c = i; c < 8; c++) A[r][c] -= f * A[i][c]; b[r] -= f * b[i]; }
  }
  const h = b.map((v, i) => v / A[i][i]);
  return `matrix3d(${h[0]},${h[3]},0,${h[6]},${h[1]},${h[4]},0,${h[7]},0,0,1,0,${h[2]},${h[5]},0,1)`;
};
function noiseTex(c1, c2, size = 256, rep = 8) {
  const cv = document.createElement('canvas'); cv.width = cv.height = size; const x = cv.getContext('2d'); x.fillStyle = c1; x.fillRect(0, 0, size, size);
  for (let i = 0; i < size * 14; i++) { x.fillStyle = c2 + Math.floor(Math.random() * 60 + 10).toString(16).padStart(2, '0'); x.fillRect(Math.random() * size, Math.random() * size, 2 + Math.random() * 3, 2 + Math.random() * 3); }
  const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); return t;
}
function start() {
  const T = THREE; const el = document.createElement('div'); el.id = 'world';
  el.innerHTML = `<div id="tvbox" style="display:none"></div><canvas></canvas><div class="whud"><span id="wroom">🏕️ Kamp Ateşi Lobisi</span><span class="sp"></span><button id="wTv" style="display:none">📺 TV</button><button id="wHelp">ⓘ Kontroller</button><button id="wGfx">⚙ Grafik</button><button id="wChar">🧑‍🎤 Karakter</button><button id="wExit">Çık ✕</button></div>
    <div class="whelp"><b>WASD</b> yürü · <b>Fare</b> bakış (tıkla=kilitle) · <b>V</b> 1./3. şahıs · <b>ESC</b> fareyi bırak, tekrar ESC = çıkış sorusu<br><b>E</b> otur / TV / 🚗 Araba / 🛒 Market / 🚘 Galeri · <b>R</b> arabayı çağır · 📱 Parkur · 🎴 Okey · <b>Boşluk</b> zıpla · <b>Shift</b> koş · <b>F</b> 👊 · <b>1-4</b> emote</div>
    <div class="wprompt" id="wprompt"></div><div id="whp"><div class="hpb"><i></i></div><span class="hpt">❤️ 100</span><span class="kl">🐺 0</span><span class="wcoins" id="wcoins">💰 100</span></div><div id="wdmg"></div><div id="wdead">💀 Yenildin<small>Ateşin yanında yeniden doğuyorsun…</small></div><div id="okp" style="display:none"></div><div id="wtv" style="display:none"></div><div id="wpk" style="display:none"></div><div id="wwin" style="display:none"></div><div id="wfps"></div><div id="wgfx"></div><div class="wemo">${['👋', '💃', '🦘', '👏'].map(e => `<button data-em="${e}">${e}</button>`).join('')}<button id="wAtk" title="Saldır (Sol tık / F)">👊</button></div>`;
  document.body.appendChild(el);
  const cv = el.querySelector('canvas'); const R = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); R.setPixelRatio(Math.min(devicePixelRatio, 2)); R.shadowMap.enabled = true; R.shadowMap.type = T.PCFSoftShadowMap; R.toneMapping = T.ACESFilmicToneMapping; R.toneMappingExposure = 1.3;
  const scene = new T.Scene(); const cam = new T.PerspectiveCamera(55, 1, .25, 700);
  const mesh = (geo, mat, x = 0, y = 0, z = 0) => { const m = new T.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; };
  const std = (c, r = .8, extra = {}) => new T.MeshStandardMaterial({ color: c, roughness: r, ...extra });
  const seats = [];  // {id, room, x, y, z, ry}
  const CITY = { drive: false, idx: 0 };
  const rooms = [new T.Group(), new T.Group(), new T.Group()]; scene.add(rooms[0], rooms[1], rooms[2]);
  rooms[2].visible = false;

  /* ---------- EFEKT ALTYAPISI ---------- */
  const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.35, 'rgba(255,255,255,.45)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new T.CanvasTexture(c); })();
  const PN = 420, pP = new Float32Array(PN * 3), pV = new Float32Array(PN * 3), pL = new Float32Array(PN), pL0 = new Float32Array(PN).fill(1), pC = new Float32Array(PN * 3), pC0 = new Float32Array(PN * 3), pGv = new Float32Array(PN);
  const pGeo = new T.BufferGeometry(); pGeo.setAttribute('position', new T.BufferAttribute(pP, 3)); pGeo.setAttribute('color', new T.BufferAttribute(pC, 3));
  const pPts = new T.Points(pGeo, new T.PointsMaterial({ size: .3, map: glowTex, vertexColors: true, transparent: true, depthWrite: false, blending: T.AdditiveBlending })); pPts.frustumCulled = false; scene.add(pPts);
  let pCur = 0;
  const fxBurst = (x, y, z, col, n, sp = 3, up = 2, grav = 9, life = .6) => { const c = new T.Color(col);
    for (let i = 0; i < n; i++) { const k = pCur++ % PN, a = Math.random() * 6.283, r = sp * (.3 + Math.random() * .7);
      pP[k * 3] = x; pP[k * 3 + 1] = y; pP[k * 3 + 2] = z; pV[k * 3] = Math.cos(a) * r; pV[k * 3 + 1] = up * (.4 + Math.random() * .9); pV[k * 3 + 2] = Math.sin(a) * r;
      pC0[k * 3] = c.r; pC0[k * 3 + 1] = c.g; pC0[k * 3 + 2] = c.b; pL[k] = pL0[k] = life * (.6 + Math.random() * .8); pGv[k] = grav; } };
  const fxUpdate = dt => { for (let k = 0; k < PN; k++) { if (pL[k] > 0) { pL[k] -= dt; pV[k * 3 + 1] -= pGv[k] * dt; pP[k * 3] += pV[k * 3] * dt; pP[k * 3 + 1] = Math.max(.02, pP[k * 3 + 1] + pV[k * 3 + 1] * dt); pP[k * 3 + 2] += pV[k * 3 + 2] * dt; const f = Math.max(0, pL[k] / pL0[k]); pC[k * 3] = pC0[k * 3] * f; pC[k * 3 + 1] = pC0[k * 3 + 1] * f; pC[k * 3 + 2] = pC0[k * 3 + 2] * f; } else { pC[k * 3] = pC[k * 3 + 1] = pC[k * 3 + 2] = 0; } }
    pGeo.attributes.position.needsUpdate = true; pGeo.attributes.color.needsUpdate = true; };
  const slash = new T.Mesh(new T.RingGeometry(.55, 1.15, 20, 1, 1.2, 2.6), new T.MeshBasicMaterial({ color: '#fff1c2', transparent: true, opacity: 0, side: T.DoubleSide, blending: T.AdditiveBlending, depthWrite: false })); scene.add(slash); let slashT = 0;

  /* ---------- LOBİ ---------- */
  const L = rooms[0];
  const ground = mesh(new T.CircleGeometry(26, 64), new T.MeshStandardMaterial({ map: noiseTex('#a66a3a', '#ffcc88', 256, 10), roughness: 1 })); ground.rotation.x = -Math.PI / 2; ground.castShadow = false; L.add(ground);
  const grass = mesh(new T.RingGeometry(25, 900, 64), new T.MeshStandardMaterial({ map: noiseTex('#14301c', '#3d7a3a', 256, 330), roughness: 1 })); grass.rotation.x = -Math.PI / 2; grass.position.y = -.02; grass.castShadow = false; L.add(grass);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; L.add(mesh(new T.DodecahedronGeometry(.32), std('#6b6b6b', 1), Math.cos(a) * 1.15, .15, Math.sin(a) * 1.15)); }
  const flames = []; [['#ff4d00', 1.0, .55], ['#ff9500', .75, .38], ['#ffd400', .5, .24]].forEach(([c, h, r]) => { const f = mesh(new T.ConeGeometry(r, h * 1.4, 10), new T.MeshBasicMaterial({ color: c, transparent: true, opacity: .85 }), 0, h * .7 + .1, 0); f.castShadow = false; L.add(f); flames.push(f); });
  const fireL = new T.PointLight('#ff8a2a', 2.2, 22, 1.6); fireL.position.set(0, 1.2, 0); fireL.castShadow = true; L.add(fireL);
  const NP = 70, pPos = new Float32Array(NP * 3), pAge = new Float32Array(NP); for (let i = 0; i < NP; i++) pAge[i] = Math.random();
  const pg = new T.BufferGeometry(); pg.setAttribute('position', new T.BufferAttribute(pPos, 3)); const sparks = new T.Points(pg, new T.PointsMaterial({ color: '#ffb347', size: .34, map: glowTex, transparent: true, opacity: .9, depthWrite: false, blending: T.AdditiveBlending })); L.add(sparks);
  const logs = 6; for (let i = 0; i < logs; i++) {
    const a = i / logs * Math.PI * 2 + .3, r = 3.6, x = Math.cos(a) * r, z = Math.sin(a) * r;
    const lg = mesh(new T.CylinderGeometry(.32, .32, 2.1, 12), new T.MeshStandardMaterial({ map: noiseTex('#7a4a22', '#3a1f0a', 128, 2), roughness: 1 }), x, .32, z); lg.rotation.order = 'YXZ'; lg.rotation.set(0, -a - Math.PI / 2, Math.PI / 2); L.add(lg);
    const tx = -Math.sin(a), tz = Math.cos(a); [-.5, .5].forEach((s, j) => seats.push({ id: i * 2 + j, room: 0, x: x + tx * s, y: .62, z: z + tz * s, ry: Math.atan2(-x, -z) }));
  }
  const treeC = [];   // çarpışma daireleri {x,z,r}
  const onRoad = (x, z, m = 0) => Math.abs(Math.hypot(x, z) - 19.2) < 2.3 + m || (Math.abs(z) < 2.6 + m && Math.abs(x) > 18) || (Math.abs(x) < 2.6 + m && Math.abs(z) > 18);
  let ember, groundGlow, fireGlow, smoke = [];
  { const NT = 420, trk = new T.InstancedMesh(new T.CylinderGeometry(.35, .5, 1, 6), std('#5a3a22', 1), NT);
    const cones = [0, 1, 2].map(k => new T.InstancedMesh(new T.ConeGeometry(1, 1, 8), std('#ffffff', 1), NT));
    const dm = new T.Object3D(), tcol = new T.Color(); let n = 0;
    for (let tries = 0; n < NT && tries < 6000; tries++) {
      const a = Math.random() * Math.PI * 2, r = 28 + Math.pow(Math.random(), .85) * 90, x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (Math.hypot(x, z - 14.5) < 7 || onRoad(x, z, 2.5)) continue;
      if (treeC.some(c => Math.hypot(c.x - x, c.z - z) < 3.4)) continue;
      const h = 4 + Math.random() * 6, sc = .85 + Math.random() * .5;
      dm.rotation.set(0, Math.random() * 6, 0); dm.position.set(x, h * .25, z); dm.scale.set(1, h * .5, 1); dm.updateMatrix(); trk.setMatrixAt(n, dm.matrix);
      cones.forEach((c, k) => { dm.position.set(x, h * .55 + k * h * .22, z); dm.scale.set((2.2 - k * .5) * sc, h * .55, (2.2 - k * .5) * sc); dm.updateMatrix(); c.setMatrixAt(n, dm.matrix); c.setColorAt(n, tcol.setHSL(.3 + Math.random() * .08, .45, .15 + Math.random() * .1 + k * .02)); });
      treeC.push({ x, z, r: .75 }); n++; }
    [trk, ...cones].forEach(m => { m.count = n; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; m.castShadow = true; m.frustumCulled = false; L.add(m); }); }
  [1.15, 1.42, 1.7].forEach((k, i) => { const a = k * Math.PI, tx = Math.cos(a) * 16, tz = Math.sin(a) * 16;   // çadırlar
    const tent = mesh(new T.ConeGeometry(2, 2.6, 4), std(['#c8553d', '#3d7fc8', '#c8a23d'][i], .95), tx, 1.3, tz); tent.rotation.y = Math.PI / 4 + a; L.add(tent); treeC.push({ x: tx, z: tz, r: 1.7 }); });
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + .2, tx = Math.cos(a) * 22, tz = Math.sin(a) * 22;   // meşaleler
    L.add(mesh(new T.CylinderGeometry(.07, .09, 2.2, 6), std('#4a2e15', 1), tx, 1.1, tz));
    const fl = mesh(new T.ConeGeometry(.2, .5, 7), new T.MeshBasicMaterial({ color: '#ff9a2a' }), tx, 2.45, tz); fl.castShadow = false; L.add(fl); }

  { // ateş: kor, parıltı, dumanlar, alevler, çapraz odunlar
    const addM = (c, o) => new T.MeshBasicMaterial({ map: glowTex, color: c, transparent: true, opacity: o, depthWrite: false, blending: T.AdditiveBlending });
    ember = new T.Mesh(new T.CircleGeometry(1.5, 24), addM('#ff4a10', .9)); ember.rotation.x = -Math.PI / 2; ember.position.y = .06; L.add(ember);
    groundGlow = new T.Mesh(new T.CircleGeometry(12, 32), addM('#ff8a2a', .4)); groundGlow.rotation.x = -Math.PI / 2; groundGlow.position.y = .04; L.add(groundGlow);
    fireGlow = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: '#ff7a1a', transparent: true, opacity: .55, depthWrite: false, blending: T.AdditiveBlending })); fireGlow.position.set(0, 1.4, 0); fireGlow.scale.setScalar(7); L.add(fireGlow);
    smoke = Array.from({ length: 14 }, (_, i) => { const sp = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: '#6b6b70', transparent: true, opacity: 0, depthWrite: false })); L.add(sp); return { sp, ph: i / 14 }; });
    for (let i = 0; i < 4; i++) { const a = i / 4 * 6.283 + .4, lg = mesh(new T.CylinderGeometry(.12, .13, 1.3, 8), std('#2a1608', 1), Math.cos(a) * .35, .24, Math.sin(a) * .35); lg.rotation.order = 'YXZ'; lg.rotation.set(0, a, 1.15); L.add(lg); }
    for (let i = 0; i < 7; i++) { const a = i / 7 * 6.283, h = .7 + (i % 3) * .25; const f = mesh(new T.ConeGeometry(.16 + (i % 2) * .05, h * 1.3, 6), new T.MeshBasicMaterial({ color: ['#ff6a00', '#ffb300', '#ff3d00'][i % 3], transparent: true, opacity: .75, blending: T.AdditiveBlending, depthWrite: false }), Math.cos(a) * .4, h * .65 + .1, Math.sin(a) * .4); f.castShadow = false; f.rotation.z = Math.cos(a) * .18; f.rotation.x = Math.sin(a) * .18; L.add(f); flames.push(f); }
    fireL.shadow.mapSize.set(1024, 1024);
  }
  { // çimen öbekleri + kayalar
    const NG = 1800, gm = new T.InstancedMesh(new T.ConeGeometry(.07, .55, 3), std('#ffffff', 1), NG), dm = new T.Object3D(), col = new T.Color(); let n = 0;
    for (let tries = 0; n < NG && tries < 5000; tries++) { const a = Math.random() * 6.283, r = 14 + Math.pow(Math.random(), .8) * 88, x = Math.cos(a) * r, z = Math.sin(a) * r; if ((Math.abs(x) < 3.5 && z > 12 && z < 17.5) || onRoad(x, z, .3)) continue; if (r < 26 && Math.random() < .7) continue;
      const s2 = .7 + Math.random() * 1.1; dm.position.set(x, .22, z); dm.rotation.set((Math.random() - .5) * .4, Math.random() * 6, (Math.random() - .5) * .4); dm.scale.set(s2, s2 * (.7 + Math.random() * .8), s2); dm.updateMatrix(); gm.setMatrixAt(n, dm.matrix); gm.setColorAt(n, col.setHSL(.27 + Math.random() * .1, .5, .16 + Math.random() * .12)); n++; }
    gm.count = n; gm.instanceMatrix.needsUpdate = true; gm.instanceColor.needsUpdate = true; gm.castShadow = false; gm.frustumCulled = false; L.add(gm);
    const NR = 70, rm = new T.InstancedMesh(new T.DodecahedronGeometry(1), std('#ffffff', .95), NR); let m2 = 0;
    for (let tries = 0; m2 < NR && tries < 800; tries++) { const a = Math.random() * 6.283, r = 22 + Math.random() * 74, x = Math.cos(a) * r, z = Math.sin(a) * r; if (Math.hypot(x, z - 14.5) < 7 || onRoad(x, z, 1.2)) continue; const sc = .4 + Math.random() * .9;
      dm.position.set(x, sc * .35, z); dm.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3); dm.scale.set(sc, sc * .7, sc); dm.updateMatrix(); rm.setMatrixAt(m2, dm.matrix); rm.setColorAt(m2, col.setHSL(.08, .05, .25 + Math.random() * .15)); treeC.push({ x, z, r: sc * .6 }); m2++; }
    rm.count = m2; rm.instanceMatrix.needsUpdate = true; rm.instanceColor.needsUpdate = true; rm.frustumCulled = false; L.add(rm);
  }
  const stars = (() => { const n = 600, p = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, b = Math.random() * Math.PI * .45, r = 120; p[i * 3] = Math.cos(a) * Math.cos(b) * r; p[i * 3 + 1] = Math.sin(b) * r + 5; p[i * 3 + 2] = Math.sin(a) * Math.cos(b) * r; } const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(p, 3)); const s = new T.Points(g, new T.PointsMaterial({ color: '#fff', size: 1.1, sizeAttenuation: false, fog: false })); return s; })(); L.add(stars);
  const moon = new T.Mesh(new T.SphereGeometry(5, 16, 12), new T.MeshBasicMaterial({ color: '#f5f1d0', fog: false })); moon.position.set(-60, 55, -80); L.add(moon);
  { const halo = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: '#bcd0ff', transparent: true, opacity: .4, depthWrite: false, blending: T.AdditiveBlending, fog: false })); halo.position.copy(moon.position); halo.scale.setScalar(45); L.add(halo); }
  const NF = 40, fPos = new Float32Array(NF * 3), fSeed = []; for (let i = 0; i < NF; i++) { fSeed.push([Math.random() * 6, Math.random() * 6]); fPos[i * 3] = (Math.random() - .5) * 26; fPos[i * 3 + 1] = .5 + Math.random() * 2.5; fPos[i * 3 + 2] = (Math.random() - .5) * 26; }
  const fg = new T.BufferGeometry(); fg.setAttribute('position', new T.BufferAttribute(fPos, 3)); const flies = new T.Points(fg, new T.PointsMaterial({ color: '#d4ff6a', size: .5, map: glowTex, transparent: true, opacity: .95, blending: T.AdditiveBlending, depthWrite: false })); L.add(flies);
  const mkPortal = (x, z, color, label, parent) => { const g = new T.Group(); g.position.set(x, 0, z); const ring = mesh(new T.TorusGeometry(1.1, .12, 10, 28), new T.MeshBasicMaterial({ color }), 0, 1.4, 0); ring.castShadow = false; g.add(ring);
    const inner = mesh(new T.CircleGeometry(1.0, 24), new T.MeshBasicMaterial({ color, transparent: true, opacity: .25, side: T.DoubleSide }), 0, 1.4, 0); inner.castShadow = false; g.add(inner);
    const pl = new T.PointLight(color, 1.2, 8); pl.position.y = 1.4; g.add(pl); parent.add(g); g.userData = { ring, label }; return g; };
  const portalL = mkPortal(0, 11.5, '#7c5cff', '🏠 Eve Gir', L);
  const cabin = new T.Group(); cabin.position.set(0, 0, 14.5); cabin.add(mesh(new T.BoxGeometry(5, 3, 3), std('#8a5a33', 1), 0, 1.5, 0)); const roof = mesh(new T.ConeGeometry(4, 1.8, 4), std('#5a2d1a', 1), 0, 3.9, 0); roof.rotation.y = Math.PI / 4; cabin.add(roof); L.add(cabin);

  /* ---------- ASFALT YOLLAR + ARABALAR ---------- */
  const ROAD_R = 19.2, SPOKE_E = 92;
  const asphalt = std('#2a2c33', .92), asphaltL = std('#33363e', .92), lineW = new T.MeshBasicMaterial({ color: '#f1f5f9' }), lineY = new T.MeshBasicMaterial({ color: '#fbbf24' });
  const flatMesh = (geo, mat, x, y, z, ry = 0) => { const m = new T.Mesh(geo, mat); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.rotation.z = ry; m.receiveShadow = true; return m; };
  L.add(flatMesh(new T.RingGeometry(ROAD_R - 1.9, ROAD_R + 1.9, 120), asphalt, 0, .03, 0));
  [[ROAD_R - 1.85, ROAD_R - 1.75, lineW], [ROAD_R + 1.75, ROAD_R + 1.85, lineW]].forEach(([a, b, m]) => L.add(flatMesh(new T.RingGeometry(a, b, 120), m, 0, .045, 0)));
  [[ROAD_R - 1.95, ROAD_R - 1.85], [ROAD_R + 1.85, ROAD_R + 1.95]].forEach(([a, b]) => L.add(flatMesh(new T.RingGeometry(a, b, 120), std('#9ca3af', .9), 0, .05, 0)));   // kaldırım şeridi
  [1, -1].forEach(sd => {   // çıkış yolları (+x / -x)
    const len = SPOKE_E + 2 - 20, cx = sd * (20 + len / 2);
    L.add(flatMesh(new T.PlaneGeometry(len, 3.8), asphalt, cx, .03, 0));
    [-1.85, 1.85].forEach(z => L.add(flatMesh(new T.PlaneGeometry(len, .1), lineW, cx, .045, z)));
    L.add(flatMesh(new T.PlaneGeometry(.5, 3.8), lineW, sd * 21, .046, 0));   // dur çizgisi hissi
  });
  { // orta sarı kesik çizgiler
    const nD = 44, dm = new T.Object3D(), dash = new T.InstancedMesh(new T.BoxGeometry(1.6, .02, .12), lineY, nD + 2 * 24);
    for (let i = 0; i < nD; i++) { const a = i / nD * Math.PI * 2; dm.position.set(Math.cos(a) * ROAD_R, .05, Math.sin(a) * ROAD_R); dm.rotation.set(0, -(a + Math.PI / 2), 0); dm.updateMatrix(); dash.setMatrixAt(i, dm.matrix); }
    let k = nD; [1, -1].forEach(sd => { for (let i = 0; i < 24; i++) { dm.position.set(sd * (24 + i * 2.9), .05, 0); dm.rotation.set(0, 0, 0); dm.updateMatrix(); dash.setMatrixAt(k++, dm.matrix); } });
    dash.frustumCulled = false; L.add(dash);
  }
  for (let i = 0; i < 12; i++) {   // sokak lambaları
    const a = .2 + .2618 + i * .5236, x = Math.cos(a) * 21.4, z = Math.sin(a) * 21.4, lamp = new T.Group(); lamp.position.set(x, 0, z);
    lamp.add(mesh(new T.CylinderGeometry(.06, .08, 3.6, 6), std('#374151', .6), 0, 1.8, 0));
    lamp.add(mesh(new T.BoxGeometry(.5, .12, .3), std('#374151', .6), -Math.cos(a) * .25, 3.6, -Math.sin(a) * .25));
    const hd = new T.Mesh(new T.SphereGeometry(.16, 8, 6), new T.MeshBasicMaterial({ color: '#fff4c2' })); hd.position.set(-Math.cos(a) * .4, 3.5, -Math.sin(a) * .4); lamp.add(hd);
    const gl = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: '#ffe9a0', transparent: true, opacity: .55, depthWrite: false, blending: T.AdditiveBlending })); gl.scale.setScalar(2.6); gl.position.copy(hd.position); lamp.add(gl);
    L.add(lamp); treeC.push({ x, z, r: .35 });
  }
  const mkFormula = col => {
    const g = new T.Group(), paint = std(col, .25, { metalness: .6 }), carbon = std('#111827', .5, { metalness: .4 }), dark = std('#0b0f19', .8), silver = std('#cbd5e1', .25, { metalness: .9 });
    g.add(mesh(new T.BoxGeometry(.7, .34, 3.0), paint, 0, .4, 0)); g.add(mesh(new T.BoxGeometry(.36, .26, 1.3), paint, 0, .34, 1.95));
    g.add(mesh(new T.BoxGeometry(.5, .24, .75), carbon, 0, .6, -.1)); g.add(mesh(new T.SphereGeometry(.15, 12, 10), std('#fbbf24', .3), 0, .76, -.1));
    [-1, 1].forEach(sx => { g.add(mesh(new T.BoxGeometry(.45, .26, 1.3), paint, sx * .62, .33, -.25)); g.add(mesh(new T.BoxGeometry(.05, .18, .42), carbon, sx * .95, .27, 2.5)); g.add(mesh(new T.BoxGeometry(.05, .3, .42), carbon, sx * .75, .95, -1.7)); g.add(mesh(new T.BoxGeometry(.05, .5, .05), carbon, sx * .3, .7, -1.6)); });
    g.add(mesh(new T.BoxGeometry(1.9, .05, .42), carbon, 0, .17, 2.5)); g.add(mesh(new T.BoxGeometry(1.5, .05, .42), carbon, 0, .95, -1.7));
    g.add(mesh(new T.BoxGeometry(.3, .08, .06), new T.MeshBasicMaterial({ color: '#ef4444' }), 0, .45, -1.55));
    [[-1, 1.55], [1, 1.55], [-1, -1.25], [1, -1.25]].forEach(([sx, z]) => { const r = .36, t = mesh(new T.CylinderGeometry(r, r, .44, 18), dark, sx * 1.0, r, z); t.rotation.z = Math.PI / 2; g.add(t); const rm = mesh(new T.CylinderGeometry(r * .6, r * .6, .46, 12), silver, sx * 1.0, r, z); rm.rotation.z = Math.PI / 2; g.add(rm); });
    return g;
  };
  const mkCar = (col, kind) => {
    if (kind === 'formula') return mkFormula(col);
    const KS = { sedan: [2.9, 1.55, .46, .5, 1.45, -.18, .18], taxi: [2.9, 1.55, .46, .5, 1.45, -.18, .18], police: [2.95, 1.58, .46, .5, 1.5, -.18, .18], hatch: [2.5, 1.5, .46, .54, 1.55, -.28, .18], suv: [3.2, 1.68, .6, .62, 2.0, -.2, .3], jeep: [2.8, 1.66, .56, .55, 1.4, -.2, .34], van: [3.5, 1.7, .62, .82, 2.6, -.15, .26], truck: [3.9, 1.7, .55, .62, 1.15, .95, .3], sport: [3.0, 1.74, .36, .38, 1.2, -.12, .12], muscle: [3.2, 1.76, .42, .42, 1.3, -.3, .16], limo: [4.7, 1.6, .46, .5, 2.7, -.2, .18], cyber: [3.1, 1.82, .34, .34, 1.35, -.1, .12] };
    const [L, W, bh, ch, cl, co, rd] = KS[kind] || KS.sedan, g = new T.Group();
    const main = kind === 'police' ? '#f8fafc' : kind === 'cyber' ? '#0b1020' : col;
    const paint = std(main, .28, { metalness: .6 }), glass = new T.MeshStandardMaterial({ color: '#0f172a', roughness: .08, metalness: .85, emissive: '#1e3a5f', emissiveIntensity: .25 });
    const dark = std('#0b0f19', .8), silver = std('#cbd5e1', .25, { metalness: .9 }), by = rd + .07 + bh / 2, top = by + bh / 2;
    const neon = kind === 'cyber' ? new T.MeshBasicMaterial({ color: col }) : null;
    g.add(mesh(new T.BoxGeometry(W * .92, .12, L * .96), dark, 0, rd + .08, 0));
    g.add(mesh(new T.BoxGeometry(W, bh, L), paint, 0, by, 0));
    g.add(mesh(new T.BoxGeometry(W * .97, .05, L * .27), paint, 0, top + .02, L * .36));
    g.add(mesh(new T.BoxGeometry(W * 1.02, .17, .14), dark, 0, rd + .2, L / 2)); g.add(mesh(new T.BoxGeometry(W * 1.02, .17, .14), dark, 0, rd + .2, -L / 2));
    g.add(mesh(new T.BoxGeometry(W * .5, .1, .04), dark, 0, by + .02, L / 2 + .01));
    const cab = (w2, h2, l2, z2) => { g.add(mesh(new T.BoxGeometry(w2, h2, l2), glass, 0, top + h2 / 2, z2)); g.add(mesh(new T.BoxGeometry(w2 + .04, .07, l2 + .06), paint, 0, top + h2 + .035, z2)); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => g.add(mesh(new T.BoxGeometry(.07, h2, .07), paint, a * w2 / 2, top + h2 / 2, z2 + b * l2 / 2))); };
    if (kind === 'truck') {
      cab(W * .84, ch, 1.15, L * .22);
      [-1, 1].forEach(sx => g.add(mesh(new T.BoxGeometry(.08, .42, L * .45), paint, sx * W * .47, top + .21, -L * .2)));
      g.add(mesh(new T.BoxGeometry(W * .96, .42, .08), paint, 0, top + .21, -L * .43)); g.add(mesh(new T.BoxGeometry(W * .9, .04, L * .45), dark, 0, top + .02, -L * .2));
    } else if (kind === 'van') {
      g.add(mesh(new T.BoxGeometry(W * .98, ch, cl), paint, 0, top + ch / 2, co)); g.add(mesh(new T.BoxGeometry(W * .88, ch * .5, .05), glass, 0, top + ch * .6, co + cl / 2 + .01)); g.add(mesh(new T.BoxGeometry(W * 1.0, ch * .34, cl * .55), glass, 0, top + ch * .62, co + cl * .15));
    } else if (kind === 'jeep') {
      const ws = mesh(new T.BoxGeometry(W * .84, .5, .05), glass, 0, top + .28, L * .02); ws.rotation.x = -.2; g.add(ws);
      [-1, 1].forEach(sx => { g.add(mesh(new T.CylinderGeometry(.03, .03, .6, 6), silver, sx * W * .4, top + .3, -L * .16)); });
      const rb = mesh(new T.CylinderGeometry(.03, .03, W * .8, 6), silver, 0, top + .6, -L * .16); rb.rotation.z = Math.PI / 2; g.add(rb);
      g.add(mesh(new T.BoxGeometry(W * .7, .16, .4), dark, 0, top + .1, -L * .02)); g.add(mesh(new T.BoxGeometry(W * .7, .3, .08), dark, 0, top + .22, -L * .16));
      const sp = mesh(new T.CylinderGeometry(.32, .32, .2, 14), dark, 0, by + .15, -L / 2 - .18); sp.rotation.x = Math.PI / 2; g.add(sp);
    } else cab(W * .84, ch, cl, co);
    if (kind === 'taxi') { g.add(mesh(new T.BoxGeometry(.5, .16, .22), new T.MeshBasicMaterial({ color: '#fef08a' }), 0, top + ch + .17, co)); g.add(mesh(new T.BoxGeometry(W + .012, .08, L * .6), dark, 0, by - .04, 0)); }
    if (kind === 'police') {
      g.add(mesh(new T.BoxGeometry(W + .012, .15, L * .72), std('#1d4ed8', .4), 0, by - .03, 0));
      g.add(mesh(new T.BoxGeometry(.24, .1, .22), new T.MeshBasicMaterial({ color: '#ef4444' }), -.14, top + ch + .12, co)); g.add(mesh(new T.BoxGeometry(.24, .1, .22), new T.MeshBasicMaterial({ color: '#3b82f6' }), .14, top + ch + .12, co));
    }
    if (kind === 'muscle' || kind === 'sport') {
      const st = std(kind === 'muscle' ? '#f8fafc' : '#0b0f19', .4);
      [-.22, .22].forEach(x => { g.add(mesh(new T.BoxGeometry(.16, .012, L * .3), st, x, top + .05, L * .34)); g.add(mesh(new T.BoxGeometry(.16, .012, L * .26), st, x, top + .05, -L * .37)); });
      g.add(mesh(new T.BoxGeometry(W * .9, .05, .3), paint, 0, top + .3, -L / 2 + .12)); [-1, 1].forEach(sx => g.add(mesh(new T.BoxGeometry(.05, .3, .05), dark, sx * W * .3, top + .15, -L / 2 + .12)));
    }
    if (kind === 'limo') g.add(mesh(new T.BoxGeometry(W + .012, .03, L * .9), silver, 0, by + .06, 0));
    if (neon) {
      [-1, 1].forEach(sx => g.add(mesh(new T.BoxGeometry(.03, .045, L * .9), neon, sx * (W / 2 + .005), by, 0)));
      g.add(mesh(new T.BoxGeometry(W * .8, .04, .03), neon, 0, by + .06, L / 2 + .015)); g.add(mesh(new T.BoxGeometry(W * .8, .04, .03), new T.MeshBasicMaterial({ color: '#f43f5e' }), 0, by + .06, -L / 2 - .015));
      const ug = new T.Mesh(new T.PlaneGeometry(W * 1.5, L * 1.25), new T.MeshBasicMaterial({ color: col, transparent: true, opacity: .32, depthWrite: false })); ug.rotation.x = -Math.PI / 2; ug.position.y = .04; g.add(ug);
    }
    const wr = (kind === 'suv' || kind === 'jeep' || kind === 'truck' || kind === 'van') ? .36 : kind === 'sport' || kind === 'cyber' ? .29 : .3, rimM = neon || silver;
    const wz = kind === 'truck' ? [L * .3, -L * .3] : [L * .31, -L * .31];
    [-1, 1].forEach(sx => wz.forEach(z => { const t = mesh(new T.CylinderGeometry(wr, wr, .26, 16), std('#111827', .9), sx * (W / 2 - .02), wr, z); t.rotation.z = Math.PI / 2; g.add(t); const rm = mesh(new T.CylinderGeometry(wr * .62, wr * .62, .28, 12), rimM, sx * (W / 2 - .02), wr, z); rm.rotation.z = Math.PI / 2; g.add(rm); }));
    [-1, 1].forEach(s => {
      g.add(mesh(new T.SphereGeometry(.12, 8, 6), new T.MeshBasicMaterial({ color: '#fff7c2' }), s * W * .34, by + .04, L / 2)); g.add(mesh(new T.BoxGeometry(.3, .1, .05), new T.MeshBasicMaterial({ color: '#ef4444' }), s * W * .34, by + .06, -L / 2 - .01));
      g.add(mesh(new T.BoxGeometry(.12, .09, .14), paint, s * (W / 2 + .09), top + .1, co + cl / 2 - .05));
      g.add(mesh(new T.BoxGeometry(.012, bh * .8, .015), dark, s * (W / 2 + .005), by, co)); g.add(mesh(new T.BoxGeometry(.012, bh * .8, .015), dark, s * (W / 2 + .005), by, co + cl * .45));
    });
    g.add(mesh(new T.BoxGeometry(.4, .12, .02), std('#f1f5f9', .5), 0, rd + .27, -L / 2 - .075));
    return g;
  };
  const mkPath = pts => { let tot = 0; const cum = [0]; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; tot += Math.hypot(q[0] - p[0], q[1] - p[1]); cum.push(tot); } return { pts, cum, len: tot }; };
  const pathAt = (P, s) => { s = ((s % P.len) + P.len) % P.len; let lo = 0, hi = P.cum.length - 2; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (P.cum[m] <= s) lo = m; else hi = m - 1; } const p = P.pts[lo], q = P.pts[(lo + 1) % P.pts.length], k = (s - P.cum[lo]) / (P.cum[lo + 1] - P.cum[lo] || 1); return { x: p[0] + (q[0] - p[0]) * k, z: p[1] + (q[1] - p[1]) * k, h: Math.atan2(q[0] - p[0], q[1] - p[1]) }; };
  const ringPath = (r, dir) => mkPath(Array.from({ length: 96 }, (_, i) => { const a = dir * i / 96 * Math.PI * 2; return [Math.cos(a) * r, Math.sin(a) * r]; }));
  const spokePath = sd => { const pts = [[sd * 22.5, .9 * sd], [sd * SPOKE_E, .9 * sd]]; for (let i = 1; i < 8; i++) { const th = i / 8 * Math.PI; pts.push([sd * (SPOKE_E + Math.sin(th) * .9), sd * (.9 * Math.cos(th))]); } pts.push([sd * SPOKE_E, -.9 * sd], [sd * 22.5, -.9 * sd]); for (let i = 1; i < 8; i++) { const th = i / 8 * Math.PI; pts.push([sd * (22.5 - Math.sin(th) * .9), sd * (-.9 * Math.cos(th))]); } return mkPath(pts); };
  const roadCars = [];
  { const defs = [[ringPath(ROAD_R + .95, 1), 4, 5.2, ['#ef4444', 'taxi', '#facc15', 'suv', '#2563eb', 'sedan', '#10b981', 'truck']], [ringPath(ROAD_R - .95, -1), 3, 4.6, ['#f97316', 'sedan', '#a855f7', 'suv', '#e5e7eb', 'sedan']], [spokePath(1), 2, 8.5, ['#0ea5e9', 'sedan', '#f43f5e', 'suv']], [spokePath(-1), 2, 8.5, ['#22c55e', 'truck', '#eab308', 'taxi']]];
    defs.forEach(([P, n, spd, sty]) => { const arr = []; for (let i = 0; i < n; i++) { const g = mkCar(sty[i * 2], sty[i * 2 + 1]); L.add(g); const c = { g, P, s: i * P.len / n, v: spd, spd, grp: arr, ry: 0 }; arr.push(c); roadCars.push(c); } }); }
  const updateCars = dt => {
    for (const c of roadCars) {
      let want = c.spd; const cur = pathAt(c.P, c.s), fx = Math.sin(cur.h), fz = Math.cos(cur.h);
      const px = myP.x - cur.x, pz = myP.z - cur.z, fw = px * fx + pz * fz, lat = Math.abs(px * fz - pz * fx);
      if (myP.room === 0 && fw > -1 && fw < 5.5 && lat < 1.7 && myP.y < 1.2) want = 0;
      for (const o of c.grp) if (o !== c) { const gap = ((o.s - c.s) % c.P.len + c.P.len) % c.P.len; if (gap < 5.5) want = 0; }
      c.v += (want - c.v) * Math.min(1, dt * (want ? 1.6 : 4)); c.s += c.v * dt;
      const p = pathAt(c.P, c.s); let dh = p.h - c.ry; dh = Math.atan2(Math.sin(dh), Math.cos(dh)); c.ry += dh * Math.min(1, dt * 8);
      c.g.position.set(p.x, 0, p.z); c.g.rotation.y = c.ry;
    }
  };

  /* ---------- PARKUR TABLETİ ---------- */
  const tabletPos = { x: 5.5, z: 3.2 };
  const tabletG = new T.Group(); tabletG.position.set(tabletPos.x, 0, tabletPos.z);
  // stand
  tabletG.add(mesh(new T.CylinderGeometry(.12, .18, .9, 12), std('#333', .6), 0, .45, 0));
  tabletG.add(mesh(new T.CylinderGeometry(.45, .5, .08, 16), std('#222', .5), 0, .04, 0));
  // screen
  const tabScreen = mesh(new T.BoxGeometry(1.1, .7, .06), new T.MeshStandardMaterial({ color: '#0a1628', roughness: .3, metalness: .4, emissive: '#1a3a6a', emissiveIntensity: .6 }), 0, 1.25, 0);
  tabletG.add(tabScreen);
  // frame
  tabletG.add(mesh(new T.BoxGeometry(1.2, .8, .04), std('#1a1a22', .4), 0, 1.25, -.02));
  // glow sprite
  const tabGlow = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: '#4af', transparent: true, opacity: .35, depthWrite: false, blending: T.AdditiveBlending }));
  tabGlow.position.set(0, 1.25, .1); tabGlow.scale.set(1.8, 1.2, 1); tabletG.add(tabGlow);
  L.add(tabletG);
  treeC.push({ x: tabletPos.x, z: tabletPos.z, r: .6 });

  /* ---------- EV (TV odası) ---------- */
  const H = rooms[1]; H.visible = false;
  // --- daha gerçekçi ev: ahşap zemin, kalın duvarlar, süpürgelik, tavan, kapı açıklığı ---
  const floor = mesh(new T.PlaneGeometry(14, 11), new T.MeshStandardMaterial({ map: noiseTex('#a9743f', '#5a3a1a', 256, 3), roughness: .75 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; floor.castShadow = false; H.add(floor);
  const wallM = new T.MeshStandardMaterial({ color: '#e8d9c4', roughness: .85, metalness: .02 });
  const wallDark = new T.MeshStandardMaterial({ color: '#c4b39a', roughness: .9 });
  // arka / sol / sağ tam duvarlar
  [[0, 2.15, -5.55, 14.2, 4.3, .28], [-7.05, 2.15, 0, .28, 4.3, 11.2], [7.05, 2.15, 0, .28, 4.3, 11.2]].forEach(([x,y,z,w,h,d]) => H.add(mesh(new T.BoxGeometry(w,h,d), wallM, x,y,z)));
  // ön duvar (kapı boşluklu): iki yan panel + üst lintel
  H.add(mesh(new T.BoxGeometry(5.1, 4.3, .28), wallM, -4.55, 2.15, 5.55));
  H.add(mesh(new T.BoxGeometry(5.1, 4.3, .28), wallM, 4.55, 2.15, 5.55));
  H.add(mesh(new T.BoxGeometry(4.0, 1.1, .28), wallM, 0, 3.75, 5.55)); // kapı üstü
  // kapı çerçevesi (ahşap)
  const doorWood = std('#5c3a1e', .55);
  H.add(mesh(new T.BoxGeometry(.18, 3.3, .35), doorWood, -1.95, 1.65, 5.55));
  H.add(mesh(new T.BoxGeometry(.18, 3.3, .35), doorWood, 1.95, 1.65, 5.55));
  H.add(mesh(new T.BoxGeometry(4.1, .18, .35), doorWood, 0, 3.25, 5.55));
  // açık kapı kanadı (içe doğru hafif açık)
  const doorLeaf = mesh(new T.BoxGeometry(1.85, 3.05, .08), std('#6b4423', .5), 1.05, 1.55, 5.35);
  doorLeaf.rotation.y = -0.55;
  H.add(doorLeaf);
  // kapı kolu
  H.add(mesh(new T.SphereGeometry(.06, 8, 8), std('#c9a84c', .3), 1.55, 1.55, 5.2));
  // pencereler (arka duvar, iki yan)
  const winGlass = new T.MeshStandardMaterial({ color: '#a8d4ff', transparent: true, opacity: .35, roughness: .1, metalness: .4 });
  const winFrame = std('#4a3728', .6);
  [[-3.2, -5.4], [3.2, -5.4]].forEach(([wx, wz]) => {
    H.add(mesh(new T.BoxGeometry(2.2, 1.6, .08), winGlass, wx, 2.5, wz));
    H.add(mesh(new T.BoxGeometry(2.35, .12, .14), winFrame, wx, 3.35, wz));
    H.add(mesh(new T.BoxGeometry(2.35, .12, .14), winFrame, wx, 1.65, wz));
    H.add(mesh(new T.BoxGeometry(.12, 1.7, .14), winFrame, wx - 1.1, 2.5, wz));
    H.add(mesh(new T.BoxGeometry(.12, 1.7, .14), winFrame, wx + 1.1, 2.5, wz));
    H.add(mesh(new T.BoxGeometry(.08, 1.6, .1), winFrame, wx, 2.5, wz)); // orta dikme
  });
  // süpürgelik
  const baseM = std('#6b4a2e', .7);
  [[0, .08, -5.4, 13.8, .16, .12], [0, .08, 5.4, 13.8, .16, .12], [-6.9, .08, 0, .12, .16, 10.8], [6.9, .08, 0, .12, .16, 10.8]].forEach(([x,y,z,w,h,d]) => H.add(mesh(new T.BoxGeometry(w,h,d), baseM, x,y,z)));
  // tavan
  H.add(mesh(new T.BoxGeometry(14.2, .18, 11.2), std('#f0e8d8', 1), 0, 4.3, 0));
  // tavan lambası
  H.add(mesh(new T.CylinderGeometry(.35, .45, .12, 16), std('#f5f0e0', .4), 0, 4.15, 0));
  const ceilL = new T.PointLight('#fff5e0', 0.7, 16); ceilL.position.set(0, 4.0, 0); H.add(ceilL);
  // halı
  const rug = mesh(new T.CircleGeometry(3.2, 32), std('#7c5cff', 1), 0, .02, .5); rug.rotation.x = -Math.PI / 2; rug.castShadow = false; H.add(rug);
  const tvC = document.createElement('canvas'); tvC.width = 320; tvC.height = 180; const tvX = tvC.getContext('2d'); const tvTex = new T.CanvasTexture(tvC);
  const tvScreen = mesh(new T.PlaneGeometry(4.4, 2.475), new T.MeshBasicMaterial({ map: tvTex }), 0, 2.2, -5.285); tvScreen.castShadow = false; H.add(tvScreen);
  // "delik": bu yüzeyde canvas şeffaf olur, arkadaki video/iframe görünür (karakterler yine önünde durur)
  const tvHole = new T.Mesh(new T.PlaneGeometry(4.4, 2.475), new T.MeshBasicMaterial({ transparent: true, blending: T.CustomBlending, blendEquation: T.AddEquation, blendSrc: T.ZeroFactor, blendDst: T.ZeroFactor, blendSrcAlpha: T.ZeroFactor, blendDstAlpha: T.ZeroFactor, fog: false, toneMapped: false })); tvHole.position.set(0, 2.2, -5.285); tvHole.renderOrder = 5; tvHole.visible = false; H.add(tvHole);
  H.add(mesh(new T.BoxGeometry(4.7, 2.75, .25), std('#111', .4), 0, 2.2, -5.42)); H.add(mesh(new T.BoxGeometry(5.5, .6, .8), std('#5a3a22', .8), 0, .3, -5));
  const tvLight = new T.PointLight('#6ee7ff', 0, 14, 1.5); tvLight.position.set(0, 2.2, -3.6); H.add(tvLight);
  const lamp = new T.Group(); lamp.position.set(-5.8, 0, -4.2); lamp.add(mesh(new T.CylinderGeometry(.06, .06, 2.2, 8), std('#333'), 0, 1.1, 0)); lamp.add(mesh(new T.ConeGeometry(.5, .6, 12, 1, true), new T.MeshBasicMaterial({ color: '#ffd89a', side: T.DoubleSide }), 0, 2.4, 0)); const lampL = new T.PointLight('#ffb866', 1.1, 14); lampL.position.y = 2.3; lamp.add(lampL); H.add(lamp);
  H.add(new T.AmbientLight('#8a7a9a', .45));
  const sofa = new T.Group(); sofa.position.set(0, 0, 2.6); sofa.add(mesh(new T.BoxGeometry(4.2, .55, 1.3), std('#c0392b', .9), 0, .28, 0)); sofa.add(mesh(new T.BoxGeometry(4.2, .9, .35), std('#a93226', .9), 0, .75, .55)); [-2.05, 2.05].forEach(x => sofa.add(mesh(new T.BoxGeometry(.3, .85, 1.3), std('#a93226', .9), x, .45, 0))); H.add(sofa);
  [-1.3, 0, 1.3].forEach((x, i) => seats.push({ id: 20 + i, room: 1, x, y: .62, z: 2.5, ry: Math.PI }));
  [[-4.2, 1.5], [4.2, 1.5]].forEach(([x, z], i) => { const pf = mesh(new T.SphereGeometry(.8, 14, 10), std(i ? '#2980b9' : '#27ae60', 1), x, .45, z); pf.scale.y = .6; H.add(pf); seats.push({ id: 23 + i, room: 1, x, y: .62, z, ry: Math.PI * (x < 0 ? .75 : 1.25) }); });

  /* ---------- OKEY MASASI (ev, sağ taraf) ---------- */
  const TC = { x: 4.4, z: -1.4 }, TR = 1.55, TY = .9, OD = [[0, 1], [-1, 0], [0, -1], [1, 0]];
  const steamSp = []; let confettiOn = false;
  { const cvs = (w_, h_, fn) => { const c = document.createElement('canvas'); c.width = w_; c.height = h_; fn(c.getContext('2d')); const t = new T.CanvasTexture(c); t.anisotropy = 4; return t; };
    const woodTex = cvs(256, 256, x => { x.fillStyle = '#7a4d28'; x.fillRect(0, 0, 256, 256); for (let i = 0; i < 90; i++) { x.strokeStyle = `rgba(${40 + Math.random() * 30 | 0},${20 + Math.random() * 15 | 0},8,${.15 + Math.random() * .25})`; x.lineWidth = .6 + Math.random() * 1.6; const y = Math.random() * 256; x.beginPath(); x.moveTo(0, y); x.bezierCurveTo(80, y + Math.random() * 10 - 5, 170, y + Math.random() * 10 - 5, 256, y + Math.random() * 6 - 3); x.stroke(); } });
    const feltTex = cvs(512, 512, x => { const g = x.createRadialGradient(256, 256, 40, 256, 256, 360); g.addColorStop(0, '#2a8a4c'); g.addColorStop(1, '#14502a'); x.fillStyle = g; x.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 9000; i++) { x.fillStyle = `rgba(255,255,255,${Math.random() * .05})`; x.fillRect(Math.random() * 512, Math.random() * 512, 1.5, 1.5); }
      x.strokeStyle = 'rgba(212,175,55,.85)'; x.lineWidth = 3; x.strokeRect(14, 14, 484, 484); x.lineWidth = 1.5; x.strokeRect(24, 24, 464, 464);
      [[14, 14, 1, 1], [498, 14, -1, 1], [14, 498, 1, -1], [498, 498, -1, -1]].forEach(([cx, cy, sx, sy]) => { x.beginPath(); x.arc(cx + sx * 40, cy + sy * 40, 22, 0, 6.283); x.stroke(); });
      x.lineWidth = 2; x.beginPath(); x.arc(256, 256, 70, 0, 6.283); x.stroke(); x.beginPath(); x.arc(256, 256, 60, 0, 6.283); x.stroke(); });
    const rugTex = cvs(512, 512, x => { x.fillStyle = '#5a1620'; x.fillRect(0, 0, 512, 512); [240, 210, 150, 110, 60].forEach((r, i) => { x.strokeStyle = i % 2 ? 'rgba(212,175,55,.8)' : 'rgba(240,220,170,.5)'; x.lineWidth = i % 2 ? 4 : 10; x.beginPath(); x.arc(256, 256, r, 0, 6.283); x.stroke(); });
      for (let i = 0; i < 24; i++) { const a = i / 24 * 6.283; x.fillStyle = 'rgba(212,175,55,.7)'; x.beginPath(); x.arc(256 + Math.cos(a) * 180, 256 + Math.sin(a) * 180, 7, 0, 6.283); x.fill(); } });
    const wood = new T.MeshStandardMaterial({ map: woodTex, roughness: .42, metalness: .05 }), rim = new T.MeshStandardMaterial({ map: woodTex, color: '#b08a66', roughness: .4 });
    const felt = new T.MeshStandardMaterial({ map: feltTex, roughness: 1 }), gold = new T.MeshStandardMaterial({ color: '#d4af37', roughness: .3, metalness: .8 });
    const rug = new T.Mesh(new T.CircleGeometry(2.9, 48), new T.MeshStandardMaterial({ map: rugTex, roughness: 1 })); rug.rotation.x = -Math.PI / 2; rug.position.set(TC.x, .017, TC.z); rug.receiveShadow = true; H.add(rug);
    H.add(mesh(new T.BoxGeometry(2.3, .1, 2.3), wood, TC.x, TY - .05, TC.z));
    H.add(mesh(new T.BoxGeometry(2.0, .16, 2.0), rim, TC.x, TY - .18, TC.z));
    const ft = mesh(new T.PlaneGeometry(2.0, 2.0), felt, TC.x, TY + .002, TC.z); ft.rotation.x = -Math.PI / 2; ft.castShadow = false; H.add(ft);
    const prof = [[.42, 0], [.42, .04], [.28, .08], [.12, .18], [.1, .34], [.17, .46], [.1, .56], [.13, .68], [.3, .78]].map(([x, y]) => new T.Vector2(x, y));
    H.add(mesh(new T.LatheGeometry(prof, 20), wood, TC.x, 0, TC.z));
    [[0, 1.075, 2.3, .12], [0, -1.075, 2.3, .12], [1.075, 0, .12, 2.3], [-1.075, 0, .12, 2.3]].forEach(([ox, oz, bw, bd]) => H.add(mesh(new T.BoxGeometry(bw, .09, bd), rim, TC.x + ox, TY + .02, TC.z + oz)));
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz]) => { H.add(mesh(new T.SphereGeometry(.075, 10, 8), gold, TC.x + sx * 1.15, TY - .03, TC.z + sz * 1.15));
      const sauc = mesh(new T.CylinderGeometry(.085, .07, .012, 14), std('#f4f0e6', .3), TC.x + sx * .98, TY + .07, TC.z + sz * .98); H.add(sauc);
      const gl = mesh(new T.LatheGeometry([[.03, 0], [.04, .02], [.05, .06], [.052, .09], [.046, .125]].map(([x, y]) => new T.Vector2(x, y)), 12), new T.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: .35, roughness: .1, side: T.DoubleSide }), TC.x + sx * .98, TY + .078, TC.z + sz * .98); gl.castShadow = false; H.add(gl);
      H.add(mesh(new T.CylinderGeometry(.043, .035, .075, 10), new T.MeshStandardMaterial({ color: '#a63a12', emissive: '#401000', roughness: .3 }), TC.x + sx * .98, TY + .12, TC.z + sz * .98));
      for (let k = 0; k < 2; k++) { const sp = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: '#ffffff', transparent: true, opacity: 0, depthWrite: false })); H.add(sp); steamSp.push({ sp, x: TC.x + sx * .98, y: TY + .2, z: TC.z + sz * .98, ph: Math.random() + k * .5 }); } });
    const rackM = new T.MeshStandardMaterial({ map: woodTex, color: '#d8a878', roughness: .45 });
    OD.forEach(([dx, dz], i) => { const r = new T.Mesh(new T.BoxGeometry(1.7, .07, .2), rackM); r.position.set(TC.x + dx * .86, TY + .035, TC.z + dz * .86); r.rotation.y = Math.atan2(dx, dz); r.castShadow = true; H.add(r);
      const lip = new T.Mesh(new T.BoxGeometry(1.7, .045, .03), rackM); lip.position.set(0, .04, .1); r.add(lip); [-.85, .85].forEach(ex => { const cap = new T.Mesh(new T.SphereGeometry(.05, 8, 6), gold); cap.position.set(ex, .02, 0); r.add(cap); }); });
    OD.forEach(([dx, dz], i) => {
      const sx = TC.x + dx * TR, sz = TC.z + dz * TR, cm = std(['#c0392b', '#2980b9', '#27ae60', '#8e44ad'][i], .75), ch = new T.Group(); ch.position.set(sx, 0, sz); ch.rotation.y = Math.atan2(dx, dz); H.add(ch);
      ch.add(mesh(new T.CylinderGeometry(.28, .26, .07, 22), cm, 0, .47, 0));
      [[-.18, -.18], [.18, -.18], [-.18, .18], [.18, .18]].forEach(([lx, lz]) => ch.add(mesh(new T.CylinderGeometry(.03, .025, .44, 8), wood, lx, .22, lz)));
      ch.add(mesh(new T.BoxGeometry(.52, .5, .06), cm, 0, .8, .25)); [-.22, .22].forEach(px => ch.add(mesh(new T.CylinderGeometry(.03, .03, .55, 8), wood, px, .72, .25)));
      seats.push({ id: 30 + i, room: 1, x: sx, y: .62, z: sz, ry: Math.atan2(TC.x - sx, TC.z - sz), okey: true, i, ox: dx, oz: dz });
    });
    // sarkıt lamba
    H.add(mesh(new T.CylinderGeometry(.012, .012, 1.05, 6), std('#222'), TC.x, 3.62, TC.z));
    const shade = mesh(new T.ConeGeometry(.45, .35, 22, 1, true), new T.MeshStandardMaterial({ color: '#2d5a3a', roughness: .4, metalness: .5, side: T.DoubleSide }), TC.x, 3.0, TC.z); H.add(shade);
    const bulb = new T.Mesh(new T.SphereGeometry(.09, 12, 10), new T.MeshBasicMaterial({ color: '#fff1c0' })); bulb.position.set(TC.x, 2.88, TC.z); H.add(bulb);
    const tl = new T.PointLight('#ffd9a0', 1.6, 10, 1.6); tl.position.set(TC.x, 2.7, TC.z); H.add(tl);
    const lg = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: '#ffcc80', transparent: true, opacity: .4, depthWrite: false, blending: T.AdditiveBlending })); lg.position.set(TC.x, 2.85, TC.z); lg.scale.setScalar(2.4); H.add(lg);
    // süslemeler: süpürgelik, pencereler, tablolar
    const bb = std('#8a6a48', .6); [[0, .08, -5.38, 13.8, .16, .06], [0, .08, 5.38, 13.8, .16, .06], [-6.88, .08, 0, .06, .16, 10.8], [6.88, .08, 0, .06, .16, 10.8]].forEach(([x, y, z, w_, h_, d_]) => H.add(mesh(new T.BoxGeometry(w_, h_, d_), bb, x, y, z)));
    const fr = std('#e9dcc6', .6);
    [-4.6, 4.6].forEach(x => { const win = new T.Mesh(new T.PlaneGeometry(1.8, 1.5), new T.MeshBasicMaterial({ color: '#27407a' })); win.position.set(x, 2.5, -5.38); H.add(win);
      const wg = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: '#7a9cff', transparent: true, opacity: .3, depthWrite: false, blending: T.AdditiveBlending })); wg.position.set(x, 2.5, -5.2); wg.scale.setScalar(3.4); H.add(wg);
      [[0, .75, 1.95, .08], [0, -.75, 1.95, .08], [.9, 0, .08, 1.5], [-.9, 0, .08, 1.5], [0, 0, 1.8, .04], [0, 0, .04, 1.5]].forEach(([ox, oy, bw, bh]) => { const f = mesh(new T.BoxGeometry(bw, bh, .06), fr, x + ox, 2.5 + oy, -5.34); f.castShadow = false; H.add(f); }); });
    [[-2, '#c98a3a'], [1.5, '#3a7ab5']].forEach(([z, c]) => { H.add(mesh(new T.BoxGeometry(.05, 1.0, 1.4), std('#3a2412', .5), -6.86, 2.6, z)); const pic = new T.Mesh(new T.PlaneGeometry(1.2, .8), new T.MeshBasicMaterial({ color: c })); pic.rotation.y = Math.PI / 2; pic.position.set(-6.82, 2.6, z); H.add(pic); });
  }
  const tableFx = (dt, t) => { if (myP.room !== 1) return; steamSp.forEach(o => { const a = (t * .45 + o.ph) % 1; o.sp.position.set(o.x + Math.sin(a * 6 + o.ph * 9) * .015, o.y + a * .35, o.z); o.sp.scale.setScalar(.06 + a * .14); o.sp.material.opacity = .28 * Math.sin(a * Math.PI) * (1 - a * .4); }); };
  const okG = new T.Group(); H.add(okG);
  const tSide = std('#f4ecd8', .5), tBack = std('#c89b5a', .6), tGeo = new T.BoxGeometry(.16, .045, .22), hGeo = new T.BoxGeometry(.1, .17, .045), dGeo = new T.BoxGeometry(.2, 1, .27);
  const tMat = {}, tCv = id => {
    const t = tInfo(id), key = t.fake ? 'f' : t.c + '_' + t.n; if (tMat[key]) return tMat[key];
    const c = document.createElement('canvas'); c.width = 64; c.height = 88; const x = c.getContext('2d'); x.fillStyle = '#f4ecd8'; x.fillRect(0, 0, 64, 88); x.textAlign = 'center';
    if (t.fake) { x.fillStyle = '#1e9d4a'; x.font = 'bold 44px sans-serif'; x.fillText('✦', 32, 54); }
    else { x.fillStyle = OCOL[t.c]; x.font = 'bold 46px sans-serif'; x.fillText(t.n, 32, 52); x.beginPath(); x.arc(32, 68, 7, 0, 7); x.fill(); }
    const tx = new T.CanvasTexture(c); tx.anisotropy = 4; return tMat[key] = new T.MeshStandardMaterial({ map: tx, roughness: .5 });
  };
  const flatTile = id => { const m = new T.Mesh(tGeo, [tSide, tSide, tCv(id), tSide, tSide, tSide]); m.castShadow = true; return m; };
  const okeyRender = () => {
    while (okG.children.length) okG.remove(okG.children[0]);
    const s = OK.s; if (!s || s.phase !== 'end') confettiOn = false; if (!s || s.phase === 'lobby') { return; }
    if (s.phase === 'end' && s.winner != null && !confettiOn) { confettiOn = true; ['#ff4d6d', '#ffd400', '#4dd2ff', '#7dff9a', '#c77dff'].forEach(c => fxBurst(TC.x, TY + .9, TC.z, c, 22, 2.6, 4.5, 3.2, 2.6)); }
    const place = (m, dx, dz, u, r, y, rot = 0) => { const tx = -dz, tz = dx; m.position.set(TC.x + dx * r + tx * u, y, TC.z + dz * r + tz * u); m.rotation.y = Math.atan2(dx, dz) + rot; okG.add(m); return m; };
    OD.forEach(([dx, dz], i) => {
      if (s.seats[i] == null) return;
      const n = s.counts[i], pile = s.discards[i].slice(-5);
      if (s.phase === 'end' && s.hands) {   // el bitti: herkesin taşları masada açılır
        const hand = [...s.hands[i]].sort((a, b) => a - b), cols = 7;
        hand.forEach((id, j) => { const row = (j / cols) | 0, col = j % cols; place(flatTile(id), dx, dz, (col - (cols - 1) / 2) * .19, .8 - row * .27, TY + .025); });
      } else for (let j = 0; j < n; j++) { const m = new T.Mesh(hGeo, tBack); m.castShadow = true; place(m, dx, dz, (j - (n - 1) / 2) * .105, .86, TY + .105); }
      pile.forEach((id, j) => place(flatTile(id), dx, dz, .5, .5, TY + .025 + j * .046, ((id * 37) % 11 - 5) * .03));
      if (s.phase === 'play' && s.turn === i) { const l = new T.Mesh(new T.TorusGeometry(.13, .035, 8, 24), new T.MeshBasicMaterial({ color: '#ffd400' })); l.rotation.x = Math.PI / 2; place(l, dx, dz, -.8, 1.0, TY + .04); l.rotation.x = Math.PI / 2; }
      if (s.phase === 'end' && s.winner === i) { const l = new T.Mesh(new T.TorusGeometry(.3, .04, 8, 32), new T.MeshBasicMaterial({ color: '#7dff9a' })); place(l, dx, dz, 0, .45, TY + .06); l.rotation.x = Math.PI / 2; }
    });
    if (s.deck > 0) { const h = Math.max(.03, s.deck * .0045); const m = new T.Mesh(dGeo, tBack); m.scale.y = h; m.castShadow = true; m.position.set(TC.x - .22, TY + h / 2, TC.z); okG.add(m); }
    if (s.ind != null) { const m = flatTile(s.ind); m.position.set(TC.x + .22, TY + .025, TC.z); okG.add(m); }
  };
  H.add(mesh(new T.BoxGeometry(1.2, 1.9, .45), std('#6b4423', 1), 6.4, .95, -3)); H.add(mesh(new T.CylinderGeometry(.35, .28, .6, 10), std('#a0522d', 1), -6.2, .3, 3.6)); H.add(mesh(new T.SphereGeometry(.55, 10, 8), std('#2e8b57', 1), -6.2, 1.1, 3.6));
  const portalH = mkPortal(0, 4.4, '#ff8a2a', '🏕️ Lobiye Çık', H);
  const lights = [new T.HemisphereLight('#6a7bd1', '#2a1a10', .55), new T.DirectionalLight('#9bb0ff', .5)]; lights[1].position.set(-10, 20, 8); lights[1].castShadow = true; lights[1].shadow.mapSize.set(1024, 1024); Object.assign(lights[1].shadow.camera, { left: -20, right: 20, top: 20, bottom: -20 }); scene.add(...lights);
  seatsDef.length = 0; seatsDef.push(...seats);

  /* ---------- oyuncular ---------- */
  const players = new Map(); const me = S.me.id;
  const spawn = i => { const a = i * 2.4; return { x: Math.cos(a) * 6.2, z: Math.sin(a) * 6.2 + 1 }; };
  const getP = id => {
    let p = players.get(id);
    if (!p) { const sp = spawn(players.size); p = { id, g: null, x: sp.x, z: sp.z, tx: sp.x, tz: sp.z, ry: Math.PI, tr: Math.PI, a: 0, room: 0, seat: -1, em: '', emAt: -9, lab: document.createElement('div'), y: 0, vy: 0, vx: 0, vz: 0, sitK: 0 }; p.lab.className = 'nm'; el.appendChild(p.lab); players.set(id, p); }
    return p;
  };
  const myP = getP(me); const SP0 = { x: 0, z: 7 }; myP.x = myP.tx = SP0.x; myP.z = myP.tz = SP0.z; myP.ry = myP.tr = Math.PI;
  W = { el, R, scene, cam, players, myP, seats, rooms, keys: {}, yaw: 0, pitch: .5, dist: 8, fp: false, tvOn: false, tvT: 0, lastSend: 0, lastState: '', clock: new T.Clock(), stepT: 0, goto: null, drag: false, rs: null, kd: null, ku: null, raf: 0, hb: 0, fx: { flames, fireL, pPos, pAge, pg, flies, fSeed, fPos, fg, portalL, portalH, tvX, tvTex, tvLight } };
  const w = W; w.okeyRender = okeyRender; okBind(el); okeyRender();
  // PK early (setRoom / nearTablet before full parkour setup)
  const PK = { active: false, course: -1, startT: 0, plats: [], fin: null, group: new T.Group(), onGround: true, shake: 0, fovPunch: 0, landT: 0, coyote: 0, jumpBuf: 0, stretch: 0, jumpRing: 0, pvx: 0, pvz: 0, px: 0, pz: 0 };
  let clearParkour = () => { PK.active = false; PK.course = -1; };
  /* ===================== LASER TRACER (Stumble Guys) ===================== */
  const LT = {
    active: false, phase: 'idle', // idle | countdown | play | victory | eliminated
    mode: 'bots', t: 0, startT: 0, alive: 6, total: 6,
    lasers: [], bots: [], group: new T.Group(),
    arenaR: 18, speedMul: 1, elimFx: [], friendIds: [],
  };
  /* ===================== HONEY DROP (Stumble Guys) ===================== */
  const HD = {
    active: false, phase: 'idle', mode: 'bots',
    t: 0, startT: 0, alive: 6, total: 6,
    tiles: [], bots: [], group: new T.Group(),
    floors: 5, floorH: 8, hexR: 1.05, friendIds: [],
  };
  let clearHoney = () => {
    HD.active = false; HD.phase = 'idle';
    while (HD.group.children.length) {
      const ch = HD.group.children[0]; HD.group.remove(ch);
      ch.traverse?.(o => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          if (Array.isArray(o.material)) o.material.forEach(m => m.dispose?.());
          else o.material.dispose?.();
        }
      });
    }
    if (HD.group.parent) HD.group.parent.remove(HD.group);
    HD.tiles = [];
    HD.bots.forEach(b => { if (b.g) b.g.parent?.remove(b.g); if (b.lab) b.lab.remove(); });
    HD.bots = []; HD.friendIds = [];
    myP.dead = false;
    const ui = el.querySelector('#wpk'); if (ui) ui.style.display = 'none';
  };
  let clearLaser = () => {
    LT.active = false; LT.phase = 'idle';
    while (LT.group.children.length) {
      const ch = LT.group.children[0]; LT.group.remove(ch);
      ch.traverse?.(o => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (Array.isArray(o.material)) o.material.forEach(m => m.dispose?.()); else o.material.dispose?.(); } });
    }
    if (LT.group.parent) LT.group.parent.remove(LT.group);
    LT.lasers = []; LT.bots.forEach(b => { if (b.g) b.g.parent?.remove(b.g); if (b.lab) b.lab.remove(); });
    LT.bots = []; LT.elimFx = [];
    myP.dead = false;
    const ui = el.querySelector('#wpk'); if (ui) ui.style.display = 'none';
  };
  const RU = { active: false, phase: 'idle', mode: 'bots', t: 0, left: 45, score: 0, coins: [], taken: new Set(), scores: new Map(), bots: [], group: new T.Group(), bar: null, ang: 0, hitCool: 0, diff: 1, ai: null };
  let clearRush = () => { RU.active = false; };
  const roomName = ['🏕️ Kamp Ateşi Lobisi', '🏠 Ev · TV Odası', '🏃 Parkur Arenası'];
  const setRoom = (r, silent) => {
    if (PK.active && r !== 2) clearParkour();
    if (LT.active && r !== 2) clearLaser();
    if (HD.active && r !== 2) clearHoney();
    if (CITY.drive) CITY.out?.(true);
    myP.room = r; rooms[0].visible = r === 0; rooms[1].visible = r === 1; rooms[2].visible = r === 2;
    scene.background = new T.Color(r === 0 ? '#16204a' : r === 2 ? '#070b16' : '#1c1428');
    scene.fog = r === 0 ? new T.Fog('#16204a', 80, 330) : r === 2 ? new T.Fog('#070b16', 25, 90) : new T.Fog('#1c1428', 25, 60);
    lights[0].intensity = r === 0 ? .85 : r === 2 ? .2 : .35; lights[1].intensity = r === 0 ? .95 : r === 2 ? .15 : .1;
    el.querySelector('#wroom').textContent = roomName[r] || roomName[0]; el.querySelector('#wTv').style.display = r === 1 ? '' : 'none'; if (r !== 1) el.querySelector('#wtv').style.display = 'none';
    if (r === 0) { myP.x = myP.tx = 0; myP.z = myP.tz = 8.6; } else if (r === 1) { myP.x = myP.tx = 0; myP.z = myP.tz = 0.2; }
    myP.vx = myP.vz = 0; w.portalLock = true;   // portal yarıçapından çıkana kadar tekrar tetiklenmez (eve girince geri atma bugı)
    myP.seat = -1; myP.a = 0; w.goto = null; if (!silent) sfx('door'); netSend(true);
  };
  w.setRoom = setRoom;

  // Parkur arenası (oda 2) tek oda: herkes kendi haritasını kurduğu için farklı harita/oyundakileri birbirine gösterme
  const myGame = () => PK.active ? 100 + PK.course : LT.active ? 1 : HD.active ? 2 : RU.active ? 3 : 0;
  const netSend = force => {
    const now = performance.now(); const st = [myP.x.toFixed(2), myP.z.toFixed(2), (myP.y || 0).toFixed(1), myP.ry.toFixed(2), myP.a, myP.room, CITY.drive ? -2 - CITY.idx : myP.seat].join();
    if (!force && st === w.lastState && now - w.lastSend < 1500) return; if (!force && now - w.lastSend < 110) return;
    w.lastState = st; w.lastSend = now; wsSend({ t: 'world', x: myP.x, z: myP.z, y: +(myP.y || 0).toFixed(2), ry: myP.ry, a: myP.a, room: myP.room, g: myGame(), seat: CITY.drive ? -2 - CITY.idx : myP.seat, em: '' });
  };
  const sendEm = e => wsSend({ t: 'world', x: myP.x, z: myP.z, y: +(myP.y || 0).toFixed(2), ry: myP.ry, a: myP.a, room: myP.room, g: myGame(), seat: CITY.drive ? -2 - CITY.idx : myP.seat, em: e });
  setRoom(0, true);
  w.hb = setInterval(() => netSend(true), 2000);

  const nearSeat = () => { let best = null, bd = 1.9; for (const s of seats) { if (s.room !== myP.room) continue; if ([...players.values()].some(p => p.seat === s.id && p.id !== me && p.room === s.room)) continue; const d = Math.hypot(s.x - myP.x, s.z - myP.z); if (d < bd) { bd = d; best = s; } } return best; };
  const nearTV = () => myP.room === 1 && Math.hypot(myP.x, myP.z + 4) < 3.6;
  const nearTablet = () => myP.room === 0 && !PK.active && Math.hypot(myP.x - tabletPos.x, myP.z - tabletPos.z) < 2.2;
  const sit = s => {
    if (s.okey) { if (OK.s?.phase === 'play') return toast('Okey oyunu devam ediyor, bitince oturabilirsin.'); wsSend({ t: 'okey:sit', seat: s.i }); }
    // oturunca 1. şahıs: koltuğun baktığı yöne bak (karşı taraf görünsün)
    w.fp = true;
    w.yaw = s.ry;           // koltuk yönü
    w.pitch = 0.05;         // düz karşıya
    w.dist = 0.01;
    myP.seat = s.id; myP.a = 2; myP.tr = s.ry; w.goto = null; sfx('sit'); netSend(true); okUI();
  };
  const stand = () => {
    const s = seats.find(x => x.id === myP.seat);
    if (s?.okey) { if (OK.s?.phase === 'play' && OK.s.seats.includes(me) && !OK.s.seats.some(x => typeof x === 'string') && !confirm('Kalkarsan okey oyunu iptal olur. Emin misin?')) return; wsSend({ t: 'okey:leave' }); w.dist = 8; w.pitch = .5; w.goto = { x: s.x + s.ox * .9, z: s.z + s.oz * .9 }; }
    else if (s) { w.goto = { x: s.x + Math.sin(s.ry) * 1.0, z: s.z + Math.cos(s.ry) * 1.0 }; }
    myP.seat = -1; myP.a = 0; sfx('stand'); netSend(true); okUI();
  };
  const toggleTV = (fromNet, on) => { w.tvOn = fromNet ? on : !w.tvOn; sfx(w.tvOn ? 'tvOn' : 'tvOff'); if (!fromNet) sendEm(w.tvOn ? 'tv+' : 'tv-'); };
  const emote = e => { if (myP.a === 1) return; myP.em = e; myP.emAt = performance.now() / 1000; sfx(e === '👋' ? 'wave' : e === '💃' ? 'dance' : e === '🦘' ? 'jump' : 'clap'); sendEm(e); };

  /* ---------- PARKUR SİSTEMİ (ayrı harita) ---------- */
  const PA = rooms[2]; // parkour arena
  PA.add(PK.group);

  // Arena zemini + duvarlar + ışık (daha gerçekçi)
  const arenaFloor = mesh(new T.CircleGeometry(55, 64), new T.MeshStandardMaterial({ color: '#1a1f2e', roughness: .95, metalness: .05 })); arenaFloor.rotation.x = -Math.PI / 2; arenaFloor.receiveShadow = true; PA.add(arenaFloor);
  const arenaRing = mesh(new T.RingGeometry(54, 58, 64), new T.MeshStandardMaterial({ color: '#0d111a', roughness: 1 })); arenaRing.rotation.x = -Math.PI / 2; arenaRing.position.y = .01; PA.add(arenaRing);
  // neon ring glow
  const neonRing = new T.Mesh(new T.TorusGeometry(40, .08, 8, 64), new T.MeshBasicMaterial({ color: '#7c5cff', transparent: true, opacity: .35 })); neonRing.rotation.x = Math.PI / 2; neonRing.position.y = .15; PA.add(neonRing);
  // arena lights
  const aAmb = new T.AmbientLight('#6a7cff', .35); PA.add(aAmb);
  const aDir = new T.DirectionalLight('#c8d4ff', .9); aDir.position.set(15, 30, 10); aDir.castShadow = true; aDir.shadow.mapSize.set(2048, 2048); aDir.shadow.bias = -.0004; PA.add(aDir); { const rimL = new T.DirectionalLight('#ffd6a8', .45); rimL.position.set(-18, 14, -22); PA.add(rimL); }
  const aSpot = new T.SpotLight('#7c5cff', 1.4, 80, .55, .4); aSpot.position.set(0, 25, 0); aSpot.target.position.set(0, 0, 0); PA.add(aSpot, aSpot.target);
  // floating particles in arena
  const aPN = 80, aPos = new Float32Array(aPN * 3); for (let i = 0; i < aPN; i++) { aPos[i * 3] = (Math.random() - .5) * 90; aPos[i * 3 + 1] = 1 + Math.random() * 18; aPos[i * 3 + 2] = (Math.random() - .5) * 90; }
  const aGeo = new T.BufferGeometry(); aGeo.setAttribute('position', new T.BufferAttribute(aPos, 3));
  const aPts = new T.Points(aGeo, new T.PointsMaterial({ color: '#a5b4fc', size: .35, map: glowTex, transparent: true, opacity: .7, blending: T.AdditiveBlending, depthWrite: false })); PA.add(aPts);

  // 8 detaylı harita: kontrol noktaları, altınlar, zıplama pedleri, çöken platformlar, dönen tuzaklar, tema dekoru
  const rngF = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const THEMES = {
    meadow: { bg: '#8fd0ff', fog: '#bfe5ff', fn: 40, ff: 170, sea: '#2f9e44', seaEm: 0, plat: '#4ade80', amb: '#ffffff', ambI: .75, dirI: 1.1 },
    water:  { bg: '#4aa8e8', fog: '#7cc4f2', fn: 35, ff: 160, sea: '#0e7490', seaEm: .25, plat: '#38bdf8', amb: '#dff3ff', ambI: .7, dirI: 1.0 },
    mush:   { bg: '#2b1245', fog: '#3a1a5c', fn: 28, ff: 130, sea: '#581c87', seaEm: .35, plat: '#f472b6', amb: '#e9c9ff', ambI: .6, dirI: .9 },
    fire:   { bg: '#2a0d06', fog: '#401408', fn: 26, ff: 120, sea: '#ea580c', seaEm: 1.1, plat: '#fb923c', amb: '#ffb27a', ambI: .55, dirI: .8 },
    ice:    { bg: '#a5d8ff', fog: '#cfeaff', fn: 32, ff: 150, sea: '#bae6fd', seaEm: .25, plat: '#e0f2fe', amb: '#eaf6ff', ambI: .85, dirI: 1.0 },
    storm:  { bg: '#1b1530', fog: '#2a2148', fn: 26, ff: 125, sea: '#1e1b4b', seaEm: .3, plat: '#a78bfa', amb: '#c4b5fd', ambI: .55, dirI: .85 },
    space:  { bg: '#03030c', fog: '#07071a', fn: 40, ff: 200, sea: '#0b0b2a', seaEm: .15, plat: '#818cf8', amb: '#a5b4fc', ambI: .5, dirI: .9 },
    hell:   { bg: '#1a0305', fog: '#300708', fn: 24, ff: 115, sea: '#b91c1c', seaEm: 1.4, plat: '#ef4444', amb: '#ff8a8a', ambI: .5, dirI: .75 },
  };
  const CC = [
    { th: 'meadow', seed: 11, n: 16, w: [2.6, 3.4], gap: [.8, 1.6], dy: [-.2, .45], move: .15, crumble: 0, bounce: .08, sweep: 0, cp: 8, coin: 2 },
    { th: 'water', seed: 23, n: 18, w: [2.2, 3.0], gap: [1.0, 2.0], dy: [-.3, .5], move: .3, crumble: .1, bounce: .08, sweep: 0, cp: 9, coin: 2 },
    { th: 'mush', seed: 37, n: 20, w: [2.0, 2.7], gap: [1.1, 2.1], dy: [-.2, .6], move: .22, crumble: .05, bounce: .22, sweep: 10, cp: 10, coin: 2 },
    { th: 'fire', seed: 41, n: 22, w: [1.8, 2.5], gap: [1.2, 2.3], dy: [-.2, .6], move: .3, crumble: .25, bounce: .05, sweep: 7, cp: 7, coin: 3 },
    { th: 'ice', seed: 53, n: 22, w: [1.9, 2.6], gap: [1.2, 2.4], dy: [-.3, .6], move: .3, crumble: .2, bounce: .1, sweep: 7, cp: 7, coin: 3, narrow: 1.25 },
    { th: 'storm', seed: 67, n: 24, w: [1.7, 2.3], gap: [1.3, 2.5], dy: [.05, .8], move: .35, crumble: .2, bounce: .18, sweep: 6, cp: 8, coin: 3 },
    { th: 'space', seed: 79, n: 24, w: [1.7, 2.3], gap: [1.4, 2.6], dy: [-.4, .7], move: .35, crumble: .15, bounce: .3, sweep: 6, cp: 8, coin: 3 },
    { th: 'hell', seed: 97, n: 28, w: [1.5, 2.1], gap: [1.5, 2.7], dy: [-.3, .7], move: .35, crumble: .3, bounce: .15, sweep: 5, cp: 7, coin: 3 },
  ];
  const genCourse = i => {
    const K = CC[i], meta = VCAT.COURSES[i], R = rngF(K.seed), rr = (a, b) => a + (b - a) * R();
    const plats = [], hazards = [], coins = []; let x = 0, y = .5, z = 0, prev = null, bonusNext = 0;
    for (let k = 0; k < K.n; k++) {
      const first = k === 0, last = k === K.n - 1;
      let kind = 'normal', w = rr(K.w[0], K.w[1]), d = K.narrow ? Math.min(w, K.narrow) : w, mv = null, cp = false;
      if (first || last) { w = d = first ? 4 : 4.6; }
      else if (K.sweep && k % K.sweep === 0) { kind = 'sweep'; w = d = 6.2; }
      else {
        const r = R();
        if (r < K.bounce) { kind = 'bounce'; w = d = 1.9; }
        else if (r < K.bounce + K.crumble) kind = 'crumble';
        else if (r < K.bounce + K.crumble + K.move) { const ax = ['y', 'z', 'x', 'y'][(R() * 4) | 0]; mv = { axis: ax, amp: ax === 'x' ? rr(.7, 1.1) : ax === 'z' ? rr(1.1, 1.8) : rr(.6, 1.0), spd: rr(1.0, 1.6) + i * .03, ph: R() * 6 }; }
      }
      if (!first && !last && K.cp && k % K.cp === 0 && kind === 'normal' && !mv) cp = true;
      if (prev) {
        let gap = rr(K.gap[0], K.gap[1]), dy = rr(K.dy[0], K.dy[1]);
        if (prev.kind === 'bounce') { gap += rr(1.0, 1.8); dy = rr(1.4, 2.6); }
        if (kind === 'sweep' || last) { dy *= .4; }
        x += prev.w / 2 + gap + w / 2;
        const lat = (prev.d + d) / 2 * .85; z = Math.max(-7, Math.min(7, prev.z + (R() * 2 - 1) * Math.min(lat, 2.6)));
        y = Math.max(.5, y + dy);
        if (mv && mv.axis === 'y') y += mv.amp;           // yukarı-aşağı platform tabandan aşağı inmesin
      }
      const pl = { x, y, z, w, d, kind, move: mv, cp, k };
      plats.push(pl); prev = pl;
      if (kind === 'sweep') hazards.push({ x, z, y: y + .18, len: w - .6, spd: (1.25 + i * .12) * (R() < .5 ? -1 : 1), ph: R() * 6 });
      if (!first && !last && K.coin && k % K.coin === 1 && kind !== 'sweep') coins.push({ x, y: y + 1.25, z });
    }
    // başlangıç merkezle (arena sınırı için)
    const L = plats[plats.length - 1].x; plats.forEach(p => p.x -= L / 2); hazards.forEach(h => h.x -= L / 2); coins.forEach(c => c.x -= L / 2);
    const st = plats[0], fn = plats[plats.length - 1];
    return { name: meta.name, base: meta.base, color: meta.color, th: K.th, plats, hazards, coins, start: { x: st.x, z: st.z, y: st.y + .22 }, finish: { x: fn.x, z: fn.z, r: 1.7 }, len: L };
  };
  /* v2 el yapımı 5 parkur (Yeşil Vadi, Salıncak Koyu, Lav Kaçışı, Buz Zirvesi, Cehennem Kulesi) → v3 biçimine çevrilir */
  const V2TH = ['meadow', 'water', 'fire', 'ice', 'hell'];
  const fromV2 = (src, k, nBase) => {
    const idx = nBase + k, meta = VCAT.COURSES[idx] || { name: src.name, base: src.base, color: src.color };
    const plats = [], hazards = [], coins = [], N = src.plats.length;
    src.plats.forEach((p, n) => {
      const first = n === 0, last = n === N - 1;
      const o = { x: p.x, y: p.y, z: p.z, w: p.w, d: p.d, kind: p.fall ? 'crumble' : 'normal', move: p.move ? { ...p.move } : null, cp: false, conv: p.conv || null, k: plats.length };
      if (p.spin) { o.kind = 'sweep'; o.move = null; hazards.push({ x: p.x, z: p.z, y: p.y + .18, len: p.spin.len * 2, spd: p.spin.spd * .85, ph: p.spin.ph || 0 }); }
      if (p.cp && !first && !last && !o.move) o.cp = true;
      if (p.bounce) {
        if (p.w > 4) {   // büyük kontrol noktası platformu: yanına ayrı zıplatma pedi koy (pedde doğup sonsuz zıplamayı önler)
          o.kind = 'normal'; o.cp = !first && !last; plats.push(o);
          plats.push({ x: p.x + p.w / 2 + 1.5, y: p.y, z: p.z, w: 2.2, d: 2.2, kind: 'bounce', move: null, cp: false, conv: null, k: plats.length }); return;
        }
        o.kind = 'bounce'; o.w = o.d = Math.min(o.w, 2.4); o.cp = false;
      }
      plats.push(o);
    });
    plats.forEach((o, n) => { if (n > 0 && n < plats.length - 1 && n % 3 === 1 && (o.kind === 'normal' || o.kind === 'crumble') && !o.move && !o.conv && !o.cp) coins.push({ x: o.x, y: o.y + 1.25, z: o.z }); });
    let mn = 1e9, mx = -1e9; plats.forEach(o => { mn = Math.min(mn, o.x); mx = Math.max(mx, o.x); });
    const sh = (mn + mx) / 2; plats.forEach(o => o.x -= sh); hazards.forEach(h => h.x -= sh); coins.forEach(c => c.x -= sh);
    const st = plats[0], fn = plats[plats.length - 1];
    return { name: meta.name, base: meta.base, color: meta.color, th: V2TH[k] || 'meadow', plats, hazards, coins, start: { x: st.x, z: st.z, y: st.y + .22 }, finish: { x: fn.x, z: fn.z, r: 1.9 }, len: Math.max(24, mx - mn), decorOff: k === 4 ? 22 : 11 };
  };
  const COURSES = CC.map((_, i) => genCourse(i));
  (window.VCOURSES || []).forEach((src, k) => { if (VCAT.COURSES[CC.length + k]) COURSES.push(fromV2(src, k, CC.length)); });
  const ARROW = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); x.fillStyle = '#2b3340'; x.fillRect(0, 0, 64, 64); x.strokeStyle = '#8fe3ff'; x.lineWidth = 7; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath(); x.moveTo(18, 46); x.lineTo(32, 18); x.lineTo(46, 46); x.stroke(); const tx = new T.CanvasTexture(c); tx.wrapS = tx.wrapT = T.RepeatWrapping; return tx; })();
  const convMat = p => {
    const tx = ARROW.clone(); tx.needsUpdate = true; tx.repeat.set(Math.max(1, p.w / 1.3), Math.max(1, p.d / 1.3)); tx.center.set(.5, .5);
    tx.rotation = Math.atan2(Math.sign(p.conv.dx || 0), -Math.sign(p.conv.dz || 0)); p._tx = tx;
    return new T.MeshStandardMaterial({ map: tx, roughness: .5 });
  };

  const matPlat = (c, em = .18) => new T.MeshStandardMaterial({ color: c, roughness: .45, metalness: .25, emissive: c, emissiveIntensity: em });
  const TILE = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 128, 128); x.strokeStyle = 'rgba(0,0,0,.14)'; x.lineWidth = 3; x.strokeRect(1.5, 1.5, 125, 125); x.lineWidth = 1.2; x.beginPath(); x.moveTo(64, 0); x.lineTo(64, 128); x.moveTo(0, 64); x.lineTo(128, 64); x.stroke(); x.fillStyle = 'rgba(0,0,0,.05)'; for (let i = 0; i < 70; i++) x.fillRect(Math.random() * 128, Math.random() * 128, 2, 2); const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = 4; return t; })();
  const SEATEX = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.fillStyle = '#d9d9d9'; x.fillRect(0, 0, 128, 128); x.strokeStyle = '#ffffff'; x.globalAlpha = .7; x.lineWidth = 2.2; for (let r = 0; r < 4; r++) { x.beginPath(); for (let i = 0; i <= 128; i += 4) { const y = r * 32 + 16 + Math.sin(i / 128 * Math.PI * 2 + r) * 6; i ? x.lineTo(i, y) : x.moveTo(i, y); } x.stroke(); } const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; return t; })();
  const matPlatTop = (c, p) => { const m = new T.MeshStandardMaterial({ color: '#f8fafc', roughness: .3, metalness: .15, emissive: c, emissiveIntensity: .08 }); if (p) { const t = TILE.clone(); t.needsUpdate = true; t.repeat.set(Math.max(1, Math.round(p.w / 1.5)), Math.max(1, Math.round(p.d / 1.5))); m.map = t; } return m; };
  const arenaDeco = [arenaFloor, arenaRing, neonRing, aPts];

  const enterArena = (pk) => {
    myP.room = 2;
    rooms[0].visible = false; rooms[1].visible = false; rooms[2].visible = true;
    arenaDeco.forEach(m => m.visible = !pk);
    if (!pk) { aAmb.color.set('#6a7cff'); aAmb.intensity = .35; aDir.intensity = .9; }
    scene.background = new T.Color('#070b16');
    scene.fog = new T.Fog('#070b16', 25, 90);
    lights[0].intensity = .2; lights[1].intensity = .15;
    el.querySelector('#wroom').textContent = '🏃 Parkur Arenası';
    el.querySelector('#wTv').style.display = 'none';
  };
  const leaveArena = () => {
    rooms[2].visible = false;
    setRoom(0, true);
    myP.x = myP.tx = tabletPos.x;
    myP.z = myP.tz = tabletPos.z + 1.8;
    myP.y = 0; myP.vy = 0; w.frozen = false;
  };
  const disposeGroup = grp => { while (grp.children.length) { const ch = grp.children[0]; grp.remove(ch); ch.traverse?.(o => { if (o.geometry) o.geometry.dispose?.(); if (o.material) { if (Array.isArray(o.material)) o.material.forEach(m => m.dispose?.()); else o.material.dispose?.(); } }); } };

  clearParkour = () => {
    disposeGroup(PK.group);
    PK.plats = []; PK.fin = null; PK.active = false; PK.course = -1; PK.shake = 0; PK.fovPunch = 0; PK.hazards = []; PK.coinList = []; PK.sea = null; PK.fx = null;
    arenaDeco.forEach(m => m.visible = true);
    const ui = el.querySelector('#wpk'); if (ui) ui.style.display = 'none';
    if (myP.room === 2) leaveArena();
  };

  // tema dekoru: yol boyunca iki yanda süs yapılar
  const buildDecor = (th, C, R) => {
    const G = new T.Group(), L = C.len, n = 22;
    const at = (i) => { const x = -L / 2 - 8 + (i / (n - 1)) * (L + 16), side = i % 2 ? 1 : -1; return [x, side * ((C.decorOff || 11) + R() * 18)]; };
    for (let i = 0; i < n; i++) {
      const [x, z] = at(i); let m = null;
      if (th === 'meadow') { m = new T.Group(); m.add(mesh(new T.CylinderGeometry(.35, .5, 2.4, 6), std('#6b4423', 1), 0, 1.2, 0)); m.add(mesh(new T.ConeGeometry(2.2, 4.6, 8), std('#2f9e44', 1), 0, 4.2, 0)); m.add(mesh(new T.ConeGeometry(1.7, 3.4, 8), std('#37b24d', 1), 0, 6, 0)); m.position.set(x, -4.9, z); m.scale.setScalar(1.3 + R() * 1.2); const cl = new T.Group(); for (let k = 0; k < 4; k++) cl.add(mesh(new T.SphereGeometry(2 + R() * 1.6, 10, 8), new T.MeshBasicMaterial({ color: '#fff' }), k * 2.6, R(), R() * 2)); cl.position.set(x + R() * 10, 14 + R() * 8, -z * 1.1); G.add(cl); }
      else if (th === 'water') { m = new T.Group(); const h = 8 + R() * 16; m.add(mesh(new T.CylinderGeometry(1.4, 2.4, h, 7), std('#64748b', .95), 0, h / 2, 0)); m.add(mesh(new T.ConeGeometry(1.4, 2.4, 7), std('#94a3b8', .9), 0, h + 1.2, 0)); m.position.set(x, -6, z); }
      else if (th === 'mush') { m = new T.Group(); const h = 6 + R() * 9; m.add(mesh(new T.CylinderGeometry(.9, 1.3, h, 10), std('#fef3c7', .8), 0, h / 2, 0)); const cap = mesh(new T.SphereGeometry(3.4, 18, 10, 0, 6.283, 0, 1.57), std(['#ec4899', '#a855f7', '#f43f5e'][i % 3], .6, { emissive: '#4a0d3a', emissiveIntensity: .35 }), 0, h, 0); cap.scale.y = .65; m.add(cap); m.position.set(x, -6, z); }
      else if (th === 'fire') { m = new T.Group(); const h = 8 + R() * 14; m.add(mesh(new T.ConeGeometry(2.4, h, 6), std('#2b1a14', 1), 0, h / 2, 0)); const tip = new T.Mesh(new T.SphereGeometry(.7, 8, 6), new T.MeshBasicMaterial({ color: '#ff7a1a' })); tip.position.y = h + .2; m.add(tip); m.position.set(x, -7, z); }
      else if (th === 'ice') { m = new T.Group(); const h = 6 + R() * 13; const cr = mesh(new T.OctahedronGeometry(2, 0), std('#bae6fd', .15, { emissive: '#38bdf8', emissiveIntensity: .25, metalness: .3 }), 0, h / 2, 0); cr.scale.set(1, h / 3.6, 1); m.add(cr); m.position.set(x, -6, z); }
      else if (th === 'storm') { m = new T.Group(); for (let k = 0; k < 5; k++) m.add(mesh(new T.SphereGeometry(2.4 + R() * 2.4, 10, 8), new T.MeshBasicMaterial({ color: ['#312e81', '#3b3470', '#1e1b4b'][k % 3] }), k * 3 - 6, R() * 1.5, R() * 3)); m.position.set(x, 6 + R() * 22, z * 1.2); }
      else if (th === 'space') { m = new T.Group(); const r = 2 + R() * 5, pc = ['#f97316', '#38bdf8', '#a855f7', '#22c55e', '#f43f5e'][i % 5]; m.add(mesh(new T.SphereGeometry(r, 18, 14), std(pc, .6, { emissive: pc, emissiveIntensity: .25 }), 0, 0, 0)); if (i % 3 === 0) { const rg = new T.Mesh(new T.RingGeometry(r * 1.4, r * 2, 32), new T.MeshBasicMaterial({ color: '#fde68a', side: T.DoubleSide, transparent: true, opacity: .6 })); rg.rotation.x = 1.2; m.add(rg); } m.position.set(x, -4 + R() * 28, z * 1.3); }
      else { m = new T.Group(); const h = 6 + R() * 12; m.add(mesh(new T.ConeGeometry(1.6, h, 5), std('#1a0a0a', .9), 0, h / 2, 0)); m.position.set(x, -7, z); }
      m.traverse(o => { if (o.isMesh) o.castShadow = false; }); G.add(m);
    }
    if (th === 'space' || th === 'storm') { const N = 260, pp = new Float32Array(N * 3); for (let i = 0; i < N; i++) { pp[i * 3] = (R() - .5) * 240; pp[i * 3 + 1] = R() * 70 - 10; pp[i * 3 + 2] = (R() - .5) * 240; } const sg = new T.BufferGeometry(); sg.setAttribute('position', new T.BufferAttribute(pp, 3)); G.add(new T.Points(sg, new T.PointsMaterial({ color: '#fff', size: .5, transparent: true, opacity: .85, fog: false }))); }
    return G;
  };

  const PT = { meadow: ['#fff7c2', .35, .16], water: ['#bff3ff', .9, .18], mush: ['#f9a8ff', .45, .2], fire: ['#ff9a3c', 1.9, .22], ice: ['#ffffff', -1.4, .2], storm: ['#c4b5fd', .7, .17], space: ['#e0e7ff', .05, .13], hell: ['#ff6b4a', 2.1, .25] };
  const SUN = { meadow: '#fff2b0', water: '#fff2b0', mush: '#f0abfc', fire: '#ff7a2a', ice: '#ffffff', storm: '#a78bfa', space: '#c7d2fe', hell: '#ff3a2a' };
  const buildSky = (TH, th) => {
    const night = ['mush', 'fire', 'storm', 'space', 'hell'].includes(th);
    const top = new T.Color(TH.bg).multiplyScalar(night ? .55 : .72), hor = new T.Color(TH.fog);
    const sky = new T.Mesh(new T.SphereGeometry(450, 24, 14), new T.ShaderMaterial({ side: T.BackSide, depthWrite: false, fog: false, uniforms: { top: { value: top }, hor: { value: hor } },
      vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'uniform vec3 top; uniform vec3 hor; varying vec3 vP; void main(){ float h = clamp(normalize(vP).y*1.7+.12, 0., 1.); gl_FragColor = vec4(mix(hor, top, pow(h,.7)), 1.); }' }));
    sky.renderOrder = -10;
    const sc = SUN[th] || '#fff', sun = new T.Mesh(new T.CircleGeometry(30, 32), new T.MeshBasicMaterial({ color: sc, fog: false, depthWrite: false })), halo = new T.Mesh(new T.CircleGeometry(70, 32), new T.MeshBasicMaterial({ color: sc, transparent: true, opacity: .22, fog: false, depthWrite: false }));
    sun.position.set(-190, 150, -330); sun.lookAt(0, 0, 0); halo.position.copy(sun.position); halo.lookAt(0, 0, 0); sky.add(halo, sun);
    if (night) { const n = 420, pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, e = Math.random() * 1.3 + .1, r = 420; pos[i * 3] = Math.cos(a) * Math.cos(e) * r; pos[i * 3 + 1] = Math.sin(e) * r; pos[i * 3 + 2] = Math.sin(a) * Math.cos(e) * r; } const gs = new T.BufferGeometry(); gs.setAttribute('position', new T.BufferAttribute(pos, 3)); sky.add(new T.Points(gs, new T.PointsMaterial({ color: '#ffffff', size: 2.2, sizeAttenuation: false, fog: false, depthWrite: false }))); }
    else { const cm = new T.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .92, fog: false, depthWrite: false }); for (let i = 0; i < 16; i++) { const cg = new T.Group(), a = i / 16 * 6.283 + Math.random() * .3, r = 300 + Math.random() * 60, y = 70 + Math.random() * 90; for (let k = 0; k < 5; k++) { const sp = new T.Mesh(new T.SphereGeometry(16 + Math.random() * 12, 10, 8), cm); sp.position.set((k - 2) * 20, Math.random() * 6, Math.random() * 10); sp.scale.y = .55; cg.add(sp); } cg.position.set(Math.cos(a) * r, y, Math.sin(a) * r); cg.lookAt(0, y, 0); sky.add(cg); } }
    PK.group.add(sky); PK.sky = sky;
    const pd = PT[th] || PT.meadow, N = 260, pp = new Float32Array(N * 3); for (let i = 0; i < N; i++) { pp[i * 3] = (Math.random() - .5) * 70; pp[i * 3 + 1] = Math.random() * 34 - 8; pp[i * 3 + 2] = (Math.random() - .5) * 70; }
    const pg = new T.BufferGeometry(); pg.setAttribute('position', new T.BufferAttribute(pp, 3));
    const pts = new T.Points(pg, new T.PointsMaterial({ color: pd[0], size: pd[2] * 3, transparent: true, opacity: .85, depthWrite: false })); pts.frustumCulled = false; PK.group.add(pts); PK.pts = pts; PK.ptsV = pd[1];
    PK.ptsBase = new Float32Array(pp);
  };
  const startParkour = (idx) => {
    clearHoney(); clearLaser(); clearRush(); clearParkour();
    const C = COURSES[idx]; if (!C) return;
    const TH = THEMES[C.th], R = rngF(1000 + idx);
    PK.active = true; PK.course = idx; PK.startT = performance.now(); PK.onGround = true; PK.standOn = -1;
    PK.camYaw = 0; PK.camPitch = .38; PK.camDist = 6.5; PK.camRoll = 0; PK.lookX = 0; PK.lookZ = 0; PK.coins = 0; PK.hazards = []; PK.coinList = []; PK.cpN = 0; PK.cpTotal = C.plats.filter(p => p.cp).length; PK.hitCool = 0; PK.pvx = PK.pvz = 0;
    enterArena(true);
    scene.background = new T.Color(TH.bg); scene.fog = new T.Fog(TH.fog, TH.fn, TH.ff);
    aAmb.color.set(TH.amb); aAmb.intensity = TH.ambI; aDir.intensity = TH.dirI;
    lights[0].intensity = .35; lights[1].intensity = .25;
    // alt zemin (lav / su / uçurum)
    const sea = new T.Mesh(new T.PlaneGeometry(500, 500, 1, 1), new T.MeshStandardMaterial({ color: TH.sea, emissive: TH.sea, emissiveIntensity: TH.seaEm, roughness: .5, metalness: .1 })); sea.rotation.x = -Math.PI / 2; sea.position.y = -5.2; PK.group.add(sea); PK.sea = sea; PK.seaEm = TH.seaEm;
    { const st = SEATEX.clone(); st.needsUpdate = true; st.repeat.set(70, 70); sea.material.map = st; sea.material.needsUpdate = true; PK.seaTex = st; }
    buildSky(TH, C.th);
    PK.group.add(buildDecor(C.th, C, R));
    C.plats.forEach((p, i) => {
      const g = new T.Group(), bodyH = .36, col = TH.plat;
      if (p.kind === 'bounce') {
        g.add(mesh(new T.CylinderGeometry(p.w / 2, p.w / 2 + .1, bodyH, 20), matPlat('#7c3aed', .25), 0, 0, 0));
        const pad = mesh(new T.CylinderGeometry(p.w / 2 - .12, p.w / 2 - .12, .1, 20), new T.MeshStandardMaterial({ color: '#f472b6', emissive: '#f472b6', emissiveIntensity: .8, roughness: .3 }), 0, bodyH / 2 + .05, 0); g.add(pad); g.userData.pad = pad;
        const sp = new T.Mesh(new T.TorusGeometry(p.w / 2 - .3, .05, 6, 20), new T.MeshBasicMaterial({ color: '#fff' })); sp.rotation.x = Math.PI / 2; sp.position.y = bodyH / 2 + .12; g.add(sp);
      } else if (p.kind === 'crumble') {
        g.add(mesh(new T.BoxGeometry(p.w, bodyH, p.d), matPlat('#a8a29e', .06), 0, 0, 0));
        const top = mesh(new T.BoxGeometry(p.w * .96, .05, p.d * .96), new T.MeshStandardMaterial({ color: '#e7e5e4', roughness: .9 }), 0, bodyH / 2 + .02, 0); top.receiveShadow = true; g.add(top);
        for (let k = 0; k < 3; k++) { const cr = new T.Mesh(new T.BoxGeometry(.05, .02, p.d * (.4 + k * .15)), new T.MeshBasicMaterial({ color: '#44403c' })); cr.position.set((k - 1) * p.w * .28, bodyH / 2 + .05, 0); cr.rotation.y = (k - 1) * .5; g.add(cr); }
      } else {
        const c2 = p.kind === 'sweep' ? '#64748b' : col;
        g.add(mesh(new T.BoxGeometry(p.w, bodyH, p.d), matPlat(c2), 0, 0, 0));
        g.add(mesh(new T.BoxGeometry(p.w * .6, .5, p.d * .6), matPlat(c2, .05), 0, -bodyH / 2 - .25, 0));
        const top = mesh(new T.BoxGeometry(p.w * .96, .05, p.d * .96), (p.conv ? convMat(p) : matPlatTop(c2, p)), 0, bodyH / 2 + .02, 0); top.receiveShadow = true; g.add(top);
        const edge = new T.Mesh(new T.BoxGeometry(p.w + .08, .05, p.d + .08), new T.MeshBasicMaterial({ color: C.color, transparent: true, opacity: .55 })); edge.position.y = bodyH / 2 + .04; g.add(edge);
        g.add(mesh(new T.BoxGeometry(p.w * .92, .05, p.d * .92), new T.MeshBasicMaterial({ color: C.color, transparent: true, opacity: .55 }), 0, -bodyH / 2 - .03, 0));
      }
      if (p.move) { const ind = new T.Mesh(new T.TorusGeometry(.18, .04, 6, 12), new T.MeshBasicMaterial({ color: '#fff', transparent: true, opacity: .7 })); ind.rotation.x = Math.PI / 2; ind.position.y = bodyH / 2 + .35; g.add(ind); }
      let flag = null;
      const sx = p.cp ? -Math.max(0, Math.min(p.w / 2 - .7, 2.2)) : 0;   // sabit yeniden doğma noktası (platformun giriş tarafı)
      if (p.cp) {
        const fz = Math.min(p.d / 2 - .35, 1.4);
        g.add(mesh(new T.CylinderGeometry(.04, .04, 1.5, 6), std('#e5e7eb', .4), sx, bodyH / 2 + .75, fz));
        flag = new T.Mesh(new T.PlaneGeometry(.7, .42), new T.MeshBasicMaterial({ color: '#ef4444', side: T.DoubleSide })); flag.position.set(sx + .35, bodyH / 2 + 1.3, fz); g.add(flag);
        const spr = new T.Mesh(new T.RingGeometry(.38, .52, 28), new T.MeshBasicMaterial({ color: '#22d3ee', transparent: true, opacity: .85, side: T.DoubleSide })); spr.rotation.x = -Math.PI / 2; spr.position.set(sx, bodyH / 2 + .075, 0); g.add(spr);
      }
      if (p.kind === 'sweep') g.add(mesh(new T.CylinderGeometry(.22, .3, .55, 10), matPlat('#475569', .1), 0, bodyH / 2 + .27, 0));
      g.position.set(p.x, p.y, p.z); PK.group.add(g);
      PK.plats.push({ bx: p.x, by: p.y, bz: p.z, x: p.x, y: p.y, z: p.z, w: p.w, d: p.d, h: bodyH, top: p.y + bodyH / 2, move: p.move || null, mesh: g, prevX: p.x, prevY: p.y, prevZ: p.z, kind: p.kind, cp: !!p.cp, flag, sx, conv: p.conv || null, tx: p._tx || null, cs: 0, ct: 0, dy: 0, vy: 0, off: false, reached: false });
    });
    // dönen tuzaklar
    C.hazards.forEach(h => {
      const bar = new T.Group(), len = h.len;
      bar.add(mesh(new T.BoxGeometry(len, .28, .28), std('#facc15', .4, { emissive: '#7a5a00', emissiveIntensity: .35 }), 0, 0, 0));
      [-1, 1].forEach(sg => bar.add(mesh(new T.SphereGeometry(.34, 12, 10), std('#ef4444', .4, { emissive: '#7f1d1d', emissiveIntensity: .5 }), sg * len / 2, 0, 0)));
      for (let k = -2; k <= 2; k++) if (k) bar.add(mesh(new T.BoxGeometry(.28, .3, .3), std(k % 2 ? '#111827' : '#facc15', .5), k * len * .18, 0, 0));
      bar.position.set(h.x, h.y + .45, h.z); PK.group.add(bar); PK.hazards.push({ ...h, bar, ang: h.ph });
    });
    // altınlar
    C.coins.forEach(c => { const m = new T.Mesh(new T.CylinderGeometry(.26, .26, .07, 16), new T.MeshStandardMaterial({ color: '#fbbf24', emissive: '#f59e0b', emissiveIntensity: .8, metalness: .8, roughness: .25 })); m.rotation.x = Math.PI / 2; const gC = new T.Group(); gC.add(m); gC.position.set(c.x, c.y, c.z); PK.group.add(gC); PK.coinList.push({ g: gC, x: c.x, y: c.y, z: c.z, got: false }); });
    PK.coinTotal = C.coins.length;
    const last = PK.plats[PK.plats.length - 1];
    const finG = new T.Group(); finG.position.set(C.finish.x, last.top + .25, C.finish.z);
    finG.add(new T.Mesh(new T.TorusGeometry(1.15, .09, 10, 28), new T.MeshBasicMaterial({ color: C.color })));
    finG.add(new T.Mesh(new T.TorusGeometry(1.4, .04, 8, 28), new T.MeshBasicMaterial({ color: '#fff', transparent: true, opacity: .45 })));
    const finLight = new T.PointLight(C.color, 1.8, 12); finLight.position.y = .4; finG.add(finLight);
    const beam = new T.Mesh(new T.CylinderGeometry(.9, .9, 14, 20, 1, true), new T.MeshBasicMaterial({ color: C.color, transparent: true, opacity: .16, side: T.DoubleSide, depthWrite: false })); beam.position.y = 7; finG.add(beam);
    PK.group.add(finG); PK.finMesh = finG;
    PK.fin = { x: C.finish.x, z: C.finish.z, r: C.finish.r, y: last.top };
    if (myP.seat >= 0) stand();
    PK.cp = { x: C.start.x, y: C.start.y, z: C.start.z }; w.camSnap = true;
    myP.x = myP.tx = C.start.x; myP.z = myP.tz = C.start.z; myP.y = C.start.y; myP.vy = 0; myP.vx = myP.vz = 0;
    w.goto = null; w.yaw = -Math.PI / 2; w.pitch = .38; w.dist = 6.5; w.frozen = false;
    sfx('join'); PK.fovPunch = 10;
    const ui = el.querySelector('#wpk');
    ui.style.display = '';
    ui.innerHTML = `<div class="pkhud"><b>${C.name}</b><span id="pktime">0.0s</span><span class="cc" id="pkcoins">💰 0/${PK.coinTotal}</span><span class="cp" id="pkcp">🚩 0/${PK.cpTotal}</span><button id="pkquit">Çık ✕</button></div>`;
    ui.querySelector('#pkquit').onclick = () => { clearParkour(); toast('Parkur iptal edildi'); };
    updateCoinsUI();
  };

  /* ---------- LASER TRACER v2 (sıfırdan): uyarı → lazer dalgaları ---------- */
  // Sarı lazer = alçak, ÜSTÜNDEN ZIPLA. Kırmızı lazer = duvar, BOŞLUĞUNDAN geç. Her lazer önce zeminde uyarı çizgisi gösterir.
  const LZ_CLEAR = .5, LZ_R = .38;
  const lzMat = (c, op) => new T.MeshBasicMaterial({ color: c, transparent: true, opacity: op, depthWrite: false, side: T.DoubleSide });
  const lzBeam = (len, kind) => {
    const g = new T.Group(), col = kind === 'low' ? '#fbbf24' : '#ef4444';
    const add = (w, h, d, y, op, c) => { const m = new T.Mesh(new T.BoxGeometry(w, h, d), lzMat(c || col, op)); m.position.y = y; g.add(m); };
    if (kind === 'low') { add(len, .2, .16, .3, .95, '#fff3b0'); add(len, .46, .36, .3, .28); }
    else { [.35, 1.2, 2.05].forEach(y => add(len, .15, .13, y, 1, '#ffd6d6')); add(len, 2.6, .08, 1.3, .2); }
    return g;
  };
  const lzWarn = (len, kind) => { const m = new T.Mesh(new T.PlaneGeometry(len, .6), lzMat(kind === 'low' ? '#fbbf24' : '#ef4444', .5)); m.rotation.x = -Math.PI / 2; m.position.y = .07; return m; };
  const lzDispose = o => o.traverse(m => { m.geometry?.dispose(); m.material?.dispose?.(); });

  const mkLine = (kind, phi, s0, v, segs, w0, dur) => {
    const R = LT.arenaR, G = new T.Group(), beams = [], warns = [];
    segs.forEach(([u0, u1]) => {
      const len = u1 - u0, cx = (u0 + u1) / 2;
      const wm = lzWarn(len, kind); wm.position.x = cx; G.add(wm); warns.push(wm);
      const bm = lzBeam(len, kind); bm.position.x = cx; bm.visible = false; G.add(bm); beams.push(bm);
    });
    G.rotation.y = -phi; LT.group.add(G);
    const nx = -Math.sin(phi), nz = Math.cos(phi), dx = Math.cos(phi), dz = Math.sin(phi);
    return {
      type: 'line', kind, t: 0, w: w0, dur, G, nx, nz, dx, dz, gapC: segs.length === 2 ? (segs[0][1] + segs[1][0]) / 2 : null, gapW: segs.length === 2 ? segs[1][0] - segs[0][1] : 0,
      sAt(tt) { return s0 + v * Math.max(0, tt - w0); },
      update(dt) {
        this.t += dt; const on = this.t >= w0 && this.t <= w0 + dur, s = this.sAt(this.t);
        G.position.set(nx * s, 0, nz * s); beams.forEach(b => b.visible = on);
        warns.forEach(m => { m.material.opacity = on ? .18 : .3 + .3 * Math.abs(Math.sin(this.t * 14)); });
        return this.t < w0 + dur + .05;
      },
      hit(px, pz, fy, ah) {
        const tt = this.t + ah, lead = ah > 0 ? .18 : 0; if (tt < w0 - lead || tt > w0 + dur) return false;
        if (kind === 'low' && fy > LZ_CLEAR) return false;
        if (Math.abs(px * nx + pz * nz - this.sAt(tt)) > .07 + LZ_R) return false;
        const u = px * dx + pz * dz; return segs.some(([a, b]) => u > a - .15 && u < b + .15);
      },
      dispose() { LT.group.remove(G); lzDispose(G); },
    };
  };
  const mkSpin = (kind, n, a0, spd, w0, dur) => {
    const R = LT.arenaR, G = new T.Group(), arms = [];
    for (let k = 0; k < n; k++) {
      const arm = new T.Group(), len = R - .9, bm = lzBeam(len, kind); bm.position.x = .9 + len / 2; bm.visible = false;
      const wm = lzWarn(len, kind); wm.position.x = .9 + len / 2; arm.add(wm); arm.add(bm); arm.userData = { bm, wm }; G.add(arm); arms.push(arm);
    }
    LT.group.add(G);
    return {
      type: 'spin', kind, t: 0, w: w0, dur, G, a: a0,
      angAt(tt) { return a0 + spd * Math.max(0, tt - w0); },
      update(dt) {
        this.t += dt; const on = this.t >= w0 && this.t <= w0 + dur, a = this.angAt(this.t);
        arms.forEach((arm, k) => { arm.rotation.y = -(a + k * 6.2832 / n); arm.userData.bm.visible = on; arm.userData.wm.material.opacity = on ? .15 : .3 + .3 * Math.abs(Math.sin(this.t * 14)); });
        return this.t < w0 + dur + .05;
      },
      hit(px, pz, fy, ah) {
        const tt = this.t + ah, lead = ah > 0 ? .18 : 0; if (tt < w0 - lead || tt > w0 + dur) return false;
        if (kind === 'low' && fy > LZ_CLEAR) return false;
        const a = this.angAt(tt);
        for (let k = 0; k < n; k++) {
          const an = a + k * 6.2832 / n, dx = Math.cos(an), dz = Math.sin(an), cr = Math.abs(px * dz - pz * dx), pr = px * dx + pz * dz;
          if (cr < .1 + LZ_R && pr > .8 && pr < R + .3) return true;
        }
        return false;
      },
      dispose() { LT.group.remove(G); lzDispose(G); },
    };
  };
  const mkRing = (w0, v) => {
    const R = LT.arenaR, dur = (R + 1 - .8) / v;
    const wall = new T.Mesh(new T.CylinderGeometry(1, 1, .5, 72, 1, true), lzMat('#22d3ee', .75)); wall.position.y = .25; wall.visible = false;
    const glow = new T.Mesh(new T.CircleGeometry(1.5, 32), lzMat('#22d3ee', .5)); glow.rotation.x = -Math.PI / 2; glow.position.y = .07;
    const G = new T.Group(); G.add(wall); G.add(glow); LT.group.add(G);
    return {
      type: 'ring', kind: 'low', t: 0, w: w0, dur, G,
      rAt(tt) { return .8 + v * Math.max(0, tt - w0); },
      update(dt) { this.t += dt; const on = this.t >= w0 && this.t <= w0 + dur, r = this.rAt(this.t); wall.visible = on; wall.scale.set(r, 1, r); glow.visible = !on && this.t < w0; glow.material.opacity = .25 + .35 * Math.abs(Math.sin(this.t * 12)); return this.t < w0 + dur + .05; },
      hit(px, pz, fy, ah) { const tt = this.t + ah, lead = ah > 0 ? .18 : 0; if (tt < w0 - lead || tt > w0 + dur || fy > LZ_CLEAR) return false; return Math.abs(Math.hypot(px, pz) - this.rAt(tt)) < .42; },
      dispose() { LT.group.remove(G); lzDispose(G); },
    };
  };

  const buildLaserArena = () => {
    const G = LT.group, R = LT.arenaR;
    { const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d');
      const gr = x.createRadialGradient(256, 256, 10, 256, 256, 256); gr.addColorStop(0, '#2b1a5e'); gr.addColorStop(.6, '#171a3a'); gr.addColorStop(1, '#0c1024'); x.fillStyle = gr; x.fillRect(0, 0, 512, 512);
      x.strokeStyle = 'rgba(80,200,255,.28)'; x.lineWidth = 2; for (let i = 0; i <= 512; i += 51.2) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 512); x.moveTo(0, i); x.lineTo(512, i); x.stroke(); }
      x.strokeStyle = 'rgba(168,85,247,.55)'; x.lineWidth = 3; [64, 128, 192, 250].forEach(r => { x.beginPath(); x.arc(256, 256, r, 0, 7); x.stroke(); });
      const tex = new T.CanvasTexture(c); const disc = new T.Mesh(new T.CircleGeometry(R, 72), new T.MeshStandardMaterial({ map: tex, roughness: .55, metalness: .3, emissive: '#1b1250', emissiveIntensity: .5 })); disc.rotation.x = -Math.PI / 2; disc.position.y = .02; disc.receiveShadow = true; G.add(disc); }
    const rim = new T.Mesh(new T.TorusGeometry(R, .14, 8, 96), new T.MeshBasicMaterial({ color: '#22d3ee' })); rim.rotation.x = Math.PI / 2; rim.position.y = .08; G.add(rim);
    const base = new T.Mesh(new T.CylinderGeometry(R + .5, R + 1.5, 1.2, 72), new T.MeshStandardMaterial({ color: '#0b0f1f', roughness: .6, metalness: .5 })); base.position.y = -.6; G.add(base);
    const hub = new T.Mesh(new T.CylinderGeometry(.9, 1.1, .5, 24), new T.MeshStandardMaterial({ color: '#111827', emissive: '#a855f7', emissiveIntensity: .9, metalness: .7, roughness: .3 })); hub.position.y = .25; G.add(hub); LT.hub = hub;
    for (let i = 0; i < 10; i++) {   // kenar kuleleri
      const a = i / 10 * 6.2832, col = ['#22d3ee', '#a855f7', '#f43f5e'][i % 3], px = Math.cos(a) * (R + .6), pz = Math.sin(a) * (R + .6);
      const tw = new T.Mesh(new T.BoxGeometry(.7, 3.4, .7), new T.MeshStandardMaterial({ color: '#0f172a', emissive: col, emissiveIntensity: .7, metalness: .6, roughness: .3 })); tw.position.set(px, 1.7, pz); G.add(tw);
      const hd = new T.Mesh(new T.SphereGeometry(.42, 12, 10), new T.MeshBasicMaterial({ color: col })); hd.position.set(px, 3.6, pz); G.add(hd);
    }
    G.add(new T.HemisphereLight('#8b9bff', '#1b1240', .9));
    const dir = new T.DirectionalLight('#ffffff', .8); dir.position.set(8, 26, 12); G.add(dir);
    const cl = new T.PointLight('#a855f7', 1.6, 30); cl.position.set(0, 4, 0); G.add(cl);
    LT.lasers = [];
  };

  const hitLaser = (px, fy, pz, ah = 0) => { for (const h of LT.lasers) if (h.hit(px, pz, fy, ah)) return true; return false; };
  const threatAt = (x, z, tt) => hitLaser(x, 0, z, tt) ? (hitLaser(x, .8, z, tt) ? 2 : 1) : 0;
  // uyarı süresindeki lazerin AÇILDIĞI andaki konumunu önceden değerlendir (botlar uyarı çizgilerini "görür")
  const futureThreat = (x, z) => { let d = 0; for (const h of LT.lasers) { const ta = Math.max(0, h.w - h.t) + .05; if (ta > 1.8) continue; if (h.hit(x, z, 0, ta)) d += h.hit(x, z, .8, ta) ? 12 : (LT.ai.jump > 0 ? 1.2 : 8); } return d; };
  const ltMsg = (txt, col) => { const m = el.querySelector('#ltmsg'); if (!m) return; m.textContent = txt; m.style.color = col || '#fff'; m.style.opacity = 1; clearTimeout(LT.msgT); LT.msgT = setTimeout(() => { m.style.opacity = 0; }, 1500); };

  const spawnWave = () => {
    const R = LT.arenaR, el_ = LT.elapsed, lvl = Math.min(1, el_ / 70), d = LT.diff;
    const kind = Math.random() < .5 ? 'low' : 'full', pick = Math.random();
    const spd = (.95 + Math.random() * .5 + lvl * .6 + d * .15) * (Math.random() < .5 ? 1 : -1);
    const gap = (min, w) => { const g0 = -R * .6 + Math.random() * R * 1.2; return [[-R - 1, g0 - w / 2], [g0 + w / 2, R + 1]]; };
    const add = h => LT.lasers.push(h);
    const spinning = LT.lasers.some(h => h.type === 'spin');
    if (pick < .28 && !spinning) {
      add(mkSpin('low', d > 0 && lvl > .4 ? 3 : 2, Math.random() * 6.28, spd * .85, 1.3, 5.5));
      ltMsg('⚡ Dönen lazer — ZIPLA!', '#fbbf24');
    } else if (pick < .6) {
      const phi = Math.random() * 3.1416, v = (kind === 'low' ? 5.5 : 3.4) + lvl * (kind === 'low' ? 2.5 : 1.6) + d * .5, from = Math.random() < .5 ? -1 : 1;
      add(mkLine(kind, phi, from * (R - .5), -from * v, kind === 'low' ? [[-R - 1, R + 1]] : gap(0, 7.4 - lvl * 1.6 - d * .6), 1.2, (2 * R - 1) / v));
      ltMsg(kind === 'low' ? '⚡ Süpürme — ZIPLA!' : '⚠ Süpürme duvarı — boşluğu bul!', kind === 'low' ? '#fbbf24' : '#f87171');
    } else if (pick < .82) {
      const phi = Math.random() * 3.1416, n = 2 + (lvl > .5 ? 1 : 0), base = (Math.random() - .5) * 4;
      for (let k = 0; k < n; k++) add(mkLine(kind, phi + k * 1.047 * (n === 2 ? 1.5 : 1), base * (k ? .4 : 1), 0, kind === 'low' ? [[-R - 1, R + 1]] : gap(0, 6.5), 1.3, 1.1));
      ltMsg(kind === 'low' ? '⚡ Lazer çizgileri — ZIPLA!' : '⚠ Lazer çizgileri — boşluğa gir!', kind === 'low' ? '#fbbf24' : '#f87171');
    } else {
      const n = 2 + (lvl > .35 ? 1 : 0), v = 7 + lvl * 3 + d;
      for (let k = 0; k < n; k++) add(mkRing(1.1 + k * .6, v));
      ltMsg('🌊 Şok dalgası — ZIPLA!', '#22d3ee');
    }
  };

  const spawnLaserBots = () => {
    LT.bots = [];
    for (let i = 0; i < 5; i++) {
      const ang = i / 5 * 6.2832 + Math.random() * .25, r = 5 + Math.random() * 6;
      const o = defOutfit(1000 + i * 17); o.hat = [4, 9, 13, 18, 22][i % 5]; o.top = (i * 3) % 30; o.suit = [0, 1, 0, 10, 0][i % 5]; o.gender = i % 2; o.hair = o.gender ? 10 + (i % 4) : o.hair; o.botT = o.gender ? i % 2 : 0;
      const g = buildChar(o); scene.add(g);
      const lab = document.createElement('div'); lab.className = 'nm'; lab.textContent = ['Neon', 'Dash', 'Laser', 'Pixel', 'Glow'][i] + ' 🤖'; el.appendChild(lab);
      LT.bots.push({ id: 'ltbot' + i, g, lab, x: Math.cos(ang) * r, z: Math.sin(ang) * r, y: 0, vy: 0, ry: 0, vx: 0, vz: 0, alive: true, jumpT: 0, thinkT: 0, targetA: ang });
    }
  };

  const startLaserTracer = (mode) => {
    if (LT.active || PK.active) return;
    clearLaser(); clearParkour();
    const friendIds = [];
    if (mode === 'friends') {
      for (const [id] of players) if (id !== me) friendIds.push(id);
      if (!friendIds.length) { toast('Arenada başka kimse yok. Önce arkadaşların 3D Dünya\'ya girsin veya Botlarla oyna.'); return; }
    }
    LT.diff = w.diff;
    LT.ai = [{ react: .5, speed: 4.2, jump: .55, err: 1 }, { react: .25, speed: 4.9, jump: .85, err: .35 }, { react: .1, speed: 5.6, jump: 1, err: .05 }][w.diff];
    LT.active = true; LT.mode = mode || 'bots'; LT.phase = 'countdown'; LT.t = 3.4; LT.elapsed = 0; LT.nextT = 1.5; LT.speedMul = 1; LT.friendIds = friendIds;
    enterArena(); PA.add(LT.group); buildLaserArena();
    if (mode === 'bots') { spawnLaserBots(); LT.total = 6; LT.alive = 6; }
    else {
      LT.bots = []; LT.total = 1 + friendIds.length; LT.alive = LT.total; let fi = 0;
      for (const id of friendIds) { const p = players.get(id); if (!p) continue; const ang = fi / Math.max(1, friendIds.length) * 6.2832, r = 5 + (fi % 3) * 2.5; p.x = p.tx = Math.cos(ang) * r; p.z = p.tz = Math.sin(ang) * r; p.y = 0; p.vy = 0; p.room = 2; p.dead = false; fi++; }
    }
    myP.x = myP.tx = 0; myP.z = myP.tz = 7; myP.y = 0; myP.vy = 0; myP.dead = false;
    if (myP.seat >= 0) stand();
    w.goto = null; w.yaw = 0; w.pitch = .5; w.dist = 9;
    sfx('join'); scene.background = new T.Color('#070914'); scene.fog = new T.Fog('#070914', 30, 80);
    const ui = el.querySelector('#wpk'); ui.style.display = '';
    ui.innerHTML = `<div class="pkt" style="min-width:230px;justify-content:center"><b>🌀 LASER TRACER</b><span style="opacity:.7;font-size:12px;margin-left:8px">${mode === 'bots' ? 'Botlarla' : 'Arkadaşlarla'} · ${DIFFN[w.diff]}</span></div>
      <div id="ltcd" style="font-size:52px;font-weight:900;text-align:center;margin:12px 0 4px;text-shadow:0 0 24px #a855f7">3</div>
      <div id="ltmsg" style="text-align:center;font-weight:800;font-size:15px;min-height:22px;transition:opacity .3s;opacity:0"></div>
      <div id="ltalive" style="text-align:center;opacity:.9;font-size:15px;margin-top:4px">Hayatta: <b>${LT.alive}</b> / ${LT.total} · <span id="ltt">0.0</span> sn</div>
      <div style="text-align:center;font-size:11px;opacity:.65;margin-top:4px"><span style="color:#fbbf24">■</span> sarı = zıpla &nbsp; <span style="color:#ef4444">■</span> kırmızı = boşluktan geç</div>
      <button id="pkquit" style="margin-top:10px">Çık ✕</button>`;
    ui.querySelector('#pkquit').onclick = () => { clearLaser(); if (myP.room === 2) leaveArena(); toast('Laser Tracer iptal'); };
  };

  const openLaserChoice = () => {
    if (PK.active || LT.active || HD.active) return;
    const ui = el.querySelector('#wpk'); ui.style.display = '';
    const others = [...players.keys()].filter(id => id !== me).length;
    ui.innerHTML = `<div class="pkmenu"><h3>🌀 Laser Tracer</h3>
      <p style="margin:0 0 10px;opacity:.8;font-size:13px;text-align:center;line-height:1.5">Lazerler dalga dalga gelir ve her biri önce <b>zeminde uyarı çizgisi</b> gösterir.<br><span style="color:#fbbf24">Sarı lazer</span> alçak → üstünden zıpla. <span style="color:#f87171">Kırmızı duvar</span> → boşluğundan geç. Son kalan kazanır.<br><b>Zorluk: ${DIFFN[w.diff]}</b> (${DIFFM[w.diff]} 💰) — menüden değiştir</p>
      <button class="pkbtn" id="ltbots" style="border-color:#f97316"><span>🤖 Botlarla Oyna</span><small>5 bot + sen · 6 kişilik maç</small></button>
      <button class="pkbtn" id="ltfriends" style="border-color:#22c55e"><span>👥 Arkadaşlarla Oyna</span><small>${others > 0 ? others + ' arkadaş 3D Dünya\'da · gerçek multi' : 'Önce arkadaşların 3D Dünya\'ya girsin'}</small></button>
      <button id="pkclose" class="pkclose">← Geri</button></div>`;
    ui.querySelector('#ltbots').onclick = () => { ui.style.display = 'none'; startLaserTracer('bots'); };
    ui.querySelector('#ltfriends').onclick = () => { if (!others) { toast('Arenada başka oyuncu yok. Arkadaşların 3D Dünya\'ya girsin.'); return; } ui.style.display = 'none'; startLaserTracer('friends'); };
    ui.querySelector('#pkclose').onclick = () => openParkourMenu();
  };

  const eliminatePlayer = (isMe, bot) => {
    if (isMe) {
      if (myP.dead) return; myP.dead = true; LT.alive = Math.max(0, LT.alive - 1); sfx('leave');
      fxBurst(myP.x, myP.y + .9, myP.z, '#f43f5e', 18, 4.5, 3.8, 9, .85);
      const cd = el.querySelector('#ltcd'); if (cd) { cd.style.display = ''; cd.textContent = 'ELENDİN!'; cd.style.color = '#ef4444'; cd.style.fontSize = '30px'; }
    } else if (bot && bot.alive) {
      bot.alive = false; LT.alive = Math.max(0, LT.alive - 1); if (bot.g) bot.g.visible = false; if (bot.lab) bot.lab.style.display = 'none';
      fxBurst(bot.x, bot.y + .8, bot.z, '#a855f7', 12, 3.2, 2.8, 8, .65);
    }
    updateLaserUI();
  };
  const updateLaserUI = () => { const al = el.querySelector('#ltalive'); if (al) al.innerHTML = `Hayatta: <b>${LT.alive}</b> / ${LT.total} · <span id="ltt">${(LT.elapsed || 0).toFixed(1)}</span> sn`; };

  const updateLaserTracer = (dt) => {
    if (!LT.active) return;
    if (LT.phase === 'countdown') {
      LT.t -= dt; const n = Math.ceil(LT.t), cd = el.querySelector('#ltcd');
      if (cd) { if (n > 0) { cd.textContent = String(n); cd.style.color = n === 1 ? '#ef4444' : '#fff'; cd.style.fontSize = '52px'; } else { cd.textContent = 'KAÇ!'; cd.style.color = '#22c55e'; cd.style.fontSize = '40px'; } }
      if (LT.t <= 0) { LT.phase = 'play'; sfx('join'); if (cd) setTimeout(() => { if (cd && LT.phase === 'play') cd.style.display = 'none'; }, 650); }
    }
    if (LT.hub) LT.hub.material.emissiveIntensity = .7 + Math.sin(performance.now() / 300) * .25;
    // dalga zamanlayıcı: zamanla daha sık ve daha zor
    if (LT.phase === 'play') {
      LT.elapsed += dt; LT.nextT -= dt;
      if (LT.nextT <= 0) {
        const lvl = Math.min(1, LT.elapsed / 70); spawnWave();
        if (lvl > .55 && Math.random() < .5 && LT.lasers.length < 6) spawnWave();
        LT.nextT = Math.max(1.7, 4.2 - lvl * 2.2 - LT.diff * .35) + Math.random() * .8;
      }
      const tt = el.querySelector('#ltt'); if (tt) tt.textContent = LT.elapsed.toFixed(1);
    }
    LT.lasers = LT.lasers.filter(h => { const ok = h.update(dt); if (!ok) h.dispose(); return ok; });
    if (LT.phase !== 'play') return;

    if (!myP.dead && hitLaser(myP.x, myP.y, myP.z)) eliminatePlayer(true);
    if (!myP.dead) { const d = Math.hypot(myP.x, myP.z); if (d > LT.arenaR - .45) { const s = (LT.arenaR - .45) / d; myP.x *= s; myP.z *= s; myP.tx = myP.x; myP.tz = myP.z; } }

    for (const b of LT.bots) {
      if (!b.alive) continue;
      b.thinkT -= dt; b.jumpT = Math.max(0, b.jumpT - dt); const AI = LT.ai;
      if (b.thinkT <= 0) {
        b.thinkT = AI.react * (.75 + Math.random() * .5);
        let bestA = b.targetA || 0, best = -1e9; const cur = b.targetA || 0, TT = [.12, .3, .55];
        for (let k = 0; k < 16; k++) {
          const a = k / 16 * 6.2832 + (Math.random() - .5) * .2; let danger = 0;
          TT.forEach(tt => { const dd = AI.speed * tt, nx = b.x + Math.cos(a) * dd, nz = b.z + Math.sin(a) * dd, th = threatAt(nx, nz, tt); if (th === 2) danger += 16 / (1 + tt * 2); else if (th === 1) danger += AI.jump > 0 ? 1.5 : 9; if (Math.hypot(nx, nz) > LT.arenaR - 1) danger += 6; });
          { const fx = b.x + Math.cos(a) * AI.speed * .8, fz = b.z + Math.sin(a) * AI.speed * .8; danger += futureThreat(fx, fz) * 1.0 + futureThreat(b.x + Math.cos(a) * AI.speed * .35, b.z + Math.sin(a) * AI.speed * .35) * .8; }
          for (const h of LT.lasers) if (h.type === 'line' && h.gapC != null && h.t < h.w + h.dur) {
            const dn = Math.abs(b.x * h.nx + b.z * h.nz - h.sAt(h.t)); if (dn > 11) continue;
            const ue = (b.x + Math.cos(a) * AI.speed * .8) * h.dx + (b.z + Math.sin(a) * AI.speed * .8) * h.dz;
            danger += Math.max(0, Math.abs(ue - h.gapC) - h.gapW / 2 + .6) * .9 * (1 - dn / 12);
          }
          let da = Math.abs(a - cur) % 6.2832; if (da > 3.1416) da = 6.2832 - da; danger += da * .25 + Math.hypot(b.x + Math.cos(a) * 2, b.z + Math.sin(a) * 2) * .06;
          const sc = -danger + (Math.random() - .5) * 8 * AI.err; if (sc > best) { best = sc; bestA = a; }
        }
        b.targetA = bestA;
      }
      b.luckT = (b.luckT || 0) - dt; if (b.luckT <= 0) { b.jumpOK = Math.random() < AI.jump; b.luckT = .8; }
      if (b.jumpOK && b.y <= .05 && b.jumpT <= 0) { let soon = false; [.06, .14, .22, .3].forEach(tt => { if (threatAt(b.x + Math.cos(b.targetA || 0) * AI.speed * tt, b.z + Math.sin(b.targetA || 0) * AI.speed * tt, tt) === 1) soon = true; }); if (soon) b.jumpT = .05; }
      b.vx = Math.cos(b.targetA || 0) * AI.speed; b.vz = Math.sin(b.targetA || 0) * AI.speed; b.x += b.vx * dt; b.z += b.vz * dt; b.ry = Math.atan2(b.vx, b.vz);
      if (b.jumpT > 0 && b.y <= .05) { b.vy = 7; b.jumpT = 0; }
      b.vy -= 24 * dt; b.y += b.vy * dt; if (b.y < 0) { b.y = 0; b.vy = 0; }
      const dist = Math.hypot(b.x, b.z); if (dist > LT.arenaR - .55) { const s = (LT.arenaR - .55) / dist; b.x *= s; b.z *= s; }
      if (b.g) { b.g.position.set(b.x, b.y, b.z); b.g.rotation.y = b.ry; b.g.visible = true; }
      if (b.lab) { const v = new T.Vector3(b.x, b.y + 1.9, b.z).project(cam), sx = (v.x * .5 + .5) * el.clientWidth, sy = (-v.y * .5 + .5) * el.clientHeight; b.lab.style.transform = `translate(${sx}px,${sy}px)`; b.lab.style.display = (v.z < 1 && sx > -40 && sy > -20 && sx < el.clientWidth + 40) ? '' : 'none'; }
      if (hitLaser(b.x, b.y, b.z)) eliminatePlayer(false, b);
    }

    if (LT.mode === 'friends') {
      for (const id of LT.friendIds) { const p = players.get(id); if (!p || p.dead || p.room !== 2) continue; if (hitLaser(p.x, p.y || 0, p.z)) { p.dead = true; fxBurst(p.x, (p.y || 0) + .9, p.z, '#f97316', 10, 3, 2.5, 8, .6); } }
      LT.alive = (myP.dead ? 0 : 1) + LT.friendIds.filter(id => { const p = players.get(id); return p && !p.dead && p.room === 2; }).length; updateLaserUI();
    }

    const botsAlive = LT.bots.filter(b => b.alive).length, meAlive = myP.dead ? 0 : 1;
    if (LT.mode === 'bots') { LT.alive = botsAlive + meAlive; updateLaserUI(); }
    const ui = el.querySelector('#wpk'), quit = () => { clearLaser(); if (myP.room === 2) leaveArena(); };
    if (meAlive && ((LT.mode === 'bots' && botsAlive === 0) || (LT.mode === 'friends' && LT.alive === 1))) {
      LT.phase = 'victory'; sfx('clap'); gameEnd('laser', true);
      if (ui) { ui.innerHTML = `<div style="text-align:center;padding:16px 10px"><div style="font-size:44px;font-weight:900;color:#22c55e;text-shadow:0 0 28px #22c55e;margin-bottom:8px">VICTORY!</div><div style="opacity:.9;margin-bottom:14px;font-size:15px">Son hayatta kalan sensin 🏆 · ${LT.elapsed.toFixed(1)} sn</div><button id="pkquit">Harika!</button></div>`; ui.querySelector('#pkquit').onclick = quit; }
    } else if (!meAlive && (LT.mode === 'bots' || LT.alive <= 0)) {
      LT.phase = 'eliminated'; gameEnd('laser', false, 0, LT.mode === 'bots' ? 'Lazerlere yakalandın' : 'Herkes elendi');
      if (ui) { ui.innerHTML = `<div style="text-align:center;padding:14px"><div style="font-size:30px;font-weight:800;color:#ef4444">ELENDİN</div><div style="opacity:.8;margin:10px 0">${LT.elapsed.toFixed(1)} sn dayandın</div><button id="pkquit">Çık</button></div>`; ui.querySelector('#pkquit').onclick = quit; }
    }
  };


  /* ---------- Honey Drop build & game ---------- */
  const hexPos = (q, r, size) => {
    const x = size * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r);
    const z = size * (1.5 * r);
    return { x, z };
  };

  const makeHexGeo = (radius, height) => {
    // flat-top hex prism
    return new T.CylinderGeometry(radius, radius, height, 6);
  };

  const buildHoneyArena = () => {
    const G = HD.group, size = HD.hexR;
    G.add(new T.HemisphereLight('#bde7ff', '#f59e0b', .85));
    const sun = new T.DirectionalLight('#fff7ed', 1.1); sun.position.set(12, 40, 8); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, far: 90 }); G.add(sun); G.add(new T.AmbientLight('#fef3c7', .35));
    for (let i = 0; i < 12; i++) { const c = new T.Mesh(new T.SphereGeometry(2.5 + Math.random() * 3, 8, 6), new T.MeshBasicMaterial({ color: '#fff', transparent: true, opacity: .55 })); c.position.set((Math.random() - .5) * 90, 14 + Math.random() * 14, -28 - Math.random() * 40); c.scale.y = .35; G.add(c); }
    // bal denizi (düşersen buraya)
    const sea = new T.Mesh(new T.CircleGeometry(120, 48), new T.MeshStandardMaterial({ color: '#b45309', emissive: '#f59e0b', emissiveIntensity: .5, roughness: .35 })); sea.rotation.x = -Math.PI / 2; sea.position.y = -HD.floors * HD.floorH - 5; G.add(sea);
    // uçuşan arılar / bal kabarcıkları
    { const N = 90, pp = new Float32Array(N * 3); for (let i = 0; i < N; i++) { pp[i * 3] = (Math.random() - .5) * 46; pp[i * 3 + 1] = 3 - Math.random() * HD.floors * HD.floorH; pp[i * 3 + 2] = (Math.random() - .5) * 46; }
      const pg = new T.BufferGeometry(); pg.setAttribute('position', new T.BufferAttribute(pp, 3)); G.add(new T.Points(pg, new T.PointsMaterial({ color: '#fde68a', size: .22, transparent: true, opacity: .8 }))); }
    HD.tiles = [];
    const rings = [7, 6, 5], pal = [['#fbbf24', '#fcd34d'], ['#fb923c', '#fdba74'], ['#f472b6', '#f9a8d4']], keep = [1, .9, .84], h = .42;
    const geo = new T.CylinderGeometry(size * .95, size * .95, h, 6), edge = new T.EdgesGeometry(geo), edgeMat = new T.LineBasicMaterial({ color: '#fffbe0', transparent: true, opacity: .7 });
    for (let fl = 0; fl < HD.floors; fl++) {
      const y = -fl * HD.floorH, N = rings[fl];
      for (let q = -N; q <= N; q++) for (let r = -N; r <= N; r++) {
        if (Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r)) > N) continue;
        if (fl > 0 && Math.random() > keep[fl] && (q || r)) continue;
        const x = size * 1.04 * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r), z = size * 1.04 * 1.5 * r;
        const col = new T.Color((q + r) % 2 ? pal[fl][0] : pal[fl][1]);
        const mat = new T.MeshStandardMaterial({ color: col, roughness: .3, metalness: .25, emissive: col, emissiveIntensity: .12 });
        const mesh = new T.Mesh(geo, mat); mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; mesh.add(new T.LineSegments(edge, edgeMat)); G.add(mesh);
        HD.tiles.push({ mesh, q, r, floor: fl, x, z, y, top: y + h / 2, state: 'solid', timer: 0, vy: 0, steppedBy: null, base: col.clone() });
      }
    }
  };

  const spawnHoneyBots = () => {
    HD.bots = [];
    for (let i = 0; i < 5; i++) {
      const ang = (i / 5) * Math.PI * 2 + Math.random() * 0.2;
      const rad = 1.2 + Math.random() * 4;
      const o = defOutfit(2000 + i * 13); o.gender = i % 2; if (o.gender) { o.hair = 10 + (i % 4); o.botT = 1; }
      o.hat = [3, 17, 11, 25, 19][i % 5]; o.top = (i * 5) % 30; o.suit = [5, 0, 0, 4, 0][i % 5];
      const g = buildChar(o);
      scene.add(g);
      const lab = document.createElement('div');
      lab.className = 'nm';
      lab.textContent = ['Honey', 'Bee', 'Buzz', 'Nectar', 'Comb'][i % 5] + ' 🤖';
      el.appendChild(lab);
      HD.bots.push({
        id: 'hdbot' + i, g, lab,
        x: Math.cos(ang) * rad, z: Math.sin(ang) * rad, y: 0.3, vy: 0,
        ry: Math.random() * 6.28, vx: 0, vz: 0,
        alive: true, jumpT: 0, thinkT: 0, targetA: ang, floor: 0,
      });
    }
  };

  const getHoneyFloorY = (x, z, fromY) => {
    // find highest solid tile under player within hex radius
    let best = -1e9, bestTile = null;
    const maxR = HD.hexR * 1.05;
    for (const t of HD.tiles) {
      if (t.state === 'gone' || t.state === 'falling') continue;
      if (t.top > fromY + 0.35) continue; // only below or at feet
      const d = Math.hypot(x - t.x, z - t.z);
      if (d < maxR && t.top >= best) {
        best = t.top;
        bestTile = t;
      }
    }
    return { y: best > -1e8 ? best : -1e9, tile: bestTile };
  };

  const stepOnHoneyTile = (tile, who) => {
    if (!tile || tile.state !== 'solid') return;
    tile.state = 'timer';
    tile.timer = HD.tm[0] + Math.random() * (HD.tm[1] - HD.tm[0]); tile.tt = tile.timer;
    tile.steppedBy = who;
    // visual feedback: darken slightly
    if (tile.mesh?.material) {
      tile.mesh.material.emissiveIntensity = 0.35;
      tile.mesh.material.color.set('#f59e0b'); tile.mesh.material.emissive.set('#ff3b1f');
    }
  };

  const startHoneyDrop = (mode) => {
    if (HD.active || LT.active || PK.active) return;
    clearHoney();
    clearLaser();
    clearParkour();

    const friendIds = [];
    if (mode === 'friends') {
      for (const [id, p] of players) {
        if (id !== me) friendIds.push(id);
      }
      if (!friendIds.length) {
        toast('Arenada başka kimse yok. Arkadaşların 3D Dünya\'ya girsin veya Botlarla oyna.');
        return;
      }
    }

    HD.floors = 3; HD.floorH = 6; HD.hexR = 1.1;
    HD.diff = w.diff; HD.tm = [[.95, 1.35], [.55, .9], [.32, .55]][w.diff]; HD.ai = [{ react: .5, look: 1.6, speed: 4.0, err: 1 }, { react: .28, look: 2.2, speed: 4.7, err: .4 }, { react: .12, look: 3, speed: 5.4, err: .08 }][w.diff];
    HD.active = true;
    HD.mode = mode || 'bots';
    HD.phase = 'countdown';
    HD.t = 3.4;
    HD.startT = performance.now();
    HD.friendIds = friendIds;

    enterArena();
    PA.add(HD.group);
    buildHoneyArena();

    if (mode === 'bots') {
      spawnHoneyBots();
      HD.total = 6; HD.alive = 6;
    } else {
      HD.bots = [];
      HD.total = 1 + friendIds.length;
      HD.alive = HD.total;
      let fi = 0;
      for (const id of friendIds) {
        const p = players.get(id);
        if (!p) continue;
        const ang = (fi / Math.max(1, friendIds.length)) * Math.PI * 2;
        const r = 2 + (fi % 3) * 1.8;
        p.x = p.tx = Math.cos(ang) * r;
        p.z = p.tz = Math.sin(ang) * r;
        p.y = 0.3; p.vy = 0; p.room = 2; p.dead = false;
        fi++;
      }
    }

    myP.x = myP.tx = 0; myP.z = myP.tz = 3; myP.y = 0.3; myP.vy = 0; myP.dead = false;
    if (myP.seat >= 0) stand();
    w.goto = null; w.yaw = 0; w.pitch = 0.45; w.dist = 8;
    sfx('join');
    scene.background = new T.Color('#38bdf8');
    scene.fog = new T.Fog('#7dd3fc', 40, 110);

    const ui = el.querySelector('#wpk');
    ui.style.display = '';
    ui.innerHTML = `<div class="pkt" style="min-width:240px;justify-content:center;background:linear-gradient(135deg,#f59e0b,#eab308)">
      <b>🍯 HONEY DROP</b>
      <span style="opacity:.85;font-size:12px;margin-left:8px">${mode === 'bots' ? 'Botlarla' : 'Arkadaşlarla'} · ${DIFFN[w.diff]}</span>
    </div>
    <div id="ltcd" style="font-size:52px;font-weight:900;text-align:center;margin:12px 0;color:#fff;text-shadow:0 0 20px #f59e0b">3</div>
    <div id="ltalive" style="text-align:center;opacity:.95">Hayatta: <b>${HD.alive}</b> / ${HD.total}</div>
    <div id="hdfloor" style="text-align:center;font-size:12px;opacity:.75;margin-top:4px">Kat: 1 / ${HD.floors}</div>
    <button id="pkquit" style="margin-top:10px">Çık ✕</button>`;
    ui.querySelector('#pkquit').onclick = () => {
      clearHoney();
      if (myP.room === 2) leaveArena();
      toast('Honey Drop iptal');
    };
  };

  const openHoneyChoice = () => {
    if (PK.active || LT.active || HD.active) return;
    const ui = el.querySelector('#wpk');
    ui.style.display = '';
    const others = [...players.keys()].filter(id => id !== me).length;
    ui.innerHTML = `<div class="pkmenu">
      <h3>🍯 Honey Drop</h3>
      <p style="margin:0 0 10px;opacity:.75;font-size:13px;text-align:center;line-height:1.45">
        Bastığın petek kızarıp düşer: durma, hareket et! Kırmızıya dönenlerden uzak dur.<br><b>Zorluk: ${DIFFN[w.diff]}</b> (${DIFFM[w.diff]} 💰) — menüden değiştir
      </p>
      <button class="pkbtn" id="hdbots" style="border-color:#f59e0b">
        <span>🤖 Botlarla Oyna</span>
        <small>5 bot + sen · 6 kişilik maç</small>
      </button>
      <button class="pkbtn" id="hdfriends" style="border-color:#22c55e">
        <span>👥 Arkadaşlarla Oyna</span>
        <small>${others > 0 ? others + " arkadaş 3D Dünya'da" : "Önce arkadaşların 3D Dünya'ya girsin"}</small>
      </button>
      <button id="pkclose" class="pkclose">← Geri</button>
    </div>`;
    ui.querySelector('#hdbots').onclick = () => { ui.style.display = 'none'; startHoneyDrop('bots'); };
    ui.querySelector('#hdfriends').onclick = () => {
      if (others === 0) {
        toast("Arenada başka oyuncu yok. Arkadaşların 3D Dünya'ya girsin.");
        return;
      }
      ui.style.display = 'none';
      startHoneyDrop('friends');
    };
    ui.querySelector('#pkclose').onclick = () => openParkourMenu();
  };

  const eliminateHoney = (isMe, bot) => {
    if (isMe) {
      if (myP.dead) return;
      myP.dead = true;
      HD.alive = Math.max(0, HD.alive - 1);
      sfx('leave');
      fxBurst(myP.x, myP.y + 0.5, myP.z, '#f59e0b', 20, 4, 3, 10, 0.9);
      const ui = el.querySelector('#wpk');
      if (ui) {
        const cd = ui.querySelector('#ltcd');
        if (cd) {
          cd.style.display = '';
          cd.textContent = 'ELENDİN!';
          cd.style.color = '#ef4444';
          cd.style.fontSize = '28px';
        }
      }
    } else if (bot && bot.alive) {
      bot.alive = false;
      HD.alive = Math.max(0, HD.alive - 1);
      if (bot.g) bot.g.visible = false;
      if (bot.lab) bot.lab.style.display = 'none';
      fxBurst(bot.x, bot.y + 0.5, bot.z, '#fbbf24', 12, 3, 2.5, 8, 0.6);
    }
    const al = el.querySelector('#ltalive');
    if (al) al.innerHTML = `Hayatta: <b>${HD.alive}</b> / ${HD.total}`;
  };

  const updateHoneyDrop = (dt) => {
    if (!HD.active) return;
    HD.t -= dt;

    if (HD.phase === 'countdown') {
      const n = Math.ceil(HD.t);
      const cd = el.querySelector('#ltcd');
      if (cd) {
        if (n > 0) { cd.textContent = String(n); cd.style.color = n === 1 ? '#ef4444' : '#fff'; }
        else { cd.textContent = 'GO!'; cd.style.color = '#22c55e'; cd.style.fontSize = '42px'; }
      }
      if (HD.t <= 0) {
        HD.phase = 'play';
        HD.startT = performance.now();
        sfx('join');
        if (cd) setTimeout(() => { if (cd && HD.phase === 'play') cd.style.display = 'none'; }, 600);
      }
    }

    // update tiles
    for (const t of HD.tiles) {
      if (t.state === 'timer') {
        t.timer -= dt;
        // pulse
        if (t.mesh) {
          const pulse = 0.9 + Math.sin(performance.now() * 0.02) * 0.08;
          t.mesh.scale.setScalar(pulse);
          if (t.mesh.material && t.tt) t.mesh.material.emissiveIntensity = .3 + (1 - Math.max(0, t.timer) / t.tt) * .9;
        }
        if (t.timer <= 0) {
          t.state = 'falling';
          t.vy = -0.5;
          if (t.mesh?.material) {
            t.mesh.material.transparent = true;
            t.mesh.material.opacity = 0.85;
          }
          fxBurst(t.x, t.top, t.z, '#fbbf24', 6, 1.5, 1.2, 6, 0.4);
        }
      } else if (t.state === 'falling') {
        t.vy -= 28 * dt;
        t.y += t.vy * dt;
        t.top = t.y + 0.21;
        if (t.mesh) {
          t.mesh.position.y = t.y;
          t.mesh.rotation.x += dt * 1.2;
          t.mesh.rotation.z += dt * 0.8;
          if (t.mesh.material) t.mesh.material.opacity = Math.max(0, (t.mesh.material.opacity || 1) - dt * 0.8);
        }
        if (t.y < -HD.floors * HD.floorH - 15) {
          t.state = 'gone';
          if (t.mesh) t.mesh.visible = false;
        }
      }
    }

    if (HD.phase !== 'play' && HD.phase !== 'countdown') return;

    // player physics override for honey floors
    if (!myP.dead) {
      const { y: floorY, tile } = getHoneyFloorY(myP.x, myP.z, myP.y + 0.2);
      const onGround = myP.y <= floorY + 0.12 && floorY > -1e8;
      if (onGround && myP.vy <= 0) {
        myP.y = floorY;
        myP.vy = 0;
        if (HD.phase === 'play' && tile) stepOnHoneyTile(tile, me);
      }
      // eliminate if fell below last floor
      const lastY = -(HD.floors - 1) * HD.floorH - 4;
      if (myP.y < lastY) eliminateHoney(true);

      // floor indicator
      const curFloor = Math.min(HD.floors, Math.max(1, Math.floor((-myP.y) / HD.floorH) + 1));
      const hf = el.querySelector('#hdfloor');
      if (hf) hf.textContent = `Kat: ${curFloor} / ${HD.floors}`;
    }

    // bots
    for (const b of HD.bots) {
      if (!b.alive) continue;
      b.thinkT -= dt;
      b.jumpT = Math.max(0, b.jumpT - dt);

      // gravity + floor
      const { y: floorY, tile } = getHoneyFloorY(b.x, b.z, b.y + 0.2);
      const onG = b.y <= floorY + 0.12 && floorY > -1e8;
      if (onG && b.vy <= 0) {
        b.y = floorY; b.vy = 0;
        if (HD.phase === 'play' && tile) stepOnHoneyTile(tile, b.id);
      } else {
        b.vy -= 26 * dt;
        b.y += b.vy * dt;
      }

      if (b.thinkT <= 0 && HD.phase === 'play') {
        const AI = HD.ai; b.thinkT = AI.react * (.7 + Math.random() * .6);
        let bestA = b.targetA ?? 0, bestScore = -1e9;
        const rate = (nx, nz, wgt) => {
          const { y: fy, tile: nt } = getHoneyFloorY(nx, nz, b.y + .35); if (fy < -1e8 || !nt) return -22 * wgt;
          let sc = 0; if (nt.state === 'solid') sc += 8; else if (nt.state === 'timer') sc += nt.timer > .35 ? 1 : -8; else sc -= 20;
          return (sc - Math.abs(fy - b.y) * .4) * wgt;
        };
        for (let k = 0; k < 16; k++) {
          const a = k / 16 * 6.283 + (Math.random() - .5) * .25;
          let sc = rate(b.x + Math.cos(a) * 1.0, b.z + Math.sin(a) * 1.0, 1) + rate(b.x + Math.cos(a) * AI.look, b.z + Math.sin(a) * AI.look, .7) + rate(b.x + Math.cos(a) * AI.look * 1.6, b.z + Math.sin(a) * AI.look * 1.6, .35);
          sc -= Math.hypot(b.x + Math.cos(a), b.z + Math.sin(a)) * .12;    // merkeze yakın kal
          sc += (Math.random() - .5) * 10 * AI.err;
          if (sc > bestScore) { bestScore = sc; bestA = a; }
        }
        b.targetA = bestA;
        if (Math.random() < .08 && onG) b.jumpT = .12;
      }
      const spd0 = (HD.ai ? HD.ai.speed : 4.6) * (HD.phase === 'play' ? 1 : 0);
      b.vx = Math.cos(b.targetA || 0) * spd0;
      b.vz = Math.sin(b.targetA || 0) * spd0;
      b.x += b.vx * dt; b.z += b.vz * dt;
      b.ry = Math.atan2(b.vx, b.vz);
      if (b.jumpT > 0 && onG) { b.vy = 7.2; b.jumpT = 0; }

      if (b.g) {
        b.g.position.set(b.x, b.y, b.z);
        b.g.rotation.y = b.ry;
        b.g.visible = true;
      }
      if (b.lab) {
        const v = new T.Vector3(b.x, b.y + 1.9, b.z).project(cam);
        const sx = (v.x * 0.5 + 0.5) * el.clientWidth;
        const sy = (-v.y * 0.5 + 0.5) * el.clientHeight;
        b.lab.style.transform = `translate(${sx}px,${sy}px)`;
        b.lab.style.display = (v.z < 1) ? '' : 'none';
      }

      const lastY = -(HD.floors - 1) * HD.floorH - 4;
      if (b.y < lastY) eliminateHoney(false, b);
    }

    // friends death by fall
    if (HD.mode === 'friends' && HD.phase === 'play') {
      for (const id of HD.friendIds) {
        const p = players.get(id);
        if (!p || p.dead) continue;
        const lastY = -(HD.floors - 1) * HD.floorH - 4;
        if ((p.y || 0) < lastY) {
          p.dead = true;
          fxBurst(p.x, (p.y || 0), p.z, '#f59e0b', 10, 3, 2, 8, 0.5);
        }
      }
      const aliveF = HD.friendIds.filter(id => {
        const p = players.get(id);
        return p && !p.dead;
      }).length;
      HD.alive = (myP.dead ? 0 : 1) + aliveF;
      const al = el.querySelector('#ltalive');
      if (al) al.innerHTML = `Hayatta: <b>${HD.alive}</b> / ${HD.total}`;
    }

    // win conditions
    if (HD.phase === 'play') {
      const botsAlive = HD.bots.filter(b => b.alive).length;
      const meAlive = myP.dead ? 0 : 1;
      if (HD.mode === 'bots') {
        HD.alive = botsAlive + meAlive;
        const al = el.querySelector('#ltalive');
        if (al) al.innerHTML = `Hayatta: <b>${HD.alive}</b> / ${HD.total}`;
      }

      if (meAlive && ((HD.mode === 'bots' && botsAlive === 0) || (HD.mode === 'friends' && HD.alive === 1))) {
        HD.phase = 'victory';
        sfx('clap'); gameEnd('honey', true);
        const ui = el.querySelector('#wpk');
        if (ui) {
          ui.innerHTML = `<div style="text-align:center;padding:16px 10px">
            <div style="font-size:42px;font-weight:900;color:#f59e0b;text-shadow:0 0 24px #fbbf24;margin-bottom:8px">VICTORY!</div>
            <div style="opacity:.9;margin-bottom:12px">Honey Drop şampiyonu 🍯🏆</div>
            <button id="pkquit" style="background:#f59e0b;border:0;color:#fff;padding:12px 22px;border-radius:12px;font-weight:700;cursor:pointer">Harika!</button>
            <button id="hdretry" style="margin-left:8px;background:#fff3;border:1px solid #fff5;color:#fff;padding:12px 18px;border-radius:12px;font-weight:600;cursor:pointer">Tekrar</button>
          </div>`;
          ui.querySelector('#pkquit').onclick = () => { clearHoney(); if (myP.room === 2) leaveArena(); };
          ui.querySelector('#hdretry').onclick = () => { clearHoney(); startHoneyDrop(HD.mode); };
        }
      } else if (!meAlive && (HD.mode === 'bots' || (HD.mode === 'friends' && HD.alive <= 0))) {
        HD.phase = 'eliminated'; gameEnd('honey', false, 0, 'Petekten düştün');
        const ui = el.querySelector('#wpk');
        if (ui) {
          ui.innerHTML = `<div style="text-align:center;padding:14px">
            <div style="font-size:28px;font-weight:800;color:#ef4444">ELENDİN</div>
            <div style="opacity:.8;margin:10px 0">Petekten düştün!</div>
            <button id="pkquit">Çık</button>
            <button id="hdretry" style="margin-left:8px">Tekrar</button>
          </div>`;
          ui.querySelector('#pkquit').onclick = () => { clearHoney(); if (myP.room === 2) leaveArena(); };
          ui.querySelector('#hdretry').onclick = () => { clearHoney(); startHoneyDrop(HD.mode); };
        }
      }
    }
  };

  /* ---------- KAZANMA EKRANI + LOBİYE IŞINLAMA ---------- */
  const confetti = () => {
    const box = el.querySelector('#wwin'); const cols = ['#fbbf24', '#f472b6', '#38bdf8', '#4ade80', '#a78bfa', '#fb7185', '#fff'];
    for (let i = 0; i < 70; i++) { const c = document.createElement('i'); c.className = 'confetti'; c.style.left = Math.random() * 100 + '%'; c.style.background = cols[i % cols.length]; c.style.animationDuration = (2.4 + Math.random() * 2.2) + 's'; c.style.animationDelay = (Math.random() * .8) + 's'; c.style.width = (6 + Math.random() * 8) + 'px'; c.style.borderRadius = i % 3 ? '2px' : '50%'; box.appendChild(c); setTimeout(() => c.remove(), 5500); }
  };
  const hideWinner = () => { clearInterval(w.winTimer); w.winTimer = 0; const b = el.querySelector('#wwin'); if (b) { b.style.display = 'none'; b.innerHTML = ''; } w.endLock = false; };
  const toLobby = () => {
    hideWinner(); w.frozen = false;
    clearHoney(); clearLaser(); clearRush(); clearParkour();
    if (myP.room === 2) leaveArena();
    myP.dead = false; PK.hitCool = 0; sfx('door'); toast('🏕️ Lobiye döndün!');
  };
  const showWinner = ({ title, sub, lose, reward }) => {
    const b = el.querySelector('#wwin'); w.endLock = true; clearInterval(w.winTimer); w.frozen = true;
    b.className = lose ? 'lose' : ''; b.style.display = 'flex';
    b.innerHTML = `<div class="wt">${title}</div><div class="ws">${sub || ''}</div><div class="wr" id="wwr">💰 hesaplanıyor…</div><div class="wc">Lobiye ışınlanıyorsun: <b id="wwn">5</b></div><div class="wrow"><button id="wwgo">Hemen git ➜</button></div>`;
    b.querySelector('#wwgo').onclick = toLobby;
    let n = 5; w.winTimer = setInterval(() => { n--; const e = b.querySelector('#wwn'); if (e) e.textContent = Math.max(0, n); if (n <= 0) toLobby(); }, 1000);
    Promise.resolve(reward).then(r => { const e = b.querySelector('#wwr'); if (r && r.ok) { S.me.coins = r.coins; updateCoinsUI(); if (e) e.textContent = `+${r.reward} 💰 kazandın!  (Toplam ${r.coins})`; } else if (e) e.textContent = ''; }).catch(() => { const e = b.querySelector('#wwr'); if (e) e.textContent = 'Ödül alınamadı'; });
    if (!lose) confetti();
  };
  w.diff = (() => { try { const v = +localStorage.getItem('vibra.diff'); return v >= 0 && v <= 2 ? v : 1; } catch { return 1; } })();
  const DIFFN = ['Kolay', 'Orta', 'Zor'], DIFFM = ['×0.6', '×1', '×1.6'];
  const gameEnd = (game, won, bonus = 0, sub = '') => {
    if (w.endLock) return;
    showWinner({ title: won ? 'WINNER!' : 'ELENDİN', lose: !won, sub: sub || VCAT.GAMES[game].name, reward: api('/api/game/reward', 'POST', { game, won, bonus, diff: w.diff }) });
    if (won) sfx('clap'); else sfx('hurt');
  };

  /* ---------- MİNİ OYUN MENÜSÜ ---------- */
  const openGameMenu = (tab = 'pk') => {
    if (PK.active || LT.active || HD.active || RU.active || w.endLock) return;
    const ui = el.querySelector('#wpk'); ui.style.display = '';
    const stars = i => '★'.repeat(Math.min(5, 1 + Math.floor(i * .6))) + '☆'.repeat(5 - Math.min(5, 1 + Math.floor(i * .6)));
    const pk = COURSES.map((c, i) => `<button class="pkbtn" data-i="${i}" style="border-color:${c.color}"><span>${c.name}<span class="tag" style="color:#fde68a">${stars(i)}</span></span><small>+${c.base} 💰 · ${c.plats.length} platform · ${c.coins.length} altın · ${c.hazards.length} tuzak</small></button>`).join('');
    const G = VCAT.GAMES;
    const gm = `<button class="pkbtn big" data-g="laser" style="border-color:#f97316"><span>⚡ Laser Tracer</span><small>Lazerlerden kaç, son hayatta kalan kazanır · Kazan: +${G.laser.win} 💰</small></button>
      <button class="pkbtn big" data-g="honey" style="border-color:#f59e0b"><span>🍯 Honey Drop</span><small>Petekler düşüyor, son kalan sen ol · Kazan: +${G.honey.win} 💰</small></button>
      <button class="pkbtn big" data-g="rush" style="border-color:#22c55e"><span>💰 Para Avı</span><small>45 sn altın topla, botları ve arkadaşlarını geç, dönen tuzaktan kaç · Kazan: +${G.rush.win} 💰</small></button>`;
    ui.innerHTML = `<div class="gmenu"><h3>📱 Yarışmalar · <span style="color:#fde68a">💰 ${(S.me && S.me.coins != null) ? S.me.coins : 100}</span></h3>
      <div class="gtabs"><button data-t="pk" class="${tab === 'pk' ? 'on' : ''}">🏃 Parkur (${COURSES.length})</button><button data-t="gm" class="${tab === 'gm' ? 'on' : ''}">🎮 Arena Oyunları (3)</button></div>
      ${tab === 'gm' ? `<div class="gdiff"><span>Zorluk:</span>${DIFFN.map((n, i) => `<button data-d="${i}" class="${w.diff === i ? 'on' : ''}">${n} <small>${DIFFM[i]} 💰</small></button>`).join('')}</div>` : ''}
      <div class="ggrid">${tab === 'pk' ? pk : gm}</div><button id="pkclose" class="pkclose" style="width:100%;margin-top:10px">Kapat</button></div>`;
    ui.querySelectorAll('[data-t]').forEach(b => b.onclick = () => openGameMenu(b.dataset.t));
    ui.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { w.diff = +b.dataset.d; try { localStorage.setItem('vibra.diff', w.diff); } catch {} openGameMenu('gm'); });
    ui.querySelectorAll('.pkbtn[data-i]').forEach(b => b.onclick = () => { ui.style.display = 'none'; startParkour(+b.dataset.i); });
    ui.querySelectorAll('.pkbtn[data-g]').forEach(b => b.onclick = () => { const g = b.dataset.g; if (g === 'laser') openLaserChoice(); else if (g === 'honey') openHoneyChoice(); else openRushChoice(); });
    ui.querySelector('#pkclose').onclick = () => { ui.style.display = 'none'; };
  };
  const openParkourMenu = () => openGameMenu('pk');
  const updateCoinsUI = () => {
    const c = (S.me && S.me.coins != null) ? S.me.coins : 100;
    const elc = el.querySelector('#wcoins'); if (elc) elc.textContent = `💰 ${c}`;
  };
  updateCoinsUI();

  /* ---------- PARA AVI: botlarla (yapay zekalı) veya arkadaşlarla (gerçek çok oyunculu) ---------- */
  const RUAI = [
    { name: 'Kolay', speed: 3.3, react: .7, avoid: .35, steal: 0, interval: .6, max: 14 },
    { name: 'Orta', speed: 4.2, react: .35, avoid: .8, steal: .5, interval: .45, max: 18 },
    { name: 'Zor', speed: 5.2, react: .14, avoid: 1, steal: 1, interval: .34, max: 22 },
  ];
  const BOTN = ['Altın', 'Cimri', 'Çılgın', 'Hızlı', 'Şanslı'];
  clearRush = () => {
    if (RU.active && RU.mode === 'friends') wsSend({ t: 'mg', g: 'rush', k: 'quit' });
    RU.active = false; RU.phase = 'idle'; RU.scores = new Map();
    disposeGroup(RU.group); if (RU.group.parent) RU.group.parent.remove(RU.group);
    RU.bots.forEach(b => { if (b.g) b.g.parent?.remove(b.g); if (b.lab) b.lab.remove(); }); RU.bots = []; RU.coins = [];
    const ui = el.querySelector('#wpk'); if (ui && !w.endLock) ui.style.display = 'none';
  };
  const openRushChoice = () => {
    if (PK.active || LT.active || HD.active || RU.active) return;
    const ui = el.querySelector('#wpk'); ui.style.display = '';
    const others = [...players.keys()].filter(id => id !== me).length;
    ui.innerHTML = `<div class="pkmenu"><h3>💰 Para Avı</h3>
      <p style="margin:0 0 8px;opacity:.75;font-size:13px;text-align:center;line-height:1.45">45 saniyede en çok altını topla. Mor altın = 5 puan. Ortadaki dönen çubuğa çarparsan 2 puan kaybedersin.<br><b>Zorluk: ${DIFFN[w.diff]}</b> (${DIFFM[w.diff]} 💰)</p>
      <button class="pkbtn" id="rubots" style="border-color:#22c55e"><span>🤖 Botlarla Oyna</span><small>5 yapay zekalı bot · zorluğa göre hız, tepki ve tuzaktan kaçma</small></button>
      <button class="pkbtn" id="rufr" style="border-color:#38bdf8"><span>👥 Arkadaşlarla Oyna</span><small>${others > 0 ? others + ' kişi 3D Dünya\'da · davet gider, 10 sn içinde katılırlar (+3 bot)' : 'Önce arkadaşların 3D Dünya\'ya girsin'}</small></button>
      <button id="pkclose" class="pkclose">← Geri</button></div>`;
    ui.querySelector('#rubots').onclick = () => { ui.style.display = 'none'; startRush('bots'); };
    ui.querySelector('#rufr').onclick = () => { if (!others) { toast('Arenada başka oyuncu yok. Arkadaşların ses kanalına + 3D Dünya\'ya girsin.'); return; } ui.style.display = 'none'; startRush('friends'); };
    ui.querySelector('#pkclose').onclick = () => openGameMenu('gm');
  };
  const mkRushBot = (i, x, z) => {
    const o = defOutfit(2000 + i * 31); o.hat = [4, 11, 6, 2, 21][i % 5]; o.top = (i * 5 + 2) % 30; o.suit = [0, 0, 1, 0, 3][i % 5];
    const g = buildChar(o); scene.add(g); const lab = document.createElement('div'); lab.className = 'nm'; lab.textContent = BOTN[i % 5] + ' 🤖'; el.appendChild(lab);
    return { g, lab, x, z, tx: x, tz: z, ry: 0, score: 0, tgt: null, thinkT: 0, stun: 0, walk: 0, name: BOTN[i % 5] + ' 🤖' };
  };
  // altın i: tohumdan deterministik (herkeste aynı yerde çıkar)
  const coinAt = (seed, i) => { const R = rngF(seed * 7919 + i * 104729); const a = R() * 6.283, r = 2 + R() * 16.5; return { x: Math.cos(a) * r, z: Math.sin(a) * r, v: R() < .12 ? 5 : 1 }; };
  const addRushCoin = i => {
    if (RU.coins.some(c => c.id === i) || RU.taken.has(i)) return; const c = coinAt(RU.seed, i), big = c.v > 1;
    const m = new T.Mesh(new T.CylinderGeometry(big ? .42 : .3, big ? .42 : .3, .08, 18), new T.MeshStandardMaterial({ color: big ? '#e879f9' : '#fbbf24', emissive: big ? '#c026d3' : '#f59e0b', emissiveIntensity: .9, metalness: .8, roughness: .25 })); m.rotation.x = Math.PI / 2;
    const gc = new T.Group(); gc.add(m); if (big) { const gl = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: '#e879f9', transparent: true, opacity: .7, depthWrite: false, blending: T.AdditiveBlending })); gl.scale.setScalar(1.8); gc.add(gl); }
    gc.position.set(c.x, .75, c.z); RU.group.add(gc); RU.coins.push({ id: i, g: gc, x: c.x, z: c.z, v: c.v, ph: i });
  };
  const takeRushCoin = id => { RU.taken.add(id); const k = RU.coins.findIndex(c => c.id === id); if (k < 0) return null; const c = RU.coins[k]; RU.group.remove(c.g); RU.coins.splice(k, 1); return c; };
  const startRush = (mode = 'bots', join) => {
    if (RU.active || PK.active || LT.active || HD.active) return;
    clearRush(); clearParkour(); clearLaser(); clearHoney(); hideWinner();
    RU.active = true; RU.mode = mode; RU.phase = 'countdown'; RU.left = 45; RU.score = 0; RU.hitCool = 0; RU.coins = []; RU.taken = new Set(); RU.scores = new Map(); RU.bots = []; RU.playT = 0; RU.nextCoin = 0; RU.sendT = 0; RU.stun = 0;
    RU.diff = join ? join.diff : w.diff; RU.ai = RUAI[RU.diff]; RU.seed = join ? join.seed : ((Math.random() * 1e6) | 0) + 1; RU.host = join ? join.host : me; RU.isHost = RU.host === me;
    RU.t = join ? Math.max(1, join.wait) : (mode === 'friends' ? 10 : 3.4);
    enterArena(); PA.add(RU.group);
    const G = RU.group;
    const flTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); x.fillStyle = '#10301c'; x.fillRect(0, 0, 256, 256); x.strokeStyle = '#1f6b3a'; x.lineWidth = 2; for (let i = 0; i <= 256; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 256); x.moveTo(0, i); x.lineTo(256, i); x.stroke(); } x.fillStyle = '#16422a'; for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) if ((i + j) % 2) x.fillRect(i * 32, j * 32, 32, 32); const t2 = new T.CanvasTexture(c); t2.wrapS = t2.wrapT = T.RepeatWrapping; t2.repeat.set(3, 3); return t2; })();
    G.add(mesh(new T.CylinderGeometry(20.5, 21, .6, 64), new T.MeshStandardMaterial({ map: flTex, roughness: .55, metalness: .25, emissive: '#06240f', emissiveIntensity: .35 }), 0, -.3, 0));
    const rim = new T.Mesh(new T.TorusGeometry(20.6, .22, 8, 80), new T.MeshBasicMaterial({ color: '#4ade80' })); rim.rotation.x = Math.PI / 2; rim.position.y = .05; G.add(rim);
    [7.7, 14].forEach((r, i) => { const rg = new T.Mesh(new T.RingGeometry(r - .15, r + .15, 64), new T.MeshBasicMaterial({ color: i ? '#fde047' : '#86efac', transparent: true, opacity: .35, side: T.DoubleSide })); rg.rotation.x = -Math.PI / 2; rg.position.y = .03; G.add(rg); });
    for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283, col = i % 2 ? '#4ade80' : '#fde047'; G.add(mesh(new T.CylinderGeometry(.35, .5, 3, 8), std('#334155', .5), Math.cos(a) * 21.5, 1.5, Math.sin(a) * 21.5)); const tp = new T.Mesh(new T.SphereGeometry(.38, 10, 8), new T.MeshBasicMaterial({ color: col })); tp.position.set(Math.cos(a) * 21.5, 3.2, Math.sin(a) * 21.5); G.add(tp); const pl = new T.PointLight(col, .9, 12); pl.position.set(Math.cos(a) * 20, 3.4, Math.sin(a) * 20); G.add(pl); }
    for (let i = 0; i < 20; i++) { const a = i / 20 * 6.283, r = 25 + (i % 3) * 5; const st = mesh(new T.BoxGeometry(2.6, 2 + (i % 4), 2.6), std('#1e293b', .6), Math.cos(a) * r, 1 + (i % 4) * .5, Math.sin(a) * r); G.add(st); const gl = new T.Mesh(new T.BoxGeometry(2.7, .12, 2.7), new T.MeshBasicMaterial({ color: ['#4ade80', '#fde047', '#38bdf8'][i % 3] })); gl.position.set(Math.cos(a) * r, 2 + (i % 4), Math.sin(a) * r); G.add(gl); }
    const bar = new T.Group(); bar.add(mesh(new T.BoxGeometry(13, .4, .4), std('#facc15', .4, { emissive: '#7a5a00', emissiveIntensity: .4 }), 0, 0, 0)); [-1, 1].forEach(sg => bar.add(mesh(new T.SphereGeometry(.5, 12, 10), std('#ef4444', .4, { emissive: '#7f1d1d', emissiveIntensity: .5 }), sg * 6.5, 0, 0)));
    const sh = new T.Mesh(new T.BoxGeometry(13, .02, 1.6), new T.MeshBasicMaterial({ color: '#ef4444', transparent: true, opacity: .22 })); sh.position.y = -.6; bar.add(sh);
    bar.position.y = .65; G.add(bar); G.add(mesh(new T.CylinderGeometry(.5, .6, .9, 12), std('#475569', .4), 0, .45, 0)); RU.bar = bar; RU.ang = 0;
    scene.background = new T.Color('#06140c'); scene.fog = new T.Fog('#06140c', 26, 90);
    aAmb.color.set('#9affb0'); aAmb.intensity = .6; aDir.intensity = .95;
    // botlar (yapay zeka)
    const nb = mode === 'friends' ? 3 : 5;
    if (!join || RU.isHost) for (let i = 0; i < nb; i++) { const a = i / nb * 6.283 + .5; RU.bots.push(mkRushBot(i, Math.cos(a) * 12, Math.sin(a) * 12)); }
    else for (let i = 0; i < nb; i++) RU.bots.push(mkRushBot(i, 0, 0));
    if (myP.seat >= 0) stand();
    const sa = mode === 'friends' ? ((me * 2.399) % 6.283) : 0; myP.x = myP.tx = Math.sin(sa) * 14; myP.z = myP.tz = Math.cos(sa) * 14; myP.y = 0; myP.vy = 0; myP.vx = myP.vz = 0; myP.dead = false;
    w.goto = null; w.yaw = sa; w.pitch = .5; w.dist = 8; w.frozen = true; w.camSnap = true; sfx('join');
    const ui = el.querySelector('#wpk'); ui.style.display = '';
    ui.innerHTML = `<div class="pkhud"><b>💰 Para Avı</b><span style="opacity:.8">${DIFFN[RU.diff]}${mode === 'friends' ? ' · 👥' : ''}</span><span id="rutime">45s</span><span class="cc" id="ruscore">💰 0</span><span class="cp" id="rurank">1. sıra</span><button id="pkquit">Çık ✕</button></div><div id="rucd" style="text-align:center;font-size:64px;font-weight:900;margin-top:20px;text-shadow:0 4px 20px #000"></div>`;
    ui.querySelector('#pkquit').onclick = () => { clearRush(); if (myP.room === 2) leaveArena(); toast('Para Avı iptal'); };
    if (mode === 'friends' && !join) { wsSend({ t: 'mg', g: 'rush', k: 'start', seed: RU.seed, diff: RU.diff, s: RU.t }); toast('👥 Arkadaşlarına davet gönderildi!'); }
  };
  const rushList = () => {
    const L = [{ n: 'Sen', s: RU.score, me: 1 }];
    for (const [id, sc] of RU.scores) L.push({ n: userName(id), s: sc, me: 0 });
    RU.bots.forEach(b => L.push({ n: b.name, s: b.score, me: 0 }));
    return L.sort((a, b) => b.s - a.s || b.me - a.me);
  };
  const rushRank = () => rushList().findIndex(x => x.me) + 1;
  const botThink = (b, i) => {
    const AI = RU.ai; b.thinkT = AI.react * (.8 + Math.random() * .5);
    // altın seç: değer/mesafe; zorda oyuncunun yakın olduğu altınları bırak
    let best = null, bs = -1e9;
    for (const c of RU.coins) {
      let d = Math.hypot(c.x - b.x, c.z - b.z), sc = c.v * 3 - d * .55 + (Math.random() - .5) * (1.2 - AI.steal);
      if (AI.steal > .4) { const dm = Math.hypot(c.x - myP.x, c.z - myP.z); if (dm < d * .6 && c.v < 5) sc -= 2.5 * AI.steal; }
      if (AI.avoid > .5) { const ca = Math.cos(RU.ang), sa = Math.sin(RU.ang), lx = c.x * ca - c.z * sa, lz = c.x * sa + c.z * ca; if (Math.abs(lx) < 6.9 && Math.abs(lz) < 1.4) sc -= 6; }
      if (sc > bs) { bs = sc; best = c; }
    }
    b.tgt = best;
  };
  const botMove = (b, i, dt) => {
    const AI = RU.ai;
    if (b.stun > 0) { b.stun -= dt; b.walk = 0; b.x += (b.kx || 0) * dt; b.z += (b.kz || 0) * dt; b.kx *= .9; b.kz *= .9; return; }
    b.thinkT -= dt; if (b.thinkT <= 0 || !b.tgt || !RU.coins.includes(b.tgt)) botThink(b, i);
    let dx = 0, dz = 0;
    if (b.tgt) { dx = b.tgt.x - b.x; dz = b.tgt.z - b.z; const d = Math.hypot(dx, dz) || 1; dx /= d; dz /= d; }
    // dönen çubuktan kaçış: .35 sn sonraki çubuk konumunu tahmin et
    if (AI.avoid > 0) {
      const la = RU.ang + 1.5 * .4 * AI.avoid, ca = Math.cos(la), sa = Math.sin(la), nx = b.x + dx * AI.speed * .4, nz = b.z + dz * AI.speed * .4, lx = nx * ca - nz * sa, lz = nx * sa + nz * ca;
      if (Math.abs(lx) < 7 && Math.abs(lz) < 1.5) { const k = lz >= 0 ? 1 : -1; dx = -sa * k * 1 * 0 + (k * sa); dz = k * ca; const ll = Math.hypot(dx, dz) || 1; dx /= ll; dz /= ll; if (Math.hypot(b.x, b.z) < 1.5) { dx = Math.cos(b.ry); dz = Math.sin(b.ry); } }
    }
    if (dx || dz) { b.x += dx * AI.speed * dt; b.z += dz * AI.speed * dt; b.ry = Math.atan2(dx, dz); b.walk = 1; } else b.walk = 0;
    if (b.tgt && Math.hypot(b.tgt.x - b.x, b.tgt.z - b.z) < .9) {
      const c = b.tgt; b.score += c.v; takeRushCoin(c.id); b.tgt = null;
      if (RU.mode === 'friends') wsSend({ t: 'mg', g: 'rush', k: 'bgot', c: [c.id, i, b.score] });
    }
    { const ca = Math.cos(RU.ang), sa = Math.sin(RU.ang), lx = b.x * ca - b.z * sa, lz = b.x * sa + b.z * ca;
      if (Math.abs(lx) < 6.7 && Math.abs(lz) < .8) { b.stun = .8; b.score = Math.max(0, b.score - 2); const dx2 = -lx * sa * (RU.ang >= 0 ? 1 : 1), dz2 = -lx * ca, l = Math.hypot(dx2, dz2) || 1; b.kx = dx2 / l * 9; b.kz = dz2 / l * 9; fxBurst(b.x, 1, b.z, '#ef4444', 8, 2.5, 2.5, 8, .5); } }
  };
  const finishRush = () => {
    RU.phase = 'done'; w.frozen = true;
    if (RU.mode === 'friends') wsSend({ t: 'mg', g: 'rush', k: 'end', s: RU.score });
    const doEnd = () => {
      const L = rushList(), rank = L.findIndex(x => x.me) + 1, won = rank === 1;
      showWinner({ title: won ? 'WINNER!' : `${rank}. SIRADASIN`, lose: !won, sub: `Para Avı (${DIFFN[RU.diff]}) · Skorun: ${RU.score} 💰 · Lider: ${L[0].me ? 'Sen' : L[0].n} (${L[0].s})`, reward: api('/api/game/reward', 'POST', { game: 'rush', won, bonus: Math.min(60, RU.score * 2), diff: RU.diff }) });
      if (won) sfx('clap');
    };
    if (RU.mode === 'friends') setTimeout(doEnd, 1200); else doEnd();
  };
  const updateRush = (dt, t) => {
    if (!RU.active) return;
    const ui = el.querySelector('#wpk');
    RU.hitCool = Math.max(0, RU.hitCool - dt);
    if (RU.phase !== 'done') { RU.ang += dt * (1.3 + RU.diff * .35); RU.bar.rotation.y = RU.ang; }
    if (RU.phase === 'countdown') {
      RU.t -= dt; const n = Math.ceil(RU.t); const cd = ui.querySelector('#rucd');
      if (cd) cd.textContent = RU.mode === 'friends' && n > 3 ? `Arkadaşlar bekleniyor… ${n}` : (n > 0 ? n : 'BAŞLA!');
      if (cd && RU.mode === 'friends' && n > 3) cd.style.fontSize = '26px'; else if (cd) cd.style.fontSize = '64px';
      if (RU.t <= 0) { RU.phase = 'play'; w.frozen = false; sfx('clap'); setTimeout(() => { const c = ui.querySelector('#rucd'); if (c) c.textContent = ''; }, 700); }
    } else if (RU.phase === 'play') {
      RU.left -= dt; RU.playT += dt;
      const want = Math.floor(RU.playT / RU.ai.interval) + 1;
      while (RU.nextCoin < want) { if (RU.coins.length < RU.ai.max) addRushCoin(RU.nextCoin); RU.nextCoin++; }
      for (let i = RU.coins.length - 1; i >= 0; i--) { const c = RU.coins[i]; c.g.rotation.y += dt * 3.5; c.g.position.y = .75 + Math.sin(t * 3 + c.ph) * .12;
        if (myP.y < 1.2 && Math.hypot(myP.x - c.x, myP.z - c.z) < 1.0) { RU.score += c.v; const id = c.id; takeRushCoin(id); sfx('pop'); fxBurst(c.x, .8, c.z, c.v > 1 ? '#e879f9' : '#fde047', 6, 1.6, 2, 8, .5); if (RU.mode === 'friends') wsSend({ t: 'mg', g: 'rush', k: 'got', i: id, s: RU.score }); } }
      { const ca = Math.cos(RU.ang), sa = Math.sin(RU.ang), lx = myP.x * ca - myP.z * sa, lz = myP.x * sa + myP.z * ca;
        if (RU.hitCool <= 0 && Math.abs(lx) < 6.7 && Math.abs(lz) < .75 && myP.y < .75) { const dx = -lx * sa, dz = -lx * ca, l = Math.hypot(dx, dz) || 1; myP.vx = dx / l * 10; myP.vz = dz / l * 10; myP.vy = 5; PK.onGround = false; RU.hitCool = .8; RU.score = Math.max(0, RU.score - 2); PK.shake = .35; sfx('hit'); fxBurst(myP.x, 1, myP.z, '#ef4444', 10, 3, 3, 8, .5); if (RU.mode === 'friends') wsSend({ t: 'mg', g: 'rush', k: 'got', i: -1, s: RU.score }); } }
      // botlar: sadece ev sahibi simüle eder, diğerleri konumları alır
      if (RU.isHost) { RU.bots.forEach((b, i) => botMove(b, i, dt)); if (RU.mode === 'friends') { RU.sendT -= dt; if (RU.sendT <= 0) { RU.sendT = .1; wsSend({ t: 'mg', g: 'rush', k: 'bots', b: RU.bots.map(b => [b.x, b.z, b.ry, b.score, b.walk]) }); } } }
      else RU.bots.forEach(b => { b.x += (b.tx - b.x) * Math.min(1, dt * 12); b.z += (b.tz - b.z) * Math.min(1, dt * 12); });
      const tm = ui.querySelector('#rutime'); if (tm) tm.textContent = Math.max(0, Math.ceil(RU.left)) + 's';
      const sc = ui.querySelector('#ruscore'); if (sc) sc.textContent = '💰 ' + RU.score; const rk = ui.querySelector('#rurank'); if (rk) rk.textContent = rushRank() + '. sıra';
      if (RU.left <= 0) finishRush();
    }
    RU.bots.forEach((b, i) => { const dd = Math.hypot(b.x, b.z); if (dd > 19.5) { b.x *= 19.5 / dd; b.z *= 19.5 / dd; } b.g.position.set(b.x, 0, b.z); b.g.rotation.y = b.ry; poseChar(b.g, b.walk ? 1 : 0, t + i * 2, '', 9); tmp.set(b.x, 2.3, b.z).project(cam); b.lab.style.display = tmp.z < 1 ? '' : 'none'; b.lab.style.left = (tmp.x * .5 + .5) * innerWidth + 'px'; b.lab.style.top = (-tmp.y * .5 + .5) * innerHeight + 'px'; });
  };
  // ağdan gelen mini oyun mesajları
  w.onMg = d => {
    if (d.g !== 'rush') return;
    if (d.k === 'start') {
      if (RU.active || PK.active || LT.active || HD.active || w.endLock || myP.room === 2) return;
      const ui = el.querySelector('#wpk'); ui.style.display = ''; const who = userName(d.id);
      ui.innerHTML = `<div class="invite"><span>👥 <b>${esc(who)}</b> Para Avı başlattı (${DIFFN[d.diff | 0]})</span><button style="background:#fde047" id="rujoin">Katıl</button><button style="background:#ffffff33;color:#fff" id="runo">Hayır</button></div>`;
      const at = performance.now(), wait = d.s || 8;
      ui.querySelector('#rujoin').onclick = () => { ui.style.display = 'none'; const left = wait - (performance.now() - at) / 1000; if (left < 1.5) { toast('Oyun başlamak üzereydi, bir sonrakine katıl.'); return; } startRush('friends', { seed: d.seed, diff: d.diff | 0, host: d.id, wait: left }); };
      ui.querySelector('#runo').onclick = () => { ui.style.display = 'none'; };
      setTimeout(() => { if (ui.querySelector('#rujoin')) ui.style.display = 'none'; }, wait * 1000);
      sfx('join'); return;
    }
    if (!RU.active || RU.mode !== 'friends') return;
    if (d.k === 'got') { if (d.i >= 0) takeRushCoin(d.i); RU.scores.set(d.id, d.s); const c = RU.coins; if (d.i >= 0) { RU.taken.add(d.i); } }
    else if (d.k === 'bgot') { const [cid, bi, bs] = d.c || []; if (cid != null) takeRushCoin(cid); if (RU.bots[bi]) RU.bots[bi].score = bs; }
    else if (d.k === 'bots' && d.id === RU.host && !RU.isHost) (d.b || []).forEach((a, i) => { const b = RU.bots[i]; if (b) { b.tx = a[0]; b.tz = a[1]; b.ry = a[2]; b.score = a[3]; b.walk = a[4]; } });
    else if (d.k === 'end') RU.scores.set(d.id, d.s);
    else if (d.k === 'quit') { RU.scores.delete(d.id); }
  };

  /* ---------- PARKUR: bitiş, platformlar, çarpışma, tuzaklar ---------- */
  const checkParkourFinish = () => {
    if (!PK.active || !PK.fin || w.frozen) return;
    const d = Math.hypot(myP.x - PK.fin.x, myP.z - PK.fin.z);
    const lastTop = PK.plats[PK.plats.length - 1]?.top || 2;
    if (d < PK.fin.r && myP.y >= lastTop - .35 && myP.y < lastTop + 2.5) {
      const tsec = (performance.now() - PK.startT) / 1000, course = PK.course, cg = PK.coins, C = COURSES[course];
      PK.fin = null; PK.hitCool = 999; myP.vx = myP.vz = 0; PK.shake = .5; PK.fovPunch = 14;
      fxBurst(myP.x, myP.y + 1, myP.z, '#fbbf24', 40, 5, 6, 8, 1.1); fxBurst(myP.x, myP.y + 1, myP.z, '#f472b6', 30, 4, 5, 8, 1.1);
      sfx('clap');
      showWinner({ title: 'WINNER!', sub: `${C.name} · ⏱ ${tsec.toFixed(1)} sn · 💰 ${cg}/${PK.coinTotal} altın`, reward: api('/api/parkour/reward', 'POST', { course, time: tsec, coins: cg }) });
    }
  };

  const updatePlatforms = (t, dt) => {
    PK.standOn = -1;
    if (PK.sky) { PK.sky.position.copy(cam.position); PK.sky.rotation.y += dt * .004; }
    if (PK.seaTex) { PK.seaTex.offset.x += dt * .012; PK.seaTex.offset.y += dt * .007; }
    if (PK.pts) {
      const a = PK.pts.geometry.attributes.position, arr = a.array, cx = cam.position.x, cy = cam.position.y, cz = cam.position.z, v = PK.ptsV;
      for (let i = 0; i < arr.length; i += 3) {
        arr[i + 1] += v * dt + Math.sin(t + i) * .004; arr[i] += Math.sin(t * .6 + i) * dt * .25;
        if (arr[i] - cx > 35) arr[i] -= 70; else if (arr[i] - cx < -35) arr[i] += 70;
        if (arr[i + 2] - cz > 35) arr[i + 2] -= 70; else if (arr[i + 2] - cz < -35) arr[i + 2] += 70;
        if (arr[i + 1] - cy > 26) arr[i + 1] -= 34; else if (arr[i + 1] - cy < -12) arr[i + 1] += 34;
      }
      a.needsUpdate = true;
    }
    for (let i = 0; i < PK.plats.length; i++) {
      const p = PK.plats[i];
      p.prevX = p.x; p.prevY = p.y; p.prevZ = p.z;
      if (p.cs === 1) { p.ct -= dt; if (p.ct <= 0) { p.cs = 2; p.vy = 0; sfx('land'); } }
      else if (p.cs === 2) { p.vy -= 26 * dt; p.dy += p.vy * dt; if (p.dy < -.3) p.off = true; if (p.dy < -14) { p.cs = 3; p.ct = 3.2; p.mesh.visible = false; } }
      else if (p.cs === 3) { p.ct -= dt; if (p.ct <= 0) { p.cs = 0; p.dy = 0; p.vy = 0; p.off = false; p.mesh.visible = true; } }
      if (p.move) {
        const m = p.move, off = Math.sin(t * m.spd + m.ph) * m.amp;
        p.x = p.bx + (m.axis === 'x' ? off : 0); p.y = p.by + (m.axis === 'y' ? off : 0); p.z = p.bz + (m.axis === 'z' ? off : 0);
      } else { p.x = p.bx; p.y = p.by + p.dy; p.z = p.bz; }
      p.top = p.y + p.h / 2;
      if (p.tx) p.tx.offset.y -= dt * .6;
      if (p.mesh) { const jit = p.cs === 1 ? (Math.random() - .5) * .08 : 0; p.mesh.position.set(p.x + jit, p.y, p.z + jit); const sq = p.mesh.userData.sq || 0; if (sq > 0) { p.mesh.userData.sq = Math.max(0, sq - dt * 2.5); if (p.mesh.userData.pad) p.mesh.userData.pad.scale.y = 1 - sq * .8; } }
    }
    if (PK.finMesh && PK.plats.length) {
      const last = PK.plats[PK.plats.length - 1];
      PK.finMesh.position.set(PK.fin ? PK.fin.x : PK.finMesh.position.x, last.top + .25, PK.fin ? PK.fin.z : PK.finMesh.position.z);
      if (PK.fin) PK.fin.y = last.top;
    }
  };

  // Solid collision: floor + side walls (no pass-through)
  const rad = .32;
  const getFloorY = (x, z, y) => {
    let best = PK.active ? -99 : 0, bestI = -1;
    for (let i = 0; i < PK.plats.length; i++) {
      const p = PK.plats[i]; if (p.off) continue;
      if (Math.abs(x - p.x) <= p.w / 2 + rad * .35 && Math.abs(z - p.z) <= p.d / 2 + rad * .35) {
        if (p.top <= y + .45 + Math.max(0, -(myP.vy || 0)) * .07 && p.top >= best) { best = p.top; bestI = i; }
      }
    }
    if (bestI >= 0) PK.standOn = bestI;
    return best;
  };

  const resolvePlatCollision = (o) => {
    for (const p of PK.plats) {
      if (p.off) continue;
      const hw = p.w / 2 + rad, hd = p.d / 2 + rad;
      const dx = o.x - p.x, dz = o.z - p.z;
      if (Math.abs(dx) >= hw || Math.abs(dz) >= hd) continue;
      const top = p.top, bot = p.y - p.h / 2;
      if (o.y + 1.6 < bot || o.y > top + .12) continue;
      if (o.y >= top - .3) continue;   // ayaklar üst yüzeye yakınsa yan itme YOK (zıplarken/inerken yana kayma bugı)
      const wasOutX = Math.abs(PK.px - p.x) >= hw, wasOutZ = Math.abs(PK.pz - p.z) >= hd;   // geldiğin yönden it, yana kaydırma
      const px = hw - Math.abs(dx), pz = hd - Math.abs(dz);
      const pushX = (wasOutX && !wasOutZ) ? true : (wasOutZ && !wasOutX) ? false : px < pz;
      if (pushX) { o.x = p.x + Math.sign(dx || 1) * hw; o.vx = 0; } else { o.z = p.z + Math.sign(dz || 1) * hd; o.vz = 0; }
    }
  };

  const respawnPK = () => {
    const cp = PK.cp || COURSES[PK.course].start;
    myP.x = myP.tx = cp.x; myP.z = myP.tz = cp.z; myP.y = cp.y + .15; myP.vy = 0; myP.vx = myP.vz = 0; PK.onGround = false; PK.pvx = PK.pvz = 0; PK.hitCool = 1.8; PK.coyote = 0; PK.jumpBuf = 0;
    w.camSnap = true; PK.shake = .3; PK.fovPunch = 6; sfx('door'); fxBurst(cp.x, cp.y + .5, cp.z, '#7dd3fc', 16, 2.5, 3, 6, .6);
  };

  const parkourTick = (dt, t) => {
    if (!PK.active) return;
    PK.hitCool = Math.max(0, PK.hitCool - dt);
    if (PK.sea) PK.sea.material.emissiveIntensity = PK.seaEm * (.85 + Math.sin(t * 1.7) * .15);
    const si = (PK.standOn >= 0 && PK.onGround) ? PK.standOn : -1, sp = si >= 0 ? PK.plats[si] : null;
    if (sp) {
      if (sp.kind === 'crumble' && sp.cs === 0) { sp.cs = 1; sp.ct = .6; sfx('tile'); }
      if (sp.kind === 'bounce') { myP.vy = 13.4; PK.onGround = false; PK.standOn = -1; PK.coyote = 0; sp.mesh.userData.sq = 1; sfx('jump'); PK.fovPunch = Math.max(PK.fovPunch, 7); PK.stretch = .3; fxBurst(myP.x, sp.top + .1, myP.z, '#f472b6', 14, 2.2, 3, 6, .55); }
      if (sp.cp && !sp.reached) { sp.reached = true; PK.cpN++; PK.cp = { x: sp.bx + (sp.sx || 0), y: sp.top + .2, z: sp.bz }; if (sp.flag) sp.flag.material.color.set('#22c55e'); sfx('clap'); toast(`🚩 Kontrol noktası! (${PK.cpN}/${PK.cpTotal})`); const e = el.querySelector('#pkcp'); if (e) e.textContent = `🚩 ${PK.cpN}/${PK.cpTotal}`; fxBurst(sp.bx, sp.top + 1, sp.bz, '#4ade80', 18, 2.4, 3.5, 6, .7); }
    }
    for (const c of PK.coinList) {
      if (c.got) continue; c.g.rotation.y += dt * 3.2; c.g.position.y = c.y + Math.sin(t * 3 + c.x) * .1;
      if (Math.hypot(myP.x - c.x, myP.z - c.z) < .85 && myP.y > c.y - 2.0 && myP.y < c.y + .5) { c.got = true; c.g.visible = false; PK.coins++; sfx('pop'); fxBurst(c.x, c.y, c.z, '#fde047', 8, 1.8, 2.2, 8, .5); const e = el.querySelector('#pkcoins'); if (e) e.textContent = `💰 ${PK.coins}/${PK.coinTotal}`; }
    }
    for (const h of PK.hazards) {
      h.ang += h.spd * dt; h.bar.rotation.y = h.ang;
      if (PK.hitCool > 0 || w.frozen) continue;
      const rx = myP.x - h.x, rz = myP.z - h.z, ca = Math.cos(h.ang), sa = Math.sin(h.ang), lx = rx * ca - rz * sa, lz = rx * sa + rz * ca, by = h.y + .45;
      if (Math.abs(lx) < h.len / 2 + .35 && Math.abs(lz) < .62 && myP.y < by + .3 && myP.y + 1.5 > by - .2) {
        let dx = -lx * sa, dz = -lx * ca; if (h.spd < 0) { dx = -dx; dz = -dz; } let l = Math.hypot(dx, dz); if (l < .05) { dx = rx; dz = rz; l = Math.hypot(dx, dz) || 1; }
        myP.vx = dx / l * 10.5; myP.vz = dz / l * 10.5; myP.vy = 5.5; PK.onGround = false; PK.standOn = -1; PK.hitCool = .7; PK.shake = .4; sfx('hit'); fxBurst(myP.x, myP.y + 1, myP.z, '#facc15', 12, 3, 3, 8, .5);
      }
    }
    if (PK.finMesh) PK.finMesh.rotation.y = t * 1.5;
  };

  w.act = () => { if (myP.seat >= 0) return stand(); const s = nearSeat(); if (s) return sit(s); if (nearTV()) return w.tvOpen?.(); if (nearTablet()) return openParkourMenu(); };
  w.onNet = d => {
    if (d.id === me) return; const p = getP(d.id);
    if (d.em) { if (d.em.startsWith('tv')) { toggleTV(true, d.em === 'tv+'); } else { p.em = d.em; p.emAt = performance.now() / 1000; if (p.room === myP.room) sfx(d.em === '👋' ? 'wave' : d.em === '💃' ? 'dance' : d.em === '🦘' ? 'jump' : d.em === '⚔️' ? 'swing' : 'clap'); } }
    const wasSeat = p.seat; p.tx = d.x; p.tz = d.z; p.ty = +d.y || 0; p.pg = d.g | 0; p.tr = d.ry; p.a = d.a & 3; p.drv = d.seat <= -2 ? -2 - d.seat : -1; p.seat = d.seat <= -2 ? -1 : d.seat; if (d.room === 2) { p.seat = -1; p.drv = -1; } if (p.room !== d.room) { p.room = d.room; p.x = d.x; p.z = d.z; p.y = p.ty; if (d.room === myP.room) sfx('pop'); }
    if (d.seat >= 0) { const s = seats.find(x => x.id === d.seat); if (s) { p.tx = s.x; p.tz = s.z; p.tr = s.ry; if (wasSeat !== d.seat && p.room === myP.room) sfx('sit'); } }
  };

  /* ---------- TV: link / ekran paylaşımı ---------- */
  const tvbox = el.querySelector('#tvbox'), tvPanel = el.querySelector('#wtv');
  const tvCorners = [[-2.2, 3.4375], [2.2, 3.4375], [2.2, .9625], [-2.2, .9625]].map(([x, y]) => new T.Vector3(x, y, -5.285));
  const tvPos = () => TVS.pos + (TVS.playing ? (performance.now() - TVS.at) / 1000 : 0);
  const tvKey = () => (myP.room === 1 && TVS.kind !== 'off') ? TVS.kind + '|' + TVS.url + '|' + TVS.owner : '';
  const tvCmd = (func, args) => { try { w.tvEl.contentWindow.postMessage(JSON.stringify({ event: 'command', func, args: args || [] }), '*'); } catch {} };
  const vmCmd = (method, value) => { try { w.tvEl.contentWindow.postMessage(JSON.stringify(value === undefined ? { method } : { method, value }), '*'); } catch {} };
  const tvRestoreVol = () => { const rv = call.videos?.get(TVS.owner); if (rv) rv.volume = 1; };
  const tvUnlock = () => { toast('TV sesi için ekranda bir yere tıkla 🔊'); window.addEventListener('pointerdown', () => w.tvEl?.play?.().catch(() => {}), { once: true }); };
  const tvDestroy = () => {
    const e = w.tvEl; if (e) { try { if (e.tagName === 'IFRAME') e.src = 'about:blank'; else { e.pause(); e.srcObject = null; e.removeAttribute('src'); e.load(); } } catch {} e.remove(); tvRestoreVol(); }
    w.tvEl = null; w.tvKey = ''; w.tvType = ''; tvHole.visible = false; tvScreen.visible = true; tvbox.style.display = 'none';
  };
  const tvCreate = () => {
    tvDestroy(); const key = tvKey(); if (!key) return; w.tvKey = key; let e;
    if (TVS.kind === 'screen') { e = document.createElement('video'); e.autoplay = true; e.muted = true; e.playsInline = true; w.tvType = 'screen'; }
    else {
      const m = tvEmbed(TVS.url, tvPos()); if (!m) { toast('Link açılamadı.'); return; } w.tvType = m.type;
      if (m.type === 'video') { e = document.createElement('video'); e.src = m.src; e.playsInline = true; e.autoplay = true; e.addEventListener('loadedmetadata', () => { try { e.currentTime = tvPos(); } catch {} }, { once: true }); }
      else { e = document.createElement('iframe'); e.allow = 'autoplay; fullscreen; encrypted-media; picture-in-picture'; e.allowFullscreen = true; e.referrerPolicy = 'strict-origin-when-cross-origin'; e.src = m.src; e.addEventListener('load', () => { w.tvRev = -1; setTimeout(() => { w.tvRev = -1; }, 1500); }); }
    }
    tvbox.appendChild(e); w.tvEl = e; w.tvRev = -1; w.tvVol = -1; tvHole.visible = true; tvScreen.visible = false;
  };
  const tvApply = () => {
    const e = w.tvEl; if (!e) return; w.tvRev = TVS.rev; const pl = TVS.playing, pos = tvPos();
    if (w.tvType === 'video') { if (isFinite(pos) && e.readyState > 0 && Math.abs(e.currentTime - pos) > 1.2) { try { e.currentTime = pos; } catch {} } if (pl) e.play().catch(tvUnlock); else e.pause(); }
    else if (w.tvType === 'yt') { tvCmd(pl ? 'playVideo' : 'pauseVideo'); if (TVS.seek) tvCmd('seekTo', [pos, true]); }
    else if (w.tvType === 'vimeo') { vmCmd(pl ? 'play' : 'pause'); if (TVS.seek) vmCmd('setCurrentTime', pos); }
  };
  w.tvTick = dt => {
    const key = tvKey(); if (key !== w.tvKey) tvCreate();
    const e = w.tvEl; if (!e) return;
    if (w.tvType === 'screen') { const st = TVS.owner === me ? call.screen : call.videos.get(TVS.owner)?.srcObject; if (st && e.srcObject !== st) { e.srcObject = st; e.play().catch(() => {}); } }
    if (TVS.rev !== w.tvRev) tvApply();
    const vol = Math.max(.12, Math.min(1, 1.15 - Math.hypot(myP.x, myP.z + 5) / 13)), q = Math.round(vol * 10) / 10;
    if (q !== w.tvVol) { w.tvVol = q;
      if (w.tvType === 'video') e.volume = q; else if (w.tvType === 'screen') { const rv = call.videos.get(TVS.owner); if (rv) rv.volume = q; }
      else if (w.tvType === 'yt') tvCmd('setVolume', [Math.round(q * 100)]); else if (w.tvType === 'vimeo') vmCmd('setVolume', q); }
    // yerleşim: TV'nin 4 köşesini ekrana projekte edip iframe/video'yu oraya oturt
    if (document.fullscreenElement === tvbox) return;
    cam.updateMatrixWorld(); const pts = []; let ok = true;
    for (const c of tvCorners) { const v = c.clone().applyMatrix4(cam.matrixWorldInverse); if (v.z > -.1) { ok = false; break; } v.applyMatrix4(cam.projectionMatrix); pts.push([(v.x * .5 + .5) * innerWidth, (-v.y * .5 + .5) * innerHeight]); }
    const tf = ok ? tvHomog(pts) : null; if (!tf) { tvbox.style.display = 'none'; return; }
    tvbox.style.display = 'block'; tvbox.style.transform = tf;
  };
  const tvSend = o => wsSend({ t: 'tv:set', ...o });
  const tvRender = () => {
    const keep = tvPanel.querySelector('#tvUrl')?.value || ''; const on = TVS.kind !== 'off', scr = TVS.kind === 'screen';
    const sharers = (S.voice[call.chanId] || []).filter(u => u.sharing && u.id !== me);
    const now = !on ? '' : scr ? `🖥️ ${esc(TVS.owner === me ? 'Senin ekranın' : userName(TVS.owner) + ' ekranı')}` : '🔗 ' + esc(TVS.url.length > 46 ? TVS.url.slice(0, 46) + '…' : TVS.url);
    tvPanel.innerHTML = `<div class="tvh"><b>📺 TV Kumandası</b><button data-a="x" title="Kapat">✕</button></div>
      <div class="tvr"><input id="tvUrl" placeholder="Video linki yapıştır (YouTube, Vimeo, Twitch, .mp4…)" autocomplete="off"><button data-a="go">▶ Oynat</button></div>
      <div class="tvr">${scr && TVS.owner === me ? '' : '<button class="alt" data-a="me">🖥️ Ekranımı TV\'ye yansıt</button>'}${sharers.filter(u => !(scr && TVS.owner === u.id)).map(u => `<button class="alt" data-a="sh" data-id="${u.id}">🖥️ ${esc(userName(u.id))}</button>`).join('')}</div>
      ${on ? `<div class="tvn">Şu an: ${now}</div><div class="tvr">${scr ? '' : `<button data-a="b">⏪ 10 sn</button><button data-a="pp">${TVS.playing ? '⏸ Duraklat' : '▶ Devam'}</button><button data-a="f">10 sn ⏩</button>`}<button data-a="fs">⛶ Tam ekran</button><button class="danger" data-a="off">⏹ Kapat</button></div>` : ''}
      <small>İpucu: ekran paylaşırken tüm ekran yerine <b>sekme</b> seç, TV kendini yansıtmasın. TV'ye yaklaştıkça ses artar.</small>`;
    const inp = tvPanel.querySelector('#tvUrl'); inp.value = keep;
  };
  w.tvUI = () => { if (tvPanel.style.display !== 'none') tvRender(); };
  w.tvOpen = () => { if (myP.room !== 1) return; tvPanel.style.display = 'block'; tvRender(); tvPanel.querySelector('#tvUrl')?.focus(); };
  tvPanel.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'tvUrl') tvPanel.querySelector('[data-a=go]').click(); });
  tvPanel.addEventListener('click', async e => {
    const b = e.target.closest('button'); if (!b) return; const a = b.dataset.a, cur = { kind: TVS.kind, url: TVS.url, owner: TVS.owner };
    if (a === 'x') tvPanel.style.display = 'none';
    else if (a === 'go') { const u = tvPanel.querySelector('#tvUrl').value.trim(); if (!u) return; if (!/^https?:\/\//i.test(u) || !tvEmbed(u, 0)) return toast('Geçerli bir http(s) linki gir.'); tvSend({ kind: 'link', url: u, playing: true, pos: tvStartOf(u) }); }
    else if (a === 'me') { if (!call.screen) { await call.startShare(); if (!call.screen) return; } tvSend({ kind: 'screen', owner: me, playing: true, pos: 0 }); }
    else if (a === 'sh') tvSend({ kind: 'screen', owner: +b.dataset.id, playing: true, pos: 0 });
    else if (a === 'pp') tvSend({ ...cur, playing: !TVS.playing, pos: tvPos() });
    else if (a === 'b' || a === 'f') tvSend({ ...cur, playing: TVS.playing, pos: Math.max(0, tvPos() + (a === 'f' ? 10 : -10)), seek: 1 });
    else if (a === 'fs') { if (tvbox.requestFullscreen) tvbox.requestFullscreen().catch(() => {}); }
    else if (a === 'off') tvSend({ kind: 'off' });
  });
  el.querySelector('#wTv').onclick = () => w.tvOpen();

  /* ---------- girdi ---------- */
  // ESC: önce fareyi serbest bırak; fare zaten serbestse "çıkmak istiyor musun?" diye sor
  w.showQuit = () => {
    const old = el.querySelector('#wquit'); if (old) { old.remove(); return; }
    try { document.exitPointerLock?.(); } catch {}
    const d = document.createElement('div'); d.id = 'wquit';
    d.innerHTML = '<div class="qbox"><div class="qico">🚪</div><h3>3D dünyadan çıkmak istiyor musun?</h3><p>Çıkarsan sohbet ekranına dönersin.</p><div class="qbtn"><button class="btn sec" id="qno">Kal (ESC)</button><button class="btn" id="qyes">Evet, çık</button></div></div>';
    el.appendChild(d);
    d.querySelector('#qyes').onclick = () => { d.remove(); close(); };
    d.querySelector('#qno').onclick = () => d.remove();
    d.addEventListener('mousedown', e => { if (e.target === d) d.remove(); });
    d.querySelector('#qyes').focus();
  };
  w.askExit = () => { if (document.pointerLockElement) { try { document.exitPointerLock(); } catch {} return; } w.showQuit(); };
  w.kd = e => { if (e.target.closest('input,textarea')) return; const k = e.key.toLowerCase(); w.keys[k] = true;
    if (k === 'e') w.act(); else if (k === ' ') { e.preventDefault(); if (myP.seat < 0 && !myP.dead) PK.jumpBuf = .2; }
    else if ('1234'.includes(k) && k.length === 1) emote(['👋', '💃', '🦘', '👏'][+k - 1]); else if (k === 'f') w.attack?.(); else if (k === 'v') { w.fp = !w.fp; if (w.fp) { w.dist = 0.01; w.pitch = 0; } else { w.dist = 8; w.pitch = .45; } toast(w.fp ? '1. şahıs' : '3. şahıs'); } else if (k === 'escape') w.askExit(); };
  w.ku = e => { w.keys[e.key.toLowerCase()] = false; };
  window.addEventListener('keydown', w.kd); window.addEventListener('keyup', w.ku);
  let dx = 0, moved = 0, mb = 0, locked = false;
  // Pointer Lock: tıklayınca fare yakalanır, hareket direkt kamerayı döndürür
  cv.addEventListener('click', () => {
    if (!document.pointerLockElement) cv.requestPointerLock?.();
  });
  document.addEventListener('pointerlockchange', () => {
    locked = document.pointerLockElement === cv;
    w.drag = locked;
  });
  cv.addEventListener('mousedown', e => {
    if (e.button === 0) { mb = 0; dx = e.clientX; moved = 0; }
    else if (e.button === 2) { mb = 2; moved = 0; }
  });
  w.mu = e => {
    if (e.button === 0 && moved < 6 && e.target === cv && !locked) {
      w.attack?.();
    } else if (e.button === 2 && moved < 6) {
      clickGround(e);
    }
  };
  window.addEventListener('mouseup', w.mu);
  cv.addEventListener('contextmenu', e => e.preventDefault());
  cv.addEventListener('mousemove', e => {
    // Pointer lock varken veya sürüklerken kamera dönsün
    if (!locked && !w.drag) return;
    moved += Math.abs(e.movementX) + Math.abs(e.movementY);
    w.yaw -= e.movementX * .0025;
    w.pitch = Math.max(.08, Math.min(1.35, w.pitch + e.movementY * .0022));
  });
  // ESC zaten close() yapıyor; pointer lock da ESC ile açılır
  cv.addEventListener('wheel', e => { e.preventDefault(); w.dist = Math.max(3.5, Math.min(16, w.dist + e.deltaY * .01)); }, { passive: false });
  const ray = new T.Raycaster(), v2 = new T.Vector2(), plane = new T.Plane(new T.Vector3(0, 1, 0), 0), hit = new T.Vector3();
  const clickGround = e => { const r = cv.getBoundingClientRect(); v2.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(v2, cam);
    if (ray.ray.intersectPlane(plane, hit)) { if (myP.seat >= 30) return; if (myP.seat >= 0) stand(); w.goto = { x: hit.x, z: hit.z }; } };

  /* ---------- GRAFİK AYARLARI ---------- */
  const GQ = { low: { n: 'Düşük', pr: .7, shadow: false, fx: false, far: .55, aa: 0 }, mid: { n: 'Orta', pr: 1, shadow: true, fx: true, far: .8 }, high: { n: 'Yüksek', pr: 1.5, shadow: true, fx: true, far: 1 }, ultra: { n: 'Ultra', pr: 2, shadow: true, fx: true, far: 1.2 } };
  let GS = { q: 'high', shadow: null, fx: null, fps: false }; try { GS = { ...GS, ...JSON.parse(localStorage.getItem('vibra.gfx') || '{}') }; } catch {}
  const applyGfx = () => {
    const Q = GQ[GS.q] || GQ.high, sh = GS.shadow ?? Q.shadow, fx = GS.fx ?? Q.fx;
    R.setPixelRatio(Math.min(devicePixelRatio, Q.pr)); w.rs?.();
    if (R.shadowMap.enabled !== sh) { R.shadowMap.enabled = sh; scene.traverse(o => { if (o.material) [].concat(o.material).forEach(m => m.needsUpdate = true); }); }
    pPts.visible = fx; sparks.visible = fx; flies.visible = fx; aPts.visible = fx && !PK.active;
    cam.far = 200 * Q.far; cam.updateProjectionMatrix(); w.gfxFar = Q.far; w.gfxFx = fx;
    el.querySelector('#wfps').style.display = GS.fps ? 'block' : 'none';
    try { localStorage.setItem('vibra.gfx', JSON.stringify(GS)); } catch {}
  };
  w.applyGfx = applyGfx;
  const gfxPanel = () => {
    const P = el.querySelector('#wgfx'); const Q = GQ[GS.q] || GQ.high; const sh = GS.shadow ?? Q.shadow, fx = GS.fx ?? Q.fx;
    P.innerHTML = `<h3>⚙ Grafik Ayarları</h3><div class="gq">${Object.entries(GQ).map(([k, v]) => `<button data-q="${k}" class="${GS.q === k ? 'on' : ''}">${v.n}</button>`).join('')}</div>
      <div class="gt"><button data-t="shadow" class="${sh ? 'on' : ''}">Gölgeler <span>${sh ? 'Açık' : 'Kapalı'}</span></button><button data-t="fx" class="${fx ? 'on' : ''}">Parçacık / Işıltı <span>${fx ? 'Açık' : 'Kapalı'}</span></button><button data-t="fps" class="${GS.fps ? 'on' : ''}">FPS Göstergesi <span>${GS.fps ? 'Açık' : 'Kapalı'}</span></button></div>
      <small>Takılıyorsan "Düşük"ü dene. Ayarlar kaydedilir.</small>`;
    P.querySelectorAll('[data-q]').forEach(b => b.onclick = () => { GS.q = b.dataset.q; GS.shadow = null; GS.fx = null; applyGfx(); gfxPanel(); });
    P.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { const k = b.dataset.t; if (k === 'fps') GS.fps = !GS.fps; else GS[k] = !(k === 'shadow' ? sh : fx); applyGfx(); gfxPanel(); });
  };
  el.querySelector('#wGfx').onclick = () => { const P = el.querySelector('#wgfx'); const open = P.style.display === 'block'; P.style.display = open ? 'none' : 'block'; if (!open) gfxPanel(); };
  el.querySelector('#wHelp').onclick = () => { const h = el.querySelector('.whelp'); h.classList.toggle('open'); el.querySelector('#wHelp').classList.toggle('on', h.classList.contains('open')); };
  el.querySelector('#wExit').onclick = () => w.showQuit(); el.querySelector('#wChar').onclick = editor;
  el.querySelectorAll('[data-em]').forEach(b => b.onclick = () => emote(b.dataset.em)); el.querySelector('#wAtk').onclick = () => w.attack?.();
  el.querySelector('#wAtk').title = 'Saldır (Sol tık / F)';
  w.rs = () => { const W_ = innerWidth, H_ = innerHeight; R.setSize(W_, H_, false); cam.aspect = W_ / H_; cam.updateProjectionMatrix(); }; window.addEventListener('resize', w.rs); w.rs(); applyGfx();
  ac(); ambStart(); sfx('door');

  /* ---------- ÇARPIŞMA ---------- */
  const collideLobby = (o, rad) => {
    const d = Math.hypot(o.x, o.z); if (d > 330) { o.x *= 330 / d; o.z *= 330 / d; } CITY.hit?.(o, rad); if (d < 1.5) { o.x *= 1.5 / (d || 1); o.z *= 1.5 / (d || 1); }
    for (const c of treeC) { const dx = o.x - c.x, dz = o.z - c.z; if (Math.abs(dx) > 3 || Math.abs(dz) > 3) continue; const dd = Math.hypot(dx, dz), mn = c.r + rad; if (dd < mn) { const k = mn / (dd || .001); o.x = c.x + dx * k; o.z = c.z + dz * k; } }
    if (Math.abs(o.x) < 2.5 + rad && o.z > 13 - rad && o.z < 16 + rad) { const px = 2.5 + rad - Math.abs(o.x), p1 = o.z - (13 - rad), p2 = 16 + rad - o.z, m = Math.min(px, p1, p2); if (m === px) o.x = Math.sign(o.x || 1) * (2.5 + rad); else if (m === p1) o.z = 13 - rad; else o.z = 16 + rad; }
  };

  /* ---------- HAYVANLAR + DÖVÜŞ (yerel; ormanda) ---------- */
  const KIND = {
    wolf: { name: 'Kurt', hp: 45, spd: 5.4, dmg: 9, cd: 1.0, aggro: 15, rng: 1.6, hostile: 1, n: 7, rmin: 32, rmax: 80 },
    boar: { name: 'Yaban Domuzu', hp: 70, spd: 4.8, dmg: 13, cd: 1.3, aggro: 9, rng: 1.7, hostile: 1, n: 5, rmin: 30, rmax: 75 },
    bear: { name: 'Ayı', hp: 170, spd: 4.1, dmg: 24, cd: 1.6, aggro: 13, rng: 2.3, hostile: 1, n: 3, rmin: 55, rmax: 90 },
    deer: { name: 'Geyik', hp: 28, spd: 7, dmg: 0, cd: 0, aggro: 0, rng: 0, hostile: 0, n: 8, rmin: 28, rmax: 80 },
  };
  const LOOK = {
    wolf: { c: '#6d737c', c2: '#454a52', L: 1.25, H: .5, W: .42, lh: .55, sc: 1, lw: .07 },
    boar: { c: '#6b4a34', c2: '#46301f', L: 1.15, H: .62, W: .58, lh: .38, sc: 1, lw: .08 },
    bear: { c: '#4b3524', c2: '#2f2118', L: 1.6, H: .95, W: .85, lh: .62, sc: 1.15, lw: .13 },
    deer: { c: '#b3834f', c2: '#e8d5b0', L: 1.1, H: .48, W: .36, lh: .85, sc: 1, lw: .05 },
  };
  const mkAnimal = kind => {
    const C = LOOK[kind], g = new T.Group(), A = { g, legs: [], mats: [] }; g.rotation.order = 'YXZ';
    const mk = c => { const m = new T.MeshStandardMaterial({ color: c, roughness: .9 }); A.mats.push(m); return m; };
    const bm = mk(C.c), dm = mk(C.c2), wm = new T.MeshStandardMaterial({ color: '#f2ecd8', roughness: .6 }), km = new T.MeshBasicMaterial({ color: kind === 'wolf' || kind === 'bear' ? '#ff4a1a' : '#111' });
    const add = (par, geo, m, x, y, z, rx = 0, rz = 0) => { const o = new T.Mesh(geo, m); o.position.set(x, y, z); o.rotation.set(rx, 0, rz); o.castShadow = true; par.add(o); return o; };
    const by = C.lh + C.H / 2;
    add(g, new T.BoxGeometry(C.W, C.H, C.L), bm, 0, by, 0);
    if (kind === 'bear') add(g, new T.BoxGeometry(C.W * .9, C.H * .5, .6), bm, 0, by + C.H * .45, .3);
    if (kind === 'wolf') add(g, new T.BoxGeometry(C.W * 1.05, C.H * .5, C.L * .4), dm, 0, by + C.H * .3, .25);
    if (kind === 'deer') add(g, new T.BoxGeometry(.16, .7, .2), bm, 0, by + .38, C.L / 2 - .02, .45, 0);
    const head = new T.Group(); head.position.set(0, kind === 'deer' ? by + .75 : kind === 'bear' ? by + .2 : by + .1, C.L / 2 + (kind === 'deer' ? .25 : .15)); g.add(head); A.head = head;
    const hs = kind === 'bear' ? .5 : kind === 'boar' ? .38 : kind === 'wolf' ? .34 : .26;
    add(head, new T.BoxGeometry(hs, hs * .9, hs * 1.05), bm, 0, 0, 0);
    const sn = { wolf: [.16, .15, .3], boar: [.2, .18, .3], bear: [.22, .2, .26], deer: [.13, .13, .3] }[kind];
    add(head, new T.BoxGeometry(sn[0], sn[1], sn[2]), dm, 0, -hs * .12, hs * .5 + sn[2] / 2 - .05);
    [-1, 1].forEach(sd => {
      add(head, new T.SphereGeometry(.04, 6, 6), km, sd * hs * .36, hs * .12, hs * .38);
      add(head, new T.ConeGeometry(kind === 'bear' ? .09 : .07, kind === 'deer' ? .2 : .16, 5), bm, sd * hs * .32, hs * .55, -hs * .1, 0, -sd * .25);
      if (kind === 'boar') add(head, new T.ConeGeometry(.035, .16, 5), wm, sd * .1, -hs * .3, hs * .85, -.5, 0);
      if (kind === 'deer') { const an = add(head, new T.CylinderGeometry(.015, .025, .5, 5), dm, sd * .1, hs * .9, -.05, 0, -sd * .5); add(an, new T.CylinderGeometry(.01, .015, .22, 5), dm, 0, .1, .05, .5, 0); }
    });
    [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(([sx, sz]) => { const lg = new T.Group(); lg.position.set(sx * C.W * .36, C.lh, sz * C.L * .36); add(lg, new T.CylinderGeometry(C.lw, C.lw * .8, C.lh, 6), kind === 'deer' ? dm : bm, 0, -C.lh / 2, 0); g.add(lg); A.legs.push(lg); });
    add(g, new T.BoxGeometry(.1, .1, kind === 'wolf' ? .5 : .15), dm, 0, by + C.H * .3, -C.L / 2 - (kind === 'wolf' ? .2 : .05), kind === 'wolf' ? .5 : 0);
    g.scale.setScalar(C.sc); return A;
  };
  const animals = [], popTxt = [], tmpA = new T.Vector3(); let kills = 0, hpShown = -1;
  Object.assign(myP, { hp: 100, maxhp: 100, dead: 0, deadT: 0, atkT: 0, hurtT: 0 });
  const hud = { hp: el.querySelector('#whp .hpb i'), t: el.querySelector('#whp .hpt'), kl: el.querySelector('#whp .kl'), dmg: el.querySelector('#wdmg'), dead: el.querySelector('#wdead') };
  const addPop = (x, y, z, txt, col) => { const d = document.createElement('div'); d.className = 'wtxt'; d.textContent = txt; d.style.color = col; el.appendChild(d); popTxt.push({ x, y, z, age: 0, d }); };
  const heal = n => { myP.hp = Math.min(myP.maxhp, myP.hp + n); };
  const place = a => { for (let i = 0; i < 40; i++) { const ang = Math.random() * 6.283, r = a.K.rmin + Math.random() * (a.K.rmax - a.K.rmin), x = Math.cos(ang) * r, z = Math.sin(ang) * r; if (!treeC.some(c => Math.hypot(c.x - x, c.z - z) < 1.8)) { a.x = x; a.z = z; return; } } a.x = a.K.rmin; a.z = 0; };
  const respawn = a => { a.hp = a.K.hp; a.st = 'wander'; a.dieT = 0; a.stun = 0; a.fleeT = 0; a.wt = 0; a.wind = 0; place(a); a.tx = a.x; a.tz = a.z; a.g.rotation.set(0, a.ry, 0); a.g.position.y = 0; };
  for (const [kind, K] of Object.entries(KIND)) for (let i = 0; i < K.n; i++) {
    const A = mkAnimal(kind), lab = document.createElement('div'); lab.className = 'an'; lab.innerHTML = `${K.name}<div class="hpb"><i></i></div>`; el.appendChild(lab); L.add(A.g);
    const C = LOOK[kind], a = { kind, K, A, g: A.g, lab, bar: lab.querySelector('i'), x: 0, z: 0, ry: Math.random() * 6.28, ph: Math.random() * 6, hh: (C.lh + C.H) * C.sc + .9, wind: 0, atkT: 0, flash: 0, hp: K.hp, st: 'wander', dieT: 0, resp: 0, stun: 0, fleeT: 0, wt: 0, tx: 0, tz: 0, growl: 0 };
    place(a); a.tx = a.x; a.tz = a.z; animals.push(a); }
  const hurtMe = (d, ax, az) => { if (myP.dead) return; myP.hp = Math.max(0, myP.hp - d); myP.hurtT = .35; sfx('hurt'); fxBurst(myP.x, 1.2, myP.z, '#ff3030', 10, 2.6, 2, 9, .5); addPop(myP.x, 2.3, myP.z, '-' + d, '#ff5a5a');
    const dx = myP.x - ax, dz = myP.z - az, l = Math.hypot(dx, dz) || 1; myP.x += dx / l * .6; myP.z += dz / l * .6; w.goto = null;
    if (myP.hp <= 0) { myP.dead = 1; myP.deadT = 3.2; sfx('die'); hud.dead.style.display = 'flex'; } };
  const dmgAnimal = a => { if (a.st === 'dead' || myP.dead || myP.room !== 0) return; const d = Math.hypot(a.x - myP.x, a.z - myP.z); if (d > 4.2) return;
    const crit = Math.random() < .15, dm = Math.round((16 + Math.random() * 9) * (crit ? 1.8 : 1)); a.hp -= dm; a.flash = .18; sfx('hit'); fxBurst(a.x, a.hh * .55, a.z, '#ffd27a', 12, 3.6, 2.6, 9, .45); fxBurst(a.x, a.hh * .55, a.z, '#ff4a3a', 6, 2.4, 2, 9, .5); addPop(a.x, a.hh, a.z, (crit ? '💥 ' : '') + dm, crit ? '#ffd400' : '#fff');
    const dx = a.x - myP.x, dz = a.z - myP.z, l = Math.hypot(dx, dz) || 1; a.x += dx / l * .7; a.z += dz / l * .7; a.stun = .25; a.wind = 0;
    if (a.hp <= 0) { a.st = 'dead'; a.dieT = 0; a.resp = 30; kills++; fxBurst(a.x, .6, a.z, '#a89a88', 26, 1.8, 1.6, 1.5, 1.1); hud.kl.textContent = '🐺 ' + kills; sfx('die'); const hv = a.kind === 'deer' ? 25 : 12; heal(hv); addPop(myP.x, 2.6, myP.z, '+' + hv + ' ❤️', '#7dff9a'); }
    else if (a.K.hostile) a.st = 'chase'; else { a.st = 'flee'; a.fleeT = 4; } };
  w.attack = () => {
    if (myP.dead || myP.seat >= 0 || myP.atkT > 0 || myP.sitK > .2) return;
    myP.atkT = .5; myP.em = '⚔️'; myP.emAt = performance.now() / 1000; sfx('swing'); sendEm('⚔️');
    slashT = .28;
    // damage only in lobby/forest
    if (myP.room === 0) {
      let best = null, bd = 3.4; for (const a of animals) { if (a.st === 'dead') continue; const d = Math.hypot(a.x - myP.x, a.z - myP.z); if (d < bd) { bd = d; best = a; } }
      if (best) { myP.tr = Math.atan2(best.x - myP.x, best.z - myP.z); setTimeout(() => dmgAnimal(best), 140); }
    } else {
      // parkour / house: punch particles for feedback
      const dx = Math.sin(myP.tr) * 1.1, dz = Math.cos(myP.tr) * 1.1;
      fxBurst(myP.x + dx, myP.y + 1.2, myP.z + dz, '#fff1c2', 8, 2.2, 1.2, 6, .35);
    }
  };
  const animalsUpdate = (dt, t) => {
    const on = myP.room === 0; fxUpdate(dt);
    slash.position.set(myP.x, 1.25, myP.z); slash.rotation.y = myP.tr + Math.PI / 2; slash.material.opacity = slashT > 0 ? slashT / .22 * .85 : 0; slash.scale.setScalar(1 + (1 - Math.max(0, slashT) / .22) * .35); slashT = Math.max(0, slashT - dt);
    myP.atkT = Math.max(0, myP.atkT - dt); myP.hurtT = Math.max(0, myP.hurtT - dt);
    if (myP.dead) { myP.deadT -= dt; if (myP.deadT <= 0) { myP.dead = 0; myP.hp = myP.maxhp; hud.dead.style.display = 'none'; setRoom(0, true); sfx('door'); } }
    else if (myP.hp < myP.maxhp) heal(dt * (on && Math.hypot(myP.x, myP.z) < 9 ? 8 : 1.2));
    hud.dmg.style.opacity = myP.dead ? 0 : Math.max(myP.hurtT / .35, myP.hp < 30 ? .3 + Math.sin(t * 6) * .15 : 0);
    const hh = Math.ceil(myP.hp); if (hh !== hpShown) { hpShown = hh; hud.hp.style.width = myP.hp / myP.maxhp * 100 + '%'; hud.t.textContent = '❤️ ' + hh; }
    const safe = !on || myP.dead || Math.hypot(myP.x, myP.z) < 11;
    for (const a of animals) {
      if (!on) { a.lab.style.display = 'none'; continue; }
      const g = a.g, K = a.K;
      a.flash = Math.max(0, a.flash - dt); const fe = a.flash > 0 ? .8 : 0; a.A.mats.forEach(m => m.emissive.setRGB(fe, fe * .1, fe * .1));
      if (a.st === 'dead') {
        a.dieT += dt; g.rotation.set(0, a.ry, Math.min(1, a.dieT / .4) * 1.5); a.A.legs.forEach(l => l.rotation.x = .3);
        g.position.set(a.x, a.dieT > 6 ? -(a.dieT - 6) * .5 : 0, a.z); a.resp -= dt; if (a.resp <= 0) respawn(a); a.lab.style.display = 'none'; continue;
      }
      const dxp = myP.x - a.x, dzp = myP.z - a.z, dp = Math.hypot(dxp, dzp);
      a.atkT -= dt; a.fleeT = Math.max(0, a.fleeT - dt); a.stun = Math.max(0, a.stun - dt); a.growl -= dt;
      let sp = 0, face = a.ry;
      if (a.wind > 0) { a.wind -= dt; if (a.wind <= 0 && dp < K.rng + .8 && !myP.dead) hurtMe(Math.round(K.dmg * (.8 + Math.random() * .4)), a.x, a.z); }
      if (a.stun <= 0 && a.wind <= 0) {
        let want = 'wander';
        if (K.hostile) { if (!safe && (dp < K.aggro || (a.st === 'chase' && dp < K.aggro * 2.2))) want = 'chase'; }
        else if (dp < 11 || a.fleeT > 0) want = 'flee';
        if (want === 'chase' && a.st !== 'chase' && a.growl <= 0 && dp < 22) { sfx('growl'); a.growl = 6; }
        a.st = want;
        if (want === 'chase') { face = Math.atan2(dxp, dzp); if (dp > K.rng) sp = K.spd; else if (a.atkT <= 0) { a.atkT = K.cd; a.wind = .28; } }
        else if (want === 'flee') { face = Math.atan2(-dxp, -dzp); sp = K.spd; }
        else {
          a.wt -= dt;
          if (a.wt <= 0) { if (Math.random() < .4) { a.tx = a.x; a.tz = a.z; a.wt = 2 + Math.random() * 4; } else { const ang = Math.random() * 6.283, r = 6 + Math.random() * 10; a.tx = a.x + Math.cos(ang) * r; a.tz = a.z + Math.sin(ang) * r; a.wt = 5 + Math.random() * 6; } }
          if (Math.hypot(a.tx - a.x, a.tz - a.z) > .8) { face = Math.atan2(a.tx - a.x, a.tz - a.z); sp = K.spd * .3; }
        }
      }
      let dr = face - a.ry; while (dr > Math.PI) dr -= 6.2832; while (dr < -Math.PI) dr += 6.2832; a.ry += dr * Math.min(1, dt * (a.st === 'chase' ? 9 : 5));
      if (sp) { a.x += Math.sin(a.ry) * sp * dt; a.z += Math.cos(a.ry) * sp * dt; }
      collideLobby(a, .55); const fd = Math.hypot(a.x, a.z); if (fd < 11) { a.x *= 11 / fd; a.z *= 11 / fd; }
      a.ph += sp * dt * 3; const sw = sp ? Math.sin(a.ph) * (.35 + sp * .06) : 0, lg = a.A.legs; lg[0].rotation.x = sw; lg[3].rotation.x = sw; lg[1].rotation.x = -sw; lg[2].rotation.x = -sw;
      const lunge = a.wind > 0 ? Math.sin((1 - a.wind / .28) * Math.PI) : 0;
      g.position.set(a.x, sp ? Math.abs(Math.sin(a.ph)) * .05 : 0, a.z); g.rotation.set(lunge * .22, a.ry, 0);
      a.A.head.rotation.x = lunge * .5 + (a.st === 'wander' && !sp ? .15 + Math.sin(t + a.ph) * .12 : 0);
      tmpA.set(a.x, a.hh, a.z).project(cam); const show = tmpA.z < 1 && dp < 24; a.lab.style.display = show ? '' : 'none';
      if (show) { a.lab.style.left = (tmpA.x * .5 + .5) * innerWidth + 'px'; a.lab.style.top = (-tmpA.y * .5 + .5) * innerHeight + 'px'; a.bar.style.width = a.hp / K.hp * 100 + '%'; }
    }
    for (let i = popTxt.length - 1; i >= 0; i--) { const q = popTxt[i]; q.age += dt; if (q.age > 1.1) { q.d.remove(); popTxt.splice(i, 1); continue; }
      tmpA.set(q.x, q.y + q.age * 1.1, q.z).project(cam); q.d.style.display = tmpA.z < 1 ? '' : 'none'; q.d.style.left = (tmpA.x * .5 + .5) * innerWidth + 'px'; q.d.style.top = (-tmpA.y * .5 + .5) * innerHeight + 'px'; q.d.style.opacity = 1 - q.age / 1.1; }
  };

  /* ---------- ŞEHİR: köyler, asfalt yollar, galeri, benzin, market, park, araba ---------- */
  const CARS = [
    { n: 'Vibra Sedan', col: '#ef4444', kind: 'sedan', price: 0, vmax: 24, acc: 9, d: 'Başlangıç arabası' },
    { n: 'Şehir Taksi', col: '#facc15', kind: 'taxi', price: 150, vmax: 27, acc: 10, d: 'Hızlı ve çevik' },
    { n: 'Mavi Kamyonet', col: '#0ea5e9', kind: 'truck', price: 300, vmax: 26, acc: 9, d: 'Sağlam ve iddialı' },
    { n: 'Dağ SUV', col: '#16a34a', kind: 'suv', price: 500, vmax: 32, acc: 11, d: 'Güçlü motor' },
    { n: 'Spor Coupe', col: '#a855f7', kind: 'sport', price: 900, vmax: 42, acc: 15, d: 'Çok hızlı' },
    { n: 'Altın Süper', col: '#fbbf24', kind: 'sport', price: 2000, vmax: 55, acc: 19, d: 'Parlak ve çok hızlı' },
    { n: 'Mini Hatchback', col: '#f472b6', kind: 'hatch', price: 220, vmax: 28, acc: 11, d: 'Küçük ve eğlenceli' },
    { n: 'Kargo Van', col: '#e5e7eb', kind: 'van', price: 380, vmax: 25, acc: 8, d: 'Geniş ve sağlam' },
    { n: 'Arazi Jeep', col: '#f59e0b', kind: 'jeep', price: 650, vmax: 34, acc: 12, d: 'Her yola uygun' },
    { n: 'Polis Aracı', col: '#1d4ed8', kind: 'police', price: 800, vmax: 37, acc: 14, d: 'Sirenli ve hızlı' },
    { n: 'Muscle Car', col: '#dc2626', kind: 'muscle', price: 1400, vmax: 46, acc: 16, d: 'Güçlü V8 canavarı' },
    { n: 'Lüks Limuzin', col: '#111827', kind: 'limo', price: 1800, vmax: 36, acc: 9, d: 'Şehrin en uzun arabası' },
    { n: 'Formula Hızı', col: '#ef4444', kind: 'formula', price: 3500, vmax: 64, acc: 24, d: 'Yarış pisti kralı' },
    { n: 'Cyber Neon', col: '#22d3ee', kind: 'cyber', price: 5000, vmax: 72, acc: 26, d: 'Gelecekten gelen, neon ışıklı' },
  ];
  const carModel = i => mkCar(CARS[i].col, CARS[i].kind);
  Object.assign(CITY, { boxes: [], circ: [], roads: [], reserve: [], trees: [], pumps: [], markets: [], fountains: [], npcs: [], spin: [], fuel: 100, c: { x: -9, z: 8, h: Math.PI / 2, v: 0 }, panel: null, eng: null, gal: null });
  try { const si = +localStorage.getItem('vibra_car'); if (si >= 0 && si < CARS.length && (si === 0 || (S.me.owned || []).includes('car:' + si))) CITY.idx = si; const sf = +localStorage.getItem('vibra_fuel'); if (sf > 0) CITY.fuel = Math.min(100, sf); } catch {}
  {
    const rnd = (() => { let a = 20260; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })();
    const geoC = new Map(), matC = new Map();
    const GB = (w_, h_, d_) => { const k = w_ + '|' + h_ + '|' + d_; let g = geoC.get(k); if (!g) { g = new T.BoxGeometry(w_, h_, d_); geoC.set(k, g); } return g; };
    const MT = (c, r = .9) => { const k = c + r; let m = matC.get(k); if (!m) { m = std(c, r); matC.set(k, m); } return m; };
    const GL = c => { const k = 'g' + c; let m = matC.get(k); if (!m) { m = new T.MeshBasicMaterial({ color: c }); matC.set(k, m); } return m; };
    const bx = (par, w_, h_, d_, m, x, y, z) => { const o = new T.Mesh(GB(w_, h_, d_), m); o.position.set(x, y, z); o.receiveShadow = true; par.add(o); return o; };
    const addBox = (cx, cz, w_, d_) => CITY.boxes.push({ x0: cx - w_ / 2, x1: cx + w_ / 2, z0: cz - d_ / 2, z1: cz + d_ / 2 });
    const addCirc = (x, z, r) => CITY.circ.push({ x, z, r });
    const free = (cx, cz, w_, d_, m = 2.5) => !CITY.boxes.some(b => cx + w_ / 2 + m > b.x0 && cx - w_ / 2 - m < b.x1 && cz + d_ / 2 + m > b.z0 && cz - d_ / 2 - m < b.z1)
      && !CITY.reserve.some(b => cx + w_ / 2 + m > b.x0 && cx - w_ / 2 - m < b.x1 && cz + d_ / 2 + m > b.z0 && cz - d_ / 2 - m < b.z1)
      && !CITY.roads.some(b => cx + w_ / 2 + m > b.x0 && cx - w_ / 2 - m < b.x1 && cz + d_ / 2 + m > b.z0 && cz - d_ / 2 - m < b.z1);
    const reserve = (cx, cz, w_, d_) => CITY.reserve.push({ x0: cx - w_ / 2, x1: cx + w_ / 2, z0: cz - d_ / 2, z1: cz + d_ / 2 });
    const label = (txt, sx, sy, bg = 'rgba(15,23,42,.85)', fg = '#fff') => {
      const cv = document.createElement('canvas'); cv.width = 512; cv.height = 128; const x = cv.getContext('2d'); x.fillStyle = bg; x.beginPath(); x.roundRect(4, 4, 504, 120, 28); x.fill();
      x.fillStyle = fg; x.font = 'bold 50px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, 256, 68);
      const sp = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(cv), transparent: true, depthWrite: false })); sp.scale.set(sx, sy, 1); return sp;
    };
    const glow = (x, y, z, c, s) => { const g = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: c, transparent: true, opacity: .6, depthWrite: false, blending: T.AdditiveBlending })); g.scale.setScalar(s); g.position.set(x, y, z); L.add(g); };
    const lamp = (x, z) => { const g = new T.Group(); g.position.set(x, 0, z); bx(g, .12, 4.2, .12, MT('#374151', .6), 0, 2.1, 0); bx(g, .5, .14, .34, MT('#374151', .6), 0, 4.2, 0); bx(g, .3, .12, .22, GL('#fff4c2'), 0, 4.1, 0); L.add(g); glow(x, 4, z, '#ffe9a0', 4.5); addCirc(x, z, .3); };

    /* --- asfalt yollar --- */
    const roadTex = (() => { const cv = document.createElement('canvas'); cv.width = 256; cv.height = 128; const x = cv.getContext('2d'); x.fillStyle = '#2b2d34'; x.fillRect(0, 0, 256, 128);
      for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(${Math.random() > .5 ? '255,255,255' : '0,0,0'},${Math.random() * .07})`; x.fillRect(Math.random() * 256, Math.random() * 128, 2, 2); }
      x.fillStyle = '#e5e7eb'; x.fillRect(0, 6, 256, 4); x.fillRect(0, 118, 256, 4); x.fillStyle = '#fbbf24'; x.fillRect(20, 62, 120, 4);
      const t = new T.CanvasTexture(cv); t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = 4; return t; })();
    const road = (x0, z0, x1, z1, y = .031) => {
      const hz = Math.abs(z1 - z0) < .01, len = hz ? Math.abs(x1 - x0) : Math.abs(z1 - z0), wd = 4.4, tx = roadTex.clone(); tx.needsUpdate = true; tx.repeat.set(len / 8, 1);
      const m = new T.Mesh(new T.PlaneGeometry(len, wd), new T.MeshStandardMaterial({ map: tx, roughness: .9 })); m.rotation.x = -Math.PI / 2; m.rotation.z = hz ? 0 : Math.PI / 2; m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2); m.receiveShadow = true; L.add(m);
      const kb = 2.6; CITY.roads.push(hz ? { x0: Math.min(x0, x1), x1: Math.max(x0, x1), z0: z0 - kb, z1: z0 + kb } : { x0: x0 - kb, x1: x0 + kb, z0: Math.min(z0, z1), z1: Math.max(z0, z1) });
    };
    road(93, 0, 300, 0); road(-93, 0, -300, 0); road(0, 20.5, 0, 300, .032); road(0, -20.5, 0, -300, .032);

    /* --- köyler --- */
    const VIL = [
      { n: '🏘️ Kırmızı Köy', cx: 220, cz: 0, ax: 1, az: 0, walls: ['#ead9c0', '#f4e4c1', '#d9b99b', '#efe3d0'], roofs: ['#b4452f', '#c2563a', '#a33b2a'], st: 'gable', col: '#ef4444', tree: .3 },
      { n: '🏘️ Mavi Köy', cx: -220, cz: 0, ax: 1, az: 0, walls: ['#f8fafc', '#e2e8f0', '#dbeafe'], roofs: ['#2563eb', '#1d4ed8', '#3b82f6'], st: 'gable', col: '#3b82f6', tree: .38 },
      { n: '🌲 Orman Köyü', cx: 0, cz: -220, ax: 0, az: 1, walls: ['#8b5e3c', '#a0703f', '#6f4a2a'], roofs: ['#3f2a1a', '#2f4f2f', '#4a3222'], st: 'cabin', col: '#22c55e', tree: .33 },
      { n: '🏙️ Güney Çarşı', cx: 0, cz: 220, ax: 0, az: 1, walls: ['#fde68a', '#fca5a5', '#a5f3fc', '#d9f99d', '#fbcfe8'], roofs: ['#6b7280', '#4b5563'], st: 'block', col: '#f59e0b', tree: .12 },
    ];
    const pick = a => a[Math.floor(rnd() * a.length)];
    const WIN_ON = GL('#ffd479'), WIN_OFF = GL('#1e293b');
    const house = (x, z, fx, fz, V) => {
      const st = V.st, w_ = (st === 'block' ? 9 + rnd() * 4 : 6 + rnd() * 3), d_ = (st === 'block' ? 8 + rnd() * 3 : 5.5 + rnd() * 2.5), nf = st === 'block' ? 2 + Math.floor(rnd() * 3) : 1, h = st === 'block' ? nf * 2.8 + .3 : 3 + rnd() * .5;
      const ax_ = Math.abs(fx) > .5, W_ = ax_ ? d_ : w_, D_ = ax_ ? w_ : d_; if (!free(x, z, W_, D_, 2.4)) return false;
      const g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = Math.atan2(fx, fz); const wc = pick(V.walls);
      bx(g, w_, h, d_, MT(wc), 0, h / 2, 0).castShadow = true; bx(g, w_ + .2, .25, d_ + .2, MT('#9ca3af'), 0, .12, 0);
      if (st === 'block') { bx(g, w_ + .4, .35, d_ + .4, MT(pick(V.roofs)), 0, h + .17, 0); bx(g, 1.6, .8, 1.6, MT('#6b7280'), w_ * .25, h + .75, -d_ * .2); }
      else { const rh = st === 'cabin' ? 2.6 : 1.9, pv = new T.Group(), cone = new T.Mesh(new T.ConeGeometry(1, rh, 4), MT(pick(V.roofs), .95)); cone.rotation.y = Math.PI / 4; pv.add(cone); pv.scale.set((w_ + 1.1) / 1.414, 1, (d_ + 1.1) / 1.414); pv.position.y = h + rh / 2; g.add(pv); bx(g, .8, 1.8, .8, MT('#6b4a3a'), w_ * .28, h + 1.5, -d_ * .15); }
      bx(g, 1.1, 2.1, .14, MT('#5b3a1e', .6), 0, 1.05, d_ / 2 + .04); bx(g, 1.7, .12, .9, MT('#9ca3af'), 0, .06, d_ / 2 + .45);
      const nw = st === 'block' ? Math.max(2, Math.floor(w_ / 2.6)) : 2;
      for (let f = 0; f < nf; f++) for (let k = 0; k < nw; k++) { const wx = (k - (nw - 1) / 2) * (w_ / (nw + .3)); if (f === 0 && Math.abs(wx) < 1.2) continue; bx(g, .9, 1, .1, rnd() < .65 ? WIN_ON : WIN_OFF, wx, 1.7 + f * 2.8, d_ / 2 + .04); bx(g, .9, 1, .1, rnd() < .5 ? WIN_ON : WIN_OFF, wx, 1.7 + f * 2.8, -d_ / 2 - .04); }
      L.add(g); addBox(x, z, W_, D_); if (rnd() < .5) glow(x + fx * (D_ / 2 + .6), 2.6, z + fz * (D_ / 2 + .6), '#ffd479', 3); return true;
    };
    const colBox = (cx, cz, ry, lx, lz, lw, ld) => { const s = Math.sin(ry), c = Math.cos(ry), ax_ = Math.abs(Math.round(s)) === 1; addBox(cx + lx * c + lz * s, cz - lx * s + lz * c, ax_ ? ld : lw, ax_ ? lw : ld); };
    const npc = (x, z, ry, look) => { try { const g = buildChar({ ...defOutfit(look), hat: 0, glasses: 0 }); g.position.set(x, 0, z); g.rotation.y = ry; L.add(g); CITY.npcs.push(g); addCirc(x, z, .5); } catch {} };
    const market = (x, z, fx, fz) => {
      const w_ = 20, d_ = 12, ry = Math.atan2(fx, fz), g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = ry;
      bx(g, w_, .12, d_, MT('#e5e7eb', .6), 0, .06, 0); bx(g, w_, 4, .4, MT('#f1f5f9'), 0, 2, -d_ / 2); bx(g, .4, 4, d_, MT('#f1f5f9'), -w_ / 2, 2, 0); bx(g, .4, 4, d_, MT('#f1f5f9'), w_ / 2, 2, 0);
      bx(g, w_ + .6, .5, d_ + 2.4, MT('#dc2626'), 0, 4.25, 1); bx(g, w_ + .6, .7, .3, MT('#fff'), 0, 3.7, d_ / 2 + 2.2);
      for (let i = 0; i < 10; i++) bx(g, 1.9, .7, .32, MT(i % 2 ? '#fff' : '#dc2626'), -w_ / 2 + 1 + i * 2, 3.7, d_ / 2 + 2.2);
      for (let r = 0; r < 3; r++) { bx(g, 14, 2.2, .8, MT('#94a3b8'), 1.5, 1.1, -d_ / 2 + 1.6 + r * 2.6); for (let k = 0; k < 18; k++) bx(g, .6, .5, .5, MT(['#ef4444', '#facc15', '#22c55e', '#3b82f6', '#f97316'][k % 5], .6), -4.6 + k * .75, 2.45, -d_ / 2 + 1.6 + r * 2.6); }
      bx(g, 4, 1.1, 1.2, MT('#6b4423'), -6, .55, 2.4); bx(g, .5, .35, .4, GL('#38bdf8'), -6.8, 1.25, 2.4);
      const sg = label('🛒 MARKET', 11, 2.8, '#dc2626'); sg.position.set(0, 6.2, d_ / 2 + 1); g.add(sg);
      glow(x, 3.2, z, '#fff4d8', 14);
      L.add(g); colBox(x, z, ry, 0, -d_ / 2, w_, .6); colBox(x, z, ry, -w_ / 2, 0, .6, d_); colBox(x, z, ry, w_ / 2, 0, .6, d_); colBox(x, z, ry, 1.5, -d_ / 2 + 3.9, 14, 2.4);
      const s = Math.sin(ry), c = Math.cos(ry); CITY.markets.push({ x: x + (-6) * c + (2.4 + 1.5) * s, z: z - (-6) * s + (2.4 + 1.5) * c });
      npc(x + (-6) * c + .4 * s, z - (-6) * s + .4 * c, ry, 7 + Math.floor(rnd() * 20)); reserve(x, z, w_ + 2, d_ + 6);
    };
    const park = (cx, cz, w_, d_, n) => {
      reserve(cx, cz, w_, d_); const gr = new T.Mesh(new T.PlaneGeometry(w_, d_), new T.MeshStandardMaterial({ map: noiseTex('#2f7a35', '#8ad36a', 256, Math.max(4, w_ / 6)), roughness: 1 })); gr.rotation.x = -Math.PI / 2; gr.position.set(cx, .02, cz); gr.receiveShadow = true; L.add(gr);
      const pm = MT('#cbd5e1', .9); [[w_, 2.4, 0, 0], [2.4, d_, 0, 0]].forEach(([a, b]) => { const p = new T.Mesh(new T.PlaneGeometry(a, b), pm); p.rotation.x = -Math.PI / 2; p.position.set(cx, .035, cz); L.add(p); });
      const fo = new T.Group(); fo.position.set(cx, 0, cz); const bm = new T.Mesh(new T.CylinderGeometry(3, 3.2, .6, 24), MT('#9ca3af')); bm.position.y = .3; fo.add(bm); const wt = new T.Mesh(new T.CylinderGeometry(2.7, 2.7, .1, 24), new T.MeshStandardMaterial({ color: '#4aa3ff', roughness: .1, metalness: .3, transparent: true, opacity: .85 })); wt.position.y = .6; fo.add(wt);
      const pil = new T.Mesh(new T.CylinderGeometry(.3, .45, 1.8, 10), MT('#9ca3af')); pil.position.y = 1; fo.add(pil); const jets = []; for (let i = 0; i < 10; i++) { const s = new T.Mesh(new T.SphereGeometry(.14, 6, 5), new T.MeshBasicMaterial({ color: '#bfe3ff' })); fo.add(s); jets.push({ s, a: i / 10 * 6.28, ph: i * .37 }); } L.add(fo); CITY.fountains.push(jets); addCirc(cx, cz, 3.3);
      for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283 + .5, bxx = cx + Math.cos(a) * 6.2, bzz = cz + Math.sin(a) * 6.2, bg = new T.Group(); bg.position.set(bxx, 0, bzz); bg.rotation.y = Math.atan2(cx - bxx, cz - bzz);
        bx(bg, 2, .12, .6, MT('#8b5a2b'), 0, .5, 0); bx(bg, 2, .5, .1, MT('#8b5a2b'), 0, .85, -.3); bx(bg, .1, .5, .5, MT('#374151'), -.9, .25, 0); bx(bg, .1, .5, .5, MT('#374151'), .9, .25, 0); L.add(bg); seats.push({ id: 100 + CITY.seatN++, room: 0, x: bxx, y: .55, z: bzz, ry: bg.rotation.y }); addCirc(bxx, bzz, .75); }
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => lamp(cx + a * (w_ / 2 - 3), cz + b * (d_ / 2 - 3)));
      for (let i = 0; i < n; i++) { const a = rnd() * 6.283, r = 9 + rnd() * Math.min(w_, d_) * .4, tx = cx + Math.cos(a) * r * (w_ / d_ > 1 ? 1.2 : 1), tz = cz + Math.sin(a) * r; if (Math.abs(tx - cx) < w_ / 2 - 1.5 && Math.abs(tz - cz) < d_ / 2 - 1.5 && Math.abs(tx - cx) > 2 && Math.abs(tz - cz) > 2) CITY.trees.push({ x: tx, z: tz, h: 4 + rnd() * 3, hue: .3 + rnd() * .08 }); }
      const nF = 120, fm = new T.InstancedMesh(new T.SphereGeometry(.16, 6, 5), new T.MeshBasicMaterial({ color: '#fff' }), nF), dm = new T.Object3D(), cc = new T.Color(); let k = 0;
      for (let i = 0; i < nF * 3 && k < nF; i++) { const fx = cx + (rnd() - .5) * (w_ - 3), fz = cz + (rnd() - .5) * (d_ - 3); if (Math.hypot(fx - cx, fz - cz) < 7 || Math.abs(fx - cx) < 1.6 || Math.abs(fz - cz) < 1.6) continue; dm.position.set(fx, .2, fz); dm.updateMatrix(); fm.setMatrixAt(k, dm.matrix); fm.setColorAt(k, cc.set(['#f472b6', '#facc15', '#fb7185', '#a78bfa', '#fff'][k % 5])); k++; }
      fm.count = k; fm.instanceMatrix.needsUpdate = true; if (fm.instanceColor) fm.instanceColor.needsUpdate = true; fm.frustumCulled = false; L.add(fm);
    };
    CITY.seatN = 0;
    const gallery = (cx, cz) => {
      const w_ = 46, d_ = 28; reserve(cx, cz, w_ + 4, d_ + 4);
      const g = new T.Group(); g.position.set(cx, 0, cz); L.add(g);
      bx(g, w_, .12, d_, MT('#e2e8f0', .35), 0, .06, 0); bx(g, w_ + .8, .6, d_ + .8, MT('#ffffff', .4), 0, 5.6, 0); bx(g, w_ + .9, .25, d_ + .9, GL('#7c5cff'), 0, 5.2, 0);
      [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, -1], [0, 1]].forEach(([a, b]) => { bx(g, .7, 5.4, .7, MT('#cbd5e1', .4), a * (w_ / 2 - .5), 2.7, b * (d_ / 2 - .5)); addCirc(cx + a * (w_ / 2 - .5), cz + b * (d_ / 2 - .5), .6); });
      const gm = new T.MeshStandardMaterial({ color: '#8fc4ff', transparent: true, opacity: .25, roughness: .05, metalness: .5 }); bx(g, .2, 5, d_, gm, -w_ / 2 + .2, 2.6, 0); bx(g, w_, 5, .2, gm, 0, 2.6, -d_ / 2 + .2); bx(g, w_, 5, .2, gm, 0, 2.6, d_ / 2 - .2);
      addBox(cx - w_ / 2 + .2, cz, .6, d_); addBox(cx, cz - d_ / 2 + .2, w_, .6); addBox(cx, cz + d_ / 2 - .2, w_, .6);
      const sg = label('🚘 OTO GALERİ', 14, 3.5, '#7c5cff'); sg.position.set(w_ / 2 - 2, 7.6, 0); g.add(sg); glow(cx + 6, 4.6, cz, '#cdbdff', 30);
      CARS.forEach((cr, i) => { const col = i % 5, row = Math.floor(i / 5), px = -16.8 + col * 8.4, pz = -8.6 + row * 8.6;
        const pf = new T.Group(); pf.position.set(px, .12, pz); const pl = new T.Mesh(new T.CylinderGeometry(2.7, 2.9, .3, 24), MT('#1e293b', .3)); pl.position.y = .15; pf.add(pl); const rg = new T.Mesh(new T.TorusGeometry(2.7, .06, 6, 32), GL('#a78bfa')); rg.rotation.x = Math.PI / 2; rg.position.y = .32; pf.add(rg);
        const cm = carModel(i); cm.position.y = .3; cm.scale.multiplyScalar(1.15); pf.add(cm); g.add(pf); CITY.spin.push(pf); addCirc(cx + px, cz + pz, 2.8);
        const lb = label(cr.n + ' · ' + (cr.price ? cr.price + ' 💰' : 'Ücretsiz'), 6.4, 1.6); lb.position.set(px, 3.4, pz); g.add(lb); });
      CITY.gal = { x: cx, z: cz, w: w_, d: d_, exit: { x: cx + w_ / 2 + 5, z: cz + d_ / 2 + 4 } }; npc(cx + 11, cz + 7, -Math.PI / 2, 3);
    };
    const gas = (cx, cz) => {
      reserve(cx, cz + 4, 22, 24); const pad = new T.Mesh(new T.PlaneGeometry(20, 14), MT('#3a3d45', .95)); pad.rotation.x = -Math.PI / 2; pad.position.set(cx, .036, cz); pad.receiveShadow = true; L.add(pad);
      const g = new T.Group(); g.position.set(cx, 0, cz); L.add(g); bx(g, 15, .5, 9, MT('#f8fafc'), 0, 4.6, 0); bx(g, 15.1, .3, 9.1, MT('#ef4444'), 0, 4.2, 0); bx(g, 14, .05, 8, GL('#fffbe6'), 0, 4.34, 0);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { bx(g, .5, 4.4, .5, MT('#cbd5e1'), a * 7, 2.2, b * 4); addCirc(cx + a * 7, cz + b * 4, .5); });
      for (let i = -1; i <= 1; i++) { const px = i * 4.5; bx(g, .8, 1.7, .6, MT('#dc2626', .4), px, .95, 0); bx(g, .5, .4, .08, GL('#4ade80'), px, 1.3, .34); bx(g, .5, .4, .08, GL('#4ade80'), px, 1.3, -.34); addCirc(cx + px, cz, .8); CITY.pumps.push({ x: cx + px, z: cz }); }
      glow(cx, 3.8, cz, '#fff4d0', 22);
      const shx = cx, shz = cz + 11; bx(L, 10, 3.4, 5.5, MT('#f1f5f9'), shx, 1.7, shz); bx(L, 10.6, .4, 6.1, MT('#ef4444'), shx, 3.6, shz); bx(L, 6, 1.6, .1, GL('#7dd3fc'), shx, 1.7, shz - 2.8); addBox(shx, shz, 10, 5.5);
      const sg = label('⛽ BENZİN', 8, 2, '#ef4444'); sg.position.set(cx - 9, 8, cz + 3); L.add(sg); bx(L, .3, 7, .3, MT('#374151'), cx - 9, 3.5, cz + 3); addCirc(cx - 9, cz + 3, .4); npc(cx + 6, cz + 4, -Math.PI / 2, 12);
    };

    /* --- yerleştirme --- */
    const gasG1 = { x: 60, z: 11 }; gas(gasG1.x, gasG1.z);
    gallery(-30, 197); gas(24, 168);
    market(196, -17, 0, 1); market(28, 206, -1, 0);
    park(-238, -36, 40, 32, 18); park(-40, -208, 34, 30, 16);
    { const pd = new T.Mesh(new T.CylinderGeometry(11, 11, .05, 28), new T.MeshStandardMaterial({ color: '#3b82f6', roughness: .1, metalness: .3 })); pd.position.set(46, .04, -240); L.add(pd); reserve(46, -240, 24, 24); addCirc(46, -240, 10); }
    VIL.forEach(V => {
      const { cx, cz, ax, az } = V, T2 = (u, v) => [cx + u * ax - v * az, cz + u * az + v * ax], px = -az, pz = ax;
      const cs = ax ? [cx, cz - 62, cx, cz + 62] : [cx - 62, cz, cx + 62, cz]; road(...cs, .033);
      const lab = label(V.n, 22, 5.5, 'rgba(15,23,42,.9)', V.col); const [lx, lz] = T2(-70, 0); lab.position.set(lx, 9, lz); L.add(lab);
      for (let u = -68; u <= 68; u += 12) for (const sd of [-1, 1]) { const [x, z] = T2(u + (rnd() - .5) * 3, sd * (10.5 + rnd() * 2.5)); const [fx, fz] = [-px * sd, -pz * sd]; house(x, z, fx, fz, V); }
      for (let v = 18; v <= 60; v += 13) for (const sv of [-1, 1]) for (const su of [-1, 1]) { const [x, z] = T2(su * (10.5 + rnd() * 2), sv * (v + rnd() * 2)); house(x, z, -ax * su, -az * su, V); }
      for (let i = 0; i < 6; i++) { const u = -70 + i * 28, [x, z] = T2(u, 0); lamp(...T2(u, 3.4)); lamp(...T2(u + 14, -3.4)); }
      for (let i = 0; i < 4; i++) { const u = -52 + i * 34 + rnd() * 10, sd = rnd() < .5 ? -1 : 1, [x, z] = T2(u, sd * 5.4); if (!free(x, z, 3, 3, 0)) { } const cm = mkCar(pick(['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#e5e7eb', '#a855f7']), pick(['sedan', 'suv', 'sedan', 'truck'])); cm.position.set(x, 0, z); cm.rotation.y = Math.atan2(ax, az) + (sd > 0 ? 0 : Math.PI); L.add(cm); addCirc(x, z, 1.5); }
      for (let i = 0; i < 55; i++) { const [x, z] = T2((rnd() - .5) * 170, (rnd() - .5) * 170); if (free(x, z, 1.2, 1.2, 2.2)) CITY.trees.push({ x, z, h: 3.5 + rnd() * 4, hue: V.tree + rnd() * .05 }); }
    });
    // yol kenarı ağaç + açık arazi ağaçları
    for (let i = 0; i < 1100; i++) { const x = (rnd() - .5) * 620, z = (rnd() - .5) * 620; if (Math.hypot(x, z) < 125) continue; if (VIL.some(V => Math.abs(x - V.cx) < 88 && Math.abs(z - V.cz) < 88)) continue; if (!free(x, z, 1, 1, 3.5)) continue; CITY.trees.push({ x, z, h: 4 + rnd() * 6, hue: .3 + rnd() * .08 }); }
    { const N = CITY.trees.length, trk = new T.InstancedMesh(new T.CylinderGeometry(.3, .45, 1, 6), MT('#5a3a22', 1), N), cones = [0, 1, 2].map(() => new T.InstancedMesh(new T.ConeGeometry(1, 1, 8), std('#ffffff', 1), N)), dm = new T.Object3D(), cc = new T.Color();
      CITY.trees.forEach((t_, i) => { const h = t_.h, sc = .8 + rnd() * .5; dm.rotation.set(0, rnd() * 6, 0); dm.position.set(t_.x, h * .25, t_.z); dm.scale.set(1, h * .5, 1); dm.updateMatrix(); trk.setMatrixAt(i, dm.matrix);
        cones.forEach((c, k) => { dm.position.set(t_.x, h * .55 + k * h * .22, t_.z); dm.scale.set((2.2 - k * .5) * sc, h * .55, (2.2 - k * .5) * sc); dm.updateMatrix(); c.setMatrixAt(i, dm.matrix); c.setColorAt(i, cc.setHSL(t_.hue, .5, .18 + k * .05)); }); addCirc(t_.x, t_.z, .7); });
      [trk, ...cones].forEach(m => { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; m.frustumCulled = false; L.add(m); }); }

    /* --- trafik --- */
    [[[24, .95], [285, .95], [285, -.95], [24, -.95]], [[-24, -.95], [-285, -.95], [-285, .95], [-24, .95]], [[.95, 24], [.95, 285], [-.95, 285], [-.95, 24]], [[-.95, -24], [-.95, -285], [.95, -285], [.95, -24]]].forEach((pts, pi) => {
      const P = mkPath(pts), arr = [], cols = ['#f97316', '#38bdf8', '#e5e7eb', '#84cc16', '#f43f5e', '#c084fc'];
      for (let i = 0; i < 3; i++) { const g = mkCar(cols[(pi * 2 + i) % 6], ['sedan', 'suv', 'taxi', 'truck', 'hatch', 'van', 'police', 'jeep'][(pi + i) % 8]); L.add(g); const c = { g, P, s: i * P.len / 3, v: 8, spd: 8 + i * 1.5, grp: arr, ry: 0 }; arr.push(c); roadCars.push(c); }
    });
  }

  // gökyüzü kubbesi + oyuncuyu izleyen gölgeli ay ışığı
  const sky = (() => { const cv = document.createElement('canvas'); cv.width = 4; cv.height = 256; const x = cv.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#050918'); g.addColorStop(.45, '#101a45'); g.addColorStop(.52, '#2a3a7a'); g.addColorStop(.56, '#4a4f8c'); g.addColorStop(.6, '#16204a'); g.addColorStop(1, '#0b1230'); x.fillStyle = g; x.fillRect(0, 0, 4, 256);
    const m = new T.Mesh(new T.SphereGeometry(520, 24, 14), new T.MeshBasicMaterial({ map: new T.CanvasTexture(cv), side: T.BackSide, fog: false, depthWrite: false, depthTest: false })); m.renderOrder = -10; m.frustumCulled = false; L.add(m); return m; })();
  lights[1].color.set('#c4cfff'); lights[1].shadow.mapSize.set(2048, 2048); Object.assign(lights[1].shadow.camera, { left: -38, right: 38, top: 38, bottom: -38, far: 90 }); lights[1].shadow.bias = -.0004; lights[1].shadow.camera.updateProjectionMatrix(); scene.add(lights[1].target);
  /* ---------- ARABA: sürüş, galeri, benzin, market, harita ---------- */
  CITY.hit = (o, rad) => { let hit = false;
    for (const b of CITY.boxes) { if (o.x < b.x0 - rad || o.x > b.x1 + rad || o.z < b.z0 - rad || o.z > b.z1 + rad) continue;
      const dl = o.x - (b.x0 - rad), dr = b.x1 + rad - o.x, dt = o.z - (b.z0 - rad), db = b.z1 + rad - o.z, m = Math.min(dl, dr, dt, db);
      if (m === dl) o.x = b.x0 - rad; else if (m === dr) o.x = b.x1 + rad; else if (m === dt) o.z = b.z0 - rad; else o.z = b.z1 + rad; hit = true; }
    for (const c of CITY.circ) { const dx = o.x - c.x; if (dx > 7 || dx < -7 || c.r <= 0) continue; const dz = o.z - c.z; if (dz > 7 || dz < -7) continue; const mn = c.r + rad, dd = Math.hypot(dx, dz); if (dd < mn) { const k = mn / (dd || .001); o.x = c.x + dx * k; o.z = c.z + dz * k; hit = true; } }
    return hit; };
  CITY.carCirc = { x: 0, z: 0, r: 1.5 }; CITY.circ.push(CITY.carCirc);
  const buildMine = () => { if (CITY.mine) L.remove(CITY.mine); const g = carModel(CITY.idx); const sp = new T.SpotLight('#fff4d0', 0, 60, .55, .6, 1); sp.position.set(0, .9, 1.4); sp.target.position.set(0, .3, 16); g.add(sp, sp.target); g.userData.sp = sp; L.add(g); CITY.mine = g; placeMine(); };
  const placeMine = () => { const c = CITY.c; CITY.mine.position.set(c.x, 0, c.z); CITY.mine.rotation.y = c.h; CITY.carCirc.x = c.x; CITY.carCirc.z = c.z; };
  buildMine();
  const saveFuel = () => { try { localStorage.setItem('vibra_fuel', String(Math.round(CITY.fuel))); localStorage.setItem('vibra_car', String(CITY.idx)); } catch {} };
  const carNear = r => Math.hypot(CITY.c.x - myP.x, CITY.c.z - myP.z) < r;
  const nearPump = () => CITY.pumps.find(p => Math.hypot(p.x - CITY.c.x, p.z - CITY.c.z) < 7.5);
  const inGallery = () => { const G = CITY.gal; return G && !CITY.drive && Math.abs(myP.x - G.x) < G.w / 2 + 2 && Math.abs(myP.z - G.z) < G.d / 2 + 2; };
  // HUD + mini harita
  const chud = document.createElement('div'); chud.style.cssText = 'position:absolute;left:50%;bottom:22px;transform:translateX(-50%);display:none;z-index:20;min-width:270px;padding:10px 16px;border-radius:16px;background:rgba(10,14,32,.82);color:#fff;font:700 14px sans-serif;text-align:center;border:1px solid #7c5cff77;pointer-events:none';
  chud.innerHTML = '<div style="font-size:30px"><span id="csp">0</span> <small style="font-size:13px;opacity:.7">km/h</small></div><div style="height:8px;background:#fff2;border-radius:6px;margin:6px 0"><i id="cfb" style="display:block;height:100%;border-radius:6px;background:#22c55e;width:100%"></i></div><div style="font-size:12px;opacity:.85">⛽ <span id="cft">100</span>% · W/S gaz-fren · A/D direksiyon · Boşluk el freni · Shift turbo · E: in</div>';
  el.appendChild(chud); const csp = chud.querySelector('#csp'), cfb = chud.querySelector('#cfb'), cft = chud.querySelector('#cft');
  const MM = 150, mmx = x => (x + 320) / 640 * MM, mmc = document.createElement('canvas'); mmc.width = mmc.height = MM * 2; mmc.getContext('2d').scale(2, 2); mmc.className = 'mm'; mmc.style.cssText = 'width:150px !important;height:150px !important;max-width:150px;max-height:150px;position:absolute;right:12px;top:64px;border-radius:14px;border:1px solid #7c5cff88;z-index:18;pointer-events:none';
  el.appendChild(mmc); const mmBg = document.createElement('canvas'); mmBg.width = mmBg.height = MM * 2; mmBg.getContext('2d').scale(2, 2);
  { const x = mmBg.getContext('2d'); x.fillStyle = 'rgba(10,28,18,.9)'; x.fillRect(0, 0, MM, MM); x.strokeStyle = '#9aa3b5'; x.lineWidth = 2; x.beginPath(); x.moveTo(mmx(-300), mmx(0)); x.lineTo(mmx(300), mmx(0)); x.moveTo(mmx(0), mmx(-300)); x.lineTo(mmx(0), mmx(300)); x.stroke();
    x.beginPath(); x.arc(mmx(0), mmx(0), 19 / 640 * MM, 0, 6.3); x.stroke(); x.lineWidth = 1;
    [['#ef4444', 220, 0, 'K'], ['#3b82f6', -220, 0, 'M'], ['#22c55e', 0, -220, 'O'], ['#f59e0b', 0, 220, 'Ç']].forEach(([c, vx, vz, l]) => { x.fillStyle = c + '55'; x.fillRect(mmx(vx - 75), mmx(vz - 75), 150 / 640 * MM, 150 / 640 * MM); x.fillStyle = '#fff'; x.font = 'bold 10px sans-serif'; x.textAlign = 'center'; x.fillText(l, mmx(vx), mmx(vz) + 4); });
    x.font = '10px sans-serif'; CITY.pumps.forEach((p, i) => { if (i % 3 === 1) x.fillText('⛽', mmx(p.x), mmx(p.z) + 4); }); CITY.markets.forEach(m => x.fillText('🛒', mmx(m.x), mmx(m.z) + 4)); x.fillText('🚘', mmx(CITY.gal.x), mmx(CITY.gal.z) + 4); x.fillText('⛲', mmx(-238), mmx(-36) + 4); x.fillText('⛲', mmx(-40), mmx(-208) + 4); x.fillText('🔥', mmx(0), mmx(0) + 4); }
  // ses
  const engStart = () => { try { ac(); const o = AC.createOscillator(), g = AC.createGain(), f = AC.createBiquadFilter(); o.type = 'sawtooth'; f.type = 'lowpass'; f.frequency.value = 420; g.gain.value = .035; o.frequency.value = 50; o.connect(f); f.connect(g); g.connect(master); o.start(); CITY.eng = { o, g }; } catch {} };
  const engStop = () => { try { CITY.eng?.o.stop(); } catch {} CITY.eng = null; }; w.eng = engStop;
  // paneller
  const closePanel = () => { CITY.panel?.remove(); CITY.panel = null; };
  const panel = (html, bind, at) => { closePanel(); const d = document.createElement('div'); d.style.cssText = 'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:60;background:rgba(15,18,38,.97);border:1px solid #7c5cff99;border-radius:18px;padding:16px;min-width:340px;max-width:94vw;max-height:84vh;overflow:auto;color:#fff;font:14px sans-serif;box-shadow:0 20px 60px #000a';
    d.innerHTML = html; el.appendChild(d); try { document.exitPointerLock?.(); } catch {} d.querySelector('[data-x]').onclick = closePanel; bind(d); CITY.panel = d; CITY.panelAt = at; };
  const coinsNow = () => (S.me.coins != null ? S.me.coins : 100);
  const owns = i => i === 0 || (S.me.owned || []).includes('car:' + i);
  const selectCar = (i, atGallery) => { CITY.idx = i; if (atGallery) { const e = CITY.gal.exit; Object.assign(CITY.c, { x: e.x, z: e.z, h: 0, v: 0 }); CITY.fuel = 100; } buildMine(); saveFuel(); };
  const openGallery = () => {
    const rows = () => CARS.map((c, i) => { const o = owns(i), cur = CITY.idx === i; return `<div style="display:flex;align-items:center;gap:10px;padding:8px;border-radius:12px;background:${cur ? '#7c5cff33' : '#ffffff10'};margin-bottom:6px"><i style="width:18px;height:18px;border-radius:50%;background:${c.col};flex:none"></i><div style="flex:1"><b>${c.n}</b><br><small style="opacity:.75">${c.d} · ${Math.round(c.vmax * 3.6)} km/h</small></div>${cur ? '<span style="color:#86efac;font-weight:700">Kullanımda</span>' : `<button data-i="${i}" style="border:0;border-radius:10px;padding:8px 12px;font-weight:700;cursor:pointer;background:${o ? '#22c55e' : '#fbbf24'};color:#111">${o ? 'Seç' : 'Satın Al · ' + c.price + ' 💰'}</button>`}</div>`; }).join('');
    const paint = d => { d.querySelector('#gl').innerHTML = rows(); d.querySelector('#gc').textContent = '💰 ' + coinsNow(); d.querySelectorAll('[data-i]').forEach(b => b.onclick = async () => { const i = +b.dataset.i; if (!owns(i)) { if (coinsNow() < CARS[i].price) { toast(`Yetersiz bakiye! ${CARS[i].price} 💰 lazım (sende ${coinsNow()} 💰). Parkur oyna, kazan!`); sfx('hurt'); return; }
        try { const r = await api('/api/car/buy', 'POST', { i }); S.me.coins = r.coins; S.me.owned = r.owned; updateCoinsUIGlobal(); sfx('join'); } catch (e) { toast(e.message); return; } }
        selectCar(i, true); toast(`🚗 ${CARS[i].n} galerinin önünde park etti!`); sfx('pop'); paint(d); }); };
    panel(`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><b style="font-size:17px">🚘 Oto Galeri</b><span id="gc" style="color:#fde68a;font-weight:700"></span><button data-x style="border:0;background:#fff2;color:#fff;border-radius:8px;padding:4px 10px;cursor:pointer">✕</button></div><div id="gl"></div>`, paint, CITY.gal);
  };
  /* ---- Market: yiyecek/içecek, çanta, yeme ---- */
  const FOODS = [   // sıra sunucudaki fiyat listesiyle aynı
    { n: '🍎 Elma', p: 5, d: '+30 ❤️', hp: 30, cat: 'Yiyecek' }, { n: '🥪 Sandviç', p: 12, d: '+70 ❤️', hp: 70, cat: 'Yiyecek' },
    { n: '🛢️ Benzin Bidonu', p: 25, d: '+50 ⛽ (hemen dolar)', fuel: 50, cat: 'Araç' }, { n: '🍌 Muz', p: 6, d: '+35 ❤️', hp: 35, cat: 'Yiyecek' },
    { n: '🍦 Dondurma', p: 10, d: '+50 ❤️', hp: 50, cat: 'Yiyecek' }, { n: '🍕 Pizza', p: 15, d: '+80 ❤️', hp: 80, cat: 'Yiyecek' },
    { n: '🍔 Burger', p: 18, d: 'Canı tamamen doldurur ❤️', hp: 999, cat: 'Yiyecek' }, { n: '🍫 Çikolata', p: 8, d: '+30 ❤️ · 20 sn hızlı 💨', hp: 30, boost: 20, cat: 'İçecek & Atıştırmalık' },
    { n: '🥤 Enerji İçeceği', p: 20, d: '45 sn çok hızlı ⚡', boost: 45, cat: 'İçecek & Atıştırmalık' }, { n: '💧 Su', p: 3, d: '+10 ❤️', hp: 10, cat: 'İçecek & Atıştırmalık' },
  ];
  const bagKey = () => 'vibra_bag_' + (S.me?.id || 0);
  const bagGet = () => { try { return JSON.parse(localStorage.getItem(bagKey()) || '{}'); } catch { return {}; } };
  const bagSet = b => { try { localStorage.setItem(bagKey(), JSON.stringify(b)); } catch {} };
  const eatFx = em => {
    const d = document.createElement('div'); d.textContent = em; d.style.cssText = 'position:absolute;left:50%;bottom:32%;font-size:72px;z-index:70;pointer-events:none;filter:drop-shadow(0 6px 10px #0008)'; el.appendChild(d);
    d.animate([{ transform: 'translate(-50%,0) scale(.5)', opacity: 0 }, { transform: 'translate(-50%,-30px) scale(1.25)', opacity: 1, offset: .25 }, { transform: 'translate(-50%,-50px) scale(.9) rotate(-8deg)', opacity: 1, offset: .55 }, { transform: 'translate(-50%,-110px) scale(.7)', opacity: 0 }], { duration: 1500, easing: 'ease-out' }).onfinish = () => d.remove();
    [0, 280, 560].forEach(t => setTimeout(() => sfx('pop'), t));
  };
  const eatItem = i => {
    const f = FOODS[i]; if (!f.boost && myP.hp >= myP.maxhp) { toast('Zaten tokum 😅 (canın dolu)'); return false; }
    if (f.hp) heal(f.hp); if (f.boost) myP.boostT = Math.max(myP.boostT || 0, f.boost);
    eatFx(f.n.split(' ')[0]); toast(`😋 ${f.n} yedin! ${f.d}`); return true;
  };
  const openMarket = () => {
    let tab = 'shop';
    const html = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;gap:14px"><b style="font-size:17px">🛒 Market</b><span id="mc" style="color:#fde68a;font-weight:700"></span><button data-x style="border:0;background:#fff2;color:#fff;border-radius:8px;padding:4px 10px;cursor:pointer">✕</button></div>
      <div style="display:flex;gap:6px;margin-bottom:10px"><button data-tab="shop" style="flex:1;border:0;border-radius:10px;padding:8px;font-weight:700;cursor:pointer"></button><button data-tab="bag" style="flex:1;border:0;border-radius:10px;padding:8px;font-weight:700;cursor:pointer"></button></div><div id="mk" style="min-width:330px"></div>`;
    panel(html, d => {
      const btn = 'border:0;border-radius:10px;padding:8px 10px;font-weight:700;cursor:pointer;';
      const draw = () => {
        d.querySelector('#mc').textContent = '💰 ' + coinsNow(); const bag = bagGet(), nb = Object.values(bag).reduce((a, b) => a + b, 0);
        d.querySelectorAll('[data-tab]').forEach(b => { const on = b.dataset.tab === tab; b.style.background = on ? '#7c5cff' : '#ffffff18'; b.style.color = '#fff'; b.textContent = b.dataset.tab === 'shop' ? '🛍️ Ürünler' : `🎒 Çanta (${nb})`; });
        const box = d.querySelector('#mk');
        if (tab === 'shop') {
          let cat = '', h = '';
          FOODS.map((f, i) => [f, i]).sort((x, y) => x[0].cat.localeCompare(y[0].cat, 'tr')).forEach(([f, i]) => {
            if (f.cat !== cat) { cat = f.cat; h += `<div style="margin:10px 0 4px;font-size:12px;opacity:.7;font-weight:700">${cat}</div>`; }
            h += `<div style="display:flex;align-items:center;gap:8px;padding:8px;border-radius:12px;background:#ffffff10;margin-bottom:6px"><div style="flex:1"><b>${f.n}</b><br><small style="opacity:.75">${f.d}</small></div>
              <button data-buy="${i}" style="${btn}background:#fbbf24;color:#111">${f.p} 💰 ${f.fuel ? 'Al' : 'Çantaya'}</button>${f.fuel ? '' : `<button data-buyeat="${i}" style="${btn}background:#22c55e;color:#111">Al + Ye 🍽️</button>`}</div>`;
          });
          box.innerHTML = h;
        } else {
          const rows = Object.entries(bag).filter(([, n]) => n > 0);
          box.innerHTML = rows.length ? rows.map(([i, n]) => `<div style="display:flex;align-items:center;gap:8px;padding:8px;border-radius:12px;background:#ffffff10;margin-bottom:6px"><div style="flex:1"><b>${FOODS[i].n}</b> <span style="opacity:.7">×${n}</span><br><small style="opacity:.75">${FOODS[i].d}</small></div><button data-eat="${i}" style="${btn}background:#22c55e;color:#111">Ye 🍽️</button></div>`).join('') : '<p style="opacity:.7;text-align:center;padding:18px">Çantan boş. Ürünler sekmesinden bir şeyler al!</p>';
        }
        d.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; sfx('pop'); draw(); });
        const buy = async (i, eat) => {
          const f = FOODS[i]; if (eat && !f.boost && myP.hp >= myP.maxhp) { toast('Zaten tokum 😅 (canın dolu)'); return; }
          try {
            const r = await api('/api/market/buy', 'POST', { i }); S.me.coins = r.coins; updateCoinsUIGlobal();
            if (f.fuel) { CITY.fuel = Math.min(100, CITY.fuel + f.fuel); saveFuel(); sfx('join'); toast(f.n + ' alındı ' + f.d); }
            else if (eat) { eatItem(i); sfx('join'); }
            else { const b = bagGet(); b[i] = (b[i] || 0) + 1; bagSet(b); sfx('join'); toast(f.n + ' çantaya eklendi 🎒'); }
          } catch (e) { toast(e.message); sfx('hurt'); }
          draw();
        };
        d.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => buy(+b.dataset.buy, false));
        d.querySelectorAll('[data-buyeat]').forEach(b => b.onclick = () => buy(+b.dataset.buyeat, true));
        d.querySelectorAll('[data-eat]').forEach(b => b.onclick = () => { const i = +b.dataset.eat; if (!eatItem(i)) return; const bg = bagGet(); bg[i] = Math.max(0, (bg[i] || 0) - 1); bagSet(bg); draw(); });
      };
      draw();
    }, CITY.markets[0]);
  };
  let fuelBusy = false;
  const refuel = async () => { if (fuelBusy) return; const u = Math.floor(100 - CITY.fuel); if (u < 3) return toast('Depo zaten dolu ⛽'); fuelBusy = true;
    try { const r = await api('/api/car/fuel', 'POST', { units: u }); CITY.fuel = 100; S.me.coins = r.coins; updateCoinsUIGlobal(); saveFuel(); sfx('join'); toast(`⛽ Depo doldu (-${r.cost} 💰)`); } catch (e) { toast(e.message); sfx('hurt'); } fuelBusy = false; };
  const enterCar = () => { CITY.drive = true; myP.a = 0; myP.vx = myP.vz = 0; w.fp = false; w.goto = null; CITY.carCirc.r = 0; w.dist = 9; w.pitch = .32; w.yaw = CITY.c.h + Math.PI; closePanel(); chud.style.display = 'block'; sfx('door'); engStart(); netSend(true); toast('🚗 Arabaya bindin!'); };
  const exitCar = silent => { if (!CITY.drive) return; CITY.drive = false; const c = CITY.c; c.v = 0; c.vl = 0; c.sa = 0; myP.x = myP.tx = c.x - Math.cos(c.h) * 2.4; myP.z = myP.tz = c.z + Math.sin(c.h) * 2.4; myP.vx = myP.vz = 0; collideLobby(myP, .35); w.dist = 8; w.pitch = .45; CITY.carCirc.r = 1.5; chud.style.display = 'none'; engStop(); CITY.mine.userData.sp.intensity = 0; placeMine(); saveFuel(); if (!silent) { sfx('door'); netSend(true); } };
  CITY.out = exitCar;
  const callCar = () => { if (CITY.drive || myP.room !== 0 || myP.seat >= 0) return; const c = CITY.c; c.x = myP.x + Math.sin(myP.ry) * 3.2; c.z = myP.z + Math.cos(myP.ry) * 3.2; c.h = myP.ry + Math.PI / 2; c.v = 0; if (CITY.fuel < 15) CITY.fuel = 15; collideLobby(c, 1.3); placeMine(); sfx('pop'); toast('📞 Arabanı yanına çağırdın'); };
  const act0 = w.act; w.act = () => { if (myP.seat >= 0) return act0(); closePanelIfFar();
    if (CITY.drive) { if (nearPump()) return refuel(); if (Math.abs(CITY.c.v) > 3) return toast('Önce dur! (S / Boşluk)'); return exitCar(); }
    const mk = CITY.markets.find(m => Math.hypot(m.x - myP.x, m.z - myP.z) < 3.4); if (myP.room === 0 && mk) return openMarket(); if (myP.room === 0 && inGallery()) return openGallery(); if (myP.room === 0 && carNear(4)) return enterCar(); return act0(); };
  function closePanelIfFar() { }
  w.ckd = e => { if (e.target.closest?.('input,textarea')) return; if (e.key.toLowerCase() === 'r') callCar(); }; window.addEventListener('keydown', w.ckd);
  const cityPrompt = ph => { const c = CITY.c; if (myP.seat >= 0 || myP.room !== 0) return ph;
    if (CITY.drive) { if (nearPump()) return `E: ⛽ Depoyu doldur (${Math.ceil((100 - CITY.fuel) / 20)} 💰)`; return Math.abs(c.v) < 3 ? 'E: Arabadan in' : ''; }
    if (CITY.markets.some(m => Math.hypot(m.x - myP.x, m.z - myP.z) < 3.4)) return 'E: Market 🛒'; if (inGallery()) return 'E: Oto Galeri 🚘'; if (carNear(4)) return 'E: Arabaya bin 🚗 (R: arabayı çağır)'; return ph; };
  const wrap = a => Math.atan2(Math.sin(a), Math.cos(a)); const rcars = new Map();
  const cityUpdate = (dt, t) => {
    const c = CITY.c, K = w.keys, car = CARS[CITY.idx];
    if (myP.room !== 0) { rcars.forEach(r => r.visible = false); return; }
    if (CITY.panel && CITY.panelAt && Math.hypot((CITY.panelAt.x || 0) - myP.x, (CITY.panelAt.z || 0) - myP.z) > 22) closePanel();
    if (CITY.drive) {
      const thr = (K.w || K.arrowup ? 1 : 0) - (K.s || K.arrowdown ? 1 : 0), st = (K.a || K.arrowleft ? 1 : 0) - (K.d || K.arrowright ? 1 : 0), empty = CITY.fuel <= 0, turbo = K.shift && !empty;
      const hb = !!K[' '], vabs = Math.abs(c.v), lim = empty ? 3.5 : car.vmax * (turbo ? 1.15 : .85);
      c.sa = c.sa || 0; c.vl = c.vl || 0; c.ax = c.ax || 0; c.lat = c.lat || 0; c.rpm = c.rpm || 0; c.skT = c.skT || 0;
      // motor: güç eğrisi (hız arttıkça itiş azalır), fren, geri vites, motor freni, hava direnci
      const frac = Math.min(1, Math.max(0, c.v) / lim), pw = Math.max(.1, 1 - Math.pow(frac, 1.7)) * (turbo ? 1.5 : 1) * car.acc * 1.2;
      let a = 0;
      if (thr > 0) a = c.v < -.5 ? 18 : pw; else if (thr < 0) a = c.v > .5 ? -(16 + car.acc) : -pw * .5;
      else a = -Math.sign(c.v) * Math.min(vabs / Math.max(dt, .001), 2.4);
      if (hb) a -= Math.sign(c.v) * 11;
      a -= c.v * vabs * .004;
      const prevV = c.v; c.v += a * dt; if (thr === 0 && prevV * c.v < 0) c.v = 0;
      c.v = Math.max(-lim * .18, Math.min(lim, c.v)); if (empty && c.v > 3.5) c.v -= 10 * dt;
      c.ax += ((c.v - prevV) / Math.max(dt, .001) - c.ax) * Math.min(1, dt * 6);
      // direksiyon: hızla azalan açı, yumuşak dönüş, tutuş sınırı (understeer) ve el freniyle drift
      const maxSt = .62 / (1 + vabs / 11); c.sa += (st * maxSt - c.sa) * Math.min(1, dt * (st ? 7 : 11));
      let yaw = c.v * Math.tan(c.sa) / 2.7;
      const grip = (hb ? 4.2 : 10.5) * (turbo ? 1.1 : 1), maxYaw = grip / Math.max(3, vabs), under = Math.abs(yaw) > maxYaw; if (under) yaw = Math.sign(yaw) * maxYaw;
      c.h += yaw * dt; c.lat += (yaw * c.v - c.lat) * Math.min(1, dt * 8);
      c.vl += (-yaw * c.v * (hb ? .9 : .1) - (under ? Math.sign(yaw) * vabs * .06 : 0)) * dt;
      c.vl *= Math.exp(-dt * (hb ? 1.1 : 6.5)); c.vl = Math.max(-vabs * .75, Math.min(vabs * .75, c.vl));
      const fx = Math.sin(c.h), fz = Math.cos(c.h), lx = Math.cos(c.h), lz = -Math.sin(c.h);
      const o = { x: c.x + (fx * c.v + lx * c.vl) * dt, z: c.z + (fz * c.v + lz * c.vl) * dt }, nx = o.x, nz = o.z; collideLobby(o, 1.25);
      // vites / devir (sesi ve ibreyi sallar)
      { const gf = Math.min(.9999, vabs / (lim * 1.05)), gi = Math.floor(gf * 5); c.rpm = (gf * 5 - gi) * .72 + .22 + (thr > 0 ? .08 : 0) * (1 - gf * .3); }
      // lastik izi + duman
      c.skT += dt;
      if (c.skT > .04 && vabs > 3 && (Math.abs(c.vl) > 2 || (hb && vabs > 6) || (thr < 0 && c.v > 9))) {
        c.skT = 0; const S2 = CITY._sk || (CITY._sk = { m: [], i: 0, mat: new T.MeshBasicMaterial({ color: '#0b0b0b', transparent: true, opacity: .5, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }) });
        const vx = fx * c.v + lx * c.vl, vz = fz * c.v + lz * c.vl, va = Math.atan2(vx, vz);
        [-1, 1].forEach(sd => { const k = S2.i++ % 100; let m = S2.m[k]; if (!m) { m = S2.m[k] = new T.Mesh(new T.PlaneGeometry(.26, .9), S2.mat); m.rotation.order = 'YXZ'; m.rotation.x = -Math.PI / 2; L.add(m); }
          m.position.set(c.x + lx * sd * .72 - fx * 1.0, .05, c.z + lz * sd * .72 - fz * 1.0); m.rotation.y = va; });
        if (Math.abs(c.vl) > 2.5 || hb) fxBurst(c.x - fx * 1.2, .2, c.z - fz * 1.2, '#e5e7eb', 2, .9, .5, 1.2, .5);
      }
      if (Math.hypot(o.x - nx, o.z - nz) > .02) { if (Math.abs(c.v) > 7) { PK.shake = Math.max(PK.shake, .22); sfx('land'); fxBurst(o.x, .6, o.z, '#cbd5e1', 6, 1.5, 1, 4, .4); } c.v *= .3; c.vl *= .3; }
      c.x = o.x; c.z = o.z; CITY.fuel = Math.max(0, CITY.fuel - (Math.abs(c.v) * dt * .011 + dt * .015)); if (CITY.fuel < 12 && CITY.fuel > 0 && !CITY.lowT) { CITY.lowT = 1; toast('⛽ Benzin azalıyor! Benzin istasyonu haritada ⛽'); } if (CITY.fuel > 20) CITY.lowT = 0; if (CITY.fuel <= 0 && !CITY.emT) { CITY.emT = 1; toast('⛽ Benzin bitti! İn ve R ile arabayı çağır ya da yürüyerek istasyona git.'); } if (CITY.fuel > 1) CITY.emT = 0;
      placeMine(); const g = CITY.mine; g.rotation.z += (-c.lat * .0135 - g.rotation.z) * Math.min(1, dt * 7); g.rotation.x += (-c.ax * .0034 + Math.sin(t * 30) * .004 * Math.min(1, Math.abs(c.v) / 18) - g.rotation.x) * Math.min(1, dt * 7);   // gövde yatması / burun dalışı / süspansiyon titreşimi g.userData.sp.intensity = 3;
      myP.x = myP.tx = c.x; myP.z = myP.tz = c.z; myP.y = 0; myP.vx = myP.vz = 0; myP.ry = myP.tr = c.h; myP.a = 0;
      w.yaw += wrap(c.h + Math.PI - w.yaw) * Math.min(1, dt * (Math.abs(c.v) > 2 ? 2.4 : 0)); w.dist = Math.max(w.dist, 6); if (Math.abs(c.v) > car.vmax * .75) PK.fovPunch = Math.max(PK.fovPunch, 4 + Math.abs(c.v) / car.vmax * 5);
      csp.textContent = Math.round(Math.abs(c.v) * 3.6); cfb.style.width = CITY.fuel + '%'; cfb.style.background = CITY.fuel < 15 ? '#ef4444' : CITY.fuel < 40 ? '#f59e0b' : '#22c55e'; cft.textContent = Math.round(CITY.fuel);
      if (CITY.eng) { CITY.eng.o.frequency.value = 44 + c.rpm * 150 + (turbo ? 20 : 0); CITY.eng.g.gain.value = .018 + c.rpm * .022 + (thr > 0 ? .012 : 0); }
      if (Math.abs(c.v) > 12 && !hb && Math.random() < dt * 20) fxBurst(c.x - Math.sin(c.h) * 1.6, .15, c.z - Math.cos(c.h) * 1.6, '#8a7f70', 1, .6, .4, 1, .4);
    }
    CITY.spin.forEach(p => p.rotation.y += dt * .5);
    CITY.fountains.forEach(js => js.forEach(j => { const a = (t * 1.3 + j.ph) % 1; j.s.position.set(Math.cos(j.a) * a * 1.4, 1.9 + Math.sin(a * Math.PI) * 1.5 - a * a * .6, Math.sin(j.a) * a * 1.4); }));
    CITY.npcs.forEach((n, i) => { try { poseChar(n, 0, t + i * 2.3, '', 9); } catch {} });
    stars.position.set(myP.x, 0, myP.z); sky.position.copy(cam.position); lights[1].position.set(myP.x - 14, 28, myP.z + 10); lights[1].target.position.set(myP.x, 0, myP.z); lights[1].target.updateMatrixWorld();
    // diğer oyuncuların arabaları
    for (const [id, r] of rcars) if (!players.has(id)) { L.remove(r); rcars.delete(id); }
    for (const p of players.values()) { if (p.id === me) continue; let r = rcars.get(p.id); const want = p.drv >= 0 && p.room === 0;
      if (want && (!r || r.userData.i !== p.drv)) { if (r) L.remove(r); r = carModel(Math.min(CARS.length - 1, p.drv)); r.userData.i = p.drv; L.add(r); rcars.set(p.id, r); }
      if (r) { r.visible = !!want; if (want) { r.position.set(p.x, 0, p.z); r.rotation.y = p.ry; } } }
    // mini harita
    const x = mmc.getContext('2d'); x.clearRect(0, 0, MM, MM); x.drawImage(mmBg, 0, 0, MM, MM); const dx = mmx(myP.x), dz = mmx(myP.z); x.save(); x.translate(dx, dz); x.rotate(-(CITY.drive ? c.h : (myP.ry || 0)) + Math.PI); x.fillStyle = '#fff'; x.strokeStyle = '#7c5cff'; x.lineWidth = 2; x.beginPath(); x.moveTo(0, -6); x.lineTo(4, 4); x.lineTo(-4, 4); x.closePath(); x.fill(); x.stroke(); x.restore();
    if (!CITY.drive) { x.fillStyle = CARS[CITY.idx].col; x.fillRect(mmx(c.x) - 2, mmx(c.z) - 2, 5, 5); }
  };

  /* ---------- döngü ---------- */
  const tmp = new T.Vector3(); const prompt = el.querySelector('#wprompt');
  const frame = () => {
    w.raf = requestAnimationFrame(frame); const dt = Math.min(.05, w.clock.getDelta()), t = w.clock.elapsedTime, F = w.fx;
    if (GS.fps) { w.fpsN = (w.fpsN || 0) + 1; if (t - (w.fpsT || 0) >= .5) { el.querySelector('#wfps').textContent = Math.round(w.fpsN / (t - (w.fpsT || 0))) + ' FPS'; w.fpsN = 0; w.fpsT = t; } }
    // takılı kalan geri sayım ("BAŞLA!" / "GO!") yazılarını temizle
    if ((LT.active && LT.phase === 'play' && LT.elapsed > 1.2) || (HD.active && HD.phase === 'play' && performance.now() - HD.startT > 1200)) { const lc = el.querySelector('#ltcd'); if (lc && lc.style.display !== 'none') lc.style.display = 'none'; }
    if (RU.active && RU.phase === 'play' && RU.playT > 1.2) { const rc = el.querySelector('#rucd'); if (rc && rc.textContent) rc.textContent = ''; }
    // kullanıcı listesi senkronu
    const vu = S.voice[call.chanId] || []; const ids = new Set(vu.map(u => u.id)); ids.add(me);
    for (const u of vu) getP(u.id); for (const [id, p] of players) if (!ids.has(id)) { p.lab.remove(); if (p.g) p.g.parent?.remove(p.g); players.delete(id); }
    // —— akıcı hareket (ivme + sürtünme) ——
    let mx = 0, mz = 0; const K = w.keys;
    if (myP.boostT > 0) myP.boostT -= dt; const bst = myP.boostT > 0 ? 1.3 : 1;
    const maxSpd = bst * (w.keys.shift ? (PK.active || LT.active || HD.active ? 8.2 : 7.0) : (PK.active || LT.active || HD.active ? 5.8 : 4.6));
    if (K.w || K.arrowup) mz -= 1; if (K.s || K.arrowdown) mz += 1; if (K.a || K.arrowleft) mx -= 1; if (K.d || K.arrowright) mx += 1;
    if (myP.seat >= 30) { mx = mz = 0; w.goto = null; }
    const rising = myP.seat < 0 && myP.sitK > .3; if (rising || myP.dead || w.frozen || CITY.drive) { mx = mz = 0; w.goto = null; }
    let wishX = 0, wishZ = 0;
    if (mx || mz) {
      if (myP.seat >= 0) stand(); w.goto = null;
      const l = Math.hypot(mx, mz); mx /= l; mz /= l;
      const s = Math.sin(w.yaw), c = Math.cos(w.yaw);
      wishX = mx * c + mz * s; wishZ = -mx * s + mz * c;
      myP.tr = Math.atan2(wishX, wishZ); myP.a = 1;
    } else if (w.goto && myP.seat < 0 && !rising && !myP.dead) {
      const gx = w.goto.x - myP.x, gz = w.goto.z - myP.z, d = Math.hypot(gx, gz);
      if (d < .15) { w.goto = null; myP.a = 0; }
      else { wishX = gx / d; wishZ = gz / d; myP.tr = Math.atan2(wishX, wishZ); myP.a = 1; }
    } else if (myP.seat < 0) myP.a = 0;

    // ivme / sürtünme (yerde hızlı, havada kontrollü)
    const onG = PK.onGround || myP.y <= 0.05;
    const accel = onG ? 38 : 18;
    const friction = onG ? 18 : (PK.active ? 7.5 : 4);
    if (wishX || wishZ) {
      myP.vx += wishX * accel * dt;
      myP.vz += wishZ * accel * dt;
      const sp = Math.hypot(myP.vx, myP.vz);
      const cap = onG ? maxSpd : maxSpd * .92;
      if (sp > cap) { myP.vx *= cap / sp; myP.vz *= cap / sp; }
    } else {
      const sp = Math.hypot(myP.vx, myP.vz);
      if (sp > .01) {
        const drop = Math.min(sp, friction * dt);
        myP.vx *= (sp - drop) / sp; myP.vz *= (sp - drop) / sp;
      } else { myP.vx = myP.vz = 0; }
    }
    PK.px = myP.x; PK.pz = myP.z;
    myP.x += myP.vx * dt; myP.z += myP.vz * dt;

    if (myP.seat < 0) {
      if (myP.room === 0) collideLobby(myP, .35);
      else if (myP.room === 1) { myP.x = Math.max(-6.3, Math.min(6.3, myP.x)); myP.z = Math.max(-3.2, Math.min(4.9, myP.z)); }
      else if (myP.room === 2) { const lim = LT.active ? (LT.arenaR - 0.5) : HD.active ? 14 : RU.active ? 19.5 : PK.active ? 80 : 52; const d = Math.hypot(myP.x, myP.z); if (d > lim) { myP.x *= lim / d; myP.z *= lim / d; } }
    }
    if (myP.seat >= 0) { const st = seats.find(x => x.id === myP.seat); if (st) { const gk = Math.min(1, dt * 6); myP.x += (st.x - myP.x) * gk; myP.z += (st.z - myP.z) * gk; myP.tr = st.ry; myP.vx = myP.vz = 0; } }
    myP.tx = myP.x; myP.tz = myP.z;

    // —— zıplama + coyote + buffer + platform ——
    if (PK.active) updatePlatforms(t, dt);
    if (LT.active) updateLaserTracer(dt);
    if (HD.active) updateHoneyDrop(dt);
    if (RU.active) updateRush(dt, t);
    const floorY = PK.active ? getFloorY(myP.x, myP.z, myP.y)
      : HD.active ? (getHoneyFloorY(myP.x, myP.z, myP.y + 0.15).y > -1e8 ? getHoneyFloorY(myP.x, myP.z, myP.y + 0.15).y : -1e9)
      : 0;
    const wasAir = !PK.onGround;
    // boşluk basılıyken buffer taze kalsın → akıcı ardışık zıplama (parkur)
    if (w.keys[' '] || w.keys['space']) PK.jumpBuf = Math.max(PK.jumpBuf, 0.12);
    PK.coyote = Math.max(0, PK.coyote - dt);
    PK.jumpBuf = Math.max(0, PK.jumpBuf - dt);
    // stretch negatif de olabilir (squash) — 0'a doğru sön
    if (PK.stretch > 0) PK.stretch = Math.max(0, PK.stretch - dt * 6);
    else if (PK.stretch < 0) PK.stretch = Math.min(0, PK.stretch + dt * 8);
    PK.jumpRing = Math.max(0, PK.jumpRing - dt * 5);

    if (myP.vy !== 0 || myP.y > floorY + 0.01) {
      // akıcı yerçekimi (yükselirken biraz yumuşak)
      const inPk = PK.active || LT.active || HD.active;
      const grav = inPk ? (myP.vy > 0 ? 20 : 32) : (myP.vy > 0 ? 20 : 30);
      myP.vy -= grav * dt;
      myP.y += myP.vy * dt;
      if (myP.y <= floorY) {
        myP.y = floorY; myP.vy = 0; PK.onGround = true; PK.coyote = inPk ? 0.16 : 0.12;
        if (wasAir) {
          PK.landT = performance.now();
          PK.stretch = inPk ? -0.12 : -0.06;
          // minimal iniş efekti
          if (inPk) {
            PK.shake = Math.min(0.12, PK.shake + 0.05);
            sfx('land');
            fxBurst(myP.x, myP.y + 0.03, myP.z, '#cbd5e1', 4, 0.9, 0.35, 4, 0.2);
          } else {
            sfx('land');
          }
        }
      } else {
        PK.onGround = false;
      }
    } else {
      myP.y = floorY; myP.vy = 0; PK.onGround = true; PK.coyote = PK.active ? 0.16 : 0.12;
    }

    // zıplama — buffer + coyote ile akıcı
    if (PK.jumpBuf > 0 && (PK.onGround || PK.coyote > 0) && myP.seat < 0 && !myP.dead && !CITY.drive) {
      const inPk = PK.active || LT.active || HD.active;
      PK.jumpBuf = 0; PK.coyote = 0; PK.onGround = false; PK.standOn = -1;
      myP.vy = inPk ? 6.6 : 5.1;
      PK.stretch = 0.18;
      PK.jumpRing = inPk ? 0.35 : 0.15;
      PK.fovPunch = Math.max(PK.fovPunch, inPk ? 3 : 1);
      sfx('jump');
      fxBurst(myP.x, myP.y + 0.03, myP.z, '#94a3b8', 3, 0.8, 0.4, 3, 0.18);
    }

    // carry with moving platform
    if (PK.active && PK.onGround && PK.standOn >= 0) {
      const p = PK.plats[PK.standOn];
      let cvx = 0, cvz = 0; if (p.conv) { cvx = (p.conv.dx || 0) * p.conv.spd; cvz = Math.sign(p.conv.dz || 0) * p.conv.spd; }
      const ddx = p.x - p.prevX + cvx * dt, ddz = p.z - p.prevZ + cvz * dt;
      myP.x += ddx; myP.z += ddz; myP.y = p.top;
      myP.tx = myP.x; myP.tz = myP.z;
      if (dt > 0) { PK.pvx = Math.max(-9, Math.min(9, ddx / dt)); PK.pvz = Math.max(-9, Math.min(9, ddz / dt)); }
    } else if (PK.active && !PK.onGround && (PK.pvx || PK.pvz)) {   // atlayınca platformun hızı korunur (yana çekme yok)
      myP.x += PK.pvx * dt; myP.z += PK.pvz * dt; myP.tx = myP.x; myP.tz = myP.z;
    } else if (PK.active) { PK.pvx = PK.pvz = 0; }
    if (PK.active) {
      resolvePlatCollision(myP);
      checkParkourFinish();
      const te = el.querySelector('#pktime');
      if (te) te.textContent = ((performance.now() - PK.startT) / 1000).toFixed(1) + 's';
      parkourTick(dt, t);
      if (myP.y < -7 && !w.frozen) respawnPK();
      for (let i = 0; i < aPN; i++) { aPos[i * 3 + 1] += Math.sin(t + i) * dt * .15; if (aPos[i * 3 + 1] > 20) aPos[i * 3 + 1] = 1; }
      aGeo.attributes.position.needsUpdate = true;
      neonRing.rotation.z = t * .15;
    }
    // adım sesi
    if (myP.a === 1 && PK.onGround) { w.stepT -= dt; if (w.stepT <= 0) { w.stepT = .33; sfx('step'); if (myP.room === 0) fxBurst(myP.x, myP.y + .05, myP.z, '#6a5236', 3, .7, .7, 2, .35); else if (myP.room === 2) fxBurst(myP.x, myP.y + .05, myP.z, '#7c5cff', 2, .5, .5, 2, .3); } } else w.stepT = 0;
    // portal (sadece lobi / ev)
    let pd = 99, pr = null;
    if (myP.room === 0 || myP.room === 1) {
      pr = myP.room === 0 ? F.portalL : F.portalH;
      pd = Math.hypot(pr.position.x - myP.x, pr.position.z - myP.z);
      if (pd > 2.2) w.portalLock = false;
      if (pd < 1.2 && myP.seat < 0 && !CITY.drive && !w.cool && !w.portalLock && !PK.active) { w.cool = 1; setRoom(myP.room === 0 ? 1 : 0); setTimeout(() => w.cool = 0, 1200); }
    }
    // sahne efektleri
    if (myP.room === 0) updateCars(dt);
    cityUpdate(dt, t);
    if (myP.room === 0) {
      F.flames.forEach((f, i) => { f.scale.set(1 + Math.sin(t * 9 + i) * .12, 1 + Math.sin(t * 13 + i * 2) * .18, 1 + Math.cos(t * 11 + i) * .12); f.rotation.y = t * (1 + i); });
      F.fireL.intensity = 2.1 + Math.sin(t * 17) * .35 + Math.sin(t * 31) * .2;
      fireGlow.material.opacity = .5 + Math.sin(t * 13) * .07 + Math.sin(t * 7.3) * .05; fireGlow.scale.setScalar(7 + Math.sin(t * 9) * .35); ember.material.opacity = .8 + Math.sin(t * 11) * .12; groundGlow.material.opacity = .38 + Math.sin(t * 17) * .05;
      smoke.forEach(o => { const a = (t * .16 + o.ph) % 1; o.sp.position.set(Math.sin(o.ph * 40 + a * 3) * .5 + a * 1.2, 2.2 + a * 6, Math.cos(o.ph * 31) * .4); o.sp.scale.setScalar(.8 + a * 3.6); o.sp.material.opacity = .2 * Math.sin(a * Math.PI) * (1 - a * .3); });
      for (let i = 0; i < 70; i++) { F.pAge[i] += dt * (.35 + (i % 5) * .1); if (F.pAge[i] > 1) F.pAge[i] = 0; const a = F.pAge[i]; F.pPos[i * 3] = Math.sin(i * 12.9 + a * 4) * .5 * (1 - a * .4); F.pPos[i * 3 + 1] = .3 + a * 3.4; F.pPos[i * 3 + 2] = Math.cos(i * 7.7 + a * 3) * .5 * (1 - a * .4); }
      F.pg.attributes.position.needsUpdate = true;
      for (let i = 0; i < 40; i++) { const s = F.fSeed[i]; F.fPos[i * 3] += Math.sin(t * .6 + s[0]) * dt * .6; F.fPos[i * 3 + 1] += Math.cos(t * .9 + s[1]) * dt * .3; F.fPos[i * 3 + 2] += Math.cos(t * .5 + s[0]) * dt * .6; } F.fg.attributes.position.needsUpdate = true;
    }
    F.portalL.userData.ring.rotation.z = t; F.portalH.userData.ring.rotation.z = -t;
    // TV
    if (myP.room === 1) {
      w.tvT -= dt; if (w.tvT <= 0) { w.tvT = .09; const x = F.tvX; if (w.tvOn) {
        const bars = ['#fff', '#ff0', '#0ff', '#0f0', '#f0f', '#f00', '#00f']; const sh = Math.floor(t * 3) % 7;
        for (let i = 0; i < 7; i++) { x.fillStyle = bars[(i + sh) % 7]; x.fillRect(i * 46, 0, 46, 180); }
        x.fillStyle = 'rgba(0,0,0,.35)'; for (let y = 0; y < 180; y += 4) x.fillRect(0, y, 320, 2);
        x.fillStyle = '#000a'; x.fillRect(60, 70, 200, 44); x.fillStyle = '#fff'; x.font = 'bold 28px sans-serif'; x.textAlign = 'center'; x.fillText('VIBRA TV', 160, 102);
        for (let i = 0; i < 80; i++) { x.fillStyle = `rgba(255,255,255,${Math.random() * .3})`; x.fillRect(Math.random() * 320, Math.random() * 180, 3, 2); }
        F.tvLight.intensity = 1.6 + Math.random() * .8; F.tvLight.color.setHSL((t * .15) % 1, .8, .6);
      } else { x.fillStyle = '#05060a'; x.fillRect(0, 0, 320, 180); if (w.tvEl) { F.tvLight.intensity = 1.3 + Math.sin(t * 3) * .15; F.tvLight.color.set('#cfe3ff'); } else F.tvLight.intensity = 0; } F.tvTex.needsUpdate = true; }
    }
    animalsUpdate(dt, t); tableFx(dt, t);
    // oyuncular
    const sp = new Set(vu.filter(u => u.speaking).map(u => u.id));
    for (const p of players.values()) {
      const vis = p.room === myP.room && (myP.room !== 2 || p.id === me || (p.pg | 0) === myGame());
      if (!p.g || p.g.userData.key !== JSON.stringify(outfitOf(p.id))) { if (p.g) p.g.parent?.remove(p.g); p.g = buildChar(outfitOf(p.id)); scene.add(p.g); }
      p.g.visible = vis && !(p.drv >= 0); p.lab.style.display = vis ? '' : 'none'; if (!vis) continue;
      if (p.id !== me) { p.x += (p.tx - p.x) * Math.min(1, dt * 10); p.z += (p.tz - p.z) * Math.min(1, dt * 10); const ty = p.ty || 0; p.y = Math.abs(ty - p.y) > 12 ? ty : p.y + (ty - p.y) * Math.min(1, dt * 14); }
      let dr = p.tr - p.ry; while (dr > Math.PI) dr -= Math.PI * 2; while (dr < -Math.PI) dr += Math.PI * 2; p.ry += dr * Math.min(1, dt * 12);
      p.sitK = p.sitK || 0; p.sitK += Math.max(-dt * 1.8, Math.min(dt * 1.8, (p.seat >= 0 ? 1 : 0) - p.sitK));
      // landing crouch + jump stretch (Roblox hissi)
      let landSk = 0;
      if (p.id === me && PK.landT) {
        const lt = (performance.now() - PK.landT) / 1000;
        if (lt < .32) landSk = Math.sin(lt / .32 * Math.PI) * .95;
        else PK.landT = 0;
      }
      const sk = Math.max(p.sitK, landSk), kk = p.sitK * p.sitK * (3 - 2 * p.sitK), isDead = p.id === me && myP.dead;   // kk sadece OTURMA için (iniş çömelmesi karakteri aşağı çekmez)
      if (p.seat >= 0) { const ss = seats.find(x => x.id === p.seat); if (ss) p.seatY = ss.y; } const sy = isDead ? .3 : ((p.seatY ?? .62) - .44) * kk + p.y * (1 - kk);   // oturunca koltuk yüksekliğine göre (içine çökmez)
      p.g.position.set(p.x, sy, p.z); p.g.rotation.order = 'YXZ'; p.g.rotation.y = p.ry; p.g.rotation.x = isDead ? -1.45 : 0;
      // stretch/squash scale
      if (p.id === me && PK.stretch !== 0) {
        const st = PK.stretch;
        const sy2 = 1 + st * .35, sxz = 1 - st * .18;
        p.g.scale.set(sxz, sy2, sxz);
      } else if (p.id === me) p.g.scale.set(1, 1, 1);
      const et = performance.now() / 1000 - p.emAt;
      const airAmt = (p.id === me && !PK.onGround) ? Math.min(1, Math.max(0, (p.y - (PK.active ? getFloorY(p.x, p.z, p.y) : 0)) * .35 + (p.vy > 0 ? .4 : .15))) : 0;
      const leanAmt = (p.id === me && p.a === 1) ? Math.min(1, Math.hypot(p.tx - p.x, p.tz - p.z) * 2 + (w.keys.shift ? .6 : .25)) : 0;
      if (p.g.userData) poseChar(p.g, p.sitK > .6 ? 0 : (p.id === me ? p.a : (Math.hypot(p.tx - p.x, p.tz - p.z) > .05 ? 1 : 0)), t + p.id, et < 3 ? p.em : '', et, landSk, airAmt, leanAmt, p.sitK);
      tmp.set(p.x, sy + 2.25, p.z).project(cam); const vis2 = tmp.z < 1;
      p.lab.style.display = vis && vis2 ? '' : 'none'; p.lab.style.left = (tmp.x * .5 + .5) * innerWidth + 'px'; p.lab.style.top = (-tmp.y * .5 + .5) * innerHeight + 'px';
      const nm = (p.id === me ? S.me.username : userName(p.id)) + (p.id === me ? ' (sen)' : ''); const emHtml = et < 2 && p.em && p.em !== '⚔️' ? `<span class="em">${p.em.startsWith('tv') ? '' : p.em}</span>` : '';
      const html = esc(nm) + emHtml; if (p.lab._h !== html) { p.lab.innerHTML = html; p.lab._h = html; } p.lab.classList.toggle('sp', sp.has(p.id));
    }
    // okey botları: boş koltuklarda oturan karakterler
    { const os = OK.s; if (!w.botG) w.botG = [null, null, null, null];
      for (let i = 0; i < 4; i++) {
        const bid = os?.seats[i], bot = typeof bid === 'string' ? os.bots?.[bid] : null; let b = w.botG[i];
        if (!bot || myP.room !== 1) { if (b) { b.g.visible = false; b.lab.style.display = 'none'; } continue; }
        if (!b || b.id !== bid) {
          if (b) { scene.remove(b.g); b.lab.remove(); }
          const o = { ...defOutfit(bot.look), hat: [0, 4, 6, 8, 11, 0, 9][bot.look % 7], glasses: bot.look % 3 === 0 ? 2 : 0 };
          const lab = document.createElement('div'); lab.className = 'nm'; lab.textContent = bot.name; el.appendChild(lab);
          b = w.botG[i] = { id: bid, g: buildChar(o), lab }; scene.add(b.g);
        }
        const st = seats.find(x => x.id === 30 + i); b.g.visible = true; b.g.position.set(st.x, st.y - .44, st.z); b.g.rotation.y = st.ry; poseChar(b.g, 2, t + i * 3, '', 9);
        tmp.set(st.x, 1.95, st.z).project(cam); b.lab.style.display = tmp.z < 1 ? '' : 'none';
        b.lab.style.left = (tmp.x * .5 + .5) * innerWidth + 'px'; b.lab.style.top = (-tmp.y * .5 + .5) * innerHeight + 'px'; b.lab.classList.toggle('sp', os.phase === 'play' && os.turn === i);
      } }
    // ambiyans
    const fd = myP.room === 0 ? Math.hypot(myP.x, myP.z) : 99; ambVol(myP.room === 0 ? Math.max(0, 1 - fd / 14) : 0, myP.room === 1 && w.tvOn ? Math.max(0, 1 - Math.hypot(myP.x, myP.z + 5) / 12) : 0);
    // ipucu
    let ph = ''; if (myP.seat >= 30) ph = ''; else if (myP.seat >= 0) ph = 'E: Kalk'; else { const s = nearSeat(); if (s) ph = s.okey ? 'E: Okey masasına otur 🎴' : 'E: Otur 🪑'; else if (nearTV()) ph = 'E: TV Kumandası 📺'; else if (nearTablet()) ph = 'E: Mini Oyunlar 📱'; else if (pr && pd < 3) ph = pr.userData.label; }
    ph = cityPrompt(ph); prompt.style.display = ph ? 'block' : 'none'; prompt.textContent = ph;
    // kamera + efektler (normal 3. şahıs — ters dönmez)
    cam.up.set(0, 1, 0);
    const okS = myP.seat >= 30;
    if (PK.shake > 0) PK.shake = Math.max(0, PK.shake - dt * 2.2);
    if (PK.fovPunch > 0) PK.fovPunch = Math.max(0, PK.fovPunch - dt * 12);

    if (w.camY == null || w.camSnap || Math.abs(w.camY - myP.y) > 12) { w.camY = myP.y; w.camX = myP.x; w.camZ = myP.z; w.camSnap = false; }
    if (PK.active) { w.camY += (myP.y - w.camY) * Math.min(1, dt * (PK.onGround ? 7 : 2.4)); w.camX += (myP.x - w.camX) * Math.min(1, dt * 14); w.camZ += (myP.z - w.camZ) * Math.min(1, dt * 14); }
    else { w.camY = myP.y; w.camX = myP.x; w.camZ = myP.z; }
    const cx = okS ? TC.x : (PK.active ? w.camX : myP.x), cz = okS ? TC.z : (PK.active ? w.camZ : myP.z);
    const cy = okS ? TY : PK.active ? 1.5 + w.camY : 1.35 + myP.y * .5 + (CITY.drive ? .9 : 0);
    // parkour: hafif otomatik mesafe / pitch, mouse yaw aynı kalır
    let cd = w.dist, cp = w.pitch, cyaw = w.yaw;
    if (PK.active) {
      const wantDist = 6.4 + (PK.onGround ? 0 : .35);
      w.dist += (wantDist - w.dist) * Math.min(1, dt * 2.5);
      const wantPitch = Math.max(.22, Math.min(1.05, .42 + (PK.onGround ? 0 : .08)));
      w.pitch += (wantPitch - w.pitch) * Math.min(1, dt * 2.2);
      cd = w.dist; cp = w.pitch;
    }
    const shx = PK.shake * (Math.random() - .5) * .22;
    const shy = PK.shake * (Math.random() - .5) * .16;
    // 1. şahıs / 3. şahıs — otururken de 1. şahıs mümkün (karşıyı görmek için)
    const seated = myP.seat >= 0;
    const isFP = !!w.fp;
    if (myP.g) myP.g.visible = !isFP && !CITY.drive;
    if (isFP) {
      // ayakta göz ~1.55, oturunca ~1.15
      const eyeY = (seated ? 1.15 : 1.55) + myP.y * .5;
      const lookDist = 10;
      // otururken karakter pozisyonundan bak (okS olsa bile masa merkezi değil)
      const fx = myP.x, fz = myP.z;
      cam.position.set(fx + shx * .2, eyeY + shy * .2, fz);
      const lx = fx - Math.sin(cyaw) * Math.cos(cp) * lookDist;
      const ly = eyeY + Math.sin(-cp) * lookDist;
      const lz = fz - Math.cos(cyaw) * Math.cos(cp) * lookDist;
      cam.lookAt(lx, ly, lz);
    } else {
      let useDist = Math.max(cd, seated ? 4.2 : cd);
      let usePitch = seated ? Math.max(cp, 0.5) : cp;
      if (okS) { useDist = Math.max(useDist, 4.6); usePitch = Math.max(usePitch, 0.85); }
      cam.position.set(
        cx + Math.sin(cyaw) * Math.cos(usePitch) * useDist + shx,
        cy + Math.sin(usePitch) * useDist + shy,
        cz + Math.cos(cyaw) * Math.cos(usePitch) * useDist
      );
      if (myP.room === 1) {
        cam.position.z = Math.min(cam.position.z, 5.0);
        cam.position.x = Math.max(-6.6, Math.min(6.6, cam.position.x));
        cam.position.y = Math.min(cam.position.y, 3.95);
      }
      cam.lookAt(cx, cy + (seated ? 0.35 : 0), cz);
    }
    cam.fov = (isFP ? 72 : 54) + PK.fovPunch * 1.15 + (PK.active && !PK.onGround ? 4.5 : 0) + (PK.jumpRing > 0 ? PK.jumpRing * 3 : 0);
    cam.updateProjectionMatrix();
    R.toneMappingExposure = PK.active ? 1.18 : 1.3;
    netSend(false); w.tvTick?.(dt);
    R.render(scene, cam);
  };
  frame();
}
window.__world = {
  open, close, editor, onOkey, reset: () => { TVS = { kind: 'off', url: '', owner: 0, playing: false, pos: 0, at: 0, rev: TVS.rev + 1, seek: false, by: 0 }; OK.s = null; OK.hand = []; OK.slots = Array(30).fill(null); OK.sel = null; },
  onNet: d => W?.onNet(d),
  onMg: d => W?.onMg?.(d),
  onTv: d => { const was = TVS.kind !== 'off'; TVS = { kind: d.kind || 'off', url: d.url || '', owner: d.owner | 0, playing: !!d.playing, pos: +d.pos || 0, at: performance.now(), rev: TVS.rev + 1, seek: !!d.seek, by: d.by | 0 }; if (W) { if (!was && TVS.kind !== 'off') sfx('tvOn'); else if (was && TVS.kind === 'off') sfx('tvOff'); W.tvUI?.(); } },
  onLeft: id => { if (!W) return; const p = W.players.get(id); if (p) { p.lab.remove(); p.g?.parent?.remove(p.g); W.players.delete(id); } },
};
})();
