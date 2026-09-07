# Blog Yönetim Paneli (SPA)

Bu proje, REST API (JSONPlaceholder) kullanılarak Vanilla JavaScript ile sıfırdan geliştirilmiş, tek sayfalık bir web uygulamasıdır (Single Page Application). Dışarıdan sağlanan ham verilerin asenkron olarak çekilip, modern bir yönetim paneli arayüzünde (Dashboard) işlenmesini simüle eder.

## 🚀 Temel Özellikler

- **Tam Kapsamlı CRUD:** API üzerinden GET, POST, PUT ve DELETE işlemlerinin `fetch` ve async/await yapısıyla asenkron yönetimi.
- **Asimptotik Veri Eşleştirme:** Kullanıcı ve gönderi ilişkilerinin performans kaybı yaşatmaması için O(1) karmaşıklığında çalışan global Hash Map (Sözlük) mimarisi.
- **Algoritmik Filtreleme ve Sayfalama:** İstemci taraflı (client-side) anlık arama, yazar bazlı filtreleme ve 10'ar öğelik sayfalama (pagination) algoritması.
- **Veri Kalıcılığı ve Yetkilendirme (LocalStorage):** Kullanıcının eklediği yeni kayıtların tarayıcı belleğinde kalıcı olarak saklanması ve sistemde sadece oturum sahibi Admin'in gönderilerinde Düzenle/Sil butonlarının aktifleşmesi.
- **Modern UI/UX:** CSS Variables ile tek tıkla değişen Karanlık Mod (Dark Mode), dinamik Toast bildirimleri ve yazar detaylarını/yorumları getiren Modal pencereler.

## 🛠️ Kullanılan Teknolojiler

- HTML5 (Semantik Web Yapısı)
- CSS3 (Flexbox, CSS Grid, Custom Properties)
- Vanilla JavaScript (ES6+, DOM Manipülasyonu)
- JSONPlaceholder (Mock REST API)
