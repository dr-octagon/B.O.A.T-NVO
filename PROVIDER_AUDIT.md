# Sağlayıcı kontrolü — 7–8 Ekim 2026

1.10.16 için BOAT dışındaki 44 sağlayıcı incelendi. Katalog, detay,
bölüm kimliği ve kaynak çözümü ayrı kontrol edildi. Node sonuçları tek
başına Nuvio Desktop kanıtı sayılmadı: Node'a 403 dönen bazı siteler
Nuvio'nun gerçek QuickJS/HTTP ortamında 200 döndürdü.

Medya kontrolü bir örnek bağlantının HLS listesi/video parçası veya MP4/MKV
başlığının okunmasını kapsar. “Görüntü/ses” ayrıca Nuvio ile gelen libmpv'de
gerçek video ve ses çözümünü gösterir. Sonuçlar bütün arşiv, bütün bölümler
ve Android/Mac oynatma garantisi değildir. İmzalı bağlantılar, oturum
anahtarları ve kişisel ayarlar bu raporda yayımlanmaz.

## Düzeltilenler

- HLS: çalışmayan bir ses, altyazı veya kalite listesi diğer çalışan
  seçenekleri tamamen silmiyor. Başarısız seçenekler ana listeden çıkarılıyor;
  varsayılan ses kaybolursa kalan ses seçiliyor. Bütün video listeleri
  başarısızsa bozuk bir kaynak döndürülmüyor.
- FilmModu: yeni siteye yönlenen film kimlikleri güncel Pilavyer oynatıcısına
  gidiyor. Ana kataloglar güncel siteye taşındı; eşdeğeri bulunan eski tür
  seçimleri korunuyor. Karşılığı olmayan eski koleksiyonlar gösterilmiyor.
- DDizi: güncel alan adı kullanılıyor.
- TLC: kısa video bölüm kimlikleri dizi sayfası olarak yeniden yüklenmiyor.
- YabancıDizi: güncel haftalık trend kartları doğru okunuyor.
- HDFilmDelisi: film adı, yıl ve poster navigasyon başlığından değil
  yapılandırılmış film bilgilerinden okunuyor.
- DomatesTV: anonim Firebase oturumu ve süresi dolan oturumu yenileme
  taşındı. Yeni ag2m5 oynatıcısında 7/23 saniyelik reklam yerine gerçek
  111 dakikalık film seçiliyor; 720p görüntü ve AAC ses doğrulandı.
- DominoTV: canlı F oynatıcısının kodlanmış bağlantısı okunuyor; WebP
  içinde taşınan video yerel yardımcıyla çözülüyor. BeIN Sports 1'de
  1080p görüntü ve AAC ses doğrulandı.
- CineStream: süre dolunca açık HTTP istekleri ve DNS beklemeleri iptal
  edilip tamamlanmış kaynaklar korunuyor. Gerçek QuickJS çağrısı 50 saniyelik
  bütçeyle 51,08 saniyede normal döndü; o örnekte kaynak tamamlanmadığı için
  bu sonuç oynatma başarısı olarak değerlendirilmedi.

## Kaynak bazında sonuç

| Sağlayıcı | Örnek kontrol sonucu |
|---|---|
| BronzeCloud | Film/dizi/anime katalog ve detay; film/dizi HLS ve video parçası |
| FilmModu | Matrix: 1728×720 görüntü, Türkçe/orijinal ses; katalog yönlendirmesi düzeltildi |
| Sinewix | Native katalog/detay/akış; yeni bölüm MP4, film MKV medya başlığı |
| HDFilmizle | Katalog/detay var; örnek oynatıcı vidrame.pro sertifika zinciri hatası |
| HDFilmCehennemi | 1920×800 görüntü ve AAC ses; ses listesi dayanıklılığı düzeltildi |
| DiziBox | Katalog/bölüm ve iki örnekte kaynak; TMDB bölüm eşlemesi |
| DiziYou | Bölüm ve HLS/video parçası |
| DiziMom | Bölüm ve MP4 video başlığı |
| TLC | Kısa video düzeltmesi; HLS/video parçası |
| FullHDFilmizlesene | Native katalog/detay/akış; 3840×1600 görüntü ve ses |
| SinemaCC | Katalog/detay; HLS/video parçası; Matrix eşlemesi |
| KultFilmler | Katalog/detay; HLS/video parçası; Matrix eşlemesi |
| FilmMakinesi | Native katalog 24 içerik; detay/akış ve HLS/video parçası |
| JetFilmizle | İkinci filmde HLS/video parçası; yayınlanmamış ilk filmde kaynak yok |
| SetFilmizle | Katalog/detay; HLS/video parçası; Matrix eşlemesi |
| Watch2Movies | İki filmde HLS/video parçası; ilk örnekte geçici zaman aşımı |
| DDizi | Alan adı düzeltildi; bölüm kaynakları ve MP4 video |
| SezonlukDizi | İlk bölümde kaynak; başka örnekte 429/zaman aşımı |
| FullHDFilm | Native kaynaklar; 1920×1024 görüntü ve ses |
| HDFilmDelisi | Detay düzeltildi; 1920×1080 görüntü ve ses |
| ÇizgiMax | Katalog/detay/bölümler var; örnek Sibnet oynatıcısı native HTTP 403 |
| WebDramaTurkey | Detay/bölüm ve örnek bölüm kaynakları |
| BelgeselX | Katalog/detay var; örnek harici oynatıcılar native 400/404 |
| DiziPod | Katalog/detay ve 8 bölüm; bölüm HLS/video parçası |
| FilmEkseni | Katalog/detay; HLS/video parçası; Matrix eşlemesi |
| WebteIzle | Native katalog 20 içerik; detay/akış ve HLS/video parçası |
| Dizilla | Native katalog 24 içerik; iki bölümde kaynak |
| DiziPal | Native katalog 35 içerik; iki bölümde kaynak |
| DiziPalOriginal | Bölüm ve HLS/video parçası; TMDB bölüm eşlemesi |
| Puhu | Native dizi katalog/detay ve 11 bölüm; dizi/Star TV HLS/video parçası |
| SelcukFlix | Native katalog 24 içerik; detay/akış ve HLS/video parçası |
| Vavoo | Native kanal kataloğu ve akış; örnek kanal HLS/video parçası |
| Anizium | Native film katalog/detay ve kaynaklar; film/dizi MP4 medya başlığı |
| Reeltu | Native katalog/detay ve kaynaklar; film/dizi HLS/video parçası |
| HDFilmCehennemi NL | Native katalog/detay/akış; 1920×1080 görüntü ve ses |
| YabancıDizi | Trend düzeltildi; native katalog 16; Mentalist 2, Lanterns 8 kaynak |
| DominoTV | Film/dizi HLS/video parçası; canlı BeIN Sports 1 1080p görüntü/ses |
| TrDiziizle | Katalog/detay/bölüm ve iki bölümde kaynak |
| DomatesTV | Giriş ve reklam seçimi düzeltildi; 720p gerçek film görüntü/ses |
| İnatBox | Canlı/film katalog ve medya; S Sport Plus program API'si ulaşılamadı |
| RecTV | Film/dizi HLS/video parçası; ilk canlı kanal örneği zaman aşımı |
| CineJoy | Native film/dizi katalog/detay ve kaynaklar; HLS/video parçası |
| BC Sports | Native BeIN Sports 1 A/C/E/F kaynakları; F 1080p görüntü/ses; B DNS, D boş yanıt |
| CineStream | Film/dizi/anime katalog, detay ve kaynaklar; Node film/dizi HLS/video parçası; native süre aşımı düzeltildi, native örnek 0 kaynak |

## Uzak hizmetlere bağlı kalanlar

HDFilmizle'nin örnek vidrame.pro adresinde Java ve Node sertifika doğrulaması
başarısız. ÇizgiMax'taki örnek Sibnet oynatıcısı 403, BelgeselX'teki örnek
oynatıcılar 400/404 döndürüyor. BC Sports B alan adı bulunamıyor, D boş
yanıt dönüyor. Bu yanıtlar kaynak kodu düzeltmesiyle çalışır hale getirilmiş
olarak işaretlenmedi. TLS doğrulaması kapatılmadı.

TMDB araması, birleşik ana ekran manifesti ve kullanıcıların kaynak
açık/kapalı tercihleri bu değişikliklerde korunur. BOAT'ın kaynak kodu,
derlenmiş dosyası ve kurulu önbelleği güncellenmez.
