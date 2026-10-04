
# Nuvio Türkiye

**[Kurulum sayfası](https://dr-octagon.github.io/Nuvio/)** iki bağlantı sunar:

1. **Plugin / kaynak deposu:** `https://raw.githubusercontent.com/dr-octagon/Nuvio/main/manifest.json`. Bütün JS oynatma kaynaklarını ekler.
2. **Nuvio Türkiye birleşik katalog:** TMDB ana ekranı, film/dizi araması, içerik detayları ve BC Sports, İnatBox, DominoTV, RecTV, Vavoo canlı TV satırları. Sayfadaki katalog düğmesini kullanın veya bağlantıyı kopyalayın. Tam adres [catalog-addon.json](catalog-addon.json) içindedir.

TMDB'nin 27 kategorisi ve beş canlı TV satırı Nuvio'nun **ana ekran / katalog ayarlarından** ayrı ayrı açılıp kapanır ve sıralanır. Yeni satırlar açık gelir. TMDB satırlarını gizleseniz de arama çalışır. Başlık logoları ana ekran sliderına ve detaylara, oyuncu fotoğrafları detaylara gönderilir.

Önceden ayrı TMDB ve Canlı TV kataloglarını kurduysanız birleşik kataloğu ekledikten sonra bu iki eski katalog kaydını kaldırın. **Plugin / kaynak deposunu koruyun.** Mac, Android ve Windows aynı iki bağlantıyı kullanır.

Birleşik katalog, hazır public AIOStreams hizmetiyle Nuvio Catalog Addon'ı ve repodaki canlı TV dosyalarını bir araya getirir. Netlify veya kişisel sunucu gerekmez; katalog bu hizmetlerin erişilebilirliğine bağlıdır. Oynatma kurulu JS kaynaklarımızdan gelir. [Kurulum, doğrulama ve bakım](CATALOG.md), [canlı TV bakım bilgisi](LIVE_TV.md).

Kaynak kodları: [Nuvio-Source](https://github.com/dr-octagon/Nuvio-Source).
