# Vibra

Sesli kanallar, 4K 60 FPS ekran paylaşımı, dosya paylaşımı ve sadece isimle girişle çalışan sohbet uygulaması.
**Hiç bağımlılık yok**: `npm install` gerekmez, sadece Node.js 22.5 veya üstü yeterli.

## Çalıştırma

```bash
node server.js
# ya da: npm start
```

Sonra tarayıcıdan http://localhost:3000 adresini aç. Mikrofon ve ekran paylaşımı `localhost` veya HTTPS üzerinde çalışır.

## Giriş

Kayıt kodu ve şifre yok: sadece **isim** yazıp giriş yapılır. İsim daha önce alınmışsa o hesaba girer, yoksa yeni hesap açılır. Not: şifre olmadığı için isim bilen herkes o hesaba girebilir.

## Profil özelleştirme

Sol alttaki kullanıcı alanına (ya da ⚙ → Profilimi Özelleştir) tıkla: avatar yükle (PNG/JPEG/WebP/GIF, GIF hareketli kalır), ana renk, gradyan afiş, durum yazısı ve "Hakkında" metni. Canlı önizleme var. Üye listesinde, mesajlarda veya ses kanalında birinin avatarına/adına tıklayınca profil kartı açılır.

## Diğer ayarlar

| Değişken | Varsayılan | Açıklama |
|---|---|---|
| `PORT` | 3000 | Dinlenen port |
| `HOST` | 0.0.0.0 | Dinlenen adres (sadece kendin için `127.0.0.1`) |
| `MAX_UPLOAD_MB` | 100 | Dosya yükleme sınırı |
| `DATA_DIR` | ./data | Veritabanı (SQLite) ve yüklenen dosyalar |
| `SSL_CERT`, `SSL_KEY` | yok | HTTPS için sertifika ve anahtar dosyaları |

## Neler var

- Sadece isimle giriş, çıkış, profil özelleştirme (avatar, afiş, renk, durum, hakkında)
- Sunucu oluşturma, davet koduyla katılma, metin ve ses kanalı oluşturma
- Anlık mesajlaşma, "yazıyor..." göstergesi, çevrimiçi listesi, okunmamış sayaçları, mesaj silme, emoji
- Dosya yükleme: butonla, sürükle-bırak veya yapıştırarak (100 MB). Görsel/video/ses önizlenir, diğerleri indirme kartı olur
- Sesli kanallar (WebRTC), sustur / sağırlaştır, konuşan kişinin yeşil halkası
- 🎴 **3D Okey masası**: Ses kanalındayken **3D Dünya → Ev** içinde sağdaki masaya yürü, bir sandalyenin yanında **E** ile otur. Oturunca "Botlarla doldurulsun mu?" diye sorar: **🤖 Botlarla Başlat** eksik koltukları botlarla doldurup oyunu hemen başlatır (botlar masada oturan karakterlerdir), ya da arkadaşlarını bekleyip 4 kişi olunca **Başlat**'a basarsın. Bota ait koltuğa bir insan oturursa bot çıkar; oyun sırasında biri kalkarsa yerine bot geçer, masada hiç insan kalmazsa botlar silinir. Gerçek okey kuralları: 106 taş, gösterge + okey (joker), sahte okey, 14/15 taş dağıtımı, desteden ya da soldaki oyuncunun attığı taştan çekme, per/seri (12-13-1 dahil) kontrolü **sunucuda** yapılır, **Bitir** ile el doğrulanır. Taşları sürükleyerek dizebilirsin, çift tık = at, 🎨 Seri Diz / 🔢 Per Diz ile sırala. Rafta geçerli per/seriler yeşil çerçevelenir, el hazırsa kırmızı parlayan taş atılacak taştır ve Bitir yanar. Kısayollar: C deste, V soldan, Enter at, G/H diz. El bitince herkesin taşları masada açılır. Oyun sırasında biri kalkarsa el iptal olur. Sesli sohbet masadayken de açık kalır.
- Ekran paylaşımı: 4K·60 FPS (varsayılan), 1440p·60, 1080p·60, 720p·30. Sistem sesi dahil (tarayıcı destekliyorsa). Yayın sırasında kalite değiştirilebilir

## Bilmen gerekenler

- **Ses/ekran mimarisi:** Kullanıcılar birbirine doğrudan bağlanır (mesh). Ekran paylaşan kişi her izleyiciye ayrı yayın gönderir; 4K 60 FPS için izleyici başına yaklaşık 45 Mbps yükleme gerekir. Küçük gruplar için uygundur; kalabalık kanallar için LiveKit gibi bir SFU gerekir.
- **Farklı ağlardaki kullanıcılar:** Sadece genel STUN sunucuları kullanılır. Bazı ağlarda (kurumsal, simetrik NAT) bağlantı kurulamaz; bunun için bir TURN sunucusu (örn. coturn) eklemek gerekir (`public/app.js` içindeki `ICE`).
- **Gerçek 4K:** Yakalama çözünürlüğü ekranınla sınırlıdır; tarayıcı ve işlemci gerekirse otomatik düşürür.
- **İnternete açarken:** Mikrofon/ekran paylaşımı için HTTPS şart. Önüne Caddy/nginx koyabilir veya `SSL_CERT`/`SSL_KEY` verebilirsin.

## Henüz yok

Özel mesajlar, arkadaş listesi, roller/yetkiler, mesaj düzenleme ve tepkiler, kamera, mobil uygulama.

## 3D Dünya (sesli sohbetin içinde)

Bir ses kanalına katıl → alttaki **🏕️ 3D Dünya** butonu. İçinde:
- **Kamp ateşi lobisi:** ateş, kıvılcımlar, ateşböcekleri, yıldızlı gece; kütüklerde 12 oturma yeri.
- **Ev (TV odası):** ışıktaki portaldan girilir; kanepe/puflar ve TV. TV'nin yanında **E** (ya da üstteki **📺 TV** butonu) ile kumanda açılır: **link yapıştır** (YouTube, Vimeo, Twitch, doğrudan .mp4/.webm…) ya da **ekranını TV'ye yansıt** (veya kanaldaki başka birinin paylaşımını seç). Herkes aynı şeyi izler: oynat/duraklat/10 sn ileri-geri senkron, TV'ye yaklaştıkça ses artar, kumandadan **Tam ekran** yapılabilir. Bazı siteler gömülmeye izin vermez (YouTube/Vimeo/Twitch ve doğrudan video linkleri sorunsuz).
- Karakterlerin üstünde isim etiketi, konuşurken yeşil parlama. Yürüme, zıplama, oturma, emote (👋💃🦘👏).
- Ses efektleri: katılma/ayrılma, mute/deaf, mesaj, ekran paylaşımı, adım, oturma, TV, kapı, ateş çıtırtısı (yaklaştıkça artar).
- **Karakter editörü:** ⚙ → Karakterimi Düzenle (yüz, saç, üst, alt, ayakkabı, şapka, gözlük + 3D önizleme).
- three.js ilk açılışta cdnjs'ten yüklenir (internet gerekir).

- **Ormanda dövüş:** Orman çok daha geniş (yüzlerce ağaç, çadırlar, meşaleler, geniş kamp alanı). Ormanda kurt, yaban domuzu, ayı ve geyikler dolaşır. **F** (ya da 👊 butonu) ile yumruk at, **Shift** ile koş. Ateşin 11 birim çevresi güvenli bölgedir; hayvanlar giremez ve ateşin yanında canın hızlı dolar. Hayvanlar her oyuncuda yerel çalışır (herkes kendi ormanını görür), yumruk animasyonu diğerlerine yansır.
- **Oturma/kalkma:** Koltuğa yürüyerek süzülüp yumuşakça oturur, kalkarken önce doğrulur sonra yürür.
- **Okey masası:** Ahşap dokulu masa, desenli keçe, altın işlemeler, sandalyeler, çay bardakları (buharlı), sarkıt lamba, halı, pencereler ve tablolar. El bitince kazananın üstünde konfeti patlar.
- **Efektler:** Parıltılı ateş (kor, duman, ışık havuzu), yuvarlak kıvılcım/ateşböceği, ay halesi, çimen/kaya, vuruş kıvılcımları, vuruş izi, adım tozu, vinyet ve ACES ton eşleme.

## v2 değişiklikleri (3D Dünya)
- **Ev girişi bugı düzeltildi:** eve girince artık portaldan uzakta doğuyorsun, portal sadece uzaklaşınca yeniden aktif oluyor.
- **Oturma:** karakter koltuk yüksekliğine göre oturur (çökme yok), dizli gerçekçi oturma pozu.
- **Avatar Stüdyosu:** Sıradan / Klasik / Destansı / Efsanevi nadirlikte 15 kostüm, 30 şapka, 14 gözlük, 10 sırt eşyası. Kilitli eşyalar 💰 ile alınır (sunucuda doğrulanır).
- **Grafik ayarları:** ⚙ Grafik → Düşük/Orta/Yüksek/Ultra, gölge, parçacık, FPS.
- **Parkur:** 8 detaylı harita (kontrol noktası, altın, zıplama pedi, çöken platform, dönen tuzak, tema dekoru).
- **Yarışmalar (tablet, E):** Parkur, Laser Tracer, Honey Drop, Para Avı. Bitince WINNER ekranı, 5 sn sonra lobiye ışınlanır, 💰 ödül verilir.

## v3 değişiklikleri
- **Avatar mağazası ön izleme:** kilitli eşyaya tıkla → karakterin üstünde dene → "Satın Al" veya "İptal". Satın almadan Kaydet'e basarsan ön izlemeler otomatik çıkarılır.
- **Erkek / Kız seçeneği:** Yüz sekmesi → Cinsiyet. Kız: farklı beden, kirpik, 4 yeni saç (uzun düz, bob, at kuyruğu, çift kuyruk), Alt sekmesinde Pantolon/Etek.
- **Laser Tracer sıfırdan:** her lazer önce zeminde uyarı verir. Sarı = zıpla, kırmızı duvar = boşluktan geç. Dönen lazer, süpürme duvarı, lazer çizgileri, şok dalgası; zamanla sertleşir.
- **Honey Drop sıfırdan:** 3 kat petek, düzgün hizalı altıgenler (eski rotasyon hatası giderildi), kat başına renk, bal denizi.

## v3.1
- Avatar stüdyosunda ilk sekme **🚻 Cinsiyet** (kız/erkek). Cinsiyet hiç seçilmediyse stüdyo bu sekmeyle açılır.
- 18 yeni kostüm (elbiseler, polis, doktor, süper kahraman, itfaiyeci, Noel Baba, kimono, forma, rockstar...). Hepsi mağazada, önce denenip sonra satın alınır.
- Lobide asfalt çevre yolu + doğu/batı çıkış yolları, sarı kesik çizgiler, sokak lambaları ve trafik (taksi, SUV, kamyon, sedan). Arabalar önündeki oyuncuya ve birbirine çarpmadan durur.

## 🗺️ Büyük Harita (v3.2)

3D Dünya artık ~600×600 birimlik bir harita: ortada kamp ateşi lobisi, dört yöne asfalt yollar ve 4 farklı köy.
- **Kırmızı Köy** (doğu, market) · **Mavi Köy** (batı, park + çeşme) · **Orman Köyü** (kuzey, park + göl) · **Güney Çarşı** (güney, galeri, benzin istasyonu, market)
- Yollarda trafik arabaları var, sağ üstte mini harita (⛽ 🛒 🚘 ⛲ işaretli)
- **Araban var:** Başlangıçta ücretsiz Vibra Sedan yanında park halinde. Yanına gidip **E** ile bin, **W/S** gaz-fren, **A/D** direksiyon, **Boşluk** el freni, **Shift** turbo, **E** ile in. **R** arabayı yanına çağırır.
- **Oto Galeri** (güney): galeriye yürüyüp **E** → 150–2000 💰 arası 5 farklı araba satın al / seç
- **Benzin:** araba depo harcar. Benzin istasyonunda pompaya yaklaş, **E** → depoyu doldur (20 benzin = 1 💰). Benzin bitince R ile arabayı çağırabilirsin
- **Market:** E ile elma (+30❤️), sandviç (+70❤️), benzin bidonu (+50⛽) al
- Diğer oyuncular senin arabana binerken seni araba içinde görür; parklardaki banklara E ile oturulur
Sunucuya yeni uçlar eklendi: `/api/car/buy`, `/api/car/fuel`, `/api/market/buy` (bakiye sunucuda kontrol edilir).


## v3.5
- **5 yeni parkur** (v2'den): 🌱 Yeşil Vadi, 🌊 Salıncak Koyu, 🔥 Lav Kaçışı, ❄️ Buz Zirvesi, ⚡ Cehennem Kulesi. Düşen zeminler, yürüyen bantlar, dönen çubuklar, hareketli platformlar ve zıplatma pedleri var. Mevcut 8 parkurun sonuna eklendi (toplam 13). Ödüller sunucuda `catalog.js` üzerinden hesaplanır.
- **Zıplama kayması düzeltildi:** atlayınca karakterin sola/sağa çekilmesi giderildi. Hareketli platformdan atlayınca platformun hızı korunur, havada sürtünme arttı, kenara çarpınca yana itme kaldırıldı.
- **Kontrol noktası:** her kontrol noktasında platformun giriş tarafında sabit, işaretli (cyan halka + bayrak) bir doğma yeri var. Düşünce tam orada doğarsın ve ~2 sn dönen çubuklardan korunursun.
- **"BAŞLA!/GO!" yazısı:** mini oyun başladıktan sonra ekranda takılı kalan geri sayım yazıları otomatik temizlenir.
- **Avatar Stüdyosu v2 görünümü:** tam ekran stüdyo, her eşya için 3D küçük resim, poz butonları (dur/yürü/dans/selam/otur), nadirlik renkleri. İçerik v3'ten: cinsiyet, 32 kostüm, şapka/gözlük/sırt eşyaları, deneyip satın alma.

### v3.5 - ek
- **Market:** 10 ürün (elma, muz, dondurma, sandviç, pizza, burger, çikolata, su, enerji içeceği, benzin). Ürünler sekmesinden çantaya al veya "Al + Ye" ile hemen ye; Çanta sekmesinden istediğin zaman ye. Yemek canı doldurur, çikolata ve enerji içeceği geçici hız verir. Çanta tarayıcıda saklanır.
- **Arabalar:** 6'dan 14'e çıktı (hatchback, van, jeep, polis, muscle, limuzin, formula, cyber neon). Tüm araçlar yeniden modellendi: jantlar, farlar, camlar, spoyler, ışık barı, neon. Oto galeri 5 sütunlu büyük salona döndü. Şehir trafiğinde de farklı araçlar dolaşır.
- **Parkur grafikleri:** gradyan gökyüzü, güneş/ay hâlesi, bulutlar veya yıldızlar, temaya göre uçuşan parçacıklar (polen, kabarcık, kor, kar), akan dalgalı zemin, karo dokulu ve alttan ışıklı platformlar.
- **Masaüstü (.exe):** Windows'ta `EXE-YAP.bat` dosyasına çift tıkla (Node.js kurulu olmalı, internet gerekir). `dist` klasörüne kurulum ve kurulumsuz .exe çıkar. Uygulama kendi sunucusunu açar. Başkasının sunucusuna bağlanmak için menüden "Ayar dosyasını aç" ile config.json içine `"url"` yaz. Exe'siz oynamak için `BASLAT.bat`.

### v3.5 - güncelleme 2
- **Parkurda arkadaş konumu:** oyuncu yüksekliği (y) artık ağdan senkronlanıyor; arkadaşın tam olduğu platformda görünür.
- **Gerçekçi araba:** motor güç eğrisi + 5 vitesli devir sesi, fren/geri vites, hızla azalan direksiyon açısı, lastik tutuş sınırı (understeer), el frenine (Boşluk) basınca drift, yana kayma, lastik izi ve duman, gövde yatması, burun dalışı, süspansiyon titreşimi.
- **Kıyafet:** 32 yeni kostüm (toplam 63) ve 6 yeni şapka (toplam 36).
- **Grafik:** parkurda 2048 gölge, ek ışık, tüm ekranda sinematik vinyet.
