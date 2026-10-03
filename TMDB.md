## Mac, Android ve Windows üzerinde TMDB araması

[Nuvio Türkiye kurulum sayfası](https://dr-octagon.github.io/Nuvio/) üzerinden **Aramayı Nuvio'ya ekle** ve **Ana ekranı Nuvio'ya ekle** düğmelerini kullanabilirsiniz. Uygulama açılmazsa aynı sayfadaki kopyalama düğmeleriyle aşağıdaki kurulumu yapın. Manifestin tarayıcıda görünmesi, Nuvio'ya kurulduğu anlamına gelmez.

Nuvio'da **Ayarlar → Eklentiler → Eklenti ekle** bölümüne aşağıdaki manifest adresini yapıştırın (eklenti/Stremio adresi olarak; JS sağlayıcı deposu olarak değil):

https://tmdb.elfhosted.com/N4IgNghgdg5grhGBTEAuEAXATgWgCoBKIANCAMYQYRgD2MAzmgNoC6pWSGcWUAkgLYATAEa9BaTFjgpSFehgDCNOFAxoATAAYAvkA/manifest.json

Bu ayar TMDB'de Türkçe film ve dizi araması yapar. Hesap bağlantısı veya bu Windows bilgisayarındaki yerel hizmet gerekli değildir. Yalnızca arama katalogları etkin olduğu için ana ekrandaki TMDB satırları tekrarlanmaz. Her cihazda bir kez eklenmesi gerekir; GitHub'daki kaynak deposunu yenilemek bu ayrı eklentiyi otomatik kurmaz.

Windows Desktop kapalıyken yerel kurulum: `scripts/install_desktop_tmdb_search.ps1`. Diğer cihazlarda yukarıdaki adresi uygulamadan ekleyin.

Hazır hizmet: [TMDB Addon](https://github.com/mrcanelas/tmdb-addon), [ElfHosted ücretsiz ortak hizmeti](https://docs.elfhosted.com/sponsorship/). Arama ve yeni içeriklerin detayları bu hizmetin erişilebilirliğine bağlıdır. Arama sonuçlarındaki IMDb kimlikleri mevcut JS kaynaklarımızla kullanılır.

## Ana ekran ve içerik detayları

GitHub kataloğunun başlıkları emojisizdir. TMDB oyuncu fotoğrafları `app_extras.cast[].photo`, şeffaf başlık görselleri `logo` alanında gönderilir. Standart `cast` isim listesi korunur. TMDB'de logo veya fotoğrafı olmayan içeriklerde uygulama metin/yer tutucu gösterebilir.

Statik detayları güncellemek için `node scripts/enrich_tmdb_metadata.js`; yeni katalog üretimi için `node scripts/generate_catalogs.js` kullanılır. Mevcut içerik kimlikleri ve kaynak sağlayıcıları değişmez.

## 1.10.10 doğrulaması — 2026-10-03

Kurulu Windows Nuvio'nun HTTP çalışma ortamında ortak HTTPS hizmeti: manifest, Matrix film araması, Reacher dizi araması ve Reacher detayları HTTP 200. Uygulamanın AddonManifestParser ve HomeCatalogParser sınıfları iki aranabilir katalog, Matrix için 21 sonuç, Reacher için 2 sonuç ve doğru IMDb kimliklerini okudu. MetaDetailsParser, ortak Reacher detaylarında 6 oyuncu fotoğrafı, başlık logosu ve 32 bölüm okudu. Arama bu PC'ye kuruldu.

Statik TMDB arşivinde 119 başlığın 356 detay dosyası yenilendi; 116 başlıkta logo, 115 başlıkta oyuncu fotoğrafı mevcut. Matrix ve Reacher'ın statik detayları uygulamanın kendi okuyucusunda doğrulandı; Reacher logo URL'si `200 image/png`, oyuncu fotoğrafı `200 image/jpeg` döndü. Beş ana ekran başlığı emojisizdir. BOAT sağlayıcısı değiştirilmedi.

Mac ve Android uygulamalarında fiziksel arayüz testi yapılmadı. Bu cihazlarda aynı ortak HTTPS manifesti kullanılmalı; eklenti kurulmadan “aranabilir katalog yok” uyarısı devam eder.
