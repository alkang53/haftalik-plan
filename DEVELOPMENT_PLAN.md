# Haftalik Plan Gelistirme Plani

## Urun Tanimi

Haftalik Plan, kullanicinin icinde bulundugu haftayi pazartesiden pazara gunlere ayrilmis bir todo listesi olarak gormesini saglayan, local-first bir mobil uygulamadir.

Todo'lar:

- Belirli bir gune eklenir.
- Istege bagli saat icerebilir.
- Sabit bir tag'e sahip olur: Toplanti, Is, Ozel Hayat, Saglik, Kisisel veya Diger.
- Tamamlanabilir, duzenlenebilir ve silinebilir.
- Ayni gun icinde yeniden siralanabilir.
- Suruklenerek baska bir gune tasinabilir.

## Temel Urun Kararlari

- Uygulama acilisinda mevcut hafta goruntulenir.
- Haftalar ileri ve geri gezinilebilir.
- Gelecek haftalara sinirsiz todo eklenebilir.
- Gecmis tarafta yalnizca mevcut haftadan onceki hafta uygulama icinde goruntulenir.
- Saatli todo'lar, kullanici manuel siralama yapmadigi surece saatlerine gore siralanir.
- Manuel surukle-birak siralamasi, otomatik saat siralamasinin onune gecer.
- Todo verileri ilk asamada yalnizca cihazda saklanir; backend, hesap ve uzak senkronizasyon yoktur.
- Gmail, Exchange ve Zimbra entegrasyonlari ileri asama kapsamindadir ve kullanici izniyle calisacaktir.

## Branch ve PR Kurali

Her adim ayri bir branch'te gelistirilecek ve PR ile `main` branch'ine alinacak.

```bash
git switch main
git pull origin main
git switch -c feature/<branch-adi>
```

Her branch icin:

1. Yalnizca o adimin kapsami uygulanir.
2. TypeScript ve Expo kontrolleri calistirilir.
3. Anlamli bir commit olusturulur.
4. GitHub'a push edilerek PR acilir.
5. Acik review yorumlari merge oncesi cozulur.
6. PR merge edildikten sonra sonraki branch guncel `main`den acilir.

## Gelistirme Sirasi

### 1. Urun ve arayuz temeli

**Branch:** `feature/001-app-shell`

**Amac:** Baslangic ekranindan haftalik plan ekranina gecen temel uygulama iskeletini kurmak.

**Kapsam:**

- Mevcut baslangic ekranini urun kararlariyla uyumlu hale getirme.
- Haftalik plan ekraninin bos durumunu ekleme.
- Ortak renk, bosluk, yazi ve buton stillerini belirleme.
- Mobil ekranlarda dikey kaydirma davranisini kurma.

**Kabul kriterleri:**

- Kullanici baslangic ekranindan plan ekranina gecebilir.
- Plan ekrani mevcut haftayi temel baslikla gosterir.
- Android Expo Go uzerinde acilir.

### 2. Todo veri modeli ve cihazda saklama

**Branch:** `feature/002-local-storage`

**Amac:** Todo verisini uygulama kapanip acildiginda korunacak sekilde cihazda saklamak.

**Kapsam:**

- Todo TypeScript tipini tanimlama.
- Benzersiz kimlik, tarih, baslik, saat, tag, tamamlanma ve siralama alanlarini ekleme.
- Yerel depolama katmani olusturma.
- Yukleme, ekleme, guncelleme, silme ve siralama islemlerini ayirma.
- Bozuk veya eksik yerel veri icin guvenli varsayilan durum.

**Kabul kriterleri:**

- Uygulama yeniden acildiginda todo'lar kaybolmaz.
- Todo degisiklikleri uzak bir servise gonderilmez.
- Veri islemleri ekran kodundan bagimsiz kullanilabilir.

### 3. Hafta hesaplama ve hafta navigasyonu

**Branch:** `feature/003-week-navigation`

**Amac:** Pazartesi-pazar haftalarini dogru hesaplamak ve haftalar arasinda gezinmek.

**Kapsam:**

- Cihaz yerel tarihine gore mevcut haftayi hesaplama.
- Pazartesi ve pazar tarihlerini gosterme.
- Onceki, sonraki ve `Bu hafta` navigasyonu.
- Gelecek haftalarda todo eklenebilecek hafta verisini destekleme.
- Gecmis navigasyonunu onceki hafta ile sinirlama.

**Kabul kriterleri:**

- Her hafta tam olarak pazartesi-pazar araligini gosterir.
- Uygulama ilk acildiginda mevcut haftayi acar.
- Onceki haftadan daha geriye gidilemez.
- Gelecek haftalara gidilebilir ve geri donulebilir.

### 4. Gun listeleri ve todo ekleme

**Branch:** `feature/004-todo-create`

**Amac:** Haftanin gunlerini ve her gun icin todo ekleme akislarini tamamlamak.

**Kapsam:**

- Yedi gunu tarih ve gun adi ile listeleme.
- Her gun icin bos durum ve todo ekleme aksiyonu.
- Baslik girisi.
- Istege bagli saat secimi.
- Tag secimi ve varsayilan `Diger` tag'i.
- Form dogrulama ve klavye davranisi.

**Kabul kriterleri:**

- Kullanici haftanin herhangi bir gunune todo ekleyebilir.
- Saat belirtilirse todo basligindan once gorunur.
- Saat belirtilmezse saat alani bos kalir.
- Todo dogru gun ve tag ile listelenir.

### 5. Todo islemleri ve detay duzenleme

**Branch:** `feature/005-todo-actions`

**Amac:** Todo'larin gunluk kullanimdaki tum temel islemlerini eklemek.

**Kapsam:**

- Tamamlandi/tamamlanmadi durumunu degistirme.
- Todo detay ekranini veya duzenleme akisini ekleme.
- Baslik, tarih, saat ve tag duzenleme.
- Silme ve silme onayi.
- Tarih secici ile gorunen hafta disindaki bir tarihe tasiyabilme.
- Tamamlanan todo'lar icin belirgin ama sade gorunum.

**Kabul kriterleri:**

- Tum degisiklikler yerel veriye kaydedilir.
- Kullanici bir todo'yu istedigi tarihe detaydan tasiyabilir.
- Silme islemi yanlislikla kolayca tetiklenmez.

### 6. Surukle-birak siralama ve gun degistirme

**Branch:** `feature/006-drag-and-drop`

**Amac:** Todo'larin ayni gun icinde siralanmasini ve baska gunlere tasinmasini saglamak.

**Kapsam:**

- Todo satirini basili tutarak surukleme.
- Ayni gun icinde basa, sona veya aradaki konuma birakma.
- Gorunen baska bir gune birakinca tarihi otomatik guncelleme.
- Manuel siralama bilgisini yerel olarak saklama.
- Manuel siralama yoksa saatli todo'lari kronolojik siralama.
- Saatli ve saatsiz todo'lar icin tutarli siralama kurali.

**Kabul kriterleri:**

- Todo kaydirilarak baska bir gune tasinabilir.
- Uygulama yeniden acildiginda manuel siralama korunur.
- Kullanici siralama yapmadiginda saatli todo'lar saat sirasindadir.

### 7. Gizlilik bilgilendirmesi ve ayarlar temeli

**Branch:** `feature/007-privacy-settings`

**Amac:** Verilerin nerede tutuldugunu kullaniciya acikca bildirmek.

**Kapsam:**

- Ilk kullanimda local-first bilgilendirmesi.
- Ayarlar veya bilgi ekraninda gizlilik metni.
- Veri silme davranisini ve uygulama silinirse verilerin kaybolabilecegini belirtme.
- Ileride takvim senkronizasyonu icin izin ve baglanti alanini ayri tutma.

**Kabul kriterleri:**

- Kullanici verilerin uzak sunucuya gonderilmedigini gorebilir.
- Metin, gelecekteki senkronizasyonun kullanici izniyle olacagini aciklar.

### 8. Kalite, erisilebilirlik ve yayin oncesi duzenleme

**Branch:** `feature/008-quality-polish`

**Amac:** Ilk kullanilabilir surumu test edilebilir ve tutarli hale getirmek.

**Kapsam:**

- Ana kullanici akislarinin test edilmesi.
- Erisilebilirlik etiketleri ve yeterli dokunma alanlari.
- Kucuk ekran ve uzun todo basliklari icin kontrol.
- Tarih, saat ve hafta gecisi sinir durumlari.
- Yuklenme, bos liste ve hata durumlari.
- Dokumantasyon ve kurulum adimlarinin guncellenmesi.

**Kontroller:**

```bash
npx tsc --noEmit
npx expo-doctor
npm start
```

## Ileri Asama: Takvim Senkronizasyonu

Bu asama ilk local-first surumden sonra ele alinacak.

**Olası branch'ler:**

- `feature/101-calendar-domain`
- `feature/102-google-calendar`
- `feature/103-exchange-calendar`
- `feature/104-zimbra-calendar`
- `feature/105-calendar-sync-settings`

Bu asamada kullanici izni, OAuth veya kurumsal kimlik dogrulama, salt-okunur toplantilar, tekrar eden toplantilar, saat dilimleri, guncelleme/silme kurallari ve manuel todo'larla cakisma davranisi ayrica tasarlanmalidir.

## Ilk Uygulama Adimi

Ilk kod adimi `feature/001-app-shell` branch'idir. Bu branch yalnizca uygulama iskeletini ve bos haftalik plan gorunumunu icerecek; yerel veri saklama, form ve takvim entegrasyonu sonraki branch'lerde ele alinacaktir.
