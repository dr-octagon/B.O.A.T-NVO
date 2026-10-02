# Nuvio Desktop HLS yardımcısı

HDFilmCehennemi FastPlay ve DiziBox King gibi kaynaklar HLS listelerini `.txt` veya uzantısız adreslerde sunabiliyor. Kurulu Nuvio Desktop'ın mpv sürümü bunları AMR-WB ses olarak tanıyabiliyor. FilmModu'nun güncel Pilavyer oynatıcısı da token içeren PHP HLS adresleri kullanıyor.

Yardımcı `127.0.0.1:18765` üzerinde çalışır. Eklenti korumalı ana/alt listeleri Nuvio'nun kendi HTTP çalışma ortamında çeker; yardımcı bunları `.m3u8` ve doğru MIME ile sunar. Türkçe/orijinal sesler, altyazılar ve anahtarlar korunur. Video parçaları yardımcıdan geçmez. HLS uyarlaması yalnız VOD için kullanılır; canlı HLS listelerini sürekli yenileyen bir proxy değildir. Sürüm 2 ayrıca DominoTV'nin üç sabit GitHub gzip kataloğunu açıp kategori, arama ve içerik detayı olarak sunar. Kurulu Desktop'ın `arrayBuffer()` uyarlaması ikili gzip verisini UTF-8'e çevirerek bozduğu için bu katalog yolu gerekir; diğer çalışma ortamlarında sağlayıcı gzip dosyalarını doğrudan JS ile açar.

## Windows üzerinde başlatma

Node.js gereklidir. Dağıtım deposundaki bu klasörde:

```powershell
pwsh -NoProfile -File ./start_desktop_hls.ps1
```

Alternatif olarak terminal açık kaldığı sürece:

```powershell
node ./desktop_hls_bridge.js
```

Sağlık kontrolü: `http://127.0.0.1:18765/health`. Başlatma scripti mevcut yardımcının sürümünü ve kod özetini kontrol eder. Güncelleme gerektiğinde yalnız bu kurulumun başlattığı Node işlemini, Nuvio Desktop kapalıysa yeniden başlatır. Günlükler depo kökünde `tmp/` altında tutulur.

Kaynak deposunda aynı dosyalar `scripts/` altındadır. `scripts/install_desktop_hls.ps1 -AutoStart`, Nuvio kapalıyken dört kurulu eklentiyi günceller ve Windows Başlangıç klasörüne `Nuvio Desktop HLS.lnk` ekler. `-AllRegistered` eklenirse manifest içinde etkin tüm derlenmiş sağlayıcıları önbelleğe yükler ve yeni kayıtları ekler; mevcut sağlayıcıların kullanıcı tarafından seçilmiş açık/kapalı durumu korunur. İşlem öncesinde ayarlar ve önbellek `tmp/desktop-backup-*` altında yedeklenir. Bu kısayol kaynak klasörüne bağlıdır; depo taşınırsa kurulum scriptini yeniden çalıştırın. Otomatik başlatmayı kaldırmak için yalnız bu kısayolu silin.

Yardımcı kapalı olduğunda sağlayıcılar uzak URL'leri döndürür; bu Desktop sürümünde King/FastPlay sorunu tekrar oluşabilir ve DominoTV'nin gzip katalogları açılamaz. Yardımcı yeniden başlatıldıktan veya kaynak tokeni sona erdikten sonra Nuvio'da kaynak listesini yeniden açın. Yerel listeler bellekte en fazla 12 saat/128 oturum tutulur. Servis yalnız loopback'e bağlanır, tarayıcı Origin'iyle liste kaydını ve katalog isteklerini reddeder. Katalog yolu yalnız üç sabit DominoTV GitHub dosyasına erişir; istekten alınan dış URL'leri çekmez.

FilmModu öncelikle güncel `filmmodu.live`/Pilavyer yolunu kullanır. Eski `.one` ayrıştırıcısı geriye uyumluluk için korunur; eski CDN'nin 503 dönen dosyaları eklenti tarafından onarılamaz. Başlık/yıl eşleştirmesi yanlış filmi döndürmeyi engeller; arşivde bulunmayan içerik için kaynak gelmeyebilir.
