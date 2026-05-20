# insider-horseracing


# Insider Frontend Internship - At Yarışı Uygulaması

Bu proje, **Vue 3 (Composition API)**, **TypeScript** ve **Pinia** kullanılarak geliştirilmiş etkileşimli bir at yarışı turnuvası uygulamasıdır. Projede temel oyun durumu (state), oyun döngüleri ve iş mantığı (business logic), arayüz bileşenlerinden tamamen bağımsız bir şekilde kurgulanmıştır.

---

## 🚀 Teknik Mimari ve Tercihler

- **Framework:** Modern reaktivite ve güçlü tip güvenliği (type safety) sağlamak amacıyla TypeScript destekli Vue 3 (Composition API) tercih edilmiştir.
- **State Yönetimi:** Pinia. Case study dökümanındaki kesin kurallara (Locked Core Specs) sadık kalınarak turnuva durumu, at verileri, yarış programları ve simülasyon döngülerinin %100'ü tek bir global store içinde (`src/store/gameStore.ts`) toplanmıştır. Bileşenler (components) yalnızca bu veriyi ekrana yansıtan pasif katmanlar olarak çalışır.
- **Yarış Motoru:** At animasyonlarının tarayıcının yenileme hızına (refresh rate) senkronize, akıcı ve yüksek performanslı çalışması amacıyla `requestAnimationFrame` kullanılmıştır.

---

## 📝 Case Study Sorularının Cevapları

### Kod Hakkında

#### 1. Yarış mekaniği formülünüzü açıklayın—kondisyon sonucu nasıl etkiliyor? Formülün yer aldığı dosyayı belirtin.
Simülasyon formülü `src/store/gameStore.ts` dosyası içindeki `gameLoop()` fonksiyonunda çalışmaktadır. 
Her karede (frame tick), her atın pistteki ilerleme miktarı şu dinamik formülle hesaplanır:
$$\text{tickProgress} = \text{baseSpeed} + (\text{conditionFactor} \times \text{distanceModifier}) + \text{rngFactor}$$
- **`baseSpeed` (0.15):** Atların kararlı bir şekilde sürekli ileri doğru hareket etmesini sağlayan taban hızdır.
- **`conditionFactor`:** Atın kondisyonuna göre `(condition / 100) * 0.12` olarak hesaplanır. Yüksek kondisyonlu atların daha yüksek tepe hızlarına ulaşmasını sağlar.
- **`distanceModifier`:** Yarış mesafesine göre `currentDistance / 2000` şeklinde hesaplanır. Mesafe uzadıkça (örneğin 2200m) kondisyonun hıza olan çarpan etkisi artar; böylece fiziksel kondisyonu düşük atların uzun mesafelerde "kesilmesi/yorulması" simüle edilir.
- **`rngFactor`:** `Math.random() * 0.22` aralığında üretilen rastgele bir değerdir. Bu şans faktörü sayesinde yarıştaki öngörülemezlik korunur ve kondisyonu düşük atların da sürpriz (upset) yaparak yarışı kazanması mümkün kılınır.

#### 2. Tasarım kararlarınız arasında gurur duyduğunuz bir dosyayı (satır numaralarıyla) gösterin ve kısaca açıklayın. Aynı şekilde, tekrar gözden geçirmek (refactor etmek) istediğiniz bir yeri de belirtin.
- **Gurur Duyduğum Kısım:** `src/store/gameStore.ts` dosyasındaki `generateProgram()` fonksiyonu. Bir sonraki yarışın atlarını o an dinamik seçmek yerine, turnuva başında 6 yarışın tamamını kapsayan fikstürü (matrisi) önceden oluşturup her yarışa rastgele 10 atı peşin atıyor. Bu sayede dökümandaki "Yarış Programı (Schedule)" listeleme kuralı mimari olarak kusursuzca karşılanmış oluyor.
- **Tekrar Gözden Geçirmek İstediğim Kısım:** `src/App.vue` dosyasındaki pist renderlama alanı. Atların pistteki ilerleyişi şimdilik container genişliğine bağlı statik bir piksel çarpanıyla (`horse.position * 4.5px`) hesaplanıyor. Gerçek bir üretim (production) senaryosunda, ekran boyutlarına tam uyum sağlaması için burayı esnek bir bounding-box hesaplamasına geçirmek veya HTML5 Canvas ile çizdirmek daha doğru bir yaklaşım olacaktır.

#### 3. Gereksinimleri 10 katına çıkarsaydık (200 at, 60 yarış, çok oyunculu canlı izleyiciler) ilk kırılacak fonksiyon veya bileşen hangisi olurdu? Nedenini açıklayın.
- **Kırılma Noktası:** `src/store/gameStore.ts` içindeki aktif koşan atları dönen `gameLoop()` döngüsü.
- **Neden:** Mevcut yapıda yarışın anlık kare hesaplamaları tamamen kullanıcının tarayıcısında (client-side) sırasıyla yapılmaktadır. Eğer sistem 60 eşzamanlı yarışa ve canlı izleyicilere ölçeklenirse, her kullanıcının bilgisayarındaki saat/işlemci farkından dolayı yarış senkronizasyonları tamamen kayar ve CPU darboğazları oluşur. Bu gereksinim altında mimarinin tamamen değişmesi gerekir: Yarış simülasyonu sunucuda (server-side) koşturulmalı ve istemcilere WebSockets (örneğin Socket.io) üzerinden sadece anlık konum verisi akıtılmalıdır.

#### 4. Yarın ekibe yeni bir takım arkadaşı katılsaydı, bu kod tabanı hakkında ona söyleyeceğiniz ilk şey ne olurdu?
"Arayüz katmanı tamamen pasiftir ve hiçbir iş mantığı taşımaz. Atların nasıl koştuğunu, turnuvanın nasıl oluşturulduğunu veya sonuçların nasıl kaydedildiğini değiştirmek istiyorsan sadece ve sadece `src/store/gameStore.ts` dosyasına bakmalısın. `App.vue` içinde kesinlikle yerel bir interval veya state mutasyonu yazma."

---

### Süreç Hakkında

#### 1. Bu projede sizin için en zor kısım neydi ve nasıl çözdünüz?
Yarışı "Duraklat/Devam Et" (Pause/Resume) mekanizmasının, atların konumlarında kaymaya veya sıfırlanmaya yol açmamasını sağlamaktı. Bunu `requestAnimationFrame` ID'lerini güvenli bir şekilde yöneterek çözdüm. Yarış durdurulduğunda animasyon karesini tamamen iptal ediyor, tekrar başlatıldığında ise store'daki mevcut at pozisyonlarını hiç bozmadan döngüyü kaldığı milimetreden tetikliyoruz.

#### 2. Dökümanın sessiz kaldığı (belirtmediği) yerlerde ne gibi varsayımlarda bulundunuz?
Dökümanda atların kondisyonunun yarışın farklı mesafelerinde dinamik bir yorulma etkisi yaratıp yaratmayacağı belirtilmemişti. Ben uzun mesafeli yarışlarda "stamina" algısının ön plana çıkması gerektiğini varsaydım ve formüle mesafeye bağlı bir zorluk çarpanı ekleyerek uzun laplerde düşük kondisyonlu atların dezavantajını derinleştirdim.

#### 3. Neleri yetiştiremeyip elediniz ve bir haftanız daha olsaydı neleri inşa ederdiniz?
Yarım yamalak çok fazla özellik eklemek yerine, dökümandaki **%60'lık Temel Kuralları (Core Specs) eksiksiz ve pürüzsüz** sunmaya odaklandım. 
Eğer bir haftam daha olsaydı, "Anlamlı birim testleri (Unit Tests)" bonus seçeneğini seçerek Vitest ile store içindeki yarış simülasyon döngüsünün tüm sınır durumlarını (edge cases) test ederdim. Ayrıca emojiler yerine retro piksel animasyonlu at görselleri entegre ederdim.

---

### Yapay Zeka (AI) İş Akışı Hakkında

#### 1. Hangi kararları yapay zekaya devrettiniz, hangilerini kendiniz üstlendiniz?
- **Devredilenler:** CSS grid/flex tasarımlarının iskeletini yazmak, TypeScript tip arayüzlerini (interfaces) hızlıca oluşturmak ve Vite/TS config dosyalarının şablonlarını hazırlatmak.
- **Üstlenilenler:** Şans ve kondisyon arasındaki hassas dengeyi kuran simülasyon formülünün tasarımı, Pinia store sınırlarının çizilmesi ve turnuva fikstürünün önceden üretilmesi mantığının kurgulanması.

#### 2. Yapay zekanın önerdiği bir yolu reddedip farklı bir yöntem seçtiğiniz durum oldu mu? Ne oldu ve neden?
Yayap zeka ilk başta atları hareket ettirmek için standart bir JavaScript `setInterval` döngüsü kurmayı önerdi ve bunun süre yönetiminin daha kolay olduğunu savundu. Ancak interval yapıları tarayıcı sekmeleri arka plana alındığında veya yoğun render süreçlerinde takılma ve titreme (stuttering) yaptığı için bu öneriyi reddettim. Tarayıcının yenileme hızıyla doğrudan senkronize çalışan, çok daha performanslı `requestAnimationFrame` mimarisini tercih ettim.

#### 3. Yapay zekanın sizi yanlış yönlendirdiği bir yer oldu mu? Bunu nasıl fark ettiniz?
Klasörleme yapısı kurulurken, yapay zeka bazı alt bileşenlerin (components) içine yanlışlıkla yerel state'ler (local interval/tracking) koymaya çalıştı. Bu durum, dökümandaki "Tüm oyun durumu store içinde yaşamalı, bileşenlere dağılmamalı" kilit kuralını doğrudan ihlal ediyordu. Kod incelemesi (code review) esnasında bu sızıntıyı fark ettim, bileşenleri temizleyip tüm fonksiyonel tetikleyicileri yeniden store aksiyonları (actions) altına topladım.
