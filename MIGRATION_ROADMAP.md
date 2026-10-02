# Cloudstream → Nuvio taşıma planı

2026-10-02 tarihli yerel kaynak envanteri: Cloudstream deposunda `build.gradle.kts` içeren ve `settings.gradle.kts` tarafından etkinleştirilen 41 modül var. `__Temel`, `NovaStream` ve `NovaStream_backup_pre_tv` dışarıda bırakılıyor.

Nuvio'da yedi JavaScript sağlayıcı mevcut: BOAT, BronzeCloud, DiziBox, FilmModu, HDFilmCehennemi, HDFilmizle ve Sinewix. BronzeCloud bir birleştirici; HDFilmizle mevcut Cloudstream modül adıyla birebir eşleşmiyor. Beş Cloudstream modülünün JS karşılığı mevcut olması tam özellik eşitliği anlamına gelmiyor. Örneğin DiziBox şu anda yalnız akış çözüyor. Önceki plandaki “Anizium tamamlandı” kaydı kaynak ağacında karşılık bulmadığı için kaldırıldı.

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

Taşımanın güncel makine tarafından okunabilir kaydı `migration-state.json` dosyasında tutuluyor. İlk grupta DiziYou, DiziMom, TLCtr, FullHDFilmizlesene, FilmMakinesi, JetFilmizle, SinemaCX, KultFilmler ve SetFilmIzle için JS katalog/meta/akış işlevleri yazıldı; kurulu Desktop çalışma ortamında birer kısa katalog ve akış kontrolü geçti. Watch2Movies katalog/meta kodu hazır; dinamik oynatıcı çözümü henüz akış kontrolünden geçmediği için devre dışı. Bu kayıtlar bütün kategorilerin/oynatıcıların doğrulandığı anlamına gelmiyor. Kullanıcının tercihiyle kapsamlı kontroller tüm modüller taşındıktan sonra yapılacak.

| Cloudstream modülü | Nuvio karşılığı / durum |
|---|---|
| BOAT | `boat` mevcut; özellik eşitliği incelenecek |
| DiziBox | `dizibox` mevcut; katalog/meta ve diğer oynatıcılar incelenecek |
| FilmModu | `filmmodu` mevcut; güncel site/Pilavyer desteği eklendi |
| HDFilmcehennemiLand | `hdfilmcehennemi` mevcut; SetPlay/FastPlay düzeltildi |
| Sinewix | `sinewix` mevcut; özellik eşitliği incelenecek |
| Anizium | Taşınacak |
| BCSports | Taşınacak |
| BelgeselX | Taşınacak |
| CineJoy | Taşınacak |
| CineStream | Taşınacak |
| CizgiMax | Taşınacak |
| Ddizi | Taşınacak |
| Dizilla | Taşınacak |
| DiziMom | JS portu; kısa katalog/akış kontrolü geçti |
| DiziPal | Taşınacak |
| DiziPalOriginal | Taşınacak |
| Dizipod | Taşınacak |
| DiziYou | JS portu; orijinal/dublaj ve altyazılı akış geldi |
| DominoTV | Taşınacak |
| FilmEkseni | Taşınacak |
| FilmMakinesi | JS portu; CloseLoad çözümü ve kısa kontrol geçti |
| FullHDFilm | Taşınacak |
| FullHDFilmizlesene | JS portu; RapidVid ve kısa kontrol geçti |
| HDFilmCehennemi | Ayrı `.nl` modülü; Land sağlayıcısıyla aynı değil |
| HDFilmDelisi | Taşınacak |
| inatbox-bc | Taşınacak |
| JetFilmizle | JS portu; çoklu kaynak POST ve kısa kontrol geçti |
| KultFilmler | JS portu; kısa katalog/akış kontrolü geçti |
| Puhu | Taşınacak |
| rectv-bc | Taşınacak |
| Reeltu | Taşınacak |
| SelcukFlix | Taşınacak |
| SetFilmIzle | JS portu; SetPlay/FastPlay ve kısa kontrol geçti |
| SezonlukDizi | Taşınacak |
| SinemaCX | JS portu; SinemaCC çoklu oyuncu ve kısa kontrol geçti |
| TLCtr | JS portu; sezon/bölüm ve kısa kontrol geçti |
| Vavoo | Taşınacak |
| Watch2Movies | Katalog/meta hazır; dinamik oynatıcı çözümü sürüyor |
| WebDramaTurkey | Taşınacak |
| WebteIzle | Taşınacak |
| YabanciDizi | Taşınacak |

## Uygulama sırası

1. Mevcut sağlayıcıların özellik farklarını çıkar; ortak bölüm kimliği ve katalog/meta sözleşmesini sabitle.
2. Basit HTTP/HTML sağlayıcılarını ortak Cheerio, URL ve HTTP katmanı üzerinden taşı; ardından aynı extractorları kullanan film/dizi kaynaklarını grupla.
3. API/token kullanan anime ve platform sağlayıcılarını taşı; Android bağımlı olanlar için uygun JS çözümü oluştur.
4. Canlı TV/spor sağlayıcılarını ayrı ele al; VOD yardımcısı canlı liste yenilemesinin yerine geçmez.
5. Her sağlayıcıyı manifest kaydı, bir film veya birkaç farklı dizi bölümü, varsa ses/altyazı ve gerçek Desktop oynatma kontrolüyle yayımla.

41 modülün tamamı henüz taşınmadı. Kısa katalog ve akış kontrolleri her grup için yapılır; son doğrulama ve kapsamlı testler tüm portlar tamamlandıktan sonra uygulanır.
