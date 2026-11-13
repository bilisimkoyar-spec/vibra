'use strict';
/* Vibra karakter modeli v2: tam oturan kostümler, şapkalar, gözlükler, sırt eşyaları + yeni iskelet (diz) */
(function () {
  const HR = .36, HC = .28;                                   // kafa yarıçapı / merkez yüksekliği (kafa grubunda)
  const hz = (x, y, off = 0) => Math.sqrt(Math.max(.0004, HR * HR - x * x - (y - HC) * (y - HC))) + off;   // kafa yüzeyi z
  const tz = y => .252 * Math.sqrt(Math.max(.01, 1 - Math.pow((y - .12) / .322, 2))) + .008;                 // gövde ön yüzü z

  // takım elbiseler: renkler + ekstra parçalar
  const SUITS = [null,
    { top: '#15151c', bot: '#15151c', shoe: '#15151c', x: ['belt:#c0392b', 'mask'] },                               // 1 ninja
    { top: '#efe3c8', bot: '#3b2a1a', shoe: '#2a1a0e', pat: 1, x: ['belt:#5b3a1a', 'sash:#b91c1c'] },              // 2 korsan
    { top: '#0f172a', bot: '#0f172a', shoe: '#050505', x: ['front', 'bow'] },                                      // 3 smokin
    { top: '#4ade80', bot: '#4ade80', shoe: '#22c55e', x: ['spikes:#f59e0b', 'tail:#4ade80', 'belly'] },          // 4 dinozor
    { top: '#facc15', bot: '#facc15', shoe: '#1c1917', pat: 1, x: ['antenna', 'tinywings'] },                      // 5 arı
    { top: '#4c1d95', bot: '#4c1d95', shoe: '#facc15', pat: 6, x: ['robe:#4c1d95', 'belt:#facc15'] },              // 6 sihirbaz
    { top: '#cbd5e1', bot: '#94a3b8', shoe: '#64748b', metal: 1, x: ['plates:#e2e8f0', 'belt:#78350f'] },          // 7 şövalye
    { top: '#f8fafc', bot: '#f8fafc', shoe: '#9ca3af', x: ['chestpanel', 'belt:#f97316'] },                        // 8 astronot
    { top: '#94a3b8', bot: '#64748b', shoe: '#334155', metal: 1, x: ['panels', 'glowchest:#22d3ee'] },             // 9 robot
    { top: '#0f172a', bot: '#0f172a', shoe: '#0f172a', x: ['neon:#22d3ee'] },                                      // 10 neon
    { top: '#b91c1c', bot: '#7f1d1d', shoe: '#facc15', x: ['fur', 'belt:#facc15', 'robe:#b91c1c'] },               // 11 kral
    { top: '#991b1b', bot: '#1f2937', shoe: '#111827', metal: 1, x: ['plates:#b91c1c', 'belt:#facc15'] },          // 12 samuray
    { top: '#047857', bot: '#064e3b', shoe: '#facc15', metal: 1, x: ['plates:#10b981', 'spikes:#fbbf24', 'tail:#047857'] }, // 13 ejderha
    { top: '#f8fafc', bot: '#f8fafc', shoe: '#facc15', x: ['collar:#facc15', 'belt:#facc15'] },                   // 14 firavun
    { top: '#f9a8d4', bot: '#f472b6', shoe: '#fde68a', x: ['dress', 'belt:#fde68a', 'bow'] },                      // 15 prenses
    { top: '#a7f3d0', bot: '#6ee7b7', shoe: '#fef08a', x: ['dress', 'tinywings', 'belt:#fef08a'] },                // 16 peri
    { top: '#111827', bot: '#111827', shoe: '#000000', x: ['robe:#7f1d1d', 'tie:#dc2626'] },                       // 17 vampir
    { top: '#dc2626', bot: '#dc2626', shoe: '#111827', x: ['stripe:#f8fafc', 'badge:#fbbf24'] },                   // 18 yarış
    { top: '#f8fafc', bot: '#38bdf8', shoe: '#f8fafc', x: ['cross'] },                                             // 19 doktor
    { top: '#1e3a8a', bot: '#172554', shoe: '#0b0b0b', x: ['badge:#fbbf24', 'belt:#111827', 'tie:#111827'] },     // 20 polis
    { top: '#2563eb', bot: '#dc2626', shoe: '#dc2626', x: ['badge:#fde047', 'belt:#fde047'] },                     // 21 süper kahraman
    { top: '#f59e0b', bot: '#78350f', shoe: '#111111', x: ['stripe:#e5e7eb', 'belt:#e5e7eb'] },                   // 22 itfaiyeci
    { top: '#fb923c', bot: '#38bdf8', shoe: '#fde68a', pat: 7, x: [] },                                            // 23 plaj
    { top: '#dc2626', bot: '#dc2626', shoe: '#111827', x: ['fur', 'belt:#111827'] },                               // 24 noel baba
    { top: '#e11d48', bot: '#be123c', shoe: '#fde68a', x: ['robe:#e11d48', 'belt:#fbbf24'] },                     // 25 kimono
    { top: '#374151', bot: '#374151', shoe: '#050505', x: ['front', 'tie:#dc2626'] },                              // 26 şık takım
    { top: '#7c3aed', bot: '#7c3aed', shoe: '#f8fafc', x: ['stripe:#fbbf24'] },                                    // 27 basketbolcu
    { top: '#16a34a', bot: '#f8fafc', shoe: '#111827', pat: 1, x: ['badge:#fbbf24'] },                             // 28 futbolcu
    { top: '#7c3aed', bot: '#a855f7', shoe: '#fbbf24', x: ['dress', 'belt:#fbbf24', 'badge:#f0abfc'] },            // 29 parti elbisesi
    { top: '#be123c', bot: '#9f1239', shoe: '#fbbf24', x: ['dress', 'fur', 'belt:#fbbf24'] },                      // 30 kraliçe
    { top: '#111827', bot: '#111827', shoe: '#dc2626', x: ['stripe:#dc2626', 'neon:#dc2626'] },                    // 31 rockstar
    { top: '#fda4af', bot: '#fecdd3', shoe: '#ffffff', pat: 8, x: ['dress'] },                                     // 32 yaz elbisesi
    { top: '#a16207', bot: '#1e3a8a', shoe: '#3b2a1a', x: ['belt:#facc15', 'badge:#fde047'] },                  // 33 kovboy
    { top: '#fef3c7', bot: '#1d4ed8', shoe: '#78350f', x: ['stripe:#1d4ed8'] },                                  // 34 çiftçi
    { top: '#f8fafc', bot: '#374151', shoe: '#111827', x: ['front', 'belt:#f8fafc'] },                           // 35 aşçı
    { top: '#06b6d4', bot: '#0ea5e9', shoe: '#fde68a', pat: 7, x: [] },                                          // 36 sörfçü
    { top: '#7f1d1d', bot: '#7f1d1d', shoe: '#1c1917', x: ['belt:#facc15', 'mask'] },                            // 37 kızıl ninja
    { top: '#65a30d', bot: '#3f3f46', shoe: '#1c1917', x: ['belly'] },                                           // 38 zombi
    { top: '#f1f5f9', bot: '#f1f5f9', shoe: '#e2e8f0', x: ['robe:#f1f5f9'] },                                    // 39 hayalet
    { top: '#f97316', bot: '#1f2937', shoe: '#111827', x: ['belt:#111827', 'badge:#facc15'] },                   // 40 cadılar bayramı
    { top: '#16a34a', bot: '#dc2626', shoe: '#facc15', x: ['collar:#facc15', 'belt:#facc15'] },                  // 41 elf
    { top: '#f8fafc', bot: '#f8fafc', shoe: '#1f2937', x: ['belly', 'badge:#111827'] },                          // 42 kardan adam
    { top: '#ea580c', bot: '#ea580c', shoe: '#f8fafc', x: ['tail:#ea580c', 'belly'] },                           // 43 tilki
    { top: '#f8fafc', bot: '#111827', shoe: '#111827', x: ['belly'] },                                           // 44 panda
    { top: '#6b7280', bot: '#4b5563', shoe: '#1f2937', x: ['fur', 'tail:#6b7280'] },                             // 45 kurt adam
    { top: '#fbcfe8', bot: '#e9d5ff', shoe: '#fef08a', pat: 8, x: ['tail:#f0abfc', 'tinywings'] },               // 46 unicorn
    { top: '#7c3aed', bot: '#6d28d9', shoe: '#fbbf24', x: ['belt:#fbbf24', 'sash:#fbbf24', 'collar:#fbbf24'] },  // 47 cin
    { top: '#4d7c0f', bot: '#3f6212', shoe: '#1c1917', x: ['belt:#1c1917', 'badge:#fbbf24'] },                   // 48 asker
    { top: '#1e40af', bot: '#1e3a8a', shoe: '#0b0b0b', x: ['badge:#fbbf24', 'belt:#111827', 'tie:#111827'] },   // 49 pilot
    { top: '#92400e', bot: '#451a03', shoe: '#1c1917', x: ['front', 'belt:#451a03'] },                           // 50 dedektif
    { top: '#f8fafc', bot: '#475569', shoe: '#111827', x: ['cross'] },                                           // 51 bilim insanı
    { top: '#111827', bot: '#1f2937', shoe: '#22d3ee', x: ['neon:#a855f7', 'stripe:#22d3ee'] },                  // 52 oyuncu
    { top: '#f43f5e', bot: '#1e293b', shoe: '#f8fafc', x: ['stripe:#f8fafc'] },                                  // 53 paten
    { top: '#1d4ed8', bot: '#1e3a8a', shoe: '#facc15', x: ['fur', 'belt:#facc15', 'robe:#1d4ed8'] },             // 54 prens
    { top: '#fbbf24', bot: '#f59e0b', shoe: '#fef3c7', metal: 1, x: ['plates:#fde047', 'belt:#78350f'] },        // 55 altın şampiyon
    { top: '#67e8f9', bot: '#22d3ee', shoe: '#e0f2fe', metal: 1, x: ['plates:#a5f3fc', 'glowchest:#e0f2fe'] },   // 56 elmas zırh
    { top: '#b91c1c', bot: '#7c2d12', shoe: '#fbbf24', x: ['robe:#b91c1c', 'belt:#f59e0b', 'neon:#f97316'] },   // 57 ateş büyücüsü
    { top: '#bae6fd', bot: '#7dd3fc', shoe: '#e0f2fe', x: ['dress', 'fur', 'belt:#f8fafc'] },                    // 58 buz kraliçesi
    { top: '#1e1b4b', bot: '#312e81', shoe: '#fde047', pat: 6, x: ['robe:#1e1b4b', 'belt:#fde047'] },            // 59 gece büyücüsü
    { top: '#ef4444', bot: '#3b82f6', shoe: '#facc15', pat: 1, x: ['collar:#f8fafc', 'badge:#facc15'] },         // 60 palyaço
    { top: '#f8fafc', bot: '#1d4ed8', shoe: '#7c2d12', x: ['sash:#ef4444'] },                                    // 61 ressam
    { top: '#0ea5e9', bot: '#111827', shoe: '#f8fafc', x: ['stripe:#f8fafc'] },                                  // 62 sporcu
  ];
  const HIDE_HAIR = new Set([3, 15, 22, 23, 24, 28, 29]);

  function build(o, K) {
    const T = THREE, g = new T.Group();
    const M = (c, r = .6, em = .06, mt = .05) => { const m = new T.MeshStandardMaterial({ color: c, roughness: r, metalness: mt }); m.emissive = new T.Color(c).multiplyScalar(em); return m; };
    const GL = (c, k = 1.1) => new T.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: k, roughness: .35 });
    const MT = (c, r = .3) => new T.MeshStandardMaterial({ color: c, roughness: r, metalness: .85 });
    const GLASS = (c, op) => new T.MeshStandardMaterial({ color: c, roughness: .1, metalness: .2, transparent: true, opacity: op, depthWrite: false });
    const DS = m => { m.side = T.DoubleSide; return m; };
    const OUT = new T.MeshBasicMaterial({ color: '#1a1028', side: T.BackSide });
    const mesh = (geo, mat, x = 0, y = 0, z = 0, ol = 0) => {
      const m = new T.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
      if (ol) { const k = new T.Mesh(geo, OUT); k.scale.setScalar(ol); m.add(k); } return m;
    };
    const sph = (r, mat, x, y, z, sx = 1, sy = 1, sz = 1) => { const m = mesh(new T.SphereGeometry(r, 14, 10), mat, x, y, z); m.scale.set(sx, sy, sz); return m; };
    const cyl = (rt, rb, h, mat, x, y, z, seg = 14) => mesh(new T.CylinderGeometry(rt, rb, h, seg), mat, x, y, z);
    const box = (w, h, d, mat, x, y, z) => mesh(new T.BoxGeometry(w, h, d), mat, x, y, z);
    const cone = (r, h, mat, x, y, z, seg = 12) => mesh(new T.ConeGeometry(r, h, seg), mat, x, y, z);
    const tor = (r, t, mat, x, y, z, arc = Math.PI * 2) => mesh(new T.TorusGeometry(r, t, 8, 24, arc), mat, x, y, z);
    const dome = (r, mat, x, y, z, frac = .5) => mesh(new T.SphereGeometry(r, 22, 12, 0, Math.PI * 2, 0, Math.PI * frac), mat, x, y, z);
    const flat = (m, x, y, z) => { m.rotation.set(x, y, z); return m; };
    const nowrap = m => { m.castShadow = false; return m; };

    const su = SUITS[o.suit | 0] || null;
    const skinC = K.SKIN[o.skin % K.SKIN.length];
    const topC = su ? su.top : K.CLOTH[o.top % K.CLOTH.length];
    const botC = su ? su.bot : K.CLOTH[o.bottom % K.CLOTH.length];
    const shoeC = su ? su.shoe : K.SHOES[o.shoes % K.SHOES.length];
    const topT = su ? 1 : (o.topT | 0);
    let topPat = su ? (su.pat | 0) : (o.topPat | 0); if (!su && topT === 3 && !topPat) topPat = 1;
    const botPat = su ? 0 : (o.botPat | 0);

    const Mp = (c, pat, r = .7, img, metal) => {
      const m = new T.MeshStandardMaterial({ color: c, roughness: metal ? .32 : r, metalness: metal ? .75 : .04 });
      if (img && typeof img === 'string' && img.startsWith('data:')) {
        try { const tex = new T.TextureLoader().load(img); tex.colorSpace = T.SRGBColorSpace || undefined; m.map = tex; m.color.set('#ffffff'); return m; } catch (e) { /* düz renk */ }
      }
      if (pat > 0) { m.map = K.clothPat(c, pat); m.color.set('#ffffff'); }
      m.emissive = new T.Color(c).multiplyScalar(pat > 0 ? .03 : .07); return m;
    };
    const skin = M(skinC, .55), cloth = Mp(topC, topPat, .7, su ? '' : o.topImg, su && su.metal), pant = Mp(botC, botPat, .75, '', su && su.metal), shoe = M(shoeC, .5);
    const dark = M('#1a1a2e', .4, 0), white = M('#ffffff', .5, 0);

    const body = new T.Group(); body.position.y = .72; g.add(body);
    const fem = (o.gender | 0) === 1; const skirtOn = fem && !su && (o.botT | 0) === 1;
    const torso = mesh(new T.SphereGeometry(.28, 22, 16), cloth, 0, .12, 0, 1.05); torso.scale.set(fem ? .94 : 1.05, 1.15, fem ? .85 : .9); body.add(torso);
    const hips = mesh(new T.SphereGeometry(.24, 18, 14), pant, 0, -.12, 0, 1.05); hips.scale.set(fem ? 1.22 : 1.1, .75, fem ? 1.02 : .95); body.add(hips);
    if (skirtOn) { const sk = mesh(new T.CylinderGeometry(.2, .4, .36, 24, 1, true), DS(Mp(botC, botPat, .75)), 0, -.27, 0); body.add(sk); body.add(tor(.2, .02, M(botC, .6), 0, -.09, 0)).rotation.x = Math.PI / 2; }

    /* ---------- KAFA ---------- */
    const head = new T.Group(); head.position.y = .42; body.add(head);
    head.add(mesh(new T.SphereGeometry(HR, 28, 22), skin, 0, HC, 0, 1.04));
    [-1, 1].forEach(s => { const e = sph(.07, skin, s * .35, .28, 0, .55, 1, .8); head.add(e); });
    // yüz ifadeleri
    const face = o.face | 0;
    const eyeY = .31, eyeX = .125;
    const eyeSpec = [[1, 0, 0], [.85, 0, 0], [1, .45, 0], [1.25, 0, 0], [1, 0, 0], [1, 1, 0], [.95, .15, 0], [1, 0, 1], [1, .3, 0], [1, 0, -.35]][face] || [1, 0, 0];  // [boyut, göz kapağı, bakış y]
    const [es, lid, look] = eyeSpec;
    [-1, 1].forEach(s => {
      const wink = face === 7 && s === 1;
      if (wink || lid >= 1) { head.add(box(.15, .028, .02, dark, s * eyeX, eyeY - .005, hz(s * eyeX, eyeY, .0))); return; }
      const wh = sph(.078 * es, white, s * eyeX, eyeY, hz(s * eyeX, eyeY, -.012), 1, 1.15, .45); head.add(wh);
      const px = s * eyeX, py = eyeY + look * .02;
      head.add(sph(.042 * es, dark, px, py, hz(px, py, .004), 1, 1, .6));
      head.add(sph(.015, white, px + .012, py + .022, hz(px, py, .018)));
      if (lid > 0) head.add(box(.17 * es, .07 * lid + .02, .03, skin, s * eyeX, eyeY + .06 - lid * .02, hz(s * eyeX, eyeY + .06, .008)));  // yarı kapalı göz kapağı
    });
    if (fem && lid < 1) [-1, 1].forEach(s => { [0, 1].forEach(k => { const lb = box(.05, .014, .016, dark, s * (eyeX + .075 + k * .012), eyeY + .045 + k * .035, hz(s * eyeX, eyeY + .04, .004)); lb.rotation.z = -s * (.5 + k * .45); head.add(lb); }); });
    if (face === 6) [-1, 1].forEach(s => { const b = box(.14, .028, .02, dark, s * eyeX, eyeY + .11, hz(s * eyeX, eyeY + .11, .006)); b.rotation.z = -s * .45; head.add(b); });
    if (face === 3) [-1, 1].forEach(s => { const b = box(.12, .022, .02, dark, s * eyeX, eyeY + .13, hz(s * eyeX, eyeY + .13, .006)); b.rotation.z = s * .2; head.add(b); });
    if (face === 8) [-1, 1].forEach(s => { const b = box(.14, .026, .02, dark, s * eyeX, eyeY + .11, hz(s * eyeX, eyeY + .11, .006)); b.rotation.z = s * .18; head.add(b); });
    // ağız
    const my = .165, mouthMat = M(fem ? '#e11d6a' : '#b83a52', .5, .05);
    const smile = (r, x = 0, rot = 0) => { const t = tor(r, .017, mouthMat, x, my + r * .5, hz(x, my, .008), Math.PI); t.rotation.z = Math.PI + rot; return t; };
    if (face === 0 || face === 7 || face === 9) head.add(smile(face === 9 ? .045 : .075));
    else if (face === 1 || face === 5) head.add(box(.09, .02, .02, mouthMat, 0, my, hz(0, my, .006)));
    else if (face === 2 || face === 8) head.add(smile(.07, .03, .25));
    else if (face === 3) head.add(sph(.04, M('#5b1a2a', .6, 0), 0, my - .01, hz(0, my, .0), 1, 1.15, .5));
    else if (face === 4) { head.add(smile(.1)); head.add(box(.13, .035, .02, white, 0, my + .015, hz(0, my, .01))); }
    else if (face === 6) { const t = tor(.06, .017, mouthMat, 0, my - .02, hz(0, my, .008), Math.PI); head.add(t); }
    // yanak + burun
    [-1, 1].forEach(s => { const ck = new T.Mesh(new T.CircleGeometry(face === 9 ? .075 : .05, 14), new T.MeshBasicMaterial({ color: '#ff8a9a', transparent: true, opacity: face === 9 ? .6 : .38, depthWrite: false })); const x = s * .22, y = .22; ck.position.set(x, y, hz(x, y, .004)); ck.rotation.y = s * .55; head.add(ck); });
    head.add(sph(.03, skin, 0, .245, hz(0, .245, .004)));

    /* ---------- SAÇ ---------- */
    const hairId = o.hair | 0, hatId = o.hat | 0;
    const hc = M(K.HAIRC[o.hairC % K.HAIRC.length], .7, .04);
    if (hairId > 0 && !HIDE_HAIR.has(hatId)) {
      const cap = (r = .375, frac = .5, y = .3, z = -.015) => dome(r, hc, 0, y, z, frac);
      if (hairId === 1) head.add(cap());
      else if (hairId === 2) { head.add(cap(.38, .56)); head.add(box(.58, .5, .12, hc, 0, .1, -.27)); [-1, 1].forEach(s => head.add(box(.09, .38, .22, hc, s * .33, .16, -.08))); }
      else if (hairId === 3) { head.add(cap(.365, .46)); for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2, rr = i === 0 ? 0 : .2; const c = cone(.06, .2, hc, Math.cos(a) * rr, .66 - (i ? .02 : -.04), Math.sin(a) * rr, 6); if (i) { c.rotation.z = -Math.cos(a) * .5; c.rotation.x = Math.sin(a) * .5; } head.add(c); } }
      else if (hairId === 4) { head.add(cap()); head.add(sph(.15, hc, 0, .76, -.04)); head.add(tor(.1, .025, hc, 0, .7, -.04)); }
      else if (hairId === 5) { head.add(sph(.43, hc, 0, .42, -.05, 1.05, .95, 1)); }
      else if (hairId === 6) { head.add(cap(.365, .42)); for (let i = 0; i < 6; i++) head.add(cone(.07, .22 - i * .012, hc, 0, .74 - Math.abs(i - 2.5) * .035, .2 - i * .085, 6)); }
      else if (hairId === 7) { head.add(cap(.38, .55)); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; head.add(sph(.1, hc, Math.cos(a) * .35, .28 + Math.sin(i * 2) * .06, Math.sin(a) * .35 - .02)); } }
      else if (hairId === 8) { head.add(cap(.38, .52)); head.add(box(.5, .09, .08, hc, 0, .53, .27)); [-.14, 0, .14].forEach((x, i) => head.add(cone(.07, .13, hc, x, .46 - (i === 1 ? .02 : 0), .31, 6).rotateX(Math.PI))); }
      else if (hairId === 10) { head.add(cap(.38, .56)); head.add(box(.64, .95, .14, hc, 0, -.12, -.27)); [-1, 1].forEach(s => head.add(box(.09, .75, .24, hc, s * .335, -.02, -.1))); head.add(box(.5, .09, .1, hc, 0, .54, .3)); }
      else if (hairId === 11) { head.add(cap(.385, .58)); head.add(box(.7, .34, .15, hc, 0, .1, -.26)); [-1, 1].forEach(s => head.add(box(.1, .32, .34, hc, s * .335, .14, -.05))); head.add(box(.5, .09, .1, hc, 0, .55, .3)); }
      else if (hairId === 12) { head.add(cap()); head.add(sph(.1, hc, 0, .58, -.36)); head.add(sph(.045, M('#ef4444', .5), 0, .56, -.42)); for (let i = 0; i < 4; i++) head.add(sph(.092 - i * .012, hc, 0, .44 - i * .13, -.46 - i * .02)); }
      else if (hairId === 13) { head.add(cap(.38, .54)); [-1, 1].forEach(s => { head.add(sph(.05, M('#f472b6', .5), s * .4, .4, -.05)); for (let i = 0; i < 3; i++) head.add(sph(.095 - i * .014, hc, s * (.42 + i * .015), .3 - i * .14, -.06)); }); }
      else if (hairId === 9) { head.add(cap(.375, .52)); for (let i = 0; i < 5; i++) head.add(sph(.075 - i * .006, hc, 0, .32 - i * .13, -.36 - i * .03)); }
    }

    /* ---------- ŞAPKALAR ---------- */
    let hat = null;
    if (hatId > 0) {
      hat = new T.Group(); const A = m => { hat.add(m); return m; };
      const gold = () => new T.MeshStandardMaterial({ color: '#fbbf24', roughness: .22, metalness: .85, emissive: '#7a5200', emissiveIntensity: .25 });
      switch (hatId) {
        case 1: { const gm = M('#4ade80', .55); A(dome(.39, gm, 0, .3, -.01, .52)); [-1, 1].forEach(s => { A(sph(.13, gm, s * .17, .66, .08)); A(sph(.085, white, s * .17, .68, .16)); A(sph(.045, dark, s * .17, .68, .22)); }); break; }
        case 2: { const om = M('#ff7a1a', .5); A(cone(.24, .52, om, 0, .9, 0, 18)); A(cyl(.34, .34, .05, om, 0, .64, 0, 18)); A(cyl(.205, .215, .07, M('#ffffff', .4), 0, .82, 0, 18)); A(cyl(.14, .15, .07, M('#ffffff', .4), 0, 1.0, 0, 18)); break; }
        case 3: { const rm = M('#dc2626', .55); const d = A(dome(.5, rm, 0, .46, 0, .5)); d.scale.y = .78; for (let i = 0; i < 7; i++) { const a = i * 2.4, ph = .35 + (i % 3) * .28; A(sph(.07, white, Math.cos(a) * .38 * Math.cos(ph), .46 + Math.sin(ph) * .36 * .78 * 1.05, Math.sin(a) * .38 * Math.cos(ph), 1, .5, 1)); } break; }
        case 4: { const gm = M('#3cb54a', .55); A(dome(.385, gm, 0, .31, -.01, .52)); A(cyl(.3, .3, .035, M('#2a7a35', .5), 0, .46, .17, 16)).rotation.y = 0; hat.children[hat.children.length - 1].geometry = new T.CylinderGeometry(.3, .3, .035, 18, 1, false, -1.15, 2.3); A(sph(.035, M('#2a7a35'), 0, .7, -.01)); break; }
        case 5: { const wm = M('#ffffff', .6), pm = M('#fda4af', .6); [-1, 1].forEach(s => { const e = A(sph(.1, wm, s * .13, .95, -.02, .6, 2.6, .5)); e.rotation.z = -s * .16; const p = A(sph(.06, pm, s * .13, .93, .0, .5, 2.3, .3)); p.rotation.z = -s * .16; }); A(tor(.34, .03, wm, 0, .5, -.01)).rotation.x = Math.PI / 2; break; }
        case 6: { const bm = M('#121218', .35); A(cyl(.25, .25, .44, bm, 0, .83, 0, 20)); A(cyl(.44, .44, .045, bm, 0, .62, 0, 24)); A(cyl(.255, .255, .09, M('#dc2626', .5), 0, .69, 0, 20)); break; }
        case 7: { const rm = M('#dc2626', .6), wm = M('#ffffff', .8); const c = A(cone(.3, .6, rm, 0, .86, -.1, 18)); c.rotation.x = -.45; A(tor(.33, .075, wm, 0, .56, 0)).rotation.x = Math.PI / 2; A(sph(.1, wm, 0, 1.1, -.31)); break; }
        case 8: { const cm = M('#8b5a2b', .75); A(cyl(.54, .54, .035, cm, 0, .58, 0, 24)); A(cyl(.24, .28, .3, cm, 0, .75, 0, 20)); A(cyl(.285, .285, .06, M('#3b2a1a', .6), 0, .66, 0, 20)); [-1, 1].forEach(s => { const r = A(box(.12, .035, .3, cm, s * .5, .64, 0)); r.rotation.z = s * .5; }); break; }
        case 9: { const gm = gold(); A(cyl(.27, .25, .16, gm, 0, .66, 0, 16)); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; A(cone(.055, .2, gm, Math.cos(a) * .24, .84, Math.sin(a) * .24, 6)); A(sph(.03, GL(['#ef4444', '#3b82f6', '#22c55e'][i % 3], .8), Math.cos(a) * .262, .66, Math.sin(a) * .262)); } break; }
        case 10: { A(dome(.385, M('#3b82f6', .5), 0, .31, -.01, .5)); A(cyl(.025, .025, .22, M('#9ca3af', .4), 0, .76, 0)); const pr = new T.Group(); pr.position.y = .88; [0, 1.57].forEach(r => { const b = box(.62, .018, .08, M('#f8fafc', .3), 0, 0, 0); b.rotation.y = r; pr.add(b); }); hat.add(pr); hat.userData.prop = pr; break; }
        case 11: { const wm = M('#ffffff', .85); A(cyl(.31, .3, .2, wm, 0, .66, 0, 18)); A(sph(.28, wm, 0, .96, 0, 1.1, .85, 1.1)); [-1, 1].forEach(s => A(sph(.17, wm, s * .2, .9, .02))); A(sph(.17, wm, 0, 1.06, -.12)); break; }
        case 12: { A(box(.52, .4, .42, M('#3f3f46', .5, .02, .4), 0, .85, 0)); A(box(.4, .28, .02, GL('#38bdf8', .9), 0, .85, .215)); [-1, 1].forEach(s => { const a = A(cyl(.012, .012, .34, MT('#d4d4d8'), s * .12, 1.15, 0, 6)); a.rotation.z = -s * .45; }); break; }
        case 13: { const rm = M('#dc2626', .6); const b = A(cyl(.35, .35, .12, rm, 0, .4, 0, 22)); b.material.side = T.DoubleSide; b.geometry = new T.CylinderGeometry(.352, .352, .12, 22, 1, true); [-1, 1].forEach((s, i) => { const k = A(box(.09, .3, .03, rm, s * .05, .32, -.4)); k.rotation.z = s * .35; }); A(box(.1, .1, .05, rm, 0, .4, -.36)); break; }
        case 14: { A(sph(.5, GLASS('#9bd7ff', .26), 0, .28, 0)); A(tor(.37, .05, M('#e5e7eb', .4), 0, -.06, 0)).rotation.x = Math.PI / 2; A(cyl(.015, .015, .2, MT('#e5e7eb'), .22, .75, 0, 6)); A(sph(.04, GL('#ef4444', .9), .22, .87, 0)); break; }
        case 15: { const mm = MT('#94a3b8', .35); A(dome(.39, mm, 0, .3, -.01, .52)); A(cyl(.02, .02, .22, mm, 0, .8, 0, 6)); A(sph(.05, GL('#ef4444', 1), 0, .93, 0)); [-1, 1].forEach(s => { A(cyl(.07, .07, .1, MT('#475569'), s * .39, .3, 0, 10)).rotation.z = Math.PI / 2; }); A(box(.5, .03, .06, GL('#38bdf8', .8), 0, .52, .35)); break; }
        case 16: { const pm = M('#f97316', .6); A(sph(.3, pm, 0, .76, 0, 1.15, .78, 1.1)); for (let i = 0; i < 4; i++) { const t = A(sph(.3, pm, 0, .76, 0, 1.15, .78, 1.1)); t.rotation.y = i * .78; t.scale.x = .35 + i * .0; t.scale.x = 1.15 - i * .28; } A(cyl(.035, .05, .14, M('#3f7d1f', .8), 0, 1.0, 0, 8)); break; }
        case 17: { const wm = M('#ffffff', .5); A(dome(.385, wm, 0, .31, -.01, .5)); const hm = gold(); const h = A(cone(.065, .42, hm, 0, .92, .08, 10)); h.rotation.x = .2; for (let i = 0; i < 3; i++) A(tor(.05 - i * .01, .012, hm, 0, .8 + i * .1, .1 - i * .01)).rotation.x = Math.PI / 2 + .2; ['#f472b6', '#c084fc', '#60a5fa', '#34d399'].forEach((c, i) => A(sph(.07, M(c, .5), 0, .62 - i * .12, -.34 - i * .02))); [-1, 1].forEach(s => A(cone(.05, .15, wm, s * .2, .7, 0, 8))); break; }
        case 18: { const bm = M('#1f2937', .4); const arc = A(tor(.39, .03, bm, 0, .28, 0, Math.PI)); [-1, 1].forEach(s => { A(cyl(.12, .12, .09, M('#ef4444', .4), s * .39, .28, 0, 14)).rotation.z = Math.PI / 2; A(cyl(.1, .1, .02, bm, s * .44, .28, 0, 14)).rotation.z = Math.PI / 2; }); break; }
        case 19: { const pm = M('#3b0764', .6); const c = A(cone(.3, .8, pm, 0, 1.0, -.02, 20)); c.rotation.z = .12; A(cyl(.5, .5, .03, pm, 0, .58, 0, 24)); A(cyl(.31, .31, .07, gold(), 0, .64, 0, 20)); [[.1, .82, .26], [-.12, .98, .2], [.08, 1.12, .12]].forEach(p => A(sph(.04, GL('#fde047', 1), p[0], p[1], p[2]))); break; }
        case 20: { const mm = M('#b45309', .8); for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; A(sph(.115, mm, Math.cos(a) * .4, .28 + Math.sin(a) * .4, -.03, 1, 1, 1.2)); } [-1, 1].forEach(s => A(sph(.09, mm, s * .24, .7, 0))); break; }
        case 21: { const bm = M('#111827', .5); A(box(.74, .04, .74, bm, 0, .72, 0)); A(cyl(.25, .27, .12, bm, 0, .66, 0, 16)); A(cyl(.01, .01, .3, gold(), .3, .56, .3, 5)); A(sph(.045, gold(), .3, .4, .3)); break; }
        case 22: { const ym = M('#facc15', .4); A(dome(.4, ym, 0, .3, -.01, .52)); A(box(.12, .06, .62, ym, 0, .68, 0)); A(cyl(.4, .4, .03, ym, 0, .43, .08, 20)).geometry = new T.CylinderGeometry(.38, .38, .03, 20, 1, false, -1.2, 2.4); break; }
        case 23: { const om = M('#4d5b2f', .8); A(dome(.41, om, 0, .3, -.01, .6)); A(tor(.4, .03, M('#2f3a1c', .8), 0, .38, 0)).rotation.x = Math.PI / 2; A(sph(.06, gold(), 0, .5, .4, 1, 1, .4)); break; }
        case 24: { const rm = MT('#7f1d1d', .35); A(dome(.4, rm, 0, .3, -.01, .56)); A(tor(.4, .035, gold(), 0, .4, 0)).rotation.x = Math.PI / 2; [-1, 1].forEach(s => { const h = A(cone(.07, .36, gold(), s * .33, .7, 0, 8)); h.rotation.z = -s * .8; }); for (let i = 0; i < 5; i++) A(cone(.045, .14 + (i === 2 ? .06 : 0), gold(), 0, .72 - Math.abs(i - 2) * .04, .22 - i * .11, 6)); break; }
        case 25: { const h = A(tor(.26, .04, GL('#fde68a', 1.4), 0, .95, 0)); h.rotation.x = Math.PI / 2; hat.userData.bob = h; break; }
        case 26: { const rm = M('#b91c1c', .5); [-1, 1].forEach(s => { const h = A(cone(.075, .3, rm, s * .2, .78, .02, 8)); h.rotation.z = -s * .35; A(sph(.075, rm, s * .17, .64, .02)); }); break; }
        case 27: { const bm = M('#111111', .6); A(dome(.385, bm, 0, .31, -.01, .5)); const t = A(cyl(.55, .55, .045, bm, 0, .56, 0, 3)); t.rotation.y = Math.PI; t.scale.set(1, 1, .9); A(sph(.05, white, 0, .62, .39, 1, 1.2, .3)); A(box(.14, .02, .02, white, 0, .55, .395)); break; }
        case 28: { const mm = MT('#6b7280', .35); A(dome(.4, mm, 0, .3, -.01, .56)); A(tor(.4, .03, MT('#9ca3af'), 0, .42, 0)).rotation.x = Math.PI / 2; [-1, 1].forEach(s => { const h = A(cone(.075, .4, M('#f5f5dc', .5), s * .42, .6, 0, 8)); h.rotation.z = -s * .95; }); break; }
        case 29: { const dm = MT('#1f2937', .4); A(dome(.4, dm, 0, .3, -.01, .56)); const sk = A(cyl(.4, .56, .18, dm, 0, .42, -.02, 20)); sk.geometry = new T.CylinderGeometry(.4, .56, .18, 20, 1, true); sk.material.side = T.DoubleSide; A(tor(.4, .03, M('#b91c1c', .5), 0, .5, 0)).rotation.x = Math.PI / 2; const cr = A(tor(.26, .03, gold(), 0, .78, .16, Math.PI)); cr.rotation.set(0, 0, 0); break; }
        case 30: { A(dome(.385, M('#e11d48', .8), 0, .3, -.01, .52)); A(cyl(.39, .39, .08, M('#fda4af', .85), 0, .27, 0, 20)); A(sph(.11, M('#ffffff', .9), 0, .72, 0)); break; }
        case 31: { const km = M('#ec4899', .6); [-1, 1].forEach(s => { const c = A(cone(.14, .3, km, s * .17, .64, .12, 14)); c.rotation.z = -s * 1.2; }); A(sph(.07, km, 0, .64, .12)); break; }
        case 32: { const fm = M('#b91c1c', .7); A(cyl(.2, .3, .3, fm, 0, .5, 0, 20)); A(sph(.05, gold(), .22, .4, 0)); A(cyl(.01, .01, .16, gold(), .22, .32, 0, 6)); break; }
        case 33: { const bm = M('#1f2937', .5), pm = M('#f9a8d4', .6); A(tor(.38, .035, bm, 0, .26, 0, Math.PI)); [-1, 1].forEach(s => { const e = A(cone(.12, .28, bm, s * .2, .62, 0, 3)); e.rotation.z = -s * .25; const f = A(cone(.07, .18, pm, s * .2, .6, .03, 3)); f.rotation.z = -s * .25; }); break; }
        case 34: { const fl = ['#f472b6', '#fde047', '#ffffff', '#a78bfa', '#fb7185']; for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; A(sph(.07, M(fl[i % 5], .6), Math.cos(a) * .37, .3, Math.sin(a) * .37)); } A(tor(.37, .02, M('#22c55e', .7), 0, .3, 0)).rotation.x = Math.PI / 2; break; }
        case 35: { for (let i = 0; i < 5; i++) { const a = (i - 2) * .38, c = A(cone(.1, .42 - Math.abs(i - 2) * .07, i % 2 ? GL('#fb923c', 1.1) : GL('#fde047', 1.1), Math.sin(a) * .3, .6, Math.cos(a) * .12 - .02, 10)); c.rotation.z = -a; } break; }
      }
      head.add(hat); g.userData.hat = hat;
    }

    /* ---------- GÖZLÜK ---------- */
    const glassId = o.glasses | 0;
    if (glassId > 0) {
      const gg = new T.Group(); const A = m => { gg.add(m); return m; };
      const GY = eyeY, GZ = x => hz(x, GY, .03);
      const fr = M('#18181b', .35, 0), silver = MT('#d4d4d8', .25);
      const round = (mat, lens, r = .105) => [-1, 1].forEach(s => { A(tor(r, .016, mat, s * eyeX, GY, GZ(s * eyeX))); if (lens) { const l = A(cyl(r, r, .012, lens, s * eyeX, GY, GZ(s * eyeX) - .004, 20)); l.rotation.x = Math.PI / 2; } });
      const bridge = mat => A(box(.07, .02, .02, mat, 0, GY + .02, GZ(0) + .004));
      const temples = mat => [-1, 1].forEach(s => { const t = A(box(.02, .02, .28, mat, s * .3, GY + .005, .17)); t.rotation.y = s * .12; });
      const sqr = (w, h, t, mat, cx, lens) => { const z = GZ(cx); A(box(w, t, t, mat, cx, GY + h / 2, z)); A(box(w, t, t, mat, cx, GY - h / 2, z)); A(box(t, h, t, mat, cx - w / 2, GY, z)); A(box(t, h, t, mat, cx + w / 2, GY, z)); if (lens) A(box(w, h, .01, lens, cx, GY, z - .004)); };
      switch (glassId) {
        case 1: round(fr, GLASS('#e0f2fe', .22)); bridge(fr); temples(fr); break;
        case 2: round(fr, M('#050505', .1, 0, .3), .115); bridge(fr); temples(fr); break;
        case 3: { A(box(.6, .17, .04, GLASS('#f472b6', .55), 0, GY, GZ(0) + .01)); A(box(.62, .02, .05, fr, 0, GY + .09, GZ(0) + .012)); temples(fr); break; }
        case 4: { A(tor(.1, .016, gold2(), eyeX, GY, GZ(eyeX))); const l = A(cyl(.1, .1, .01, GLASS('#fef3c7', .18), eyeX, GY, GZ(eyeX) - .004, 20)); l.rotation.x = Math.PI / 2; const ch = A(cyl(.004, .004, .3, gold2(), eyeX + .1, GY - .16, GZ(eyeX) - .02, 4)); ch.rotation.z = .1; break; }
        case 5: [-1, 1].forEach(s => { A(box(.2, .13, .03, M('#050505', .12, 0, .3), s * eyeX, GY, GZ(s * eyeX) + .005)); }), A(box(.07, .022, .02, fr, 0, GY + .03, GZ(0) + .004)), temples(fr); break;
        case 6: { A(box(.7, .24, .17, M('#27272a', .35, 0, .3), 0, GY, hz(0, GY, .06))); A(box(.58, .15, .01, GL('#0ea5e9', .55), 0, GY, hz(0, GY, .15))); const st = A(tor(.39, .035, M('#52525b', .5), 0, GY - .01, 0)); st.rotation.x = Math.PI / 2; break; }
        case 7: sqr(.21, .16, .03, fr, -eyeX, GLASS('#e0f2fe', .18)), sqr(.21, .16, .03, fr, eyeX, GLASS('#e0f2fe', .18)), bridge(fr), temples(fr); break;
        case 8: round(silver, GLASS('#3b82f6', .5)); bridge(silver); temples(silver); break;
        case 9: { A(box(.62, .1, .04, GL('#a855f7', 1.2), 0, GY, GZ(0) + .012)); A(box(.66, .03, .05, fr, 0, GY + .065, GZ(0) + .012)); A(box(.66, .03, .05, fr, 0, GY - .065, GZ(0) + .012)); temples(fr); break; }
        case 10: [-1, 1].forEach(s => { const x = s * eyeX, hm = GL('#fb7185', .8); A(sph(.05, hm, x - .036, GY + .03, GZ(x) + .005, 1, 1, .4)); A(sph(.05, hm, x + .036, GY + .03, GZ(x) + .005, 1, 1, .4)); const c = A(cone(.092, .13, hm, x, GY - .035, GZ(x) + .005, 4)); c.rotation.z = Math.PI; c.rotation.y = Math.PI / 4; c.scale.z = .35; }), temples(fr); break;
        case 11: [-1, 1].forEach(s => { const x = s * eyeX, sh = new T.Shape(); for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? .05 : .12; sh[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r); } const m = A(mesh(new T.ExtrudeGeometry(sh, { depth: .015, bevelEnabled: false }), GL('#fde047', .9), x, GY, GZ(x))); }), temples(fr); break;
        case 12: { A(box(.66, .12, .1, M('#0b1220', .3, 0, .4), 0, GY, hz(0, GY, .05))); A(box(.58, .06, .01, GL('#22d3ee', 1.4), 0, GY, hz(0, GY, .105))); [-1, 1].forEach(s => A(box(.05, .1, .2, M('#0b1220', .3, 0, .4), s * .33, GY, .1))); break; }
        case 13: { const gm = gold2(); round(gm, M('#3b2a10', .1, 0, .5), .11); bridge(gm); temples(gm); break; }
      }
      head.add(gg);
    }
    function gold2() { return new T.MeshStandardMaterial({ color: '#fbbf24', roughness: .22, metalness: .85, emissive: '#7a5200', emissiveIntensity: .25 }); }

    /* ---------- KOLLAR ---------- */
    const slv = [.13, .28, 0, .14, .28, .28, .26][topT] ?? .13;
    const sleeveMat = cloth;
    const mkArm = side => {
      const p = new T.Group(); p.position.set(side * (fem ? .29 : .32), .18, 0); body.add(p);
      if (topT !== 2) p.add(mesh(new T.SphereGeometry(.11, 12, 10), cloth, 0, 0, 0, 1.06)); else p.add(mesh(new T.SphereGeometry(.095, 12, 10), skin, 0, 0, 0, 1.06));
      p.add(mesh(new T.CylinderGeometry(.09, .085, .28, 10), skin, 0, -.22, 0, 1.05));
      if (slv > 0) p.add(mesh(new T.CylinderGeometry(.1, .098, slv, 12), sleeveMat, 0, -.075 - slv / 2, 0, 1.04));
      if (su && (su.metal || o.suit === 14)) { p.add(mesh(new T.CylinderGeometry(.1, .1, .06, 12), MT(o.suit === 14 || o.suit === 12 || o.suit === 13 ? '#fbbf24' : '#cbd5e1'), 0, -.36, 0)); }   // bilek bandı
      const hand = mesh(new T.SphereGeometry(.095, 12, 10), (o.suit === 1 || o.suit === 3 && 0) ? cloth : skin, 0, -.42, 0, 1.06); p.add(hand);
      return p;
    };
    const armL = mkArm(-1), armR = mkArm(1);

    /* ---------- BACAKLAR (kalça + diz) ---------- */
    const legM = (skirtOn || (su && su.x.includes('dress'))) ? skin : pant;
    const mkLeg = side => {
      const p = new T.Group(); p.position.set(side * .12, .62, 0); g.add(p);
      p.add(mesh(new T.CylinderGeometry(.105, .098, .3, 10), legM, 0, -.15, 0, 1.05));
      const knee = new T.Group(); knee.position.y = -.3; p.add(knee);
      knee.add(mesh(new T.SphereGeometry(.1, 10, 8), pant, 0, 0, 0, 1.04));
      knee.add(mesh(new T.CylinderGeometry(.098, .09, .26, 10), legM, 0, -.13, 0, 1.05));
      const foot = mesh(new T.SphereGeometry(.115, 12, 10), shoe, 0, -.25, .045, 1.05); foot.scale.set(1, .7, 1.38); knee.add(foot);
      knee.add(mesh(new T.CylinderGeometry(.1, .1, .045, 12), M(su ? '#e5e7eb' : '#f1f5f9', .6, 0), 0, -.275, .03));   // taban
      if (su && o.suit === 1) knee.add(mesh(new T.CylinderGeometry(.105, .105, .06, 12), M('#c0392b'), 0, -.2, 0));
      p.userData.knee = knee; return p;
    };
    const legL = mkLeg(-1), legR = mkLeg(1);

    /* ---------- ÜST MODELİ (kıyafet detayları) ---------- */
    const trim = M('#f8fafc', .7, 0);
    if (!su) {
      if (topT === 4) { const h = sph(.2, cloth, 0, .4, -.2, 1.25, .8, .75); body.add(h); body.add(box(.3, .12, .05, M(topC, .9, .0), 0, -.04, tz(-.04))); [-1, 1].forEach(s => body.add(cyl(.012, .012, .16, trim, s * .06, .26, tz(.26), 5))); }
      else if (topT === 5) { [-1, 1].forEach(s => { const l = box(.1, .26, .03, M('#111827', .6, 0), s * .1, .28, tz(.28)); l.rotation.z = s * .35; body.add(l); }); body.add(box(.02, .5, .02, MT('#d4d4d8'), 0, .1, tz(.1))); body.add(tor(.17, .045, M('#111827', .6, 0), 0, .4, -.02)).rotation.x = Math.PI / 2; }
      else if (topT === 6) { [-1, 1].forEach(s => { const c = box(.1, .08, .03, trim, s * .07, .4, tz(.4) - .005); c.rotation.z = -s * .6; body.add(c); }); [.3, .17, .04].forEach(y => body.add(sph(.018, trim, 0, y, tz(y) + .004))); }
    }
    /* ---------- KOSTÜM EKSTRALARI ---------- */
    if (su) su.x.forEach(spec => {
      const [k, a] = spec.split(':'); const cm = a ? M(a, .5, .05) : null;
      if (k === 'belt') { const b = tor(.235, .035, cm, 0, -.055, 0); b.rotation.x = Math.PI / 2; b.scale.set(1.04, .87, 1); body.add(b); body.add(box(.1, .09, .03, gold2(), 0, -.055, .215)); }
      else if (k === 'sash') { const s2 = box(.07, .62, .02, cm, 0, .12, tz(.12) + .005); s2.rotation.z = .8; body.add(s2); }
      else if (k === 'mask') { const m = mesh(new T.SphereGeometry(.372, 22, 12, 0, Math.PI * 2, Math.PI * .56, Math.PI * .22), M('#15151c', .7, 0), 0, HC, 0); head.add(m); }
      else if (k === 'front') { const f = mesh(new T.SphereGeometry(.292, 16, 12, Math.PI / 2 - .55, 1.1, .5, 1.1), M('#f8fafc', .6, 0), 0, .12, 0); f.scale.set(1.05, 1.15, .9); body.add(f); [.28, .16, .04].forEach(y => body.add(sph(.018, dark, 0, y, tz(y) + .012))); }
      else if (k === 'bow') { [-1, 1].forEach(s => { const c = cone(.05, .09, M('#dc2626', .5), s * .06, .41, tz(.41) + .01, 3); c.rotation.z = s * -Math.PI / 2; body.add(c); }); body.add(sph(.025, M('#b91c1c'), 0, .41, tz(.41) + .012)); }
      else if (k === 'belly') { const f = mesh(new T.SphereGeometry(.292, 16, 12, Math.PI / 2 - .6, 1.2, .5, 1.3), M('#fde68a', .7, 0), 0, .12, 0); f.scale.set(1.05, 1.15, .9); body.add(f); }
      else if (k === 'spikes') { [.34, .2, .06, -.08].forEach((y, i) => body.add(cone(.055 - i * .005, .15, cm, 0, y, -.27 - (i === 0 ? 0 : .01), 6).rotateX(-Math.PI / 2 - .3))); }
      else if (k === 'tail') { const tg = new T.Group(); tg.position.set(0, -.14, -.26); [.12, .1, .075, .05].forEach((r, i) => tg.add(sph(r, cm, 0, -i * .03, -i * .14))); body.add(tg); g.userData.tail = tg; }
      else if (k === 'antenna') { [-1, 1].forEach(s => { const a2 = cyl(.012, .012, .26, dark, s * .1, .8, 0, 5); a2.rotation.z = -s * .3; head.add(a2); head.add(sph(.045, M('#facc15', .4), s * .17, .92, 0)); }); }
      else if (k === 'tinywings') { [-1, 1].forEach(s => { const w2 = sph(.14, GLASS('#e0f2fe', .6), s * .16, .2, -.3, .5, 1.2, .15); w2.rotation.z = s * .5; body.add(w2); }); }
      else if (k === 'dress') { const r = mesh(new T.CylinderGeometry(.22, .47, .55, 28, 1, true), DS(M(botC, .7, .05)), 0, -.3, 0); body.add(r); body.add(tor(.47, .02, M('#ffffff', .6, 0), 0, -.575, 0)).rotation.x = Math.PI / 2; }
      else if (k === 'tie') { body.add(box(.06, .22, .02, cm, 0, .22, tz(.22) + .01)); body.add(sph(.04, cm, 0, .33, tz(.33) + .012)); }
      else if (k === 'badge') { const b2 = sph(.05, new T.MeshStandardMaterial({ color: a, roughness: .25, metalness: .8, emissive: a, emissiveIntensity: .25 }), .1, .24, tz(.24) + .004, 1, 1, .35); body.add(b2); }
      else if (k === 'stripe') { body.add(box(.06, .52, .02, cm, 0, .12, tz(.12) + .006)); [legL, legR].forEach(lg => lg.add(box(.022, .55, .06, cm, lg === legL ? -.1 : .1, -.28, 0))); }
      else if (k === 'cross') { body.add(cyl(.07, .07, .02, white, 0, .24, tz(.24) + .004, 16).rotateX(Math.PI / 2)); const rd = M('#dc2626', .5, .1); body.add(box(.09, .03, .02, rd, 0, .24, tz(.24) + .016)); body.add(box(.03, .09, .02, rd, 0, .24, tz(.24) + .016)); }
      else if (k === 'robe') { const r = mesh(new T.CylinderGeometry(.25, .39, .46, 20, 1, true), DS(M(a, .75, .04)), 0, -.3, 0); body.add(r); body.add(tor(.39, .018, gold2(), 0, -.53, 0)).rotation.x = Math.PI / 2; }
      else if (k === 'plates') { [-1, 1].forEach(s => { const sp = sph(.14, MT(a, .3), s * .35, .27, 0, 1, .6, 1.05); sp.rotation.z = s * .4; body.add(sp); });
        const f = mesh(new T.SphereGeometry(.302, 18, 12, Math.PI / 2 - .85, 1.7, .35, 1.15), MT(a, .28), 0, .12, 0); f.scale.set(1.05, 1.15, .9); body.add(f); }
      else if (k === 'chestpanel') { body.add(box(.2, .14, .02, M('#e5e7eb', .4), 0, .2, tz(.2) + .006)); [['#ef4444', -.06], ['#22c55e', 0], ['#3b82f6', .06]].forEach(([c, x]) => body.add(sph(.016, GL(c, 1), x, .2, tz(.2) + .02))); [-1, 1].forEach(s => { const ring = tor(.1, .025, M('#f97316', .5), s * .36, .18, 0); ring.rotation.y = Math.PI / 2; ring.position.y = .06; }); }
      else if (k === 'panels') { [-1, 1].forEach(s => body.add(box(.16, .1, .03, MT('#475569', .35), s * .12, .0, tz(0) + .004))); [-1, 1].forEach(s => body.add(sph(.07, MT('#334155'), s * .35, .26, 0))); }
      else if (k === 'glowchest') { const c = sph(.07, GL(a, 1.6), 0, .22, tz(.22) + .0, 1, 1, .4); body.add(c); g.userData.glow = c; }
      else if (k === 'neon') { const nm = GL(a, 1.4); [.3, .16, .02].forEach((y, i) => { const r = tor(.262 * Math.sqrt(Math.max(.1, 1 - Math.pow((y - .12) / .322, 2))), .012, nm, 0, y, 0); r.rotation.x = Math.PI / 2; r.scale.set(1.05, .9, 1); body.add(r); });
        [armL, armR].forEach(ar => { const r = tor(.092, .01, nm, 0, -.2, 0); r.rotation.x = Math.PI / 2; ar.add(r); }); [legL, legR].forEach(lg => { const r = tor(.103, .01, nm, 0, -.15, 0); r.rotation.x = Math.PI / 2; lg.add(r); }); const vs = box(.26, .018, .02, nm, 0, .36, tz(.36)); body.add(vs); }
      else if (k === 'fur') { const f = tor(.2, .075, M('#f8fafc', .9, 0), 0, .38, 0); f.rotation.x = Math.PI / 2; body.add(f); for (let i = 0; i < 7; i++) { const a2 = i / 7 * Math.PI * 2; body.add(sph(.022, dark, Math.cos(a2) * .2, .385, Math.sin(a2) * .2 + .005)); } }
      else if (k === 'collar') { const c = tor(.21, .07, gold2(), 0, .38, 0); c.rotation.x = Math.PI / 2; c.scale.set(1.1, 1, 1); body.add(c); body.add(tor(.17, .03, M('#2563eb', .4), 0, .4, 0)).rotation.x = Math.PI / 2; const sk = mesh(new T.CylinderGeometry(.25, .36, .3, 20, 1, true), DS(M('#f8fafc', .7, .03)), 0, -.24, 0); body.add(sk); body.add(tor(.36, .02, gold2(), 0, -.39, 0)).rotation.x = Math.PI / 2; }
    });

    /* ---------- SIRT EŞYALARI ---------- */
    const backId = o.back | 0;
    if (backId > 0) {
      const bk = new T.Group(); bk.position.set(0, .12, -.27); body.add(bk); const A = m => { bk.add(m); return m; };
      const red = M('#dc2626', .6, .05);
      const wingFeathers = (s, col, n, len, em) => { const w2 = new T.Group(); w2.position.set(s * .12, .12, -.02); bk.add(w2);
        for (let i = 0; i < n; i++) { const l = len - i * (len * .12), f = sph(1, em ? GL(col, .35) : M(col, .55, .05), 0, 0, 0); f.scale.set(l, .07, .025); f.position.set(s * l * .85, .26 - i * .09 - (i ? 0 : 0), -.02 * i); f.rotation.z = s * (.45 - i * .12); w2.add(f); } return w2; };
      const bat = (s, col, size) => { const w2 = new T.Group(); w2.position.set(s * .1, .16, -.02); bk.add(w2); const sh = new T.Shape(); sh.moveTo(0, .1); sh.lineTo(.5 * size, .42 * size); sh.lineTo(.72 * size, .3 * size); sh.lineTo(.64 * size, .08 * size); sh.lineTo(.5 * size, -.04 * size); sh.lineTo(.34 * size, -.12 * size); sh.lineTo(.2 * size, -.02 * size); sh.lineTo(0, -.14); const mm = new T.Mesh(new T.ShapeGeometry(sh), DS(M(col, .7, .1))); mm.scale.x = s; mm.castShadow = true; w2.add(mm); const bone = cyl(.015, .015, .62 * size, dark, s * .22 * size, .25 * size, 0, 5); bone.rotation.z = -s * 1.0; w2.add(bone); return w2; };
      if (backId === 1) { A(box(.34, .44, .18, M('#ef4444', .7), 0, 0, -.08)); A(box(.26, .16, .06, M('#b91c1c', .7), 0, -.1, -.19)); [-1, 1].forEach(s => body.add(box(.045, .46, .02, M('#7f1d1d', .8), s * .12, .14, tz(.14) + .004))); }
      else if (backId === 2 || backId === 9) { const gm = backId === 9; const cm = DS(gm ? new T.MeshStandardMaterial({ color: '#fbbf24', roughness: .35, metalness: .6, emissive: '#7a5200', emissiveIntensity: .3 }) : red); const cp = new T.Group(); cp.position.set(0, .26, -.02); bk.add(cp); const pl = new T.Mesh(new T.PlaneGeometry(.6, .78, 4, 6), cm); pl.position.set(0, -.39, -.02); pl.castShadow = true; cp.add(pl); [-1, 1].forEach(s => cp.add(sph(.045, gold2(), s * .17, .02, .02))); g.userData.cape = cp; }
      else if (backId === 3) { const bl = A(box(.07, .92, .02, MT('#e5e7eb', .2), 0, .12, -.1)); bl.rotation.z = .55; const hd = A(cyl(.025, .025, .22, M('#78350f'), -.36, -.2, -.1, 6)); hd.rotation.z = .55; hd.position.set(-.27 - .1, -.24 - .0, -.1); const gd = A(box(.22, .04, .05, gold2(), -.2, -.12, -.1)); gd.rotation.z = .55 + Math.PI / 2 * 0; }
      else if (backId === 4) { g.userData.wings = [wingFeathers(-1, '#ffffff', 5, .55), wingFeathers(1, '#ffffff', 5, .55)]; }
      else if (backId === 5) { g.userData.wings = [bat(-1, '#7f1d1d', 1), bat(1, '#7f1d1d', 1)]; }
      else if (backId === 8) { g.userData.wings = [bat(-1, '#047857', 1.45), bat(1, '#047857', 1.45)]; }
      else if (backId === 6) { [-1, 1].forEach(s => { A(cyl(.085, .085, .46, MT('#6b7280', .3), s * .12, 0, -.1, 12)); A(cone(.07, .12, M('#f97316', .4), s * .12, -.28, -.1, 10)).rotation.x = Math.PI; const fl = A(cone(.06, .32, GL('#fb923c', 1.2), s * .12, -.46, -.1, 8)); fl.rotation.x = Math.PI; (g.userData.flames ||= []).push(fl); A(sph(.09, M('#ef4444', .4), s * .12, .24, -.1, 1, .6, 1)); }); }
      else if (backId === 7) { const sh = A(dome(.34, M('#16a34a', .6), 0, -.02, -.12, .5)); sh.rotation.x = Math.PI / 2 + .1; sh.scale.set(1, 1, .6); for (let i = 0; i < 6; i++) { const a2 = i / 6 * Math.PI * 2; A(sph(.07, M('#15803d', .6), Math.cos(a2) * .16, Math.sin(a2) * .16, -.2, 1, 1, .5)); } A(sph(.07, M('#15803d', .6), 0, 0, -.22, 1, 1, .5)); }
    }

    g.userData = { ...g.userData, body, head, armL, armR, legL, legR, key: JSON.stringify(o) };
    return g;
  }

  /* ------------------------------------------------------------- ANİMASYON */
  function pose(g, a, t, emote, et, land = 0, air = 0, lean = 0, sitArg = 0) {
    let sk = 0; if (a === 2) { a = 0; sk = 1; } else if (sitArg > 0) { sk = sitArg; }
    const u = g.userData, sw = Math.sin(t * 9), kL = u.legL.userData.knee, kR = u.legR.userData.knee;
    if (u.hat?.userData.prop) u.hat.userData.prop.rotation.y = t * 20;
    if (u.hat?.userData.bob) u.hat.userData.bob.position.y = .95 + Math.sin(t * 2.4) * .025;
    let aL = 0, aR = 0, lL = 0, lR = 0, nL = 0, nR = 0, by = .72, bz = 0, hzr = 0, ry = 0, bx = 0, moving = 0;
    if (air > .05) {
      const k = Math.min(1, air); lL = -.75 * k; lR = -.45 * k; nL = .95 * k; nR = .7 * k; aL = -1.35 * k; aR = -1.25 * k; by = .72 + .12 * k; bx = -.2 * k;
      u.armL.rotation.z = -.25 * k; u.armR.rotation.z = .25 * k; moving = 1;
    } else if (a === 1) {
      lL = sw * .78; lR = -sw * .78; nL = Math.max(0, lL) * 1.05 + .08; nR = Math.max(0, lR) * 1.05 + .08;
      aL = -sw * .65; aR = sw * .65; by = .72 + Math.abs(Math.cos(t * 9)) * .045; bx = lean * .22; moving = 1;
    } else { by = .72 + Math.sin(t * 2) * .012; aL = Math.sin(t * 1.7) * .05; aR = -aL; }
    if (emote && et < 3) {
      if (emote === '👋') aR = Math.PI - .5 + Math.sin(t * 14) * .45;
      else if (emote === '💃') { aL = Math.PI - .4 + Math.sin(t * 8) * .4; aR = Math.PI - .4 - Math.sin(t * 8) * .4; bz = Math.sin(t * 8) * .18; hzr = Math.sin(t * 4) * .2; by += Math.abs(Math.sin(t * 8)) * .1; ry = Math.sin(t * 4) * .5; lL = Math.sin(t * 8) * .4; lR = -lL; nL = Math.max(0, lL) * .8; nR = Math.max(0, lR) * .8; }
      else if (emote === '🦘') { const k = Math.abs(Math.sin(et * 5)); by += k * .25; aL = aR = Math.PI * .5 * k; nL = nR = (1 - k) * .6; }
      else if (emote === '⚔️') { if (et < .5) { const k = Math.min(1, et / .3), e = 1 - (1 - k) * (1 - k); aR = (Math.PI - .5) * (1 - e) - 1.5 * e; ry = .5 * (1 - e) - .5 * e; bz = -.08 * Math.sin(k * Math.PI); } }
      else if (emote === '👏') { const k = (Math.sin(t * 16) + 1) / 2; aL = aR = -1.2; u.armL.rotation.z = -.35 * (1 - k) + .05; u.armR.rotation.z = .35 * (1 - k) - .05; }
    }
    // OTURMA (sk): uyluk ileri, baldır aşağı
    if (sk > 0) {
      const k = sk * sk * (3 - 2 * sk);
      lL = lL * (1 - k) - 1.5708 * k; lR = lR * (1 - k) - 1.5708 * k; nL = nL * (1 - k) + 1.5708 * k; nR = nR * (1 - k) + 1.5708 * k;
      if (!emote || et >= 3) { aL = aL * (1 - k) - .42 * k; aR = aR * (1 - k) - .42 * k; }
      u.body.rotation.x = Math.sin(k * Math.PI) * .26; by = by * (1 - k) + (.72 - .015) * k;
    } else u.body.rotation.x = bx;
    // İNİŞ ÇÖMELMESİ (land): diz bükülür, gövde alçalır, ayaklar yerde kalır
    if (land > 0 && sk === 0) {
      const k = land * land * (3 - 2 * land);
      lL = lL * (1 - k) - .9 * k; lR = lR * (1 - k) - .9 * k; nL = nL * (1 - k) + 1.5 * k; nR = nR * (1 - k) + 1.5 * k;
      by -= .2 * k; u.body.rotation.x = k * .18; if (!emote || et >= 3) { aL = aL * (1 - k) - .5 * k; aR = aR * (1 - k) - .5 * k; }
    }
    if (!(emote === '👏' && et < 3)) { u.armL.rotation.z = .05; u.armR.rotation.z = -.05; }
    u.armL.rotation.x = aL; u.armR.rotation.x = aR; u.legL.rotation.x = lL; u.legR.rotation.x = lR; kL.rotation.x = nL; kR.rotation.x = nR;
    u.body.position.y = by; u.body.rotation.z = bz; u.head.rotation.z = hzr; u.body.rotation.y = ry;
    u.legL.position.y = u.legR.position.y = by - .1 + (sk === 0 && land > 0 ? .2 * land * land * (3 - 2 * land) * 0 : 0);
    // pelerin / kanat / kuyruk / jetpack
    if (u.cape) u.cape.rotation.x = .08 + (moving ? .35 + Math.sin(t * 9) * .08 : Math.sin(t * 1.6) * .03) + (air > .05 ? .5 : 0) - sk * .12;
    if (u.wings) { const f = air > .05 ? Math.sin(t * 16) * .45 : (moving ? Math.sin(t * 5) * .12 : Math.sin(t * 2) * .06); u.wings[0].rotation.y = .28 + f; u.wings[1].rotation.y = -.28 - f; }
    if (u.tail) u.tail.rotation.y = Math.sin(t * (moving ? 9 : 3)) * (moving ? .5 : .3);
    if (u.flames) u.flames.forEach((f, i) => { f.scale.y = air > .05 ? 1.6 + Math.sin(t * 40 + i) * .4 : .8 + Math.sin(t * 22 + i) * .15; });
    if (u.glow) u.glow.scale.setScalar(1 + Math.sin(t * 4) * .15);
  }

  window.VCHAR = { build, pose, SUITS };
})();
