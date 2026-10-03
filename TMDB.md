## İki bağlantıyla Nuvio kurulumu

[Kurulum sayfası](https://dr-octagon.github.io/Nuvio/) iki bağlantıyı sunar:

1. **Plugin / kaynak deposu:** `https://raw.githubusercontent.com/dr-octagon/Nuvio/main/manifest.json`. Nuvio'nun plugin veya kaynak deposu ekleme bölümüne yapıştırılır. Mevcut tüm JS sağlayıcılarını listeler; devre dışı sağlayıcılar kendi durumlarını korur.
2. **Katalog eklentisi:** Sayfadaki **Ana ekran ve aramayı Nuvio'ya ekle** düğmesini kullanın veya **Katalog bağlantısını kopyala** ile adresi Nuvio'nun katalog eklentisi ekleme bölümüne yapıştırın. Tam manifest adresi ve ayarları [tmdb-catalog.json](tmdb-catalog.json) dosyasındadır.

İkinci bağlantı Nuvio'nun hazır TMDB kataloğundan 27 ana ekran kategorisi (film/dizi trendleri, popüler içerikler, yeni çıkanlar, platform listeleri ve diğer kategoriler), film/dizi araması ve içerik detaylarını sağlar. İçerik bilgileri Türkçedir. Katalog başlıkları şu an İngilizce gelir; emoji içermez. Bu başlıklar hazır hizmetin Türkçe çeviri desteğine bağlıdır.

Oyuncu fotoğrafları `app_extras.cast[].photo`, başlık görselleri `logo` alanında gelir. Başlık logosu katalog önizlemesinde de gönderildiği için ana ekran sliderı aynı görseli kullanabilir. Önceki ElfHosted hizmeti logoyu yalnız detay yanıtında gönderiyordu; Nuvio kataloğu bu eksikliği giderir. TMDB'de görsel bulunmayan içerikte uygulama metin veya yer tutucu gösterebilir. Arama sonuçlarının IMDb kimlikleri mevcut JS kaynaklarımızla kullanılır; aranan içeriğin kaynaklarda bulunması ayrıca gerekir.

Mac, Android ve Windows aynı iki bağlantıyı kullanır. Netlify, kişisel sunucu veya bu PC'deki yerel katalog yardımcısı gerekli değildir. Ana ekran, arama ve yeni içerik detayları [Nuvio Catalog Addon](https://catalog.nuvio.tv/) hizmetinin erişilebilirliğine bağlıdır. Manifesti tarayıcıda açmak eklentiyi kurmaz; her cihazda Nuvio'ya ekleyin.

## Önceki kurulumdan geçiş

Plugin / kaynak deposu zaten kuruluysa yeniden eklemeyin. Yeni katalog eklentisini ekledikten sonra önceki ElfHosted **The Movie Database Addon** kataloğunu, ayrı **TMDB Türkçe Arama** eklentisini ve GitHub manifestini **katalog eklentileri** bölümünden kaldırabilirsiniz. GitHub adresini plugin / kaynak deposu bölümünden kaldırmayın; kaynaklar oradan gelir.

Windows Desktop kapalıyken yerel kurulum:

```powershell
./scripts/install_desktop_tmdb_catalog.ps1
```

Bu araç eklenti ayarlarını önce yedekler, `tmdb-catalog.json` içindeki önceki katalog adreslerini yeni tek TMDB kataloğuyla değiştirir. Bu PC'deki kaynak katalog yardımcısını ana ekran/arama listesinden devre dışı bırakır; oynatma için çalışan yardımcı hizmete ve plugin ayarlarına dokunmaz. Diğer katalog eklentilerini korur. Hesap senkronizasyonunu başlatmaz.

## Doğrulama — 2026-10-04

Yeni HTTPS manifesti kurulu Windows Nuvio'nun HTTP çalışma ortamında kontrol edildi: manifest, ana ekran, Matrix film araması, Reacher dizi araması ve Reacher detayları HTTP 200. Uygulamanın kendi okuyucuları 27 ana ekran kategorisi ve iki arama kataloğu okudu. Popüler filmlerin 20/20'sinde, popüler dizilerin 19/20'sinde başlık logosu okundu. Reacher'ın ana ekran ve detay logosu aynı URL'dir. Matrix araması 19, Reacher araması 2 sonuç verdi; IMDb kimlikleri doğrulandı. Reacher detaylarında 6 oyuncu fotoğrafı ve 32 bölüm okundu. Kurulum bağlantısı Nuvio'nun bağlantı ayrıştırıcısından geçti. Mac ve Android uygulamalarında fiziksel arayüz testi yapılmadı.

Bu PC'de yeni katalog yedek alınarak kuruldu. Yerel DNS, TMDB görsel CDN'sini `127.0.0.1` adresine çözüyor; bu yüzden bu PC'de doğrudan görsel indirme bağlantısı reddedildi. Sistem DNS/ağ ayarları değiştirilmedi. Katalogdaki logo alanlarının doğrulanması, bu yerel görsel erişimi sorununu çözmez; Android'deki eksik katalog logosundan ayrı bir durumdur.

Önceki statik GitHub katalog/meta dosyaları eski kurulumlarla uyumluluk için korunur. 119 başlığın 356 detay dosyası yenilenmişti; 116 başlıkta logo ve 115 başlıkta oyuncu fotoğrafı mevcut. Bunları yenilemek için `node scripts/enrich_tmdb_metadata.js` ve `node scripts/generate_catalogs.js` kullanılır. Yeni kurulum ana ekran ve arama için ortak TMDB hizmetini kullanır.

Katalog ayarını değiştirdikten sonra `node scripts/sync_setup.js` komutu kurulum sayfasını ve public repo dosyalarını eşler. Sağlayıcıları yeniden derlemez. BOAT sağlayıcısı bu değişiklikte değiştirilmedi.
