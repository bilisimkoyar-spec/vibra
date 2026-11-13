'use strict';
/* Vibra parkur haritaları (saf veri). Platform üst yüzü = y + .18.
   Özellikler: cp (kontrol noktası), fin (bitiş), move{axis,amp,spd,ph}, fall (basınca düşer),
   spin{len,spd,h,ph} (dönen çubuk), bounce (zıplatma pedi), conv{dx,dz,spd} (yürüyen bant) */
(function (root) {
  const P = (x, y, z, w, d, o) => Object.assign({ x, y, z, w, d }, o || {});
  const R = n => Math.round(n * 100) / 100;

  /* 1) YEŞİL VADİ — kolay: kıvrımlı taş yol, zıplatma pedi, 2 kontrol noktası */
  const c0 = (() => {
    const a = [P(0, .4, 0, 6, 6, { cp: 1 })]; let x = 0, z = 0, y = .4;
    for (let i = 1; i <= 24; i++) {
      x += 3.9 + (i % 3) * .3; z = Math.sin(i * .5) * 5; y = .4 + i * .1 + (i % 5 === 0 ? .25 : 0);
      const s = i > 14 ? 2.6 : 3.1; const o = {};
      if (i === 8 || i === 16) o.cp = 1;
      if (i === 11) o.bounce = 1;
      if (i === 6 || i === 19) o.move = { axis: 'z', amp: 1.6, spd: .8, ph: i };
      a.push(P(R(x), R(y), R(z), s, s, o));
    }
    a.push(P(R(x + 5), R(y + .3), R(z), 7, 7, { fin: 1 }));
    return a;
  })();

  /* 2) SALINCAK KOYU — orta: hareketli platformlar, dönen çubuk, düşen taşlar */
  const c1 = (() => {
    const a = [P(0, .4, 0, 6, 6, { cp: 1 })]; let x = 0, y = .4;
    const step = (dx, dy, z, s, o) => { x += dx; y += dy; a.push(P(R(x), R(y), R(z), s, s, o)); };
    for (let i = 0; i < 4; i++) step(4.2, .15, Math.sin(i) * 2, 2.6);
    for (let i = 0; i < 3; i++) step(4.6, .2, 0, 2.4, { move: { axis: 'z', amp: 3 + i * .5, spd: .7 + i * .12, ph: i * 2 } });
    step(5, .2, 0, 7.5, { cp: 1, spin: { len: 3.6, spd: 1.5, h: .5, ph: 0 } });
    for (let i = 0; i < 5; i++) step(4.1, .22, (i % 2 ? 1.6 : -1.6), 2.4, { fall: 1 });
    step(4.4, .25, 0, 2.4, { move: { axis: 'y', amp: .5, spd: 1.1, ph: 0 } });
    step(4.6, .25, 0, 2.4, { move: { axis: 'x', amp: 1.2, spd: 1, ph: 1 } });
    step(4.6, .1, 0, 7.5, { cp: 1, spin: { len: 3.5, spd: -1.9, h: .5, ph: 1 } });
    for (let i = 0; i < 4; i++) step(4, .25, Math.cos(i * 1.3) * 2.5, 2.3, i === 2 ? { bounce: 1 } : {});
    for (let i = 0; i < 3; i++) step(4.4, .1, 0, 2.2, { move: { axis: 'z', amp: 3.4, spd: .9 + i * .15, ph: i * 1.7 } });
    step(5, .3, 0, 8, { fin: 1 });
    return a;
  })();

  /* 3) LAV KAÇIŞI — orta/zor: dar kirişler, düşen şeritler, zıplatma ile uzun atlayış */
  const c2 = (() => {
    const a = [P(0, .4, 0, 6, 6, { cp: 1 })]; let x = 0, y = .4;
    const step = (dx, dy, z, w, d, o) => { x += dx; y += dy; a.push(P(R(x), R(y), R(z), w, d, o)); };
    step(5, .1, 0, 1.3, 7, {});                     // dar kiriş (ileri)
    for (let i = 0; i < 6; i++) step(3.9, .12, (i % 3 - 1) * 2.2, 2.2, 2.2, { fall: 1 });
    step(4.5, .15, 0, 6, 6, { cp: 1, bounce: 1 });  // pedden uzun atlayış
    step(9.3, 1.2, 0, 5, 5, {});
    for (let i = 0; i < 4; i++) step(4, .2, 0, 1.5, 6, { conv: { dx: 0, dz: i % 2 ? 2.4 : -2.4, spd: 2.4 } });
    step(4.6, .1, 0, 6.5, 6.5, { cp: 1, spin: { len: 3.3, spd: 2.1, h: .5, ph: 0 } });
    for (let i = 0; i < 5; i++) step(3.8, .2, Math.sin(i * 1.9) * 1.7, 2, 2, i % 2 ? { move: { axis: 'z', amp: 1.4, spd: 1.1, ph: i } } : { fall: 1 });
    step(4.4, .1, 0, 1.2, 8, {});
    step(4.2, .2, 0, 6.5, 6.5, { cp: 1, spin: { len: 3.3, spd: -2.6, h: .5, ph: 2 } });
    for (let i = 0; i < 4; i++) step(3.7, .25, (i % 2 ? 1.2 : -1.2), 2.1, 2.1, { move: { axis: 'y', amp: .5, spd: 1.2, ph: i } });
    step(5, .3, 0, 8, 8, { fin: 1 });
    return a;
  })();

  /* 4) BUZ ZİRVESİ — zor: yürüyen bantlar, dönen çubuklar, yükseliş */
  const c3 = (() => {
    const a = [P(0, .4, 0, 6, 6, { cp: 1 })]; let x = 0, y = .4;
    const step = (dx, dy, z, w, d, o) => { x += dx; y += dy; a.push(P(R(x), R(y), R(z), w, d, o)); };
    for (let i = 0; i < 4; i++) step(3.8, .3, 0, 2.6, 4, { conv: { dx: -1, dz: 0, spd: 3 } });
    step(4.6, .3, 0, 7, 7, { cp: 1, spin: { len: 3.6, spd: 2.2, h: .5, ph: 0 } });
    for (let i = 0; i < 6; i++) step(3.8, .3, Math.sin(i * 1.2) * 1.8, 2, 2, i % 2 ? { fall: 1 } : { move: { axis: 'x', amp: 1.1, spd: 1.2, ph: i } });
    step(4.4, .3, 0, 1.2, 9, {});
    step(4.4, .3, 0, 7, 7, { cp: 1, spin: { len: 3.6, spd: 2.6, h: .5, ph: 1 } });
    for (let i = 0; i < 5; i++) step(3.7, .3, (i % 2 ? 1.2 : -1.2), 2, 2, { move: { axis: 'z', amp: 1.8, spd: 1.2 + i * .1, ph: i * 1.3 } });
    step(4.6, .3, 0, 7.5, 7.5, { cp: 1, spin: { len: 3.8, spd: -3, h: .5, ph: 0 } });
    for (let i = 0; i < 4; i++) step(3.8, .4, 0, 1.7, 6, { conv: { dx: 0, dz: i % 2 ? 2.8 : -2.8, spd: 2.8 } });
    step(4.4, .3, 0, 8, 8, { fin: 1 });
    return a;
  })();

  /* 5) CEHENNEM KULESİ — çok zor: spiral kule, her engel türü */
  const c4 = (() => {
    const a = [P(0, .4, 0, 6, 6, { cp: 1 })]; const Rr = 11; let ang = 0, y = .4;
    a.push(P(R(5.7), R(.6), 0, 2.4, 2.4, {}));
    for (let i = 0; i < 40; i++) {
      ang += .27; y += .42; const s = i % 7 === 6 ? 5.5 : (i % 3 === 1 ? 1.9 : 2.2); const o = {};
      if (i % 7 === 6) { o.cp = 1; if (i % 14 === 6) o.spin = { len: 2.6, spd: 2.8 * (i % 2 ? 1 : -1), h: .5, ph: 0 }; }
      else if (i % 5 === 0) o.fall = 1; else if (i % 5 === 2) o.move = { axis: 'y', amp: .7, spd: 1.3, ph: i }; else if (i % 11 === 3) o.bounce = 1;
      a.push(P(R(Math.cos(ang) * Rr), R(y), R(Math.sin(ang) * Rr), s, s, o));
    }
    a.push(P(R(Math.cos(ang + .5) * Rr), R(y + .5), R(Math.sin(ang + .5) * Rr), 8, 8, { fin: 1 }));
    return a;
  })();


  /* İç içe geçen platformları ayır: çakışan platform ve ondan sonrakiler yolun yönünde kaydırılır */
  function separate(a) {
    const G = .9, ext = (o, ax) => (o.move && o.move.axis === ax ? o.move.amp : 0);
    for (let guard = 0; guard < 600; guard++) {
      let moved = false;
      for (let j = 1; j < a.length && !moved; j++) for (let i = 0; i < j && !moved; i++) {
        const p = a[i], q = a[j];
        const gx = Math.abs(p.x - q.x) - (p.w + q.w) / 2 - ext(p, 'x') - ext(q, 'x');
        const gz = Math.abs(p.z - q.z) - (p.d + q.d) / 2 - ext(p, 'z') - ext(q, 'z');
        const gy = Math.abs(p.y - q.y) - .5 - ext(p, 'y') - ext(q, 'y');
        if (gx >= G - .02 || gz >= G - .02 || gy >= 0) continue;
        const dxs = q.x - p.x, dzs = q.z - p.z, alongX = Math.abs(dxs) >= Math.abs(dzs);
        const need = Math.ceil((G - (alongX ? gx : gz)) * 100) / 100 + .02, sg = (alongX ? dxs : dzs) < 0 ? -1 : 1;
        for (let k = j; k < a.length; k++) { if (alongX) a[k].x = R(a[k].x + sg * need); else a[k].z = R(a[k].z + sg * need); }
        moved = true;
      }
      if (!moved) break;
    }
  }

  const COURSES = [
    { name: '🌱 Yeşil Vadi', diff: 'Kolay', base: 30, color: '#22c55e', accent: '#a3e635', sky: '#0b2a1c', fog: '#0d3a26', liquid: '#1d7a46', botTime: 34, plats: c0 },
    { name: '🌊 Salıncak Koyu', diff: 'Orta', base: 50, color: '#0ea5e9', accent: '#67e8f9', sky: '#06223a', fog: '#0a3050', liquid: '#0a5f9c', botTime: 52, plats: c1 },
    { name: '🔥 Lav Kaçışı', diff: 'Zor', base: 70, color: '#f97316', accent: '#fde047', sky: '#2a0b08', fog: '#3a120a', liquid: '#ff4a14', botTime: 62, plats: c2 },
    { name: '❄️ Buz Zirvesi', diff: 'Zor', base: 90, color: '#7dd3fc', accent: '#e0f2fe', sky: '#0b1830', fog: '#16294a', liquid: '#8bb8e8', botTime: 78, plats: c3 },
    { name: '⚡ Cehennem Kulesi', diff: 'Çok Zor', base: 120, color: '#a855f7', accent: '#f0abfc', sky: '#12062a', fog: '#1d0a42', liquid: '#6d28d9', botTime: 96, plats: c4 },
  ];
  COURSES.forEach(c => separate(c.plats));
  COURSES.forEach(c => { const f = c.plats.find(p => p.fin) || c.plats[c.plats.length - 1]; c.start = { x: c.plats[0].x, y: c.plats[0].y + .18 + .05, z: c.plats[0].z }; c.finish = { x: f.x, z: f.z, r: Math.min(f.w, f.d) / 2 - .4 }; });
  if (typeof module !== 'undefined' && module.exports) module.exports = COURSES; else root.VCOURSES = COURSES;
})(typeof window !== 'undefined' ? window : globalThis);
