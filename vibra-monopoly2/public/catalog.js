'use strict';
/* Vibra katalog: hem tarayıcı hem sunucu kullanır (fiyatlar sunucuda doğrulanır). */
(function (root) {
  const RAR = {
    c: { n: 'Sıradan', col: '#9ca3af', price: 60 },
    k: { n: 'Klasik', col: '#38bdf8', price: 200 },
    e: { n: 'Destansı', col: '#c084fc', price: 650 },
    l: { n: 'Efsanevi', col: '#fbbf24', price: 1800 },
  };
  // [ad, nadirlik, özel fiyat (0 = ücretsiz)]
  const hat = [
    ['Yok', 'c', 0], ['🐸 Kurbağa', 'k'], ['🚧 Koni', 'c'], ['🍄 Mantar', 'k'], ['🧢 Kep', 'c', 0], ['🐰 Tavşan', 'k'],
    ['🎩 Silindir', 'k'], ['🎅 Noel', 'k'], ['🤠 Kovboy', 'k'], ['👑 Taç', 'l'], ['🚁 Pervane', 'e'], ['👨‍🍳 Aşçı', 'c'],
    ['📺 TV', 'e'], ['🥷 Ninja Bandı', 'e'], ['🚀 Astronot', 'e'], ['🤖 Robot', 'e'], ['🎃 Balkabağı', 'k'], ['🦄 Unicorn', 'l'],
    ['🎧 Kulaklık', 'c'], ['🧙 Büyücü', 'e'], ['🦁 Aslan', 'e'], ['🎓 Mezuniyet', 'c'], ['⛑️ Kask', 'c'], ['🪖 Asker', 'k'],
    ['🐉 Ejderha Miğferi', 'l'], ['😇 Halo', 'e'], ['😈 Şeytan Boynuzu', 'e'], ['🏴‍☠️ Korsan', 'k'], ['⚔️ Viking', 'e'], ['🥋 Samuray Miğferi', 'l'],
    ['🧶 Bere', 'c'], ['🎀 Kurdele', 'c'], ['🕌 Fes', 'k'], ['🐱 Kedi Kulağı', 'k'], ['🌸 Çiçek Tacı', 'e'], ['🔥 Alev', 'l'],
  ];
  const glasses = [
    ['Yok', 'c', 0], ['Yuvarlak', 'c', 0], ['Güneş', 'c'], ['Pembe Vizör', 'k'], ['Monokl', 'k'], ['🕶️ Siyah', 'c'],
    ['🥽 VR', 'e'], ['👓 Nerd', 'c'], ['🔵 Mavi', 'k'], ['🟣 Neon', 'e'], ['💖 Kalp', 'k'], ['⭐ Yıldız', 'e'],
    ['🛰️ Siber Vizör', 'e'], ['✨ Altın Güneş', 'l'],
  ];
  const back = [
    ['Yok', 'c', 0], ['🎒 Sırt Çantası', 'c'], ['🦸 Kırmızı Pelerin', 'k'], ['🗡️ Kılıç', 'k'], ['🪽 Melek Kanatları', 'e'],
    ['🦇 Şeytan Kanatları', 'e'], ['🚀 Jetpack', 'e'], ['🐢 Kaplumbağa Kabuğu', 'k'], ['🐲 Ejderha Kanatları', 'l'], ['🌟 Altın Pelerin', 'l'],
  ];
  // Kostümler: üst+alt+ayakkabı birlikte tasarlanmış tam takımlar
  const suit = [
    ['Yok', 'c', 0],
    ['🥷 Ninja', 'k'], ['🏴‍☠️ Korsan', 'k'], ['🤵 Smokin', 'k'], ['🦖 Dinozor Pijaması', 'k'], ['🐝 Arı Kostümü', 'c'],
    ['🧙 Sihirbaz Cübbesi', 'e'], ['🛡️ Şövalye Zırhı', 'e'], ['👨‍🚀 Astronot', 'e'], ['🤖 Robot', 'e'], ['🌈 Siber Neon', 'e'],
    ['👑 Kral Cübbesi', 'l'], ['🥋 Samuray Zırhı', 'l'], ['🐉 Ejderha Zırhı', 'l'], ['🔱 Firavun', 'l'],
    ['👗 Prenses Elbisesi', 'e'], ['🧚 Peri Elbisesi', 'e'], ['🧛 Vampir', 'e'], ['🏎️ Yarış Tulumu', 'k'], ['🥼 Doktor', 'c'], ['👮 Polis', 'k'], ['🦸 Süper Kahraman', 'e'], ['🧑‍🚒 İtfaiyeci', 'k'],
    ['🏖️ Plaj Takımı', 'c'], ['🎅 Noel Baba', 'k'], ['👘 Kimono', 'e'], ['🕴️ Şık Takım', 'k'], ['🏀 Basketbolcu', 'c'], ['⚽ Futbolcu', 'c'], ['💃 Parti Elbisesi', 'l'], ['👸 Kraliçe', 'l'], ['🧑‍🎤 Rockstar', 'e'], ['🌸 Yaz Elbisesi', 'k'],
    ['🤠 Kovboy', 'k'], ['🧑‍🌾 Çiftçi', 'c'], ['🧑‍🍳 Aşçı', 'c'], ['🏄 Sörfçü', 'c'], ['🥷 Kızıl Ninja', 'e'], ['🧟 Zombi', 'k'], ['👻 Hayalet', 'e'], ['🎃 Cadılar Bayramı', 'k'],
    ['🧝 Elf', 'k'], ['⛄ Kardan Adam', 'e'], ['🦊 Tilki', 'e'], ['🐼 Panda', 'e'], ['🐺 Kurt Adam', 'e'], ['🦄 Unicorn Pijaması', 'l'], ['🧞 Cin', 'l'], ['🪖 Asker', 'k'],
    ['🧑‍✈️ Pilot', 'k'], ['🕵️ Dedektif', 'k'], ['🧑‍🔬 Bilim İnsanı', 'c'], ['🎮 Oyuncu', 'c'], ['🛹 Paten Takımı', 'c'], ['🤴 Prens', 'l'], ['🏆 Altın Şampiyon', 'l'], ['💎 Elmas Zırh', 'l'],
    ['🔥 Ateş Büyücüsü', 'e'], ['❄️ Buz Kraliçesi', 'l'], ['🌙 Gece Büyücüsü', 'e'], ['🎪 Palyaço', 'k'], ['🧑‍🎨 Ressam', 'c'], ['🏋️ Sporcu', 'c'],
  ];
  const SLOTS = { hat, glasses, back, suit };
  const SLOT_KEY = { hat: 'hat', glasses: 'glasses', back: 'back', suit: 'suit' };
  const priceOf = (slot, i) => {
    const it = SLOTS[slot] && SLOTS[slot][i]; if (!it) return -1;
    if (it[2] != null) return it[2];
    return RAR[it[1]].price;
  };
  const isFree = (slot, i) => priceOf(slot, i) === 0;
  // Parkur / mini oyun meta (sunucu ödülü buradan hesaplar)
  const COURSES = [
    { name: '🌱 Başlangıç', base: 30, target: 45, color: '#22c55e' },
    { name: '🌊 Dalga Vadisi', base: 55, target: 60, color: '#0ea5e9' },
    { name: '🍄 Mantar Ormanı', base: 70, target: 65, color: '#f472b6' },
    { name: '🔥 Ateş Yolu', base: 90, target: 70, color: '#f59e0b' },
    { name: '🧊 Buz Sarayı', base: 110, target: 75, color: '#7dd3fc' },
    { name: '⚡ Şimşek Kulesi', base: 130, target: 80, color: '#a855f7' },
    { name: '🪐 Uzay İstasyonu', base: 150, target: 85, color: '#6366f1' },
    { name: '💀 Cehennem', base: 200, target: 95, color: '#ef4444' },
    { name: '🌱 Yeşil Vadi', base: 30, target: 40, color: '#22c55e' },
    { name: '🌊 Salıncak Koyu', base: 55, target: 60, color: '#0ea5e9' },
    { name: '🔥 Lav Kaçışı', base: 80, target: 72, color: '#f97316' },
    { name: '❄️ Buz Zirvesi', base: 100, target: 88, color: '#7dd3fc' },
    { name: '⚡ Cehennem Kulesi', base: 140, target: 110, color: '#a855f7' },
  ];
  const GAMES = {
    laser: { name: 'Laser Tracer', win: 120, play: 15 },
    honey: { name: 'Honey Drop', win: 150, play: 15 },
    rush: { name: 'Para Avı', win: 100, play: 10 },
  };
  const api = { RAR, SLOTS, SLOT_KEY, priceOf, isFree, COURSES, GAMES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.VCAT = api;
})(typeof window !== 'undefined' ? window : globalThis);
