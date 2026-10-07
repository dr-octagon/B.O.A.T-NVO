# İki bağlantıyla Nuvio Türkiye

[Kurulum sayfası](https://dr-octagon.github.io/B.O.A.T-NVO/) iki adres sunar:

1. **Plugin / kaynak deposu:** `https://raw.githubusercontent.com/dr-octagon/B.O.A.T-NVO/main/manifest.json`. Bütün JS oynatma kaynaklarını ekler.
2. **Birleşik katalog:** `https://nuvio-tr.netlify.app/manifest.json`. Sayfadaki **Birleşik kataloğu Nuvio'ya ekle** veya **Katalog bağlantısını kopyala** düğmesini kullanın.

Birleşik **Nuvio Türkiye** eklentisi BC Sports, İnatBox, DominoTV, RecTV ve Vavoo için beş canlı TV satırı; 27 TMDB ana ekran satırı; film/dizi araması ve içerik detayları sunar. Mac, Android ve Windows aynı bağlantıları kullanır. Yeni bir Netlify hesabı, kişisel sunucu veya bu PC'deki katalog yardımcısı gerekmez.

## Satır tercihleri

Nuvio'da **Ayarlar → Görünüm → Ana ekran → Kataloglar** bölümünden canlı TV ve TMDB satırlarını ayrı ayrı açıp kapatın ve sıralayın. Bu işlem şifre istemez. Manifestte ilk iki katalog Trending Movies ve Trending Series'dir; ardından BC Sports, İnatBox, DominoTV, RecTV, Vavoo ve kalan TMDB satırları gelir. Nuvio yeni profilde ilk iki kataloğu slider kaynağı seçtiği için bu sıra yalnız iki TMDB trend kaynağını varsayılan yapar. Uygulamada önceden kaydedilmiş sıralama ve slider tercihleri korunur.

Eklenti listesindeki **Ayarlar / Yapılandır** düğmesi satır tercihleri ekranı değildir. AIOStreams'in ortak kataloğun yönetimi için parola isteyen `/configure` sayfasını açar. Hazır hizmet `configurable: true` alanını sabit yayımladığı için bu düğme repo yapılandırmasından gizlenemez. Kullanıcı satır seçimi için bu sayfaya giriş gerekmez; ortak yönetim parolası dağıtılmaz. [AIOStreams manifest davranışı](https://github.com/Viren070/AIOStreams/blob/v2.35.9/packages/server/src/routes/stremio/manifest.ts), [Nuvio ana ekran ayarları](https://github.com/NuvioMedia/NuvioMobile/blob/cmp-rewrite/composeApp/src/commonMain/kotlin/com/nuvio/app/features/settings/HomescreenSettingsPage.kt).

Yeni satırlar açık başlar. TMDB'nin 27 kategorisi ayrı satırlardır; Nuvio'da tek bir toplu TMDB anahtarı yoktur. İstediğiniz TMDB satırlarını gizlemek film/dizi aramasını kapatmaz. Bir canlı TV satırını gizlemek de JS oynatma kaynağını kapatmaz. Bu tercihler kullanıcının cihaz/profil ayarlarıdır; ortak katalog yapılandırmasını değiştirmez.

**BC Sports + TMDB seçimi:** “Öne çıkan kaynakları” üstteki sliderı besler; yeni kurulumda yalnız `Trending Movies` ve `Trending Series` seçilir. Daha önce başka slider kaynakları kaydedildiyse bunları kapatıp bu iki listeyi bir kez seçin. “Kataloglar” aşağıdaki satırların görünürlüğünü belirler; BC Sports ve istenen TMDB kategorileri açık, İnatBox, DominoTV, RecTV ve Vavoo kapalı olsun. BC Sports'u satır sıralamasında en üste taşıyabilirsiniz; kayıtlı slider kaynaklarını değiştirmez.

Canlı TV satırlarının kapalı tercihi manifestten otomatik uygulanmış değildir. Nuvio, tercihi kaydedilmemiş her yeni satırı açık başlatır. Diğer kaynakları ayarlardan yeniden açılabilecek şekilde listede tutarken ilk kurulumda kapalı başlatacak bir manifest alanı yoktur. Her cihaz/profilde bu dört satırın bir kez kapatılması gerekir; manifestten tamamen çıkarmak onları Nuvio'nun satır ayarlarından da kaldırır.

## Önceki kurulumdan geçiş

Birleşik kataloğu ekleyin; ardından ayrı **Nuvio Catalog Addon** ve **Nuvio Türkiye Canlı TV** katalog eklentilerini kaldırın. Eski ElfHosted TMDB veya ayrı Türkçe arama kataloğu hâlâ kuruluysa bunları da kaldırabilirsiniz. **Plugin / kaynak deposunu koruyun.** Aynı içeriklerin iki kez görünmemesi için katalog eklentileri listesinde yeni **Nuvio Türkiye** tek başına yeterlidir.

Windows Desktop kapalıyken `./scripts/install_desktop_tmdb_catalog.ps1` mevcut katalog kaydını yedekleyip bu birleşik adrese geçirir. Plugin ayarlarını ve oynatma yardımcısını değiştirmez; hesap senkronizasyonu başlatmaz.

## Hizmet ve bakım

[AIOStreams](https://github.com/Viren070/AIOStreams), [Nuvio Catalog Addon](https://catalog.nuvio.tv/) ve repodaki statik canlı TV kataloğunun `catalog`/`meta` yanıtlarını tek manifest adresinden sunar. TMDB'deki IMDb kimlikleri ve canlı TV kanal kimlikleri korunur; oynatma mevcut JS sağlayıcılarımızdan gelir. Birleştirici video akışlarını taşımaz.

Kısa adres Netlify'deki `nuvio-tr` projesinden mevcut AIOStreams hizmetine HTTP 302 ile yönlenir. Manifest, katalog, arama, detay ve diğer kaynak yolları aynı yönlendirmeyi kullanır; Netlify video veya katalog yanıtlarını taşımaz. Manifest ve tüm kaynak yanıtları AIOStreams'in hazır public hizmetine bağlıdır. TMDB verileri ayrıca Nuvio Catalog Addon'ın erişilebilirliğine bağlıdır. GitHub Pages tek başına dinamik arama isteklerini çalıştıramadığı için birleşik adres GitHub Pages üzerinde değildir; dağıtılan kısa adres `catalog-addon.json` içindeki `manifestUrl`, asıl hizmet adresi `upstreamManifestUrl` alanında tutulur. Eski uzun kurulum adresi çalışmaya devam eder. Mevcut uzun katalog zaten kuruluysa kısa adresi ikinci bir eklenti olarak eklemeyin; gerekiyorsa eski katalog kaydını kısa adresle değiştirin. Eski ayrı manifestler uyumluluk ve birleştiricinin veri kaynağı olarak korunur.

Kısa adresin yayın dosyaları `node scripts/build_catalog_link.js` ile `dist/catalog-link` altında üretilir. [Yayın ve bakım bilgisi](https://github.com/dr-octagon/Nuvio-Source/blob/main/catalog-link/README.md). Kullanıcıların kişisel sunucu veya Netlify hesabı açması gerekmez.

[catalog-template.json](catalog-template.json), hizmetteki iki kaynaklı yapılandırmanın kimlik bilgisi içermeyen kopyasıdır. Yönetim parolası repoya yüklenmez; Windows bakım kopyası `%LOCALAPPDATA%/NuvioTurkey/catalog-union-admin.json` konumunda saklanır. Ortak yapılandırmayı değiştirmenin bütün kurulumları etkilediğini dikkate alın; kullanıcıların satır tercihleri için Nuvio ayarlarını kullanın.

Kurulum metinlerini veya manifest adresini değiştirdikten sonra `node scripts/sync_setup.js` çalıştırın. Canlı TV dosyaları önceki [bakım komutlarıyla](LIVE_TV.md) yenilenir; oynatma sağlayıcılarının yeniden derlenmesi bu birleştirme için gerekmez.

## Doğrulama — 2026-10-05

Birleşik HTTPS adresinden beş canlı TV listesi ve kanal detayları, iki TMDB ana ekran listesi, Matrix film araması, Reacher dizi araması ve Reacher detayları HTTP 200 ile alındı. Kurulu Nuvio Desktop'ın manifest, ana ekran ve detay ayrıştırıcıları tek eklentiden 32 satır, 1.533 canlı TV kartı, iki arama tanımı, 40 ana ekran başlık logosu, Reacher için altı oyuncu fotoğrafı ve 32 bölüm okudu. Bilinen IMDb kimlikleri ve canlı yayın kaynak kimlikleri korundu. Nuvio kurulum bağlantısı ayrıştırıldı.

Mac/Android arayüzünde fiziksel test ve tüm kanalların baştan sona oynatma testi yapılmadı. Bu değişiklik canlı yayınları veya sistem DNS ayarlarını değiştirmez. BOAT sağlayıcısı değiştirilmedi.

Slider varsayılanı ayrıca boş bir test profilinde kurulu Nuvio Desktop'ın gerçek ana ekran ayarlarıyla doğrulandı: yalnız Trending Movies ve Trending Series öne çıkan kaynağı olarak seçildi; 32 katalog satırı erişilebilir kaldı. Test ayrı bir depolama dizininde çalıştı, kullanıcının kayıtlı tercihlerini değiştirmedi. Güncel manifestte iki arama tanımı ve önceki katalog kimlikleri korundu; Matrix araması tekrar aynı IMDb kimliğini döndürdü.

## Kısa adres doğrulaması — 2026-10-07

`https://nuvio-tr.netlify.app/manifest.json` kalıcı olarak yayınlandı ve Netlify hesabındaki `nuvio-tr` projesine bağlandı. Canlı kısa adres üzerinden 32 satırlı manifest, iki TMDB trend listesi, Matrix/Reacher araması, beş canlı TV listesi ve her listenin ilk kanal detayı, Reacher dizi detayı HTTP 200 döndü. Manifest katalog kimlikleri ve sırası eski uzun adresle aynı kaldı. Kurulu Nuvio Desktop'ın ayrıştırıcıları bu yanıtları kısa HTTPS adresiyle okudu: 1.533 canlı TV kartı, 40 başlık logosu, altı oyuncu fotoğrafı ve 32 bölüm korundu; Nuvio kurulum bağlantısı ayrıştırıldı. Cihazdaki kurulu eklenti veya tercih kayıtları değiştirilmedi. Mac/Android arayüzünde fiziksel test yapılmadı.
