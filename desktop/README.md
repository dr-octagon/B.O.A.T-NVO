# Nuvio Desktop HLS yardımcısı

HDFilmCehennemi FastPlay ve DiziBox King gibi kaynaklar HLS listelerini `.txt` veya uzantısız adreslerde sunabiliyor. Kurulu Nuvio Desktop'ın mpv sürümü bunları AMR-WB ses olarak tanıyabiliyor. FilmModu'nun güncel Pilavyer oynatıcısı da token içeren PHP HLS adresleri kullanıyor.

Yardımcı `127.0.0.1:18765` üzerinde çalışır. Eklenti korumalı ana/alt listeleri Nuvio'nun kendi HTTP çalışma ortamında çeker; yardımcı bunları `.m3u8` ve doğru MIME ile sunar. Türkçe/orijinal sesler, altyazılar ve anahtarlar korunur. Bu VOD yolunda video parçaları yardımcıdan geçmez. Canlı BC Sports için sürüm 4 ayrı bir aktarım yolu ekler. Sürüm 2 ayrıca DominoTV'nin üç sabit GitHub gzip kataloğunu açıp kategori, arama ve içerik detayı olarak sunar. Kurulu Desktop'ın `arrayBuffer()` uyarlaması ikili gzip verisini UTF-8'e çevirerek bozduğu için bu katalog yolu gerekir; diğer çalışma ortamlarında sağlayıcı gzip dosyalarını doğrudan JS ile açar.

## Windows üzerinde başlatma

Sürüm 3, CineJoy için `/transport/cinejoy` ikili POST/yanıt aktarımı ve TMDB katalog/meta için `/transport/tmdb` JSON aktarımı ekler. CineJoy adresleri sabit GitHub domain yapılandırmasıyla sınırlandırılır; oynatıcı yanıtının AES-GCM çözümü sağlayıcının JS kodunda yapılır. TMDB aktarımı yalnız okuma uç noktalarına gider, bu tek API adresini DoH ile çözer ve TLS doğrulamasını korur. Sistemin DNS/hosts ayarları değiştirilmez. Bu yollar dış URL veya kullanıcı oturum başlığı kabul etmez; tarayıcı Origin'i olan istekler reddedilir. CineJoy API'si 502 döndüğünde bu sunucudan kaynak gelmez; bağımsız Movy sunucuları denenmeye devam eder.

Sürüm 4, BC Sports için `/live/register` ve opak oturum adresleriyle canlı aktarım ekler. Canlı listeler uzak sunucudan yenilenir; iki saniyelik kısa önbellek canlı yayını sabit bir listeye dönüştürmez. Bu yolda video parçaları da yardımcıdan geçer: kaynak B’nin RGBTS PNG parçaları MPEG-TS olarak açılır, kaynak D’nin oynatıcı AES anahtar isteği uyarlanır. Kayıt yalnız bilinen kaynak/CDN alan adlarına ve genel HTTPS adreslerine izin verir; yönlendirmelerde de hedef kontrol edilir. Tarayıcı Origin’i olan kayıtlar reddedilir. Canlı oturumlar iki saat kullanılmadığında silinir; en fazla 64 oturum tutulur. C/E/F’nin BeIN Sports 1 listesinin ve video parçasının HTTP 200 kontrolü geçti; A/B/D’nin canlı doğrulaması mevcut sunucu hataları nedeniyle bekliyor.

Sürüm 6, geliştirilmekte olan CineStream için gerçek ağ zaman aşımı ve iptal edilebilir süre sayacı ekler. Desktop'ın `fetch()` uyarlaması AbortSignal'i uygulamıyor ve arka plandaki istekleri de bekliyor. CineStream'in bu yoldaki HTML/API/HLS istekleri en fazla 12 saniye, toplam kaynak araması en fazla 50 saniye sürer. Yardımcı yalnız geri döngü adresinde dinler, tarayıcı Origin'i olan istekleri reddeder ve her hedef/yönlendirme için genel IP kontrolü ile DNS sabitlemesi yapar. HTTP yanıtı en fazla 512 KiB'dır. Video dosyaları bu yoldan aktarılmaz. Kaynak seçimleri, sıralama ve kişisel anahtarlar Nuvio'nun yerleşik eklenti ayarlarından okunur; CineStream henüz dağıtım manifestine eklenmedi.

Node.js gereklidir. Dağıtım deposundaki bu klasörde:

```powershell
pwsh -NoProfile -File ./start_desktop_hls.ps1
```

Sürüm 7'nin katalog eklentisi `http://127.0.0.1:18765/addon/manifest.json`
adresindedir. Bu adres Nuvio'nun eklenti ekleme ekranında normal katalog
eklentisi olarak eklenir. Yardımcı, dağıtılmış sağlayıcıların kendi JS
`getCatalog`, `getMeta` ve `getStreams` işlevlerini çalıştırır; kategori
seçimi, arama, sayfalama ve kaynakların kendi içerik/bölüm kimlikleri korunur.
Kategoriler sağlayıcı ve içerik türüne göre gruplandırılır, kategori seçimi
`genre` filtresinde sunulur. Canlı kanallar `live` türünü korur. Cheerio ve
CryptoJS dağıtıma dahildir; npm kurulumu gerekmez. Mevcut geliştirme envanteri
34 sağlayıcının 596 kategorisini tanımlar; eski altı sağlayıcının katalog
tanımları ve CineStream yayını bekliyor. DiziBox katalog/metadata kodu
eklendi ancak site şu anda sunucu/VPN IP'lerine 403 döndüğü için canlı
doğrulaması bekliyor. Nuvio'nun yerleşik ayrıştırıcıları manifest, dizi
bölümleri ve canlı kartları okudu; arayüzün görsel kontrolü henüz yapılmadı.

Kaynak deposundan bu PC'ye kurulum için Nuvio kapalıyken
`scripts/install_desktop_catalogs.ps1` çalıştırılır. Araç, kurulu uygulamanın
yerel kayıt API'sini kullanır ve önce `nuvio_addons.properties` yedeğini alır.
Hesap/depo senkronizasyonunu başlatmaz. Kaynak derlemesi katalog envanterini
ve taşınabilir runtime dosyasını otomatik üretir.

Alternatif olarak terminal açık kaldığı sürece:

```powershell
node ./desktop_hls_bridge.js
```

Sağlık kontrolü: `http://127.0.0.1:18765/health`. Başlatma scripti mevcut yardımcının sürümünü ve kod özetini kontrol eder. Güncelleme gerektiğinde yalnız bu kurulumun başlattığı Node işlemini, Nuvio Desktop kapalıysa yeniden başlatır. Günlükler depo kökünde `tmp/` altında tutulur.

Kaynak deposunda aynı dosyalar `scripts/` altındadır. `scripts/install_desktop_hls.ps1 -AutoStart`, Nuvio kapalıyken dört kurulu eklentiyi günceller ve Windows Başlangıç klasörüne `Nuvio Desktop HLS.lnk` ekler. `-AllRegistered` eklenirse manifest içinde etkin tüm derlenmiş sağlayıcıları önbelleğe yükler ve yeni kayıtları ekler; mevcut sağlayıcıların kullanıcı tarafından seçilmiş açık/kapalı durumu korunur. İşlem öncesinde ayarlar ve önbellek `tmp/desktop-backup-*` altında yedeklenir. Bu kısayol kaynak klasörüne bağlıdır; depo taşınırsa kurulum scriptini yeniden çalıştırın. Otomatik başlatmayı kaldırmak için yalnız bu kısayolu silin.

Yardımcı kapalı olduğunda sağlayıcılar uzak URL'leri döndürür; bu Desktop sürümünde King/FastPlay sorunu tekrar oluşabilir ve DominoTV'nin gzip katalogları açılamaz. Yardımcı yeniden başlatıldıktan veya kaynak tokeni sona erdikten sonra Nuvio'da kaynak listesini yeniden açın. VOD listeleri bellekte en fazla 12 saat/128 oturum tutulur. Servis yalnız loopback'e bağlanır, tarayıcı Origin'iyle liste kaydını ve katalog isteklerini reddeder. Katalog yolu yalnız üç sabit DominoTV GitHub dosyasına erişir; istekten alınan dış URL'leri çekmez.

FilmModu öncelikle güncel `filmmodu.live`/Pilavyer yolunu kullanır. Eski `.one` ayrıştırıcısı geriye uyumluluk için korunur; eski CDN'nin 503 dönen dosyaları eklenti tarafından onarılamaz. Başlık/yıl eşleştirmesi yanlış filmi döndürmeyi engeller; arşivde bulunmayan içerik için kaynak gelmeyebilir.
