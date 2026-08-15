# KROMA — Güvenli, Minimalist Koyu Mod Görsel Galeri Sitesi

Bu proje; güvenlik öncelikli, sade koyu mod (dark mode) tasarımına sahip, resimlerin kartlar halinde listelendiği, tıklanınca tam ekran detay (lightbox) açıldığı ve altında kullanıcı adının göründüğü web uygulamasıdır.

---

## 🛡️ Güvenlik Özellikleri

1. **XSS & Kod Enjeksiyon Koruması:** Kullanıcı adı, başlık ve kategori alanları HTML temizleme (sanitization) işlemlerinden geçirilir.
2. **Güvenli Dosya Yönetimi:** Veriler `data/gallery.json` dosyasından okunur. Sunucu tarafında dosya yükleme açığı (Arbitrary File Upload), SQL Injection veya komut çalıştırma riskleri **%100 engellenmiştir**.
3. **Güvenlik Başlıkları:** Express sunucusu Content Security Policy (CSP), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff` başlıkları ile korunmaktadır.

---

## 🚀 Yerel Çalıştırma (Local Development)

Sitenizi bilgisayarınızda çalıştırmak için:

1. Terminali açın ve proje dizinine gelin:
   ```bash
   cd c:\Users\ASUS\Desktop\Site
   ```
2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```
3. Sunucuyu başlatın:
   ```bash
   npm start
   ```
4. Tarayıcınızda açın: **http://localhost:3000**

---

## 📸 Nasıl Yeni Resim ve Kullanıcı Adı Eklenir? (Manuel Veri Girişi)

Siteye elle yeni resim ve kullanıcı adı eklemek çok kolaydır:

1. Eklemek istediğiniz görsel dosyasını (örn: `yeni_resim.jpg`) **`public/images/`** klasörü içerisine kopyalayın.
2. **`data/gallery.json`** dosyasını açın ve listenin sonuna yeni bir eleman ekleyin:

```json
[
  {
    "id": "img-004",
    "title": "Yeni Görselinizin Başlığı",
    "username": "kullanici_adiniz",
    "imagePath": "images/yeni_resim.jpg",
    "category": "Doğa",
    "date": "2026-08-15"
  }
]
```

3. Kaydettiğiniz an site otomatik olarak yeni kartı ve kullanıcı adını listeleyecektir!

---

## 🌐 Siteyi Ücretsiz Online Yayınlama (Hosting Rehberi)

Siteyi online yapmak için **Vercel** veya **Render** platformlarını tercih edebilirsiniz (İkisi de %100 ücretsizdir ve Firebase gerektirmez).

### Seçenek 1: Vercel ile Yayınlama (Önerilen — 1 Dakika)
1. Projenizi GitHub hesabınıza yükleyin (`git push`).
2. [Vercel.com](https://vercel.com) sitesine ücretsiz üye olun.
3. **"Add New Project"** butonuna basın ve GitHub deponuzu seçin.
4. **Deploy** butonuna tıklayın! Siteniz anında `https://siteniz.vercel.app` şeklinde ücretsiz SSL ile online olacaktır.

### Seçenek 2: Render.com ile Yayınlama
1. [Render.com](https://render.com) sitesine ücretsiz kaydolun.
2. **New Web Service** seçeneğini belirleyin ve GitHub reponuzu bağlayın.
3. Build Command: `npm install` | Start Command: `npm start` yazarak yayınlayın.

---

## 🎹 Klavye Kısayolları (Lightbox)

- **Görsele Tıklama / Enter:** Tam ekran detay modunu açar.
- **Sağ / Sol Yön Tuşları:** Galeri görselleri arasında hızlıca geçiş yapar.
- **ESC (Escape):** Tam ekran detay modunu kapatır.
- **Kopyala Butonu:** Görselin doğrudan erişim bağlantısını panoya kopyalar.
