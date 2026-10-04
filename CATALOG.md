# İki bağlantıyla Nuvio Türkiye

[Kurulum sayfası](https://dr-octagon.github.io/Nuvio/) iki adres sunar:

1. **Plugin / kaynak deposu:** `https://raw.githubusercontent.com/dr-octagon/Nuvio/main/manifest.json`. Bütün JS oynatma kaynaklarını ekler.
2. **Birleşik katalog:** Sayfadaki **Birleşik kataloğu Nuvio'ya ekle** veya **Katalog bağlantısını kopyala** düğmesini kullanın. Tam manifest adresi [catalog-addon.json](catalog-addon.json) içindedir.

Birleşik **Nuvio Türkiye** eklentisi BC Sports, İnatBox, DominoTV, RecTV ve Vavoo için beş canlı TV satırı; 27 TMDB ana ekran satırı; film/dizi araması ve içerik detayları sunar. Mac, Android ve Windows aynı bağlantıları kullanır. Yeni bir Netlify hesabı, kişisel sunucu veya bu PC'deki katalog yardımcısı gerekmez.

## Satır tercihleri

Nuvio'da **Ayarlar → Görünüm → Ana ekran → Kataloglar** bölümünden canlı TV ve TMDB satırlarını ayrı ayrı açıp kapatın ve sıralayın. Bu işlem şifre istemez. Manifestte önce BC Sports, ardından İnatBox, DominoTV, RecTV, Vavoo ve TMDB satırları gelir. Uygulamada önceden kaydedilmiş sıralama varsa kullanıcı tercihi geçerlidir.

Eklenti listesindeki **Ayarlar / Yapılandır** düğmesi satır tercihleri ekranı değildir. AIOStreams'in ortak kataloğun yönetimi için parola isteyen `/configure` sayfasını açar. Hazır hizmet `configurable: true` alanını sabit yayımladığı için bu düğme repo yapılandırmasından gizlenemez. Kullanıcı satır seçimi için bu sayfaya giriş gerekmez; ortak yönetim parolası dağıtılmaz. [AIOStreams manifest davranışı](https://github.com/Viren070/AIOStreams/blob/v2.35.9/packages/server/src/routes/stremio/manifest.ts), [Nuvio ana ekran ayarları](https://github.com/NuvioMedia/NuvioMobile/blob/cmp-rewrite/composeApp/src/commonMain/kotlin/com/nuvio/app/features/settings/HomescreenSettingsPage.kt).

Yeni satırlar açık başlar. TMDB'nin 27 kategorisi ayrı satırlardır; Nuvio'da tek bir toplu TMDB anahtarı yoktur. İstediğiniz TMDB satırlarını gizlemek film/dizi aramasını kapatmaz. Bir canlı TV satırını gizlemek de JS oynatma kaynağını kapatmaz. Bu tercihler kullanıcının cihaz/profil ayarlarıdır; ortak katalog yapılandırmasını değiştirmez.

## Önceki kurulumdan geçiş

Birleşik kataloğu ekleyin; ardından ayrı **Nuvio Catalog Addon** ve **Nuvio Türkiye Canlı TV** katalog eklentilerini kaldırın. Eski ElfHosted TMDB veya ayrı Türkçe arama kataloğu hâlâ kuruluysa bunları da kaldırabilirsiniz. **Plugin / kaynak deposunu koruyun.** Aynı içeriklerin iki kez görünmemesi için katalog eklentileri listesinde yeni **Nuvio Türkiye** tek başına yeterlidir.

Windows Desktop kapalıyken `./scripts/install_desktop_tmdb_catalog.ps1` mevcut katalog kaydını yedekleyip bu birleşik adrese geçirir. Plugin ayarlarını ve oynatma yardımcısını değiştirmez; hesap senkronizasyonu başlatmaz.

## Hizmet ve bakım

[AIOStreams](https://github.com/Viren070/AIOStreams), [Nuvio Catalog Addon](https://catalog.nuvio.tv/) ve repodaki statik canlı TV kataloğunun `catalog`/`meta` yanıtlarını tek manifest adresinden sunar. TMDB'deki IMDb kimlikleri ve canlı TV kanal kimlikleri korunur; oynatma mevcut JS sağlayıcılarımızdan gelir. Birleştirici video akışlarını taşımaz.

Manifest ve tüm kaynak yolları AIOStreams'in hazır public hizmetine bağlıdır. TMDB verileri ayrıca Nuvio Catalog Addon'ın erişilebilirliğine bağlıdır. GitHub Pages tek başına dinamik arama isteklerini çalıştıramadığı için birleşik adres GitHub Pages üzerinde değildir; dağıtılan adres kurulum sayfasında ve `catalog-addon.json` dosyasında tutulur. Eski ayrı manifestler uyumluluk ve birleştiricinin veri kaynağı olarak korunur.

[catalog-template.json](catalog-template.json), hizmetteki iki kaynaklı yapılandırmanın kimlik bilgisi içermeyen kopyasıdır. Yönetim parolası repoya yüklenmez; Windows bakım kopyası `%LOCALAPPDATA%/NuvioTurkey/catalog-union-admin.json` konumunda saklanır. Ortak yapılandırmayı değiştirmenin bütün kurulumları etkilediğini dikkate alın; kullanıcıların satır tercihleri için Nuvio ayarlarını kullanın.

Kurulum metinlerini veya manifest adresini değiştirdikten sonra `node scripts/sync_setup.js` çalıştırın. Canlı TV dosyaları önceki [bakım komutlarıyla](LIVE_TV.md) yenilenir; oynatma sağlayıcılarının yeniden derlenmesi bu birleştirme için gerekmez.

## Doğrulama — 2026-10-05

Birleşik HTTPS adresinden beş canlı TV listesi ve kanal detayları, iki TMDB ana ekran listesi, Matrix film araması, Reacher dizi araması ve Reacher detayları HTTP 200 ile alındı. Kurulu Nuvio Desktop'ın manifest, ana ekran ve detay ayrıştırıcıları tek eklentiden 32 satır, 1.533 canlı TV kartı, iki arama tanımı, 40 ana ekran başlık logosu, Reacher için altı oyuncu fotoğrafı ve 32 bölüm okudu. Bilinen IMDb kimlikleri ve canlı yayın kaynak kimlikleri korundu. Nuvio kurulum bağlantısı ayrıştırıldı.

Mac/Android arayüzünde fiziksel test ve tüm kanalların baştan sona oynatma testi yapılmadı. Bu değişiklik canlı yayınları veya sistem DNS ayarlarını değiştirmez. BOAT sağlayıcısı değiştirilmedi.
