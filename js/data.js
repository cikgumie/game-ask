/**
 * Misi Nusa Logika 3D — Data Permainan & Kurikulum ASK Tingkatan 1
 * Mengandungi maklumat 4 pulau teknik pemikiran komputasional, cabaran bos,
 * koordinat pulau, serta laluan jambatan.
 */
'use strict';

const regions=[
{name:'Kampung Leraian',tech:'Leraian',npc:'Tok Bina',color:'#dc9540',bg:'#fff0d6',x:185,y:425,definition:'Memecahkan masalah atau tugasan besar kepada bahagian yang lebih kecil supaya lebih mudah diselesaikan.',example:'Mengurus jamuan kelas dengan membahagikan tugasan kepada menu, bahan, penyediaan makanan dan hidangan.',sp:'1.1.1, 1.1.2',intro:'Jambatan kampung rosak! Tok Bina memerlukan bantuan anda untuk membahagikan kerja dan membina semula jambatan.',tasks:[
{type:'multi',title:'Bahagikan kerja membina jambatan',text:'Pilih tiga subtugasan yang membantu menyelesaikan masalah jambatan rosak.',options:['Periksa bahagian yang rosak','Kumpulkan bahan binaan','Pasang dan uji jambatan','Pilih lagu kegemaran'],answer:[0,1,2],hint:'Setiap tugasan mesti menyumbang kepada pembaikan jambatan.',why:'Leraian membahagikan pembaikan jambatan kepada pemeriksaan, pengumpulan bahan serta pemasangan dan pengujian.'},
{type:'order',title:'Bina jambatan secara tertib',text:'Susun langkah dari atas ke bawah. Gunakan butang naik dan turun.',options:['Uji keselamatan jambatan','Periksa kerosakan jambatan','Pasang papan baharu','Sediakan bahan mengikut kerosakan'],answer:[1,3,2,0],hint:'Kenal pasti kerosakan sebelum memilih bahan. Uji selepas pemasangan.',why:'Urutan yang sesuai ialah periksa kerosakan, sediakan bahan, pasang papan dan uji keselamatan.'},
{type:'choice',title:'Leraian dalam kehidupan murid',text:'Anda perlu menyiapkan majalah kelas. Apakah tindakan yang menggunakan teknik leraian?',options:['Bahagikan kerja kepada menulis artikel, mengambil gambar dan menyusun halaman','Siapkan semua perkara serentak tanpa rancangan','Pilih warna kulit majalah sahaja'],answer:0,hint:'Cari pilihan yang memecahkan kerja besar kepada beberapa tugasan.',why:'Menulis, mengambil gambar dan menyusun halaman ialah subtugasan yang membentuk tugasan besar menghasilkan majalah.'}]},
{name:'Hutan Corak',tech:'Pengecaman Corak',npc:'Rimba',color:'#249277',bg:'#def5e8',x:390,y:235,definition:'Mengenal pasti persamaan, perbezaan dan corak yang berulang dalam sesuatu situasi untuk membantu penyelesaian masalah.',example:'Mengesan langkah semakan bekalan kuasa yang sama apabila beberapa komputer tidak dapat dihidupkan.',sp:'1.1.1, 1.1.3',intro:'Laluan hutan tersembunyi di sebalik simbol berulang. Rimba meminta anda membaca corak untuk menyalakan obor hutan.',tasks:[
{type:'choice',title:'Simbol pada pintu hutan',text:'Apakah simbol yang melengkapkan corak berulang berikut?',art:'◆ ● ▲   ◆ ● ▲   ◆ ● ?',options:['◆','▲','●'],answer:1,hint:'Bahagikan urutan kepada kumpulan tiga simbol.',why:'Kumpulan ◆ ● ▲ berulang. Selepas ◆ ●, simbol yang seterusnya ialah ▲.'},
{type:'choice',title:'Jejak batu bercahaya',text:'Bilangan cahaya bertambah dengan beza yang tetap. Berapakah nilai seterusnya?',art:'3 → 7 → 11 → 15 → ?',options:['18','19','20'],answer:1,hint:'Bandingkan beza antara dua nombor bersebelahan.',why:'Setiap nombor bertambah 4. Maka 15 + 4 = 19. Anda telah mengenal pasti corak pertambahan.'},
{type:'multi',title:'Cari persamaan dan perbezaan',text:'Pokok A dan B berdaun hijau serta berbatang berkayu. Pokok A berbuah merah; pokok B berbuah kuning. Pilih dua ciri yang sama.',options:['Warna daun hijau','Warna buah merah','Batang berkayu','Warna buah kuning'],answer:[0,2],hint:'Ciri yang sama mesti terdapat pada kedua-dua pokok.',why:'Daun hijau dan batang berkayu ialah persamaan. Warna buah ialah perbezaan. Kedua-duanya membantu pengecaman corak.'}]},
{name:'Tasik Peniskalaan',tech:'Peniskalaan',npc:'Nila',color:'#3b8bc4',bg:'#e0f1ff',x:755,y:270,definition:'Menumpukan aspek penting dalam sesuatu masalah dan mengabaikan aspek yang kurang penting.',example:'Untuk memilih laluan ke sekolah, fokus pada jarak dan keselamatan; warna rumah di tepi jalan tidak diperlukan.',sp:'1.1.1, 1.1.4',intro:'Peta tasik dipenuhi maklumat yang mengelirukan. Nila memerlukan maklumat penting sahaja untuk merancang perjalanan selamat.',tasks:[
{type:'multi',title:'Pilih maklumat perjalanan',text:'Sebuah bot hendak membawa 10 murid menyeberang tasik dengan selamat. Pilih tiga maklumat yang penting.',options:['Had penumpang bot','Warna kasut murid','Keadaan cuaca','Bilangan jaket keselamatan'],answer:[0,2,3],hint:'Fokus pada kapasiti dan keselamatan penyeberangan.',why:'Had penumpang, cuaca dan jaket keselamatan menentukan keselamatan. Warna kasut tidak mempengaruhi keputusan ini.'},
{type:'choice',title:'Peta yang membantu',text:'Anda mahu mencari jalan paling pendek ke klinik. Apakah maklumat utama yang perlu dipaparkan pada peta?',options:['Nama kedai dan warna bumbung','Laluan, lokasi klinik dan jarak','Jenis bunga dan warna pagar'],answer:1,hint:'Apakah yang membantu anda membandingkan panjang perjalanan?',why:'Laluan, lokasi klinik dan jarak membolehkan anda memilih jalan terpendek. Maklumat hiasan boleh diketepikan.'},
{type:'choice',title:'Apakah tujuan peniskalaan?',text:'Nila membuang maklumat warna bot tetapi mengekalkan had muatan. Mengapakah tindakan ini sesuai?',options:['Semua maklumat mesti dibuang','Hanya maklumat yang paling menarik perlu dipilih','Maklumat penting untuk keselamatan diberi tumpuan'],answer:2,hint:'Peniskalaan mengekalkan maklumat yang relevan kepada masalah.',why:'Peniskalaan mengabaikan maklumat kurang penting sambil mengekalkan aspek yang membantu menyelesaikan masalah.'}]},
{name:'Menara Pengitlakan',tech:'Pengitlakan',npc:'Arif',color:'#9366c7',bg:'#f0e7fc',x:945,y:465,definition:'Membina kaedah umum berdasarkan ciri kesamaan supaya kaedah itu boleh digunakan untuk menyelesaikan masalah sejenis.',example:'Kaedah pinjaman yang sama boleh digunakan untuk buku, tablet dan alat sukan: semak ketersediaan, rekod peminjam, serahkan item.',sp:'1.1.1, 1.1.5',intro:'Tiga menara menggunakan sistem pinjaman berbeza. Arif mahu satu kaedah umum yang boleh digunakan untuk semua item.',tasks:[
{type:'choice',title:'Satu kaedah, pelbagai item',text:'Buku, tablet dan bola semuanya boleh dipinjam. Pilih kaedah umum yang sesuai.',options:['Semak item tersedia → rekod peminjam → serahkan item','Hanya buku perlu direkodkan','Gunakan warna item untuk memilih peminjam'],answer:0,hint:'Kaedah mesti sesuai untuk ketiga-tiga jenis item.',why:'Semakan ketersediaan, rekod peminjam dan penyerahan ialah langkah yang boleh digunakan untuk semua item pinjaman.'},
{type:'choice',title:'Guna semula penyelesaian',text:'Anda sudah mempunyai kaedah pendaftaran peserta kelab robotik. Kelab catur memerlukan pendaftaran. Apakah tindakan pengitlakan?',options:['Buang semua kaedah sedia ada','Gunakan kaedah umum yang sama dan sesuaikan nama kelab','Salin nama peserta robotik sebagai peserta catur'],answer:1,hint:'Gunakan semula struktur kaedah, bukannya menyalin data orang.',why:'Kedua-dua pendaftaran memerlukan maklumat peserta dan pengesahan. Kaedah umum boleh digunakan semula dengan data yang sesuai.'},
{type:'multi',title:'Ciri bersama sistem pinjaman',text:'Apakah tiga ciri yang diperlukan untuk pinjaman buku dan tablet?',options:['Identiti peminjam','Tarikh pemulangan','Tajuk novel','Item yang dipinjam'],answer:[0,1,3],hint:'Pilih ciri yang berkaitan dengan kedua-dua jenis pinjaman.',why:'Identiti, tarikh pemulangan dan item ialah ciri bersama. Tajuk novel hanya berkaitan dengan buku tertentu.'}]}
];
const bossTasks=[
{type:'choice',title:'Perisai pertama · Leraian',text:'Festival sekolah memerlukan persembahan, makanan dan pendaftaran. Pilih tindakan yang meleraikan tugasan.',options:['Bahagikan kerja kepada tiga pasukan mengikut tugasan','Pilih satu warna poster','Anggap semua kerja sebagai satu tugasan sahaja'],answer:0,why:'Membahagikan kerja mengikut persembahan, makanan dan pendaftaran memudahkan penyelesaian setiap bahagian.',hint:'Bina bahagian kecil daripada tugasan besar.'},
{type:'choice',title:'Perisai kedua · Pengecaman Corak',text:'Kaunter A dan B menerima nama, kelas dan jenis aktiviti sebelum mengesahkan peserta. Apakah corak yang sama?',options:['Kedua-duanya mesti berada di lokasi sama','Kedua-duanya menggunakan urutan pendaftaran yang sama','Kedua-duanya mempunyai petugas sama'],answer:1,why:'Kedua-dua kaunter menerima maklumat peserta sebelum pengesahan. Ini persamaan dalam langkah kerja.',hint:'Perhatikan urutan kerja yang berulang.'},
{type:'multi',title:'Perisai ketiga · Peniskalaan',text:'Untuk menentukan bilangan makanan peserta, pilih dua maklumat yang diperlukan.',options:['Bilangan peserta hadir','Warna beg peserta','Bilangan hidangan bagi setiap peserta','Jenis telefon peserta'],answer:[0,2],why:'Bilangan peserta dan hidangan setiap peserta menentukan kuantiti makanan. Maklumat lain tidak diperlukan.',hint:'Fokus pada maklumat yang mempengaruhi kuantiti makanan.'},
{type:'choice',title:'Perisai terakhir · Pengitlakan',text:'Kaedah umum pendaftaran festival berjaya. Bagaimanakah anda menggunakannya untuk hari sukan?',options:['Salin semua nama peserta festival tanpa semakan','Cipta kaedah yang langsung berbeza walaupun keperluan sama','Gunakan semula langkah umum dengan maklumat peserta hari sukan'],answer:2,why:'Langkah umum boleh digunakan semula untuk masalah sejenis. Data perlu disesuaikan dengan acara baharu.',hint:'Gunakan kaedah umum yang sesuai, dengan data baharu.'}
];

// Konfigurasi 6 pulau (diperbesarkan untuk penerokaan bebas)
const islandAreas=[
 {x:185,y:425,r:6.2,name:'Kampung Leraian'},
 {x:390,y:235,r:5.8,name:'Hutan Corak'},
 {x:755,y:270,r:6.0,name:'Tasik Peniskalaan'},
 {x:945,y:465,r:5.6,name:'Menara Pengitlakan'},
 {x:575,y:80, r:5.4,name:'Istana Raja Kabut'},
 {x:550,y:545,r:3.2,name:'Pulau Permulaan'}
];

// Konfigurasi 5 jambatan menghubungkan setiap pulau
const bridgeLinks=[
 {from:0,to:1,points:[[185,425],[245,355],[315,290],[390,235]],color:0x6fe0de,name:'Hutan Corak'},
 {from:1,to:2,points:[[390,235],[500,260],[630,275],[755,270]],color:0x6fe0de,name:'Tasik Peniskalaan'},
 {from:2,to:3,points:[[755,270],[830,325],[900,395],[945,465]],color:0x6fe0de,name:'Menara Pengitlakan'},
 {from:3,to:4,points:[[945,465],[790,480],[630,360],[575,210],[575,80]],color:0xb08af1,name:'Istana Raja Kabut'},
 {from:5,to:0,points:[[550,545],[440,530],[310,490],[185,425]],color:0x6fe0de,name:'Kampung Leraian'}
];

// Pendedahan kepada skop global untuk kebolehcapaian merentas modul
window.regions = regions;
window.bossTasks = bossTasks;
window.islandAreas = islandAreas;
window.bridgeLinks = bridgeLinks;
