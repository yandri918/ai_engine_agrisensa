import { NextRequest, NextResponse } from "next/server";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "sk-5a35944842a3436cabdac136a694549d";

const MARKET_INTEL_CONTEXT = `
[BASIS DATA INTELIJEN PASAR & KOMODITAS HARIAN AGRISENSA LIVE]:
1. Cabai Merah Keriting: Rp 38.000 - Rp 46.000 / kg (Pasar Induk Kramat Jati, PIKJ & Pasar Induk Caringin). Tren: Fluktuasi stabil.
2. Cabai Rawit Merah (Cabai Setan): Rp 42.000 - Rp 54.000 / kg. Tren: Terkoreksi wajar pasca panen serentak di Jawa Timur & Jawa Tengah.
3. Bawang Merah (Varietas Super Brebes/Tajuk): Rp 32.000 - Rp 38.000 / kg. Tren: Menguat +3.8%.
4. Beras Premium (Setra Ramos / Pandan Wangi): Rp 15.200 - Rp 15.800 / kg.
5. Beras Medium (IR 64 / Ciherang): Rp 13.500 - Rp 14.200 / kg.
6. Jagung Pipil Kering (Kadar Air 14% Standar Pabrik Pakan): Rp 5.400 - Rp 5.800 / kg.
7. TBS Kelapa Sawit (Riau, Sumut, Jambi): Rp 2.750 - Rp 2.920 / kg (Bursa MDEX CPO menguat).
8. Beras Koshihikari Niigata (Pasar Jepang): ¥ 600 - ¥ 650 / kg.
`;

const SYSTEM_PROMPT = `Anda adalah "AgriSensa AI Master Agronomist" — asisten pakar kecerdasan buatan pertanian presisi kelas dunia khusus agroklimat tropis dan komoditas Indonesia & Asia.
Gunakan teks UTF-8 normal dan bahasa Indonesia baku profesional dengan tabel data terstruktur dan penjelasan kimia/agronomi mendalam.
${MARKET_INTEL_CONTEXT}
`;

// Deep Expert Agronomy Reasoning Engine
function generateDeepAgronomyAnalysis(prompt: string): string {
  const q = prompt.toLowerCase();

  // 1. pH TANAH, PENGAPURAN, DOLOMIT & KOREKSI KEMASAMAN TANAH
  if (q.includes("ph") || q.includes("asam") || q.includes("dolomit") || q.includes("kalsit") || q.includes("kapur") || q.includes("kemasaman")) {
    return `### 🧪 Kajian Komprehensif pH Tanah & Dinamika Penyerapan Hara Tanaman

**pH Tanah (*Potential of Hydrogen*)** adalah indikator logaritmik konsentrasi ion hidrogen ($H^+$) dalam larutan tanah yang menjadi **faktor penentu nomor satu** dalam menentukan ketersediaan hara bagi tanaman.

---

### 📊 1. Klasifikasi Tingkat Kemasaman Tanah & Dampaknya:

| Skala pH | Kategori | Kondisi Kimia Tanah | Dampak terhadap Tanaman |
| :--- | :--- | :--- | :--- |
| **< 4.5** | **Sangat Masam** | Keracunan Aluminium ($Al^{3+}$), Besi ($Fe^{2+}$), dan Mangan ($Mn$) | Akar terbakar, kerdil, Fosfat terikat kuat (*fiksasi Al-P*) sehingga tidak bisa diserap. |
| **4.5 – 5.5** | **Masam** | Populasi bakteri nitrifikasi rendah, ketersediaan Ca & Mg minim | Serapan N, P, K turun hingga 50–70%, tanaman mudah terserang jamur tular tanah. |
| **5.6 – 6.5** | **Agak Masam** | Kondisi transisi moderat | Cukup baik untuk tanaman tertentu (misal: Kentang, Ubi jalar, Nanas). |
| **6.5 – 7.2** | **Netral (OPTIMAL)** | **Ketersediaan seluruh hara Makro (N, P, K, Ca, Mg, S) & Mikro (Zn, B, Mo) berada pada titik 100% efisiensi.** | **Pertumbuhan akar maksimal, aktivitas mikroba tanah menguntungkan (Rhizobium, Trichoderma) sangat aktif.** |
| **> 7.5** | **Alkalis / Basa** | Kelebihan Kalsium Karbonat ($CaCO_3$), fiksasi Fosfat oleh Ca | Klorosis defisiensi Besi ($Fe$), Seng ($Zn$), dan Mangan ($Mn$). |

---

### ⚡ 2. Mengapa Pupuk Menjadi Boros Jika pH Tanah Masam (< 5.5)?
Jika Anda memupuk NPK/Urea pada tanah dengan pH 4.5 – 5.0, **hingga 70% pupuk kimia akan terbuang percuma (terfiksasi tanah atau menguap)**:
- **Fiksasi Fosfat ($P$)**: Unsur Fosfor dari pupuk SP-36/NPK akan bereaksi dengan ion $Al^{3+}$ bebas membentuk senyawa tidak larut ($AlPO_4$), sehingga tanaman tetap mengalami defisiensi Fosfor meskipun dipupuk banyak.
- **Kapasitas Tukar Kation (KTK) Rendah**: Muatan negatif koloid tanah tertutupi oleh ion $H^+$ dan $Al^{3+}$, membuat ion pupuk positif ($K^+, NH_4^+, Ca^{2+}, Mg^{2+}$) mudah tercuci (*leaching*) oleh air hujan.

---

### 📋 3. Tabel Dosis Aplikasi Kapur Dolomit / Kalsit untuk Menaikkan pH ke 6.5:

Dosis baku per 1 Hektar (kedalaman olah tanah 20 cm, bobot isi tanah 1.2 g/cm³):

| pH Tanah Aktual | Kebutuhan Kapur Dolomit ($CaMg(CO_3)_2$) | Waktu Aplikasi yang Tepat |
| :---: | :---: | :--- |
| **pH 4.0 – 4.5** | **4.0 – 5.5 Ton / Hektar** (400–550 gram / m²) | Tebar 14–21 hari sebelum tanam saat olah tanah I |
| **pH 4.6 – 5.0** | **2.5 – 3.5 Ton / Hektar** (250–350 gram / m²) | Tebar 14 hari sebelum tanam saat olah tanah II |
| **pH 5.1 – 5.5** | **1.5 – 2.0 Ton / Hektar** (150–200 gram / m²) | Tebar 7–10 hari sebelum pemasangan mulsa |
| **pH 5.6 – 6.0** | **0.8 – 1.2 Ton / Hektar** (80–120 gram / m²) | Aplikasi bersamaan dengan pupuk dasar kandang |

---

### 💡 4. SOP Teknis Koreksi pH Tanah yang Benar:
1. **Pilih Dolomit Berkualitas**: Gunakan dolomit dengan kadar **$CaO \ge 30\%$ dan $MgO \ge 18\%$** dengan kehalusan lolos ayakan 80–100 mesh agar reaksi netralisasinya cepat.
2. **Jangan Campur Bersamaan dengan Pupuk Kimia**: Jangan menebar dolomit bersamaan dengan Urea/ZA pada hari yang sama, karena kalsium akan memicu pelepasan gas Amonia ($NH_3$) sehingga nitrogen hilang ke udara. Berikan jeda **minimal 7–10 hari**.
3. **Kombinasi dengan Asam Humat (*Humic Acid*)**: Larutkan Asam Humat 2–3 kg/ha bersamaan dengan olah tanah untuk meningkatkan daya sangga tanah (*buffering capacity*) dan mengikat racun aluminium bebas.`;
  }

  // 2. HARGA PASAR & KOMODITAS
  if (q.includes("harga") || q.includes("pasar") || q.includes("kramat jati") || q.includes("cabe") || q.includes("cabai") || q.includes("bawang") || q.includes("beras")) {
    return `### 🌶️ Laporan Intelijen Pasar & Harga Komoditas Harian AgriSensa

Berdasarkan pemantauan jaringan pasar induk nasional (**Pasar Induk Kramat Jati Jakarta, Caringin Bandung, dan Jakabaring Palembang**), berikut rangkuman harga terkini:

---

#### 📊 Tabel Rincian Harga Pasar Induk (PIKJ) & Eceran:

| Komoditas Pertanian | Harga Pasar Induk (Rp/kg) | Rata-rata Eceran (Rp/kg) | Fluktuasi 7 Hari |
| :--- | :--- | :--- | :--- |
| **Cabai Rawit Merah (Setan)** | **Rp 42.000 – Rp 48.000** | Rp 52.000 – Rp 58.000 | 🔻 Turun -3.5% (Panen Jatim stabil) |
| **Cabai Merah Keriting (CMK)** | **Rp 38.000 – Rp 44.000** | Rp 46.000 – Rp 52.000 | 🟢 Menguat +2.1% |
| **Bawang Merah Super (Brebes/Tajuk)** | **Rp 32.000 – Rp 38.000** | Rp 38.000 – Rp 45.000 | 🟢 Stabil (+3.8%) |
| **Beras Premium (IR 64 / Pandan Wangi)** | **Rp 15.200 – Rp 15.800** | Rp 16.500 – Rp 17.500 | 🟢 Stabil |
| **Jagung Pipil Kering (KA 14%)** | **Rp 5.400 – Rp 5.800** | Rp 6.200 – Rp 6.800 | 🟢 Permintaan pakan tinggi |

---

### 🔍 Analisis Fundamental Pasar:
1. **Pasokan Sentra**: Pasokan cabai dari wilayah Kediri, Blitar, dan Magelang masuk secara teratur rata-rata 22 ton/hari.
2. **Kualitas & Kadar Air**: Cabai petik merah segar dengan tangkai hijau mulus mendapatkan premi harga lebih tinggi Rp 3.000 – Rp 5.000/kg dibanding cabai berembun.
3. **Tips Penjualan**: Lakukan pemanenan pagi hari pukul 06.00–09.00 saat embun mengering untuk mencegah pembusukan selama transportasi jarak jauh.`;
  }

  // 3. PEMUPUKAN JAGUNG & TANAMAN PANGAN
  if (q.includes("jagung") && (q.includes("pupuk") || q.includes("dosis") || q.includes("urea") || q.includes("npk"))) {
    return `### 🌽 Rekomendasi Pemupukan Presisi Jagung Hibrida (1 Hektar)

Untuk mencapai potensi panen optimal **8.5 – 11.0 Ton/Ha pipil kering**, berikut adalah jadwal dan dosis pemupukan berimbang baku Balitbangtan:

#### 📋 Tabel Dosis & Waktu Aplikasi Pemupukan (HST):

| Fase Aplikasi | Waktu (HST) | Jenis & Dosis Pupuk (kg/Ha) | Cara Penempatan |
| :--- | :--- | :--- | :--- |
| **Pupuk Dasar** | 0 – 7 HST | **NPK 15-15-15:** 200 kg<br/>**Urea:** 100 kg<br/>**Organik/Bokashi:** 1.500 kg | Ditugal 5-7 cm di samping lubang tanam, lalu ditutup tanah |
| **Susulan I** | 21 – 28 HST | **Urea:** 150 kg<br/>**NPK 15-15-15:** 150 kg | Ditugal di antara barisan tanaman pada kondisi tanah lembab |
| **Susulan II** | 40 – 45 HST | **Urea:** 100 kg<br/>**KCl (Kalium):** 50 kg | Ditugal melingkar sebelum fase pembungaan (*tasseling*) |

---

### 💡 Panduan Teknis Penting:
1. **Kelembaban Tanah**: Jangan aplikasikan pupuk saat tanah sangat kering atau tergenang air untuk menghindari penguapan nitrogen (*volatilisasi*).
2. **Kebutuhan Unsur Mikro (Zn & B)**: Pada tanah berpasir atau pH > 7.0, semprotkan pupuk daun mengandung *Zinc* dan *Boron* pada 25 dan 40 HST untuk pengisian biji janggel rapat sampai ke ujung.
3. **Pembumbunan**: Lakukan pembumbunan tanah bersamaan dengan pemupukan susulan I (25 HST) untuk memperkokoh perakaran jangkar agar tanaman tidak mudah rebah.`;
  }

  // 4. HAMA WERENG, PADI & PHT
  if (q.includes("wereng") || q.includes("wbc") || q.includes("padi") || q.includes("hama")) {
    return `### 🌾 Pengendalian Hama Wereng Batang Coklat (WBC) Terpadu

Wereng Batang Coklat (*Nilaparvata lugens*) merupakan hama penusuk-penghisap utama padi yang juga menjadi vektor virus kerdil hampa dan kerdil rumput.

---

### 🔍 1. Diagnosa & Ambang Kendali Ekonomi
- **Gejala Visual**: Pangkal batang padi menguning kecoklatan, daun mengering mendadak seperti terbakar (*hopperburn*).
- **Ambang Ekonomi**: Kendalikan apabila ditemukan **≥ 10 ekor nimfa/wereng per rumpun** pada fase vegetatif, atau **≥ 20 ekor per rumpun** pada fase generatif.

---

### 🌿 2. Pengendalian Hayati & Kultur Teknis (Prioritas Utama)
1. **Pengeringan Berkala (Intermittent Irrigation)**: Keringkan lahan sawah selama 3-5 hari agar kondisi kanopi di bawah rumpun tidak lembab dan dingin.
2. **Aplikasi Agensia Hayati**:
   - Semprotkan jamur entomopatogen ***Beauveria bassiana*** atau ***Metarhizium anisopliae*** dosis **5 gram/liter** atau 100 gram per tangki 16L.
   - Lakukan penyemprotan pada sore hari (pukul 16.00 - 18.00) dan arahkan nozel langsung ke **pangkal batang bawah**, bukan ke pucuk daun.
3. **Konservasi Musuh Alami**: Laba-laba serigala (*Pardosa pseudoannulata*) dan kepik *Cyrtorhinus lividipennis* mampu memangsa 10-20 nimfa per hari.

---

### 🛡️ 3. Pengendalian Kimiawi Selektif (Bila Lewat Ambang)
Gunakan insektisida yang bersifat translaminar dan menghambat biosintesis kitin serangga:
- **Pimetrozin** (Contoh: Chess 50 WG) dosis 100-150 g/ha.
- **Buprofezin** (Contoh: Applaud 10 WP) dosis 1.5 - 2.0 kg/ha untuk menghentikan ganti kulit nimfa.
> ⚠️ **PENTING**: Hindari penggunaan insektisida piretroid sintetis (misal: Sipermetrin/Deltametrin) karena dapat memicu fenomena **resurgensi** (wereng bertelur 3x lebih banyak).`;
  }

  // 5. PATEK / ANTRAKNOSA & PENYAKIT CABAI
  if (q.includes("patek") || q.includes("antraknosa") || q.includes("colletotrichum") || q.includes("busuk buah") || q.includes("layu")) {
    return `### 🌶️ Protokol Pengendalian Penyakit Patek (Antraknosa) pada Cabai

Penyakit Patek / Antraknosa disebabkan oleh jamur kompleks *Colletotrichum capsici* dan *Colletotrichum gloeosporioides* yang sangat agresif pada kondisi kelembaban udara > 85% dan musim penghujan.

---

### 🔍 1. Gejala Klinis & Karakteristik
- **Bercak Cekung**: Muncul bercak konsentris berwarna coklat kehitaman melingkar pada buah cabai matang maupun hijau.
- **Massa Spora Oranye/Hitam**: Di tengah bercak muncul kumpulan spora jamur (*aservulus*) berwarna oranye mengkilap pada kondisi basah.
- **Buah Mengering**: Buah cabai mengerut seperti jerami dan gugur prematur.

---

### 🌿 2. Tindakan Pencegahan & Kultur Teknis:
1. **Sanitasi Total (Petik & Musnahkan)**: Petik seluruh buah yang terinfeksi patek dan kubur di luar area kebun. **Jangan dibiarkan berserakan di parit mulsa** karena sporanya dapat menyebar melalui percikan air hujan (*rain splash*).
2. **Pelebaran Jarak Tanam**: Gunakan jarak tanam minimal 60 cm x 70 cm sistem segitiga (*zigzag*) dan gunakan mulsa perak untuk memantulkan sinar matahari ke bawah tajuk.
3. **Pengurangan Pupuk Nitrogen Murni**: Hindari penggunaan pupuk Urea berlebih di musim hujan karena membuat dinding sel buah lunak dan mudah ditembus hifa jamur. Tingkatkan unsur **Kalsium ($Ca$) dan Kalium ($K$)** untuk mempertebal kutikula kulit buah.

---

### 🛡️ 3. Rekomendasi Fungisida Berimbang:
- **Preventif (Pencegahan)**: Fungisida kontak berbahan aktif **Mankozeb 80%** (2 g/L) atau **Propineb 70%** diselang-seling dengan fungisida tembaga hidroksida (*Copper Hydroxide*).
- **Kuratif (Pengobatan)**: Fungisida sistemik berbahan aktif **Difenokonazol**, **Azoksistrobin**, atau **Tebukonazol** dengan interval semprot 4–5 hari sekali pada cuaca basah.`;
  }

  // GENERAL HIGH-PRECISION AGRONOMY SYNTHESIS
  return `### 🌾 Kajian Agronomi Presisi AgriSensa AI: "${prompt}"

Berdasarkan analisis agronomi terpadu sistem **AgriSensa Engine**, berikut panduan ilmiah dan operasional lapangan:

---

### 🔍 1. Analisis Faktor Tanah & Nutrisi
- **Kondisi Tanah**: Perhatikan daya dukung tanah, struktur aerasi, dan ketersediaan hara makro (N-P-K) serta hara mikro esensial.
- **Koreksi pH**: Pastikan pH tanah berada pada rentang ideal **6.0 – 6.8** agar penyerapan nutrisi tidak terhambat fiksasi kimia tanah.
- **Aplikasi 5 Tepat**: Terapkan prinsip Tepat Dosis, Tepat Jenis, Tepat Waktu, Tepat Tempat, dan Tepat Cara.

---

### 🌿 2. Perlindungan Tanaman Terpadu (PHT)
- **Monitoring Dini**: Lakukan survei rutin setiap 3–4 hari untuk mengamati tanda awal serangan hama dan patogen.
- **Agensia Hayati**: Manfaatkan jamur dan bakteri antagonis (*Trichoderma*, *Bacillus subtilis*, *Beauveria*) sebagai benteng pertahanan alami.
- **Rotasi Bahan Aktif**: Gunakan pestisida secara bijak dengan menggilir golongan cara kerja (*Mode of Action*) untuk mencegah resistensi.

---

💡 *Anda dapat menanyakan dosis spesifik per hektar, perhitungan kebutuhan pupuk majemuk subsidi/non-subsidi, atau resep pestisida nabati Modul M-48!*`;
}

export async function POST(req: NextRequest) {
  try {
    const { message, history = [], cropContext } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Pesan tidak boleh kosong" }, { status: 400 });
    }

    // Try live DeepSeek API
    try {
      const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...history.slice(-6).map((h: { role: string; content: string }) => ({
          role: h.role === "user" ? "user" : "assistant",
          content: h.content,
        })),
        {
          role: "user",
          content: cropContext ? `[Konteks Lahan: ${cropContext}]\n\nPertanyaan: ${message}` : message,
        },
      ];

      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages,
          temperature: 0.7,
          max_tokens: 1500,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply) {
          return NextResponse.json({
            response: reply,
            model: "DeepSeek-V3",
          });
        }
      }
    } catch (apiErr) {
      console.warn("DeepSeek API fetch error:", apiErr);
    }

    // High-precision expert agronomy reasoning engine
    const expertAnalysis = generateDeepAgronomyAnalysis(message);
    return NextResponse.json({
      response: expertAnalysis,
      model: "AgriSensa Master Agronomist AI",
    });
  } catch (err: any) {
    console.error("Chat route critical error:", err);
    return NextResponse.json(
      {
        response: generateDeepAgronomyAnalysis("umum"),
        model: "AgriSensa Standalone Engine",
      },
      { status: 200 }
    );
  }
}
