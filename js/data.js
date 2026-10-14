/**
 * Misi Nusa Logika 3D — Data Permainan & Kurikulum ASK Tingkatan 1
 * Mengandungi maklumat 7 pulau silibus ASK (Bab 1: Pemikiran Komputasional &
 * Bab 2: Perwakilan Data), cabaran bos, koordinat 10 pulau, serta laluan jambatan.
 */
'use strict';

const regions=[
 // === ALAM 1: ASAS PEMIKIRAN KOMPUTASIONAL (BAB 1) ===
 {
  realm:'bab1',
  realmTitle:'Bab 1: Pemikiran Komputasional',
  name:'Kampung Leraian',
  tech:'Leraian',
  npc:'Tok Bina',
  color:'#dc9540',
  bg:'#fff0d6',
  x:185,
  y:425,
  definition:'Memecahkan masalah atau tugasan besar kepada bahagian yang lebih kecil supaya lebih mudah diselesaikan.',
  example:'Mengurus jamuan kelas dengan membahagikan tugasan kepada menu, bahan, penyediaan makanan dan hidangan.',
  sp:'1.1.1, 1.1.2',
  intro:'Jambatan kampung rosak! Tok Bina memerlukan bantuan anda untuk membahagikan kerja dan membina semula jambatan.',
  tasks:[
   {type:'multi',title:'Bahagikan kerja membina jambatan',text:'Pilih tiga subtugasan yang membantu menyelesaikan masalah jambatan rosak.',options:['Periksa bahagian yang rosak','Kumpulkan bahan binaan','Pasang dan uji jambatan','Pilih lagu kegemaran'],answer:[0,1,2],hint:'Setiap tugasan mesti menyumbang kepada pembaikan jambatan.',why:'Leraian membahagikan pembaikan jambatan kepada pemeriksaan, pengumpulan bahan serta pemasangan dan pengujian.'},
   {type:'order',title:'Bina jambatan secara tertib',text:'Susun langkah dari atas ke bawah. Gunakan butang naik dan turun.',options:['Uji keselamatan jambatan','Periksa kerosakan jambatan','Pasang papan baharu','Sediakan bahan mengikut kerosakan'],answer:[1,3,2,0],hint:'Kenal pasti kerosakan sebelum memilih bahan. Uji selepas pemasangan.',why:'Urutan yang sesuai ialah periksa kerosakan, sediakan bahan, pasang papan dan uji keselamatan.'},
   {type:'match',title:'Padanan Komponen Leraian',text:'Klik item di sebelah kiri, kemudian klik pasangannya di sebelah kanan untuk memadankan tugasan binaan.',pairs:[{left:'Penyediaan Bahan',right:'Kumpulkan kayu, paku dan tali yang kukuh'},{left:'Pemeriksaan Struktur',right:'Kenal pasti bahagian tiang yang reput'},{left:'Pemasangan Papan',right:'Susun dan paku lantai laluan pejalan kaki'},{left:'Ujian Keselamatan',right:'Uji daya tampung sebelum dibuka kepada umum'}],hint:'Fikirkan fungsi utama setiap fasa pembaikan jambatan.',why:'Leraian memisahkan projek jambatan kepada fasa bahan, pemeriksaan, binaan dan pengujian.'}
  ]
 },
 {
  realm:'bab1',
  realmTitle:'Bab 1: Pemikiran Komputasional',
  name:'Hutan Corak',
  tech:'Pengecaman Corak',
  npc:'Rimba',
  color:'#249277',
  bg:'#def5e8',
  x:390,
  y:235,
  definition:'Mengenal pasti persamaan, perbezaan dan corak yang berulang dalam sesuatu situasi untuk membantu penyelesaian masalah.',
  example:'Mengesan langkah semakan bekalan kuasa yang sama apabila beberapa komputer tidak dapat dihidupkan.',
  sp:'1.1.1, 1.1.3',
  intro:'Laluan hutan tersembunyi di sebalik simbol berulang. Rimba meminta anda membaca corak untuk menyalakan obor hutan.',
  tasks:[
   {type:'choice',title:'Simbol pada pintu hutan',text:'Apakah simbol yang melengkapkan corak berulang berikut?',art:'◆ ● ▲   ◆ ● ▲   ◆ ● ?',options:['◆','▲','●'],answer:1,hint:'Bahagikan urutan kepada kumpulan tiga simbol.',why:'Kumpulan ◆ ● ▲ berulang. Selepas ◆ ●, simbol yang seterusnya ialah ▲.'},
   {type:'choice',title:'Jejak batu bercahaya',text:'Bilangan cahaya bertambah dengan beza yang tetap. Berapakah nilai seterusnya?',art:'3 → 7 → 11 → 15 → ?',options:['18','19','20'],answer:1,hint:'Bandingkan beza antara dua nombor bersebelahan.',why:'Setiap nombor bertambah 4. Maka 15 + 4 = 19. Anda telah mengenal pasti corak pertambahan.'},
   {type:'match',title:'Padanan Corak Nombor & Simbol',text:'Padankan jujukan corak dengan peraturan pola atau nilai perubahannya.',pairs:[{left:'2, 4, 6, 8, ...',right:'Pola gandaan dua / tambah 2 setiap langkah'},{left:'1, 3, 9, 27, ...',right:'Pola gandaan tiga / darab 3 setiap langkah'},{left:'▲ ■ ▲ ■ ...',right:'Corak berselang dua bentuk geometri'},{left:'50, 45, 40, ...',right:'Pola menurun dengan tolak 5'}],hint:'Perhatikan beza atau operasi matematik antara nombor bersebelahan.',why:'Pengecaman corak mengenal pasti hukum matematik dan pengulangan jujukan.'}
  ]
 },
 {
  realm:'bab1',
  realmTitle:'Bab 1: Pemikiran Komputasional',
  name:'Tasik Peniskalaan',
  tech:'Peniskalaan',
  npc:'Nila',
  color:'#3b8bc4',
  bg:'#e0f1ff',
  x:755,
  y:270,
  definition:'Menumpukan aspek penting dalam sesuatu masalah dan mengabaikan aspek yang kurang penting.',
  example:'Untuk memilih laluan ke sekolah, fokus pada jarak dan keselamatan; warna rumah di tepi jalan tidak diperlukan.',
  sp:'1.1.1, 1.1.4',
  intro:'Peta tasik dipenuhi maklumat yang mengelirukan. Nila memerlukan maklumat penting sahaja untuk merancang perjalanan selamat.',
  tasks:[
   {type:'multi',title:'Pilih maklumat perjalanan',text:'Sebuah bot hendak membawa 10 murid menyeberang tasik dengan selamat. Pilih tiga maklumat yang penting.',options:['Had penumpang bot','Warna kasut murid','Keadaan cuaca','Bilangan jaket keselamatan'],answer:[0,2,3],hint:'Fokus pada kapasiti dan keselamatan penyeberangan.',why:'Had penumpang, cuaca dan jaket keselamatan menentukan keselamatan. Warna kasut tidak mempengaruhi keputusan ini.'},
   {type:'choice',title:'Peta yang membantu',text:'Anda mahu mencari jalan paling pendek ke klinik. Apakah maklumat utama yang perlu dipaparkan pada peta?',options:['Nama kedai dan warna bumbung','Laluan, lokasi klinik dan jarak','Jenis bunga dan warna pagar'],answer:1,hint:'Apakah yang membantu anda membandingkan panjang perjalanan?',why:'Laluan, lokasi klinik dan jarak membolehkan anda memilih jalan terpendek. Maklumat hiasan boleh diketepikan.'},
   {type:'match',title:'Asingkan Maklumat Relevan',text:'Padankan matlamat tugasan dengan maklumat utama yang perlu difokuskan (peniskalaan).',pairs:[{left:'Membeli tiket bas ekspres',right:'Masa bertolak, destinasi dan harga tiket'},{left:'Menempah baju sukan kelas',right:'Saiz badan murid dan bilangan kuantiti'},{left:'Memasak nasi ayam',right:'Bahan masakan, sukatan air dan masa menanak'},{left:'Menghantar bungkusan pos',right:'Alamat penerima, poskod dan berat bungkusan'}],hint:'Abaikan butiran remeh seperti warna baju semasa membeli tiket.',why:'Peniskalaan memberi tumpuan hanya pada maklumat kritikal untuk mencapai matlamat.'}
  ]
 },
 {
  realm:'bab1',
  realmTitle:'Bab 1: Pemikiran Komputasional',
  name:'Menara Pengitlakan',
  tech:'Pengitlakan',
  npc:'Arif',
  color:'#9366c7',
  bg:'#f0e7fc',
  x:945,
  y:465,
  definition:'Membina kaedah umum berdasarkan ciri kesamaan supaya kaedah itu boleh digunakan untuk menyelesaikan masalah sejenis.',
  example:'Kaedah pinjaman yang sama boleh digunakan untuk buku, tablet dan alat sukan: semak ketersediaan, rekod peminjam, serahkan item.',
  sp:'1.1.1, 1.1.5',
  intro:'Tiga menara menggunakan sistem pinjaman berbeza. Arif mahu satu kaedah umum yang boleh digunakan untuk semua item.',
  tasks:[
   {type:'choice',title:'Satu kaedah, pelbagai item',text:'Buku, tablet dan bola semuanya boleh dipinjam. Pilih kaedah umum yang sesuai.',options:['Semak item tersedia → rekod peminjam → serahkan item','Hanya buku perlu direkodkan','Gunakan warna item untuk memilih peminjam'],answer:0,hint:'Kaedah mesti sesuai untuk ketiga-tiga jenis item.',why:'Semakan ketersediaan, rekod peminjam dan penyerahan ialah langkah yang boleh digunakan untuk semua item pinjaman.'},
   {type:'match',title:'Model & Formula Universal',text:'Padankan masalah harian dengan formula atau model umum pengitlakan.',pairs:[{left:'Kira luas segi empat tepat',right:'Panjang × Lebar (terpakai untuk semua bilik)'},{left:'Kira purata markah ujian',right:'Jumlah markah ÷ Bilangan murid'},{left:'Sistem pinjaman barang sekolah',right:'Semak stok → Catat peminjam → Serah item'},{left:'Membancuh minuman kordial',right:'Nisbah pati kordial + Sukatan air'}],hint:'Pengitlakan membina satu formula universal yang sah untuk semua nilai.',why:'Formula dan prosedur piawai ialah hasil pengitlakan untuk menyelesaikan masalah serupa.'},
   {type:'multi',title:'Ciri bersama sistem pinjaman',text:'Apakah tiga ciri yang diperlukan untuk pinjaman buku dan tablet?',options:['Identiti peminjam','Tarikh pemulangan','Tajuk novel','Item yang dipinjam'],answer:[0,1,3],hint:'Pilih ciri yang berkaitan dengan kedua-dua jenis pinjaman.',why:'Identiti, tarikh pemulangan dan item ialah ciri bersama. Tajuk novel hanya berkaitan dengan buku tertentu.'}
  ]
 },

 // === ALAM 2: PERWAKILAN DATA (BAB 2) ===
 {
  realm:'bab2',
  realmTitle:'Bab 2: Perwakilan Data',
  name:'Pulau Bit & Perduaan',
  tech:'Sistem Nombor Perduaan',
  npc:'Bitara',
  color:'#00d2ee',
  bg:'#d8f9ff',
  x:1300,
  y:470,
  definition:'Sistem nombor asas dua yang menggunakan hanya dua digit iaitu 0 dan 1 untuk mewakili semua data dan arahan dalam komputer.',
  example:'Digit 1 mewakili litar ON (ada isyarat elektrik) manakala digit 0 mewakili suis OFF (tiada isyarat elektrik).',
  sp:'2.1.1, 2.1.2, 2.1.3',
  intro:'Selamat datang ke Alam Perwakilan Data! Bitara memerlukan anda memecahkan kod perduaan untuk mengaktifkan teras neon pulau.',
  tasks:[
   {type:'match',title:'Padanan Perpuluhan & Perduaan',text:'Padankan nombor perpuluhan (asas 10) dengan nombor perduaan (asas 2) yang sepadan.',pairs:[{left:'Nombor 5',right:'101₂ (4 + 0 + 1)'},{left:'Nombor 8',right:'1000₂ (8 + 0 + 0 + 0)'},{left:'Nombor 10',right:'1010₂ (8 + 0 + 2 + 0)'},{left:'Nombor 13',right:'1101₂ (8 + 4 + 0 + 1)'}],hint:'Gunakan nilai tempat asas dua: 8, 4, 2, 1.',why:'Contoh: 1010₂ = (1×8) + (0×4) + (1×2) + (0×1) = 10.'},
   {type:'choice',title:'Nilai Tempat Bit Kelima',text:'Apakah nilai tempat bagi bit kelima (dari kanan) dalam sistem nombor perduaan?',options:['16 (iaitu 2⁴)','32 (iaitu 2⁵)','8 (iaitu 2³)'],answer:0,hint:'Nilai tempat bermula dari kanan: 1 (2⁰), 2 (2¹), 4 (2²), 8 (2³), 16 (2⁴)...',why:'Bit kelima mempunyai nilai tempat 2⁴ = 16.'},
   {type:'multi',title:'Operasi Tambah Perduaan',text:'Pilih dua hasil tambah nombor perduaan yang tepat.',options:['1₂ + 0₂ = 1₂','1₂ + 1₂ = 10₂','0₂ + 0₂ = 1₂','1₂ + 1₂ = 2₂'],answer:[0,1],hint:'Dalam perduaan, 1 + 1 bersamaan 2 dalam perpuluhan, ditulis sebagai 10₂ (0 bawa 1 ke hadapan).',why:'1 + 0 = 1₂ dan 1 + 1 = 10₂ adalah operasi asas logik perduaan.'}
  ]
 },
 {
  realm:'bab2',
  realmTitle:'Bab 2: Perwakilan Data',
  name:'Lembah Ukuran Data',
  tech:'Ukuran Data & Storan',
  npc:'Baitah',
  color:'#e91e63',
  bg:'#ffe4ee',
  x:1600,
  y:290,
  definition:'Hierarki unit ukuran saiz data komputer daripada unit terkecil (bit) sehingga terabait (TB).',
  example:'1 aksara teks menggunakan 1 Bait (8 bit). Pemacu kilat 32 GB boleh menyimpan puluhan ribu dokumen dan lagu.',
  sp:'2.2.1, 2.2.2',
  intro:'Gudang memori Lembah Ukuran Data hampir sesak! Bantu Baitah menentukur dan menukar unit ukuran storan fail.',
  tasks:[
   {type:'match',title:'Padanan Unit Ukuran Storan',text:'Padankan unit ukuran data dengan nilai pertukaran yang setara.',pairs:[{left:'1 Bait (Byte)',right:'8 Bit (Aksara asas)'},{left:'1 Kilobait (KB)',right:'1024 Bait'},{left:'1 Megabait (MB)',right:'1024 Kilobait (KB)'},{left:'1 Gigabait (GB)',right:'1024 Megabait (MB)'}],hint:'Setiap kenaikan unit storan komputer digandakan dengan 1024 (2¹⁰).',why:'Komputer menggunakan asas binari 1024: 1 KB = 1024 Bait, 1 MB = 1024 KB, 1 GB = 1024 MB.'},
   {type:'order',title:'Susunan Tertib Unit Ukuran',text:'Susun unit ukuran data dari yang TERKECIL di atas ke yang TERBESAR di bawah.',options:['Megabait (MB)','Bit','Gigabait (GB)','Bait','Kilobait (KB)'],answer:[1,3,4,0,2],hint:'Bit adalah yang paling kecil, diikuti Bait, KB, MB dan GB.',why:'Urutan saiz yang betul: Bit → Bait → Kilobait (KB) → Megabait (MB) → Gigabait (GB).'},
   {type:'choice',title:'Kiraan Saiz Aksara Teks',text:'Perkataan "NUSA" mengandungi 4 aksara. Berapakah jumlah bit yang diperlukan untuk menyimpan perkataan ini?',options:['32 bit (4 aksara × 8 bit)','16 bit (4 aksara × 4 bit)','8 bit (1 bait sahaja)'],answer:0,hint:'1 aksara = 1 Bait = 8 bit. Darabkan 4 aksara dengan 8 bit.',why:'4 aksara = 4 Bait. 4 × 8 bit = 32 bit.'}
  ]
 },
 {
  realm:'bab2',
  realmTitle:'Bab 2: Perwakilan Data',
  name:'Teluk Imej & Audio',
  tech:'Imej & Audio Digital',
  npc:'Piksela',
  color:'#00c853',
  bg:'#d8fde7',
  x:1900,
  y:480,
  definition:'Perwakilan visual dan audio dalam bentuk data digital melalui resolusi piksel, kedalaman bit warna dan pensampelan audio.',
  example:'Imej beresolusi 1920×1080 mengandungi lebih dua juta piksel untuk paparan definisi tinggi (Full HD).',
  sp:'2.2.3, 2.2.4',
  intro:'Piksela sedang mengadun grafik dan gelombang bunyi! Selaraskan resolusi dan kadar pensampelan untuk kualiti audio visual terbaik.',
  tasks:[
   {type:'match',title:'Konsep Multimedia Digital',text:'Padankan istilah multimedia digital dengan maksud yang tepat.',pairs:[{left:'Resolusi Imej',right:'Dimensi bilangan piksel (lebar × tinggi)'},{left:'Kedalaman Bit Warna',right:'Bilangan bit warna bagi setiap piksel'},{left:'Kadar Pensampelan Audio',right:'Kekerapan sampel audio sesaat (Hertz)'},{left:'Saluran Audio Stereo',right:'Menggunakan dua saluran audio (kiri dan kanan)'}],hint:'Resolusi melibatkan piksel, kedalaman bit menentukan julat warna, dan sampel mengukur frekuensi audio.',why:'Resolusi, kedalaman warna, kadar sampel dan saluran adalah penentu kualiti dan saiz fail digital.'},
   {type:'choice',title:'Kesan Peningkatan Kedalaman Bit',text:'Sekiranya kedalaman bit warna imej dinaikkan daripada 8-bit (256 warna) kepada 24-bit (16.7 juta warna), apakah kesannya?',options:['Warna imej lebih realistik dan saiz fail imej bertambah','Imej menjadi hitam putih dan saiz fail berkurangan','Resolusi imej menurun secara automatik'],answer:0,hint:'Lebih banyak bit bermakna lebih banyak variasi warna dan lebih banyak bait storan digunakan.',why:'Kedalaman bit yang lebih tinggi menghasilkan warna yang kaya dan kualiti tinggi tetapi memerlukan saiz fail yang lebih besar.'},
   {type:'multi',title:'Faktor Penentu Saiz Fail Audio',text:'Pilih tiga faktor utama yang menentukan saiz fail bagi sesuatu rakaman audio digital.',options:['Kadar pensampelan (Hz)','Kedalaman bit audio','Tempoh masa rakaman (saat)','Warna mikrofon yang digunakan'],answer:[0,1,2],hint:'Formula saiz audio: Kadar Sampel × Kedalaman Bit × Saluran × Masa ÷ 8.',why:'Saiz fail audio ditentukan oleh kadar sampel, kedalaman bit, bilangan saluran dan durasi masa rakaman.'}
  ]
 }
];

// Cabaran Bos Bab 1: Istana Raja Kabut
const bossTasks=[
 {type:'choice',title:'Perisai pertama · Leraian',text:'Festival sekolah memerlukan persembahan, makanan dan pendaftaran. Pilih tindakan yang meleraikan tugasan.',options:['Bahagikan kerja kepada tiga pasukan mengikut tugasan','Pilih satu warna poster','Anggap semua kerja sebagai satu tugasan sahaja'],answer:0,why:'Membahagikan kerja mengikut persembahan, makanan dan pendaftaran memudahkan penyelesaian setiap bahagian.',hint:'Bina bahagian kecil daripada tugasan besar.'},
 {type:'choice',title:'Perisai kedua · Pengecaman Corak',text:'Kaunter A dan B menerima nama, kelas dan jenis aktiviti sebelum mengesahkan peserta. Apakah corak yang sama?',options:['Kedua-duanya mesti berada di lokasi sama','Kedua-duanya menggunakan urutan pendaftaran yang sama','Kedua-duanya mempunyai petugas sama'],answer:1,why:'Kedua-dua kaunter menerima maklumat peserta sebelum pengesahan. Ini persamaan dalam langkah kerja.',hint:'Perhatikan urutan kerja yang berulang.'},
 {type:'multi',title:'Perisai ketiga · Peniskalaan',text:'Untuk menentukan bilangan makanan peserta, pilih dua maklumat yang diperlukan.',options:['Bilangan peserta hadir','Warna beg peserta','Bilangan hidangan bagi setiap peserta','Jenis telefon peserta'],answer:[0,2],why:'Bilangan peserta dan hidangan setiap peserta menentukan kuantiti makanan. Maklumat lain tidak diperlukan.',hint:'Fokus pada maklumat yang mempengaruhi kuantiti makanan.'},
 {type:'choice',title:'Perisai terakhir · Pengitlakan',text:'Kaedah umum pendaftaran festival berjaya. Bagaimanakah anda menggunakannya untuk hari sukan?',options:['Salin semua nama peserta festival tanpa semakan','Cipta kaedah yang langsung berbeza walaupun keperluan sama','Gunakan semula langkah umum dengan maklumat peserta hari sukan'],answer:2,why:'Langkah umum boleh digunakan semula untuk masalah sejenis. Data perlu disesuaikan dengan acara baharu.',hint:'Gunakan kaedah umum yang sesuai, dengan data baharu.'}
];

// Cabaran Bos Bab 2: Teras CyberByte
const cyberBossTasks=[
 {type:'choice',title:'Protokol 1 · Kod Perduaan',text:'Tukarkan nombor perpuluhan 25 kepada nombor perduaan.',options:['11001₂ (16 + 8 + 1)','10101₂ (16 + 4 + 1)','11100₂ (16 + 8 + 4)'],answer:0,hint:'25 = 16 + 8 + 1 = 11001₂.',why:'16 + 8 + 0 + 0 + 1 = 25 perpuluhan, bersamaan 11001₂.'},
 {type:'match',title:'Protokol 2 · Penukaran Storan Data',text:'Padankan saiz fail dengan nilai bait yang setara.',pairs:[{left:'2 Kilobait (KB)',right:'2048 Bait'},{left:'4 Bait (Byte)',right:'32 Bit'},{left:'1 Terabait (TB)',right:'1024 Gigabait (GB)'},{left:'1.5 Megabait (MB)',right:'1536 Kilobait (KB)'}],hint:'Darabkan dengan 1024 bagi setiap peningkatan unit bait.',why:'2 KB = 2 × 1024 = 2048 Bait. 4 Bait = 4 × 8 = 32 Bit.'},
 {type:'choice',title:'Protokol 3 · Pengiraan Saiz Imej',text:'Imej berukuran 100 × 100 piksel dengan kedalaman warna 8-bit (1 bait). Berapakah saiz fail imej tersebut?',options:['10,000 Bait (kira-kira 9.76 KB)','1,000 Bait','80,000 Kilobait'],answer:0,hint:'Saiz imej = 100 × 100 × 8 bit ÷ 8 = 10,000 Bait.',why:'100 × 100 piksel = 10,000 piksel. 10,000 piksel × 1 bait/piksel = 10,000 Bait.'},
 {type:'choice',title:'Protokol Akhir · Integriti Data Digital',text:'Mengapakah komputer memproses semua teks, imej dan audio dalam format perduaan (0 dan 1)?',options:['Kerana litar elektronik komputer beroperasi dengan kehadiran arus (ON) dan ketiadaan arus (OFF)','Kerana sistem perduaan hanya boleh digunakan untuk teks perkataan','Kerana nombor perduaan lebih mudah dikira oleh manusia berbanding perpuluhan'],answer:0,hint:'Fikirkan fungsi fizikal mikrocip dan transistor.',why:'Transistor dalam pemproses hanya mengenali dua keadaan isyarat voltan: voltan tinggi (1) dan voltan rendah (0).'}
];

// Konfigurasi 10 pulau (Kepulauan Alam 1 & Alam 2)
const islandAreas=[
 // Alam 1: Pemikiran Komputasional (0 - 5)
 {x:185,  y:425, r:6.2, name:'Kampung Leraian'},
 {x:390,  y:235, r:5.8, name:'Hutan Corak'},
 {x:755,  y:270, r:6.0, name:'Tasik Peniskalaan'},
 {x:945,  y:465, r:5.6, name:'Menara Pengitlakan'},
 {x:575,  y:80,  r:5.4, name:'Istana Raja Kabut'},
 {x:550,  y:545, r:3.2, name:'Pulau Permulaan'},
 // Alam 2: Perwakilan Data (6 - 9)
 {x:1300, y:470, r:6.2, name:'Pulau Bit & Perduaan'},
 {x:1600, y:290, r:6.0, name:'Lembah Ukuran Data'},
 {x:1900, y:480, r:6.4, name:'Teluk Imej & Audio'},
 {x:1620, y:680, r:5.8, name:'Teras CyberByte'}
];

// Konfigurasi 10 jambatan menghubungkan setiap pulau
const bridgeLinks=[
 // Alam 1 (0 - 4)
 {from:0,to:1,points:[[185,425],[245,355],[315,290],[390,235]],color:0x6fe0de,name:'Hutan Corak'},
 {from:1,to:2,points:[[390,235],[500,260],[630,275],[755,270]],color:0x6fe0de,name:'Tasik Peniskalaan'},
 {from:2,to:3,points:[[755,270],[830,325],[900,395],[945,465]],color:0x6fe0de,name:'Menara Pengitlakan'},
 {from:3,to:4,points:[[945,465],[790,480],[630,360],[575,210],[575,80]],color:0xb08af1,name:'Istana Raja Kabut'},
 {from:5,to:0,points:[[550,545],[440,530],[310,490],[185,425]],color:0x6fe0de,name:'Kampung Leraian'},
 // Alam 2 (5 - 9)
 {from:3,to:6,points:[[945,465],[1030,440],[1120,485],[1210,450],[1300,470]],color:0x00e5ff,name:'Pulau Bit & Perduaan'},
 {from:6,to:7,points:[[1300,470],[1390,410],[1480,340],[1600,290]],color:0xff007f,name:'Lembah Ukuran Data'},
 {from:7,to:8,points:[[1600,290],[1710,340],[1810,420],[1900,480]],color:0x00e676,name:'Teluk Imej & Audio'},
 {from:8,to:9,points:[[1900,480],[1820,560],[1730,630],[1620,680]],color:0xffd600,name:'Teras CyberByte'},
 {from:9,to:5,points:[[1620,680],[1350,710],[1050,680],[780,620],[550,545]],color:0x5eead4,name:'Laluan Kembali ke Permulaan'}
];

// Pendedahan kepada skop global untuk kebolehcapaian merentas modul
window.regions = regions;
window.bossTasks = bossTasks;
window.cyberBossTasks = cyberBossTasks;
window.islandAreas = islandAreas;
window.bridgeLinks = bridgeLinks;
