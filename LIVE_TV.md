# Nuvio Türkiye Canlı TV

Yeni kurulumda canlı TV, TMDB ve arama aynı **Nuvio Türkiye** katalog eklentisinden gelir. [Birleşik kurulum ve eski sürümden geçiş](CATALOG.md). Tek katalog bağlantısı [catalog-addon.json](catalog-addon.json) içindedir.

Kaynak deposu 1.10.11 veya üzerini yenileyin ve birleşik kataloğu ekleyin. Önceden ayrı TMDB ve Canlı TV katalogları kuruluysa birleşik katalogdan sonra bu iki eski kaydı kaldırın. `https://dr-octagon.github.io/Nuvio/live/manifest.json`, birleştiricinin kullandığı statik veri kaynağı ve eski kurulumlar için korunur; yeni kullanıcılara ayrıca kurdurulmaz. Bu veri kaynağı yalnız `live` katalogları ve kanal detayları sunar; film/dizi aramasını birleşik hizmetin TMDB kaynağı sağlar.

Beş ayrı satır, manifestte bu sırayla sunulur: **BC Sports, İnatBox, DominoTV, RecTV, Vavoo**. Nuvio'nun **ana ekran / katalog ayarlarından** satırları açıp kapatın, BC Sports'u TMDB satırlarının üzerine taşıyın veya istediğiniz sırayı seçin. Satırın görünürlüğü oynatma kaynağının etkinliğinden ayrıdır. Nuvio yeni katalogları açık başlatır; manifestten varsayılan kapalı seçimi desteklemiyor. İlk kurulumda istediğiniz satırları seçin.

Katalog dosyaları GitHub Pages'de statik yayımlanır. Kısa kanal kimlikleri `live/channel-index.json` üzerinden mevcut sağlayıcının kimliğine çevrilir. Akışlar kalıcı statik dosyaya yazılmaz; oynatma sırasında ilgili sağlayıcı çalışır. İnatBox'ın imzalı adresleri oynatma sırasında güncel kategori listesinden yeniden alınır. RecTV kimliklerinde oynatma tokenları saklanmaz.

Kanalların görünmesi yayının o anda erişilebilir olduğunu garanti etmez; yayın sağlayıcısı akışını değiştirebilir. Bu sürümde beş kaynağın güncel kanal listeleri ve Nuvio katalog/detay uyumluluğu kontrol edildi. Her kanalın baştan sona oynatılması doğrulanmadı.

Bakım:

```powershell
node build.js bcsports inatbox dominotv rectv vavoo
node scripts/build_live_catalog.js
```

Derleyici canlı listeleri toplar, aynı kanalı tekrarlamadan katalogları ve detay dosyalarını üretir. Boş kaynak varsa yeni yayını durdurur. `docs/live/inventory.json` kaynak başına kanal sayısını ve son üretim zamanını içerir. Güncellemeler Nuvio ve Nuvio-Source depolarında açıkça seçilerek yayımlanır; B.O.A.T bu iş akışında derlenmez.
