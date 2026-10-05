# Nuvio Türkiye Canlı TV

Yeni kurulumda canlı TV, TMDB ve arama aynı **Nuvio Türkiye** katalog eklentisinden gelir. [Birleşik kurulum ve eski sürümden geçiş](CATALOG.md). Tek katalog bağlantısı [catalog-addon.json](catalog-addon.json) içindedir.

Kaynak deposu 1.10.13 veya üzerini yenileyin ve birleşik kataloğu ekleyin. Önceden ayrı TMDB ve Canlı TV katalogları kuruluysa birleşik katalogdan sonra bu iki eski kaydı kaldırın. `https://dr-octagon.github.io/Nuvio/live/manifest.json`, birleştiricinin kullandığı statik veri kaynağı ve eski kurulumlar için korunur; yeni kullanıcılara ayrıca kurdurulmaz. Bu veri kaynağı yalnız `live` katalogları ve kanal detayları sunar; film/dizi aramasını birleşik hizmetin TMDB kaynağı sağlar.

Beş ayrı satır, manifestte bu sırayla sunulur: **BC Sports, İnatBox, DominoTV, RecTV, Vavoo**. Nuvio'nun **ana ekran / katalog ayarlarından** satırları açıp kapatın, BC Sports'u TMDB satırlarının üzerine taşıyın veya istediğiniz sırayı seçin. Satırın görünürlüğü oynatma kaynağının etkinliğinden ayrıdır. Nuvio yeni katalogları açık başlatır; manifestten varsayılan kapalı seçimi desteklemiyor. İlk kurulumda istediğiniz satırları seçin.

Katalog dosyaları GitHub Pages'de statik yayımlanır. Kısa kanal kimlikleri `live/channel-index.json` üzerinden mevcut sağlayıcının kimliğine çevrilir. Akışlar kalıcı statik dosyaya yazılmaz; oynatma sırasında ilgili sağlayıcı çalışır. İnatBox'ın imzalı adresleri oynatma sırasında güncel kategori listesinden yeniden alınır. RecTV kimliklerinde oynatma tokenları saklanmaz.

Kanalların görünmesi yayının o anda erişilebilir olduğunu garanti etmez; yayın sağlayıcısı akışını değiştirebilir. Bu sürümde beş kaynağın güncel kanal listeleri ve Nuvio katalog/detay uyumluluğu kontrol edildi. Her kanalın baştan sona oynatılması doğrulanmadı.

BC Sports 1.10.13, Kaynak A'yı yalnız mevcut yerel canlı yayın adaptörü başarılı biçimde kayıt yapabildiğinde listeler. Adaptör yoksa veya kayıt başarısızsa kaynak gizlenir; buffering ekranında kalan özgün URL döndürülmez. Android'de ayrı bir yardımcı veya değiştirilmiş Nuvio uygulaması gerektiren çalışma ertelendi. Diğer BC Sports kaynaklarının çözümleme davranışı korunur. Cloudstream, bu CDN için oynatma sırasında ayrıca WebView ağ katmanı kullanır; Nuvio Android'in normal ağ istemcisi aynı adresi açamıyor.

Testler, adaptör olmadığında ve kayıt başarısız olduğunda Kaynak A'nın gizlendiğini, çalışan Kaynak E'nin listede kaldığını ve başarılı adaptörle Kaynak A'nın korunduğunu doğrular. Bu PC'deki mevcut canlı yayın adaptörüyle HLS listesi ve MPEG-TS video parçası HTTP 200 ile alındı; medya sırası ilerledi. Kullanıcı Android 0.5.6-beta (138) üzerinde ham Kaynak A adresinin buffering ekranında kaldığını bildirdi; yerel ham adres MPV testinde de video/ses okunamadı.

Bakım:

```powershell
node build.js bcsports inatbox dominotv rectv vavoo
node scripts/build_live_catalog.js
```

Derleyici canlı listeleri toplar, aynı kanalı tekrarlamadan katalogları ve detay dosyalarını üretir. Boş kaynak varsa yeni yayını durdurur. `docs/live/inventory.json` kaynak başına kanal sayısını ve son üretim zamanını içerir. Güncellemeler Nuvio ve Nuvio-Source depolarında açıkça seçilerek yayımlanır; B.O.A.T bu iş akışında derlenmez.
