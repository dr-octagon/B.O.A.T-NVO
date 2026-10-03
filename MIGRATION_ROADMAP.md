# Cloudstream → Nuvio taşıma planı

2026-10-02 tarihli güncel yerel kaynak envanteri: Cloudstream deposunda `build.gradle.kts` içeren ve `settings.gradle.kts` tarafından etkinleştirilen 43 modül var. Taşıma sırasında eklenen DomatesTV ve Trdiziizle envantere alındı. `__Temel`, `NovaStream` ve `NovaStream_backup_pre_tv` dışarıda bırakılıyor.

Taşıma öncesinde Nuvio'da yedi JavaScript sağlayıcı vardı: BOAT, BronzeCloud, DiziBox, FilmModu, HDFilmCehennemi, HDFilmizle ve Sinewix. BronzeCloud bir birleştirici; HDFilmizle mevcut Cloudstream modül adıyla birebir eşleşmiyor. Beş Cloudstream modülünün JS karşılığı mevcut olması tam özellik eşitliği anlamına gelmiyor. DiziBox'ın eksik katalog/metadata işlevleri ve alternatif oynatıcı yolları eklendi; sitenin güncel IP engeli nedeniyle canlı kontrolü bekliyor.

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

Taşımanın güncel makine tarafından okunabilir kaydı `migration-state.json` dosyasında tutuluyor. 34 yeni sağlayıcının JS katalog/meta/akış işlevleri yazıldı ve kurulu Desktop çalışma ortamında kısa katalog/akış kontrolleri geçti. 1.10.0 ile BC Sports eklendi: altı aktif kaynak ailesi ve 12 kanal grubu taşındı; BeIN Sports 1 için C/E/F HLS listesi ve video parçası HTTP 200 kontrolü geçti. A 403, B bağlantı hatası, D boş 204 döndüğü için bu yolların canlı doğrulaması bekliyor. 1.9.9 ile CineJoy eklendi: 13 TMDB kategori, sezon/bölüm, CineJoy şifreli API ve altı Movy sunucusu taşındı. Desktop'ta 20 katalog, Reacher 32 bölüm, Matrix 10 Movy HLS kaynak kontrolü geçti; ana CineJoy API adresleri şu an 502 döndüğü için bu sunucuların canlı doğrulaması bekliyor. RecTV önceki sürümde eklendi. AES-GCM için saf JS [noble-ciphers](https://github.com/paulmillr/noble-ciphers) kullanılıyor; dağıtımdaki kütüphane lisansları `THIRD_PARTY_NOTICES.md` içinde korunuyor. DominoTV'nin gzip katalogları diğer ortamlarda JS ile açılır; Desktop'ın ikili veri uyarlamasındaki bozulma için yerel yardımcının sabit katalog uç noktaları kullanılır. Watch2Movies, CizgiMax, BelgeselX ve WebteIzle kodları mevcut; kullanılabilir akış kontrolü geçmediği için devre dışılar. 1.10.2 ile FilmModu, HDFilmCehennemi Land ve Sinewix özgün katalogları/meta/akış yollarıyla kısa Desktop kontrolünü geçti. BOAT kaynak kayıtlarının özellik eşitliği, DiziBox güncel IP engeli nedeniyle canlı kontrolü bekliyor. CineStream 1.10.3 ile eklendi; Simkl hesap bağlantısı kullanıcı isteğiyle ertelendi. Bu kayıtlar bütün kategorilerin/oynatıcıların doğrulandığı anlamına gelmiyor. Kullanıcının tercihiyle kapsamlı kontroller tüm modüller taşındıktan sonra yapılacak. Yeni sağlayıcıların katalog/meta çıktıları JS çalışma ortamında kontrol ediliyor; Desktop arayüzünde bu katalogların sunulması ayrıca doğrulanacak.

| Cloudstream modülü | Nuvio karşılığı / durum |
|---|---|
| BOAT | Özgün 15 kategori sorgusu, Netflix 20 kayıt ve Reacher'ın gerçek başlıklarıyla 32 bölümü Desktop'ta kontrol edildi. Kaynak kayıtlarının özellik eşitliği hâlâ incelenecek |
| DiziBox | 12 yerel kategori, arama ve çok sezonlu metadata eklendi; doğrudan içerik/bölüm kimlikleri oynatma yoluna bağlandı. Tüm alternatif oynatıcılar sınırlı eşzamanlılıkla sorgulanır; Haydi ve genel extractor yolu eklendi. Şu anda site sunucu/VPN IP mesajıyla 403 dönüyor; canlı katalog/oynatma doğrulaması bekliyor |
| FilmModu | Özgün 28 kategori ve güncel Live kategorileri bağlandı. Desktop'ta 24 film, özgün kategorinin ikinci sayfasında 24 film, Başlangıç metadata'sında yıl/5 oyuncu ve Pilavyer HLS HTTP 200 kontrolü geçti. Bazı eski `.one` CDN dosyaları sunucu hatası vermeye devam ediyor |
| HDFilmcehennemiLand | Özgün 30 kategori sorgusu, taxonomy AJAX sayfalaması, metadata/bölüm kimlikleri ve diğer iframe çözücüleri eklendi. Desktop'ta 24 film, ikinci sayfa, Çizmeli Kedi: Son Dilek metadata'sı ve FastPlay HLS HTTP 200 kontrolü geçti |
| Sinewix | Özgün 11 API kategorisi, anime/dizi/film kimlikleri, tüm sezonlar ve alternatif video çözücüleri eklendi. Desktop'ta dizi/anime 12'şer kayıt, Brokat 10 bölüm ve ilk bölüm MKV HTTP 206 kontrolü geçti. Sayfalama API'nin gerçek sayfa boyutuyla çalışıyor |
| Anizium | JS portu; günlük API başlığı, sezon/bölüm ve iki dilde on video bağlantısı kontrolü geçti |
| BCSports | JS portu; altı aktif kaynak ailesi, 12 kanal grubu ve BeIN kategorisinde 12 kart; BeIN Sports 1 için C/E/F canlı HLS listesi ve gerçek MPEG-TS parçası HTTP 200. B RGBTS PNG çözümü ve D AES anahtar yolu mevcut; A 403/B bağlantı hatası/D boş 204 nedeniyle bu yolların canlı kontrolü bekliyor |
| BelgeselX | Katalog ve metadata mevcut; Geleceğe Kalanlar 2 bölüm. epId bağlantısına sezon/bölüm parametreleri geldiğinde oynatıcıdan önce boş dönüş hatası düzeltildi. Native çağrı artık oyuncu sayfalarına ulaşır; Google Photos açık video vermediği ve alternatif gömülü içerikler 404 döndüğü için kullanılabilir kaynak yok, devre dışı |
| CineJoy | JS portu; 13 TMDB kategori, 20 katalog kaydı, Reacher 32 bölüm ve Matrix altı Movy sunucusundan 10 HLS kaynak. Türkçe normal/forced altyazılar, kalite seçenekleri, domain yenileme ve AES-GCM/AAD protokolü mevcut; ana CineJoy API 502 nedeniyle bu dalın canlı kontrolü bekliyor |
| CineStream | 1.10.3 ile yayımlandı; CineMeta/TMDB/Simkl katalogları, 71/71 kaynak işleyicisi ve 44 extractor yolu mevcut. Kısa Desktop kontrolünde CineMeta 49 içerik, Reacher 32 bölüm, Matrix 27 akış ve Simkl 500 kart/hesapsız IMDb metadata geçişi geldi. Yerleşik 71 kaynak seçimi ve yardımcı v8 üzerinden katalog ayarları bağlıdır. Simkl hesap girişi kullanıcı isteğiyle ertelendi; tüm kaynakların canlı doğrulaması ve arayüz kontrolü son aşamaya bırakıldı |
| CizgiMax | Katalog/meta hazır; ilk SibNet kaynağı HTTP 403, diğer örnek oynatıcı HTTP 404 |
| Ddizi | JS portu; tam bölüm Twitter HLS akışı ve kısa katalog kontrolü geçti |
| Dizilla | JS portu; Next.js AES veri çözümü, Pichive HLS ve kısa kontrol geçti |
| DiziMom | JS portu; kısa katalog/akış kontrolü geçti |
| DiziPal | JS portu; güncel arama şeması, PBKDF2/AES ve DPlayer HLS kontrolü geçti |
| DiziPalOriginal | JS portu; oturumlu config API, XOR/AES ve çoklu ses HLS kontrolü geçti |
| Dizipod | JS portu; sezon/bölüm, AJAX ve Tyuopix/ArtPlayer HLS kontrolü geçti |
| DiziYou | JS portu; orijinal/dublaj ve altyazılı akış geldi |
| DomatesTV | JS portu; platform/Firestore katalogları, tüm arama sayfaları ve sezon/bölüm eşleştirmesi; örnek film ve Vezir Gambiti Pichive HLS kontrolü geçti. Kotlin v5'in Sec-Fetch başlıkları ortak CDN çözücüsüne taşındı; Mezarlık ilk bölüm artık HLS döndürüyor, ana/alt liste HTTP 200 kontrolü geçti. Reklam MP4'leri kaynak olarak döndürülmüyor |
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
| rectv-bc | JS portu; 19 ulusal kanal, TRT 1 canlı HLS HTTP 200; 30 dizi ve Cennetin Doğusu 4 bölüm; ilk bölümde dublaj/altyazı iki HLS kaynak. AES-GCM doğrulaması ve API başlıkları taşındı; kilitli/hardware integrity isteyen kanallar filtreleniyor, diğer kategorilerin kapsamlı kontrolü bekliyor |
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
