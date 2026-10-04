# TMDB ana ekranı ve arama

Yeni kurulumda TMDB, arama ve canlı TV aynı **Nuvio Türkiye** katalog eklentisinden gelir. [Kurulum ve eski iki katalogdan geçiş](CATALOG.md), [kurulum sayfası](https://dr-octagon.github.io/Nuvio/). Dağıtılacak tek katalog adresi [catalog-addon.json](catalog-addon.json) içindedir.

[tmdb-catalog.json](tmdb-catalog.json), birleştiricinin kullandığı Nuvio Catalog Addon adresini ve `tr-TR`/`TR` tercihlerini tutar. Bu dosyadaki adres yeni kullanıcılara ayrıca kurdurulmaz. Hizmet 27 TMDB ana ekran kategorisi ve iki film/dizi arama tanımı sağlar. İçerik bilgileri Türkçedir; kategori başlıkları hazır hizmetten İngilizce gelir ve emoji içermez.

Oyuncu fotoğrafları `app_extras.cast[].photo`, film/dizi başlık görselleri `logo` alanından gelir. Başlık logosu ana ekran önizlemesinde de gönderilir; birleşik hizmet bu alanları ve bölüm kimliklerini korur. TMDB'de görsel bulunmayan içerikte uygulama metin veya yer tutucu gösterebilir. Arama sonuçlarının IMDb kimlikleri mevcut JS oynatma kaynaklarıyla kullanılır.

TMDB ana ekran satırlarını Nuvio'nun ana ekran ayarlarından gizlemek aramayı kapatmaz. Arama ve detay verileri Nuvio Catalog Addon ve birleşik AIOStreams hizmetinin erişilebilirliğine bağlıdır.

2026-10-05 doğrulamasında birleşik hizmetin iki TMDB ana ekran listesinde 40/40 başlık logosu okundu. Matrix film araması 19, Reacher dizi araması iki sonuç verdi. Nuvio'nun detay ayrıştırıcısı Reacher için altı oyuncu fotoğrafı, başlık logosu ve 32 bölüm okudu. Mac ve Android'de fiziksel arayüz testi yapılmadı.

Eski statik GitHub katalog/meta dosyaları önceki kurulumlarla uyumluluk için korunur. Bunları yenilemek için `node scripts/enrich_tmdb_metadata.js` ve `node scripts/generate_catalogs.js` kullanılabilir. Yeni kurulum dinamik arama için bu statik dosyaları kullanmaz.
