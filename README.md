# Odak — Görev Yöneticisi

React ile yazdığım bir görev yönetim panosu. Görevleri alanlara ayırıp öncelik, tarih ve alt görevlerle takip ediyor, her görev için çalışma süresi tutuyor.

**Canlı demo:** https://nisanur-task-manager.netlify.app

## Özellikler

- Görev ekleme, düzenleme, silme ve tamamlama
- Alanlar (Freelance, Okul, Kişisel…) ve kategoriler; yeni alan/kategori ekleme
- Öncelik, bitiş tarihi, alt görevler ve otomatik hesaplanan ilerleme yüzdesi
- Görev başına zamanlayıcı (aynı anda tek görev çalışır)
- Son 7 günün çalışma grafiği, haftalık aktivite ve genel ilerleme kartları
- Ajanda ve hatırlatmalar (bugün / gecikmiş görevler)
- Notlar ve son iki haftanın aktivite akışı
- Arama, liste/ızgara görünümü, mobil uyumlu tasarım
- Veriler tarayıcının `localStorage` alanında saklanır

## Çalıştırma

```bash
npm install
npm run dev
```

Üretim derlemesi için `npm run build` (çıktı `dist/` klasörüne yazılır).

## Teknolojiler

React 19 · Vite · saf CSS
