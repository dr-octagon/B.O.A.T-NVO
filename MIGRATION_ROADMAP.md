# Cloudstream → Nuvio taşıma planı

2026-10-02 tarihli güncel yerel kaynak envanteri: Cloudstream deposunda `build.gradle.kts` içeren ve `settings.gradle.kts` tarafından etkinleştirilen 43 modül var. Taşıma sırasında eklenen DomatesTV ve Trdiziizle envantere alındı. `__Temel`, `NovaStream` ve `NovaStream_backup_pre_tv` dışarıda bırakılıyor.

Taşıma öncesinde Nuvio'da yedi JavaScript sağlayıcı vardı: BOAT, BronzeCloud, DiziBox, FilmModu, HDFilmCehennemi, HDFilmizle ve Sinewix. BronzeCloud bir birleştirici; HDFilmizle mevcut Cloudstream modül adıyla birebir eşleşmiyor. Beş Cloudstream modülünün JS karşılığı mevcut olması tam özellik eşitliği anlamına gelmiyor. Örneğin DiziBox şu anda yalnız akış çözüyor.

## Dönüşüm eşlemesi

| Cloudstream Kotlin | Nuvio JavaScript | Dikkat edilecek nokta |
|---|---|---|
| `getMainPage`, `search` | `getCatalog(type, id, extra)` | Sayfalama, arama ve kategori kimlikleri |
| `load` | `getMeta(args)` | Dizi sezon/bölüm kimlikleri, poster, yıl, açıklama |
| `loadLinks` | `getStreams(id, mediaType, season, episode)` | Video kaynakları, sesler ve gerekli HTTP başlıkları |
| `subtitleCallback` | Akışın `subtitles` alanı / `getSubtitles` | Dil kodu, zorunlu altyazı ve başlıklar |
| Jsoup | Cheerio | Nuvio QuickJS adaptörünün desteklediği seçiciler/metotlar |
| OkHttp / `app.get`, `app.post` | `fetch()` + ortak HTTP yardımcıları | Cookie, yönlendirme, POST, timeout, Referer/Origin |
| Extractor API | `src/shared/extractors/` | Aynı oynatıcı için tek çözücü, sağlayıcıdan bağımsız test |

Bu eşleme mantıklı; otomatik satır satır çeviri yeterli değil. Android WebView, Rhino, yerel HLS sunucusu ve Android'e özgü şifreleme/medya kodları ayrıca uyarlanmalı. Desktop'ın base64/URL/HTTP davranışı ve oynatıcısı üzerinde canlı doğrulama yapılmalı. SetPlay, FastPlay ve Pilavyer için ortak çözücüler ve Desktop HLS uyarlaması bu işte hazırlandı.

## Modül envanteri

Taşımanın güncel makine tarafından okunabilir kaydı `migration-state.json` dosyasında tutuluyor. 30 yeni sağlayıcının JS katalog/meta/akış işlevleri yazıldı ve kurulu Desktop çalışma ortamında kısa katalog/akış kontrolleri geçti. 1.9.7 ile InatBox eklendi: çift AES/HMAC protokolü, 19 kategori, sezon/bölüm, canlı/VOD ve API başlıkları taşındı. DominoTV'nin gzip katalogları diğer ortamlarda JS ile açılır; Desktop'ın ikili veri uyarlamasındaki bozulma için yerel yardımcının sabit katalog uç noktaları kullanılır. Watch2Movies, CizgiMax, BelgeselX ve WebteIzle kodları mevcut; kullanılabilir akış kontrolü geçmediği için devre dışılar. Beş eski sağlayıcının özellik eşitliği incelemesi ve dört modülün taşıması bekliyor. Bu kayıtlar bütün kategorilerin/oynatıcıların doğrulandığı anlamına gelmiyor. Kullanıcının tercihiyle kapsamlı kontroller tüm modüller taşındıktan sonra yapılacak. Yeni sağlayıcıların katalog/meta çıktıları JS çalışma ortamında kontrol ediliyor; Desktop arayüzünde bu katalogların sunulması ayrıca doğrulanacak.

| Cloudstream modülü | Nuvio karşılığı / durum |
|---|---|
| BOAT | `boat` mevcut; özellik eşitliği incelenecek |
| DiziBox | `dizibox` mevcut; katalog/meta ve diğer oynatıcılar incelenecek |
| FilmModu | `filmmodu` mevcut; güncel site/Pilavyer desteği eklendi |
| HDFilmcehennemiLand | `hdfilmcehennemi` mevcut; SetPlay/FastPlay düzeltildi |
| Sinewix | `sinewix` mevcut; özellik eşitliği incelenecek |
| Anizium | JS portu; günlük API başlığı, sezon/bölüm ve iki dilde on video bağlantısı kontrolü geçti |
| BCSports | Taşınacak |
| BelgeselX | Katalog/meta hazır; ilk bölümün Google Photos yanıtında kullanılabilir medya yok |
| CineJoy | Taşınacak |
| CineStream | Taşınacak |
| CizgiMax | Katalog/meta hazır; ilk SibNet kaynağı HTTP 403, diğer örnek oynatıcı HTTP 404 |
| Ddizi | JS portu; tam bölüm Twitter HLS akışı ve kısa katalog kontrolü geçti |
| Dizilla | JS portu; Next.js AES veri çözümü, Pichive HLS ve kısa kontrol geçti |
| DiziMom | JS portu; kısa katalog/akış kontrolü geçti |
| DiziPal | JS portu; güncel arama şeması, PBKDF2/AES ve DPlayer HLS kontrolü geçti |
| DiziPalOriginal | JS portu; oturumlu config API, XOR/AES ve çoklu ses HLS kontrolü geçti |
| Dizipod | JS portu; sezon/bölüm, AJAX ve Tyuopix/ArtPlayer HLS kontrolü geçti |
| DiziYou | JS portu; orijinal/dublaj ve altyazılı akış geldi |
| DomatesTV | JS portu; platform/Firestore katalogları, tüm arama sayfaları ve sezon/bölüm eşleştirmesi; örnek film ve Vezir Gambiti Pichive HLS kontrolü geçti. Mezarlık CDN API'si `unauthorized` dönüyor; reklam MP4'leri kaynak olarak döndürülmüyor |
| DominoTV | JS portu; gzip katalog/meta ve film HLS kontrolü geçti; örnek canlı kanal HLS listesi HTTP 200 |
| FilmEkseni | JS portu; CSRF keşfet API, EksenLoad HLS ve kısa kontrol geçti |
| FilmMakinesi | JS portu; CloseLoad çözümü ve kısa kontrol geçti |
| FullHDFilm | JS portu; VidPapi üzerinden üç HLS akışı geldi |
| FullHDFilmizlesene | JS portu; RapidVid ve kısa kontrol geçti |
| HDFilmCehennemi | Ayrı `.nl` JS portu; JSON katalog/video API, Close/Rapidrame üzerinden iki HLS akışı kontrolü geçti |
| HDFilmDelisi | JS portu; Next.js video URL ve Vixolity çözümü, kısa kontrol geçti |
| inatbox-bc | JS portu; 33 ulusal kanal, TRT 1 canlı HLS HTTP 200; Seni Tanıyorum 8 bölüm ve ilk bölümde Dzen HLS/DASH/144p–1080p toplam 8 kaynak. VK/Yandex/JWPlayer ve dinamik AES/metin-regex yolları taşındı; diğer kategorilerin kapsamlı kontrolü bekliyor |
| JetFilmizle | JS portu; çoklu kaynak POST ve kısa kontrol geçti |
| KultFilmler | JS portu; kısa katalog/akış kontrolü geçti |
| Puhu | JS portu; katalog, sezon/bölüm API ve altı HLS akışıyla kısa kontrol geçti |
| rectv-bc | Taşınacak |
| Reeltu | JS portu; dinamik API keşfi, anime/sezon/shorts ve VaPlayer desteği; örnek dizide 12 bölüm ve dört kaynak geldi |
| SelcukFlix | JS portu; AES API, Next.js meta ve Pichive HLS kısa kontrolü geçti |
| SetFilmIzle | JS portu; SetPlay/FastPlay ve kısa kontrol geçti |
| SezonlukDizi | JS portu; alternatif API, OK.ru/VidMoly akışları ve kısa kontrol geçti |
| SinemaCX | JS portu; SinemaCC çoklu oyuncu ve kısa kontrol geçti |
| TLCtr | JS portu; sezon/bölüm ve kısa kontrol geçti |
| Trdiziizle | JS portu; katalog/arama, diziye geçiş, sezon/bölüm, JWPlayer/base64 MP4, YouTube ve iç iframe yolları; Ömür Usta 1. bölüm Twitter HLS kontrolü geçti. Diğer oynatıcı yollarının kapsamlı kontrolü bekliyor |
| Vavoo | JS portu; 300 canlı kanal, API çözümü ve canlı HLS yanıtı kontrolü geçti |
| Watch2Movies | Katalog/meta hazır; dinamik oynatıcı çözümü sürüyor |
| WebDramaTurkey | JS portu; UpNS/PlayerP2P şifreli API çözümü, yedi akışla kısa kontrol geçti |
| WebteIzle | JS portu; katalog/meta geldi, ilk filmin iki dili reCAPTCHA gerektiriyor |
| YabanciDizi | JS portu; arama/bölüm ve çoklu oynatıcı API, salted AES çözümü; Mac/VidMoly/OK.ru ile kısa kontrol geçti |

## Uygulama sırası

1. Mevcut sağlayıcıların özellik farklarını çıkar; ortak bölüm kimliği ve katalog/meta sözleşmesini sabitle.
2. Basit HTTP/HTML sağlayıcılarını ortak Cheerio, URL ve HTTP katmanı üzerinden taşı; ardından aynı extractorları kullanan film/dizi kaynaklarını grupla.
3. API/token kullanan anime ve platform sağlayıcılarını taşı; Android bağımlı olanlar için uygun JS çözümü oluştur.
4. Canlı TV/spor sağlayıcılarını ayrı ele al; VOD yardımcısı canlı liste yenilemesinin yerine geçmez.
5. Her sağlayıcıyı manifest kaydı, bir film veya birkaç farklı dizi bölümü, varsa ses/altyazı ve gerçek Desktop oynatma kontrolüyle yayımla.

43 modülün tamamı henüz taşınmadı. Kısa katalog ve akış kontrolleri her grup için yapılır; son doğrulama ve kapsamlı testler tüm portlar tamamlandıktan sonra uygulanır.
