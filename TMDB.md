## İki bağlantıyla Nuvio kurulumu

[Kurulum sayfası](https://dr-octagon.github.io/Nuvio/) iki bağlantıyı sunar:

1. **Plugin / kaynak deposu:** `https://raw.githubusercontent.com/dr-octagon/Nuvio/main/manifest.json`. Nuvio'nun plugin veya kaynak deposu ekleme bölümüne yapıştırılır. Mevcut tüm JS sağlayıcılarını listeler; devre dışı sağlayıcılar kendi durumlarını korur.
2. **Katalog eklentisi:** Sayfadaki **Ana ekran ve aramayı Nuvio'ya ekle** düğmesini kullanın veya **Katalog bağlantısını kopyala** ile adresi Nuvio'nun katalog eklentisi ekleme bölümüne yapıştırın. Tam manifest adresi ve ayarları [tmdb-catalog.json](tmdb-catalog.json) dosyasındadır.

İkinci bağlantı tek TMDB eklentisinden altı ana ekran listesi (film/dizi trendleri, yeni çıkanlar, popüler içerikler), film/dizi araması ve içerik detaylarını sağlar. İçerik bilgileri Türkçedir. Hizmetin katalog başlıkları şu an **Trending**, **Latest Releases**, **Popular** ve **Search** olarak gelir; emoji içermez. Bu başlıklar hazır hizmetin Türkçe çeviri desteğine bağlıdır.

Oyuncu fotoğrafları `app_extras.cast[].photo`, başlık görselleri `logo` alanında gelir. TMDB'de görsel bulunmayan içerikte uygulama metin veya yer tutucu gösterebilir. Arama sonuçlarının IMDb kimlikleri mevcut JS kaynaklarımızla kullanılır; aranan içeriğin kaynaklarda bulunması ayrıca gerekir.

Mac, Android ve Windows aynı iki bağlantıyı kullanır. Netlify, kişisel sunucu veya bu PC'deki yerel katalog yardımcısı gerekli değildir. Ana ekran, arama ve yeni içerik detayları [TMDB Addon](https://github.com/mrcanelas/tmdb-addon) ortak ElfHosted hizmetinin erişilebilirliğine bağlıdır. Manifesti tarayıcıda açmak eklentiyi kurmaz; her cihazda Nuvio'ya ekleyin.

## Önceki kurulumdan geçiş

Plugin / kaynak deposu zaten kuruluysa yeniden eklemeyin. Yeni katalog eklentisini ekledikten sonra önceki **TMDB Türkçe Arama** eklentisini ve GitHub manifestini **katalog eklentileri** bölümünden kaldırabilirsiniz. GitHub adresini plugin / kaynak deposu bölümünden kaldırmayın; kaynaklar oradan gelir.

Windows Desktop kapalıyken yerel kurulum:

```powershell
./scripts/install_desktop_tmdb_catalog.ps1
```

Bu araç eklenti ayarlarını önce yedekler, eski iki katalog kaydını tek TMDB kataloğuyla değiştirir. Bu PC'deki kaynak katalog yardımcısını ana ekran/arama listesinden devre dışı bırakır; oynatma için çalışan yardımcı hizmete ve plugin ayarlarına dokunmaz. Diğer katalog eklentilerini korur. Hesap senkronizasyonunu başlatmaz.

## Doğrulama — 2026-10-03

Yeni birleşik HTTPS manifesti kurulu Windows Nuvio'nun HTTP çalışma ortamında kontrol edildi: manifest, ana ekran, Matrix film araması, Reacher dizi araması ve Reacher detayları HTTP 200. Uygulamanın kendi okuyucuları altı ana ekran listesi, iki arama kataloğu, 20 ana ekran içeriği, Matrix için 21 ve Reacher için 2 sonuç okudu. IMDb kimlikleri doğrulandı. Reacher detaylarında 6 oyuncu fotoğrafı, başlık logosu ve 32 bölüm okundu. Kurulum bağlantısı da Nuvio'nun bağlantı ayrıştırıcısından geçti. Birleşik katalog bu PC'ye yedek alınarak kuruldu. Mac ve Android uygulamalarında fiziksel arayüz testi yapılmadı.

Önceki statik GitHub katalog/meta dosyaları eski kurulumlarla uyumluluk için korunur. 119 başlığın 356 detay dosyası yenilenmişti; 116 başlıkta logo ve 115 başlıkta oyuncu fotoğrafı mevcut. Bunları yenilemek için `node scripts/enrich_tmdb_metadata.js` ve `node scripts/generate_catalogs.js` kullanılır. Yeni kurulum ana ekran ve arama için ortak TMDB hizmetini kullanır.

Katalog ayarını değiştirdikten sonra `node scripts/sync_setup.js` komutu kurulum sayfasını ve public repo dosyalarını eşler. Sağlayıcıları yeniden derlemez. BOAT sağlayıcısı bu değişiklikte değiştirilmedi.
