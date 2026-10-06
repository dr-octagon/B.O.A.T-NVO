# Nuvio Türkçe eklenti kaynakları

JavaScript sağlayıcıları `src/`, ortak HTTP/oynatıcı çözücüleri `src/shared/` altında bulunur. `npm run build`, sağlayıcıları derler ve `dist/providers/` ile komşu `../Nuvio` dağıtım deposuna kopyalar. Desktop katalog envanteri ve bağımlılık runtime'ı da üretilir. Derleme tek başına GitHub'a göndermez.

```powershell
npm install
npm test
npm run build
node build.js filmmodu bronzecloud
node scripts/test_provider.js filmmodu 603 movie
```

`npm test` ağ gerektirmeyen regresyon testlerini çalıştırır. `test:live` Node üzerindeki canlı kaynak kontrolüdür. Desktop'ın yerel HTTP ve Cheerio davranışı Node'dan farklı olduğundan Desktop doğrulaması ayrıca yapılır.

## Nuvio Desktop

[Nuvio Türkiye kurulum sayfası](https://dr-octagon.github.io/B.O.A.T-NVO/) iki bağlantı sunar: bütün JS kaynaklarını ekleyen plugin deposu ve TMDB ana ekranını, Türkçe aramayı, detayları ve beş canlı TV satırını birleştiren katalog eklentisi. TMDB ve canlı TV satırları Nuvio'nun ana ekran ayarlarından açılıp kapanır ve sıralanır. [Kurulum, geçiş ve hizmet bilgisi](CATALOG.md). Netlify veya kişisel katalog sunucusu gerektirmez.

Mac, Android ve Windows aynı birleşik katalog adresini kullanır. Katalog eklentisi GitHub plugin deposundan ayrı olarak bir kez eklenir; Windows yerel katalog yardımcısına bağlı değildir.

[Desktop kurulumu ve HLS yardımcısı](DESKTOP.md), uzantısız veya yanlış MIME ile sunulan HLS listelerinin ses dosyası olarak açılması sorununu giderir. VOD video parçaları doğrudan kaynak sunucudan oynatıcıya gider; canlı spor aktarımı ayrı bir yol kullanır. Yardımcı ayrıca sağlayıcıların kategori, arama ve bölüm listelerini Nuvio'nun HTTP katalog arayüzüne bağlar.

Kaynak deposundan kurulu profilin önbelleğini güncellemek için Nuvio kapalıyken:

```powershell
npm run build
pwsh -NoProfile -File scripts/install_desktop_hls.ps1 -ProfileId 1 -AutoStart
```

Bu işlem FilmModu, HDFilmCehennemi, DiziBox ve BronzeCloud'un kurulu kodlarını uygulamanın kendi depolama API'siyle günceller. Etkinleştirme tercihlerini korur ve önce `tmp/desktop-backup-*` altında yedek alır. Java 17+, Node.js ve kurulu Nuvio Desktop gerekir.

## Kurulu uygulama ile canlı doğrulama

Aşağıdaki araçlar kurulu Desktop sürümünün sınıflarını ve libmpv kitaplığını kullanır. Uygulama güncellemelerinde iç API değişirse araçların güncellenmesi gerekebilir. `mpv_probe.py` başsız oynatıcıda video/ses çözülmesini kontrol eder; arayüz testi yerine geçmez.

```powershell
javac -cp 'C:/Program Files/Nuvio/app/*' -d tmp scripts/desktop_probe/DesktopProbe.java
java -cp 'tmp;C:/Program Files/Nuvio/app/*' DesktopProbe dist/providers/dizibox.js 108978 tv 1 1
java -cp 'tmp;C:/Program Files/Nuvio/app/*' DesktopProbe saved:filmmodu 603 movie
$env:NUVIO_PROBE_HEADERS = 'Referer: https://play2.pilavyerplay.top/'
python scripts/desktop_probe/mpv_probe.py 'OLUSTURULAN_HLS_URL'
```

[Doğrulama sonuçları](VALIDATION.md) ve [Cloudstream taşıma planı](MIGRATION_ROADMAP.md) depoda tutulur. Yeni sağlayıcılar `getStreams`, `getCatalog`, `getMeta`, gerekirse `getSubtitles` dışa aktarır ve manifestte kayıt edilir.
