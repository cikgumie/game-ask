# Misi Nusa Logika 3D — Struktur Projek

Projek ini telah disusun semula ke dalam struktur modular yang kemas, teratur, dan mudah diselenggara.

---

## 📁 Struktur Direktori & Fail

```
ASK GAME/
├── index.html                   # Titik masuk utama (standard pelayan web / hosting)
├── Misi_Nusa_Logika_3D.html     # Fail HTML asal (kini dipautkan ke modul luaran)
├── README.md                    # Dokumentasi struktur fail
├── css/
│   └── style.css                # Semua gaya, susun atur, HUD, tema dan cetakan sijil
├── js/
│   ├── lib/
│   │   └── three.min.js         # Pustaka grafik 3D (Three.js r180)
│   ├── data.js                  # Data pulau, soalan ASK Tingkatan 1, cabaran bos & laluan
│   ├── audio.js                 # Sintesis bunyi & kesan audio tempatan (Web Audio API)
│   ├── world3d.js               # Dunia 3D Nusa3D (kamera, pencahayaan, pulau, watak, efek)
│   └── game.js                  # Logik permainan, pengurusan keadaan, dialog, & kawalan
└── backup/
    └── Misi_Nusa_Logika_3D.backup.html  # Salinan sandaran fail tunggal asal (monolithic)
```

---

## 🧩 Penerangan Setiap Modul

| Fail | Peranan & Kandungan |
| :--- | :--- |
| **`index.html` / `Misi_Nusa_Logika_3D.html`** | Struktur HTML semantik permainan: kontena canvas 3D, antara muka HUD, laci menu pengembara, dialog soalan, dan pautan skrip. |
| **`css/style.css`** | Format CSS teratur lengkap dengan pemboleh ubah warna, reka bentuk responsif (telefon, tablet, desktop), paparan skrin penuh, dan mod cetak sijil. |
| **`js/lib/three.min.js`** | Enjin grafik Three.js (r180) yang diasingkan daripada fail HTML utama, mengurangkan saiz fail HTML daripada ~2.1MB kepada ~5.8KB. |
| **`js/data.js`** | Mengandungi array `regions` (Kampung Leraian, Hutan Corak, Tasik Peniskalaan, Menara Pengitlakan), `bossTasks` (Istana Raja Kabut), `islandAreas`, dan `bridgeLinks`. Mudah untuk guru/pembangun menambah soalan baharu. |
| **`js/audio.js`** | Penjana kesan bunyi (SFX) berasaskan Web Audio API untuk langkah kaki, pilihan jawapan, bunyi betul/salah, kristal, dan muzik kemenangan tanpa memerlukan fail MP3 luaran. |
| **`js/world3d.js`** | Pengurusan dunia 3D Three.js (`window.Nusa3D`): penjanaan pulau poli-rendah (low-poly), watak 3D dengan topi & mantel, animasi air, halangan jambatan bercahaya, dan sistem kamera. |
| **`js/game.js`** | Pengawal logik: penyimpanan kemajuan (`localStorage`), pergerakan watak di atas pulau & jambatan, pembukaan dialog kuiz, pengiraan markah XP, dan gelung animasi utama (`requestAnimationFrame`). |

---

## 🚀 Cara Menjalankan

1. **Buka Terus (Offline)**: Klik dua kali pada `index.html` atau `Misi_Nusa_Logika_3D.html` dalam mana-mana pelayar web moden (Google Chrome, Microsoft Edge, Safari, Firefox).
2. **Pelayan Tempatan (Local Server)**:
   ```bash
   python3 -m http.server 8080
   ```
   kemudian buka `http://localhost:8080` pada pelayar anda.
