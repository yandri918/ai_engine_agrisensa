"""
AgriSensa Fertilizer Engineering & Organic Recipe Engine
=========================================================
Modul komprehensif formulasi pupuk organik dan pupuk kombinasi (NPK blending)
diadopsi dari basis pengetahuan agronomi AgriSensa utama.

Fitur:
1. Database 15+ Bahan Baku Organik Ilmiah (Kotoran Ternak, Urine, Abu, Guano, Hijauan, dll.)
2. Kalkulator Formulasi NPK Pupuk Organik & Analisis C/N Ratio
3. Formulasi Pupuk Kombinasi & Nutrient-to-Weight Blending (Urea, SP-36, KCl, ZA, NPK 16-16-16, Kompos)
4. Ensiklopedia Resep & SOP Pembuatan POC, Bioaktivator Rumen, Trichoderma, dan Bokashi
"""

import logging
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field

logger = logging.getLogger("agrisensa.fertilizer_engine")

# ─────────────────────────────────────────────────────────────────────────────
# 1. Scientific Organic Raw Materials Database (FAO & Balitbangtan)
# ─────────────────────────────────────────────────────────────────────────────

ORGANIC_MATERIALS_DB: Dict[str, Dict[str, Any]] = {
    "Kotoran Ayam (Murni)": {
        "N": 3.0, "P": 2.5, "K": 1.5, "C_N": 10, "Ca": 2.0, "Mg": 0.5,
        "category": "Kotoran Ternak",
        "desc": "Panas, cepat terurai, kaya Nitrogen dan Fosfor.",
    },
    "Kotoran Kambing / Domba": {
        "N": 1.5, "P": 1.0, "K": 1.5, "C_N": 25, "Ca": 1.0, "Mg": 0.4,
        "category": "Kotoran Ternak",
        "desc": "Seimbang dan dingin, sangat baik untuk fase pembuahan.",
    },
    "Kotoran Sapi": {
        "N": 1.0, "P": 0.5, "K": 1.0, "C_N": 18, "Ca": 0.8, "Mg": 0.3,
        "category": "Kotoran Ternak",
        "desc": "Dingin, kaya humus, sangat baik sebagai pembenah fisik tanah.",
    },
    "Kotoran Kelinci (Padat)": {
        "N": 2.0, "P": 1.4, "K": 0.6, "C_N": 12, "Ca": 1.2, "Mg": 0.4,
        "category": "Kotoran Ternak",
        "desc": "Kualitas tinggi, tidak berbau tajam jika terfermentasi.",
    },
    "Guano Kelelawar": {
        "N": 1.0, "P": 10.0, "K": 1.0, "C_N": 10, "Ca": 8.0, "Mg": 1.0,
        "category": "Bahan Khusus",
        "desc": "Sangat kaya Fosfor (P) alami untuk pembungaan dan perakaran.",
    },
    "Urine Kelinci": {
        "N": 2.5, "P": 0.2, "K": 1.5, "C_N": 0.8, "Ca": 0.2, "Mg": 0.1,
        "category": "Urine Ternak",
        "desc": "Cairan bernitrogen tinggi dan ZPT alami, cepat diserap daun.",
    },
    "Urine Sapi (Fermentasi)": {
        "N": 1.0, "P": 0.1, "K": 1.0, "C_N": 0.8, "Ca": 0.1, "Mg": 0.1,
        "category": "Urine Ternak",
        "desc": "Sumber N cair dan bio-pestisida alami pengusir hama.",
    },
    "Dedak Padi (Katul Halus)": {
        "N": 2.0, "P": 1.0, "K": 1.0, "C_N": 20, "Ca": 0.1, "Mg": 0.2,
        "category": "Bahan Pengisi & Karbon",
        "desc": "Sumber karbohidrat dan makanan utama mikroba pengurai.",
    },
    "Sekam Padi (Mentah)": {
        "N": 0.5, "P": 0.2, "K": 0.5, "C_N": 80, "Ca": 0.1, "Mg": 0.1,
        "category": "Bahan Pengisi & Karbon",
        "desc": "Porositas tinggi, memperbaiki aerasi tanah, lambat lapuk.",
    },
    "Arang Sekam Padi": {
        "N": 0.3, "P": 0.2, "K": 1.0, "C_N": 100, "Ca": 0.3, "Mg": 0.2,
        "category": "Bahan Pengisi & Karbon",
        "desc": "Media tanam steril, sumber Silika (Si) dan Kalium pembenah tanah.",
    },
    "Jerami Padi": {
        "N": 0.6, "P": 0.2, "K": 1.4, "C_N": 60, "Ca": 0.4, "Mg": 0.2,
        "category": "Bahan Hijauan / Jerami",
        "desc": "Sumber Kalium (K) organik tinggi untuk kekuatan batang tanaman.",
    },
    "Hijauan Leguminosa (Gamal / Lamtoro)": {
        "N": 3.5, "P": 0.5, "K": 2.0, "C_N": 15, "Ca": 1.5, "Mg": 0.5,
        "category": "Bahan Hijauan / Jerami",
        "desc": "Sumber Nitrogen hijau super cepat terurai dan kaya protein.",
    },
    "Abu Dapur (Kayu Keras)": {
        "N": 0.0, "P": 1.5, "K": 7.0, "C_N": 0, "Ca": 15.0, "Mg": 3.0,
        "category": "Sumber Mineral",
        "desc": "Sangat kaya Kalium (K) karbonat alami dan menaikkan pH tanah.",
    },
    "Cangkang Telur (Tepung)": {
        "N": 0.5, "P": 0.1, "K": 0.1, "C_N": 0, "Ca": 36.0, "Mg": 0.5,
        "category": "Sumber Mineral",
        "desc": "Sumber Kalsium Karbonat murni pencegah busuk pantat buah (BER).",
    },
    "Kapur Pertanian (Dolomit)": {
        "N": 0.0, "P": 0.0, "K": 0.0, "C_N": 0, "Ca": 30.0, "Mg": 18.0,
        "category": "Sumber Mineral",
        "desc": "Penetralisir kemasaman tanah dan sumber Kalsium-Magnesium hara sekunder.",
    },
}

# ─────────────────────────────────────────────────────────────────────────────
# 2. Chemical / Inorganic & Compound Fertilizer Database (Subsidi & Non-Subsidi)
# ─────────────────────────────────────────────────────────────────────────────

INORGANIC_FERTILIZERS_DB: Dict[str, Dict[str, Any]] = {
    # Pupuk Subsidi (HET Pemerintah 2024-2026)
    "Urea Subsidi": {
        "N": 46.0, "P": 0.0, "K": 0.0,
        "is_subsidi": True,
        "subsidi_price_per_kg": 2250,
        "nonsubsidi_price_per_kg": 8500,
        "type": "Tunggal",
        "desc": "Sumber Nitrogen utama berkecepatan serap tinggi untuk daun & anakan.",
        "color": "#3b82f6",
    },
    "NPK Phonska Subsidi (15-10-12)": {
        "N": 15.0, "P": 10.0, "K": 12.0,
        "is_subsidi": True,
        "subsidi_price_per_kg": 2300,
        "nonsubsidi_price_per_kg": 11500,
        "type": "Majemuk",
        "desc": "Pupuk majemuk bersubsidi standar tanaman pangan (Padi, Jagung, Kedelai).",
        "color": "#8b5cf6",
    },
    "NPK Formula Khusus / Kakao Subsidi (14-12-16+4Mg)": {
        "N": 14.0, "P": 12.0, "K": 16.0, "Mg": 4.0,
        "is_subsidi": True,
        "subsidi_price_per_kg": 3300,
        "nonsubsidi_price_per_kg": 13500,
        "type": "Majemuk",
        "desc": "Pupuk majemuk subsidi khusus perkebunan (Kakao, Kopi, Tebu).",
        "color": "#ec4899",
    },
    "Petroganik / Organik Subsidi": {
        "N": 1.5, "P": 1.0, "K": 1.5,
        "is_subsidi": True,
        "subsidi_price_per_kg": 800,
        "nonsubsidi_price_per_kg": 1500,
        "type": "Organik Padat",
        "desc": "Pupuk organik padat granul bersubsidi pembenah tanah & C-organik.",
        "color": "#84cc16",
    },

    # Pupuk Non-Subsidi / Komersial
    "NPK Mutiara 16-16-16 (Komersial)": {
        "N": 16.0, "P": 16.0, "K": 16.0,
        "is_subsidi": False,
        "subsidi_price_per_kg": 2300,
        "nonsubsidi_price_per_kg": 15500,
        "type": "Majemuk",
        "desc": "Pupuk majemuk premium Eropa (Yara/Meroke), kelarutan 100%, cepat serap.",
        "color": "#ec4899",
    },
    "NPK Phonska Plus 15-15-15+Zn": {
        "N": 15.0, "P": 15.0, "K": 15.0, "Zn": 0.2,
        "is_subsidi": False,
        "subsidi_price_per_kg": 2300,
        "nonsubsidi_price_per_kg": 13000,
        "type": "Majemuk",
        "desc": "Pupuk majemuk non-subsidi Petrokimia dengan Zink untuk daya tahan penyakit.",
        "color": "#a855f7",
    },
    "NPK Mahkota 13-6-27 (Buah/Sawit)": {
        "N": 13.0, "P": 6.0, "K": 27.0, "B": 0.5,
        "is_subsidi": False,
        "subsidi_price_per_kg": 2500,
        "nonsubsidi_price_per_kg": 14500,
        "type": "Majemuk",
        "desc": "Formula tinggi Kalium untuk pengisian bobot buah, umbi, dan tandan sawit.",
        "color": "#f97316",
    },
    "NPK Pelangi 20-10-10 (Vegetatif)": {
        "N": 20.0, "P": 10.0, "K": 10.0,
        "is_subsidi": False,
        "subsidi_price_per_kg": 2300,
        "nonsubsidi_price_per_kg": 12500,
        "type": "Majemuk",
        "desc": "Formula tinggi Nitrogen untuk fase pertumbuhan awal dan sayuran daun.",
        "color": "#06b6d4",
    },
    "Urea Non-Subsidi (Petro/Pusri)": {
        "N": 46.0, "P": 0.0, "K": 0.0,
        "is_subsidi": False,
        "subsidi_price_per_kg": 2250,
        "nonsubsidi_price_per_kg": 8500,
        "type": "Tunggal",
        "desc": "Urea prill/granul non-subsidi bebas batasan kuota RDKK.",
        "color": "#3b82f6",
    },
    "SP-36 Non-Subsidi (Super Fosfat)": {
        "N": 0.0, "P": 36.0, "K": 0.0, "S": 5.0,
        "is_subsidi": False,
        "subsidi_price_per_kg": 2000,
        "nonsubsidi_price_per_kg": 9500,
        "type": "Tunggal",
        "desc": "Sumber Fosfat murni untuk memicu perakaran awal dan pembungaan.",
        "color": "#10b981",
    },
    "KCl / MOP 60 (Kanada/Rusia)": {
        "N": 0.0, "P": 0.0, "K": 60.0,
        "is_subsidi": False,
        "subsidi_price_per_kg": 2500,
        "nonsubsidi_price_per_kg": 12000,
        "type": "Tunggal",
        "desc": "Sumber Kalium terkonsentrasi tinggi untuk pengisian pati dan ketahanan rebah.",
        "color": "#f59e0b",
    },
    "ZA Non-Subsidi (Amonium Sulfat)": {
        "N": 21.0, "P": 0.0, "K": 0.0, "S": 24.0,
        "is_subsidi": False,
        "subsidi_price_per_kg": 1800,
        "nonsubsidi_price_per_kg": 5500,
        "type": "Tunggal",
        "desc": "Sumber N dan Sulfur (S) esensial untuk aroma, rasa pedas/tajam (bawang/cabai).",
        "color": "#14b8a6",
    },
    "MKP (Mono Kalium Fosfat)": {
        "N": 0.0, "P": 52.0, "K": 34.0,
        "is_subsidi": False,
        "subsidi_price_per_kg": 35000,
        "nonsubsidi_price_per_kg": 45000,
        "type": "Khusus / Foliar",
        "desc": "Fosfat dan Kalium larut air 100% untuk fase booster bunga dan buah.",
        "color": "#0ea5e9",
    },
    "KNO3 Putih (Kalium Nitrat)": {
        "N": 13.0, "P": 0.0, "K": 45.0,
        "is_subsidi": False,
        "subsidi_price_per_kg": 30000,
        "nonsubsidi_price_per_kg": 40000,
        "type": "Khusus / Foliar",
        "desc": "Nitrat bebas klorin untuk mencegah kerontokan buah dan pengisian rasa manis.",
        "color": "#6366f1",
    },
    "Kompos Matang / Bokashi Lokal": {
        "N": 1.5, "P": 1.0, "K": 1.5,
        "is_subsidi": False,
        "subsidi_price_per_kg": 800,
        "nonsubsidi_price_per_kg": 1500,
        "type": "Organik Padat",
        "desc": "Kompos organik lokal hasil fermentasi kohe + bioaktivator rumen.",
        "color": "#84cc16",
    },
}

# ─────────────────────────────────────────────────────────────────────────────
# 3. Standard Fertilizer Recipes Database (SOP)
# ─────────────────────────────────────────────────────────────────────────────

RECIPES_DATABASE: List[Dict[str, Any]] = [
    {
        "id": "poc-rotan-super",
        "title": "POC ROTAN Super (Pupuk Organik Cair Lengkap)",
        "type": "Cair (POC)",
        "phase": "Vegetatif & Generatif",
        "description": "POC berkualitas tinggi dengan mikroba super lengkap (Azotobacter, Azospirillum, Lactobacillus, Rhizobium, Pseudomonas).",
        "ingredients": [
            {"item": "Buah Pisang Matang", "amount": "5 buah"},
            {"item": "Buah Pepaya Matang", "amount": "1 buah"},
            {"item": "Buah Nanas Matang", "amount": "1 buah"},
            {"item": "Buah Mangga / Buah Manis", "amount": "2 buah"},
            {"item": "Kangkung Air Segar", "amount": "3 ikat"},
            {"item": "Kacang Panjang Segar", "amount": "3 ikat"},
            {"item": "Jagung Manis Muda", "amount": "2 tongkol"},
            {"item": "Ragi Tape", "amount": "3 butir"},
            {"item": "Air Kelapa Murni", "amount": "5 Liter"},
            {"item": "Air Cucian Beras (Leri)", "amount": "3 Liter"},
            {"item": "Gula Kelapa / Tetes Tebu (Molase)", "amount": "1 kg"},
            {"item": "Usus / Jeroan Ikan Segar", "amount": "200 gram"},
        ],
        "steps": [
            "Blender seluruh buah-buahan, sayuran, dan jagung muda hingga halus seperti jus pekat.",
            "Didihkan gula kelapa dengan 1 liter air, lalu dinginkan hingga benar-benar suhu ruang.",
            "Campurkan jus buah/sayur, larutan gula dingin, air kelapa, air leri, usus ikan, dan ragi tape yang sudah dihaluskan ke dalam tong plastik atau gerabah.",
            "Tutup rapat wadah (anaerob), pasang selang aerasi/botol air jika ada.",
            "Fermentasi selama 10-14 hari. Setiap 2 hari buka dan aduk selama 3 menit untuk membuang gas.",
            "Saring cairan POC. Hasil POC siap digunakan dengan dosis 10-20 ml per liter air semprot/kocor.",
        ],
        "success_indicators": "Aroma harum asam segar fermentasi tape, warna coklat keemasan, tidak berbau busuk bangkai.",
    },
    {
        "id": "bioaktivator-rumen",
        "title": "Bioaktivator Super Rumen Sapi (Dekomposer & Probiotik)",
        "type": "Cair (Bioaktivator)",
        "phase": "Pembenah Tanah & Pengurai Kompos",
        "description": "Kultur probiotik bakteri selulolitik dan penambat N tercepat untuk mendekomposisi kotoran ternak dan jerami dalam 7-14 hari.",
        "ingredients": [
            {"item": "Cairan Rumen Sapi Segar (Isi Lambung)", "amount": "2 Liter"},
            {"item": "Molase (Tetes Tebu) / Gula Merah Cair", "amount": "2 Liter"},
            {"item": "Air Rebusan Dedak Halus (Katul)", "amount": "4 Liter"},
            {"item": "Urine Ternak (Diendapkan 7 Hari)", "amount": "4 Liter"},
            {"item": "Ragi Tape", "amount": "2-3 butir"},
            {"item": "Terasi Matang", "amount": "50-100 gram"},
            {"item": "Buah Nanas Parut", "amount": "1 buah"},
        ],
        "steps": [
            "Rebus 1 kg dedak dengan 5 liter air hingga mendidih, dinginkan, lalu saring ambil 4 liter airnya.",
            "Campurkan cairan rumen sapi dan molase dalam ember plastik hingga homogen.",
            "Masukkan air rebusan dedak dingin, nanas parut, terasi cair, dan ragi tape yang telah dihancurkan.",
            "Tambahkan 4 liter urine ternak yang sudah terfermentasi.",
            "Masukkan ke dalam jerigen tertutup, fermentasi anaerob selama 14 hari di tempat teduh.",
            "Gunakan sebagai biang dekomposer (100 ml per 10 liter air untuk menyiram 100 kg bahan kompos).",
        ],
        "success_indicators": "Warna coklat kekuningan, berbau manis fermentasi asam segar, tidak berbusa pekat hitam.",
    },
    {
        "id": "trichoderma-biang",
        "title": "Biang Trichoderma sp. Bambu (Fungisida & Pelarut Fosfat Alami)",
        "type": "Padat & Suspensi",
        "phase": "Proteksi Penyakit Jamur (Fusarium & Busuk Batang)",
        "description": "Perbanyakan isolat jamur Trichoderma sp. dari humus rumpun bambu untuk melindungi perakaran dan meningkatkan ketahanan tanaman.",
        "ingredients": [
            {"item": "Nasi Dingin / Basi (1 Malam)", "amount": "1 mangkuk sedang"},
            {"item": "Ruas Bambu Segar (3 Ruas)", "amount": "1 bilah"},
            {"item": "Tali Pengikat / Karet", "amount": "Secukupnya"},
        ],
        "steps": [
            "Belah bambu menjadi dua bagian. Buat lubang kecil seukuran kelingking di sekat ruas kiri dan kanan.",
            "Cuci bersih bambu dengan air sumur/air mengalir (jangan gunakan air kaporit PDAM).",
            "Masukkan nasi ke dalam rongga tengah bambu, lalu satukan kembali belahan bambu dan ikat rapat.",
            "Kubur bambu sedalam 7-10 cm di bawah timbunan daun bambu lapuk (humus) di hutan bambu.",
            "Biarkan selama 7-10 hari. Buka bambu dan panen jamur putih seperti kapas kehijauan (Trichoderma sp.).",
            "Perbanyak biang ke media beras jagung atau dedak steril untuk aplikasi lahan.",
        ],
        "success_indicators": "Miselia jamur putih bersih menyerupai kapas atau spora kehijauan lembut tanpa bau busuk.",
    },
    {
        "id": "bokashi-padat-super",
        "title": "Pupuk Bokashi Padat Super (Pembenah Tanah Cepat)",
        "type": "Padat (Kompos Fermentasi)",
        "phase": "Olah Tanah / Pupuk Dasar",
        "description": "Pupuk organik padat kaya hara NPK, asam humat, dan mikroba pembenah struktur tanah dalam waktu fermentasi 14 hari.",
        "ingredients": [
            {"item": "Kotoran Kambing / Sapi Kering", "amount": "200 kg"},
            {"item": "Arang Sekam / Sekam Padi", "amount": "50 kg"},
            {"item": "Dedak Padi Halus", "amount": "20 kg"},
            {"item": "Dolomit (Kapur Pertanian)", "amount": "10 kg"},
            {"item": "Bioaktivator Rumen / EM4", "amount": "500 ml"},
            {"item": "Molase / Air Gula", "amount": "500 ml"},
            {"item": "Air Bersih", "amount": "Secukupnya (Kadar air 40-50%)"},
        ],
        "steps": [
            "Campurkan kotoran ternak, arang sekam, dedak padi, dan dolomit di atas terpal bersih hingga merata.",
            "Larutkan bioaktivator dan molase ke dalam 20 liter air.",
            "Siramkan larutan secara bertahap ke campuran bahan sambil diaduk hingga kelembaban mencapai 40-50% (bila dikepal menggumpal tapi tidak menetes air).",
            "Tumpuk setinggi 40-50 cm dan tutup rapat dengan terpal kedap udara.",
            "Balik tumpukan setiap 3 hari sekali untuk menjaga suhu fermentasi di bawah 55°C.",
            "Setelah 14 hari, bokashi matang ditandai warna kehitaman remah, dingin, dan berbau tanah hutan segar.",
        ],
        "success_indicators": "Bahan remah berwarna gelap, suhu dingin normal, aroma tanah humus segar.",
    },
]

# ─────────────────────────────────────────────────────────────────────────────
# 4. Engine Classes
# ─────────────────────────────────────────────────────────────────────────────

class FertilizerEngine:
    """Core Calculation & Formulation Engine for Organic and Combined Fertilizers."""

    def __init__(self):
        self.organic_db = ORGANIC_MATERIALS_DB
        self.inorganic_db = INORGANIC_FERTILIZERS_DB
        self.recipes = RECIPES_DATABASE

    def calculate_organic_mix(self, items: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Menghitung estimasi kandungan N-P-K, C/N rasio, dan biomassa hara dari campuran bahan organik.
        
        Args:
            items: List[{"material": "Kotoran Sapi", "weight_kg": 100.0}, ...]
        """
        total_weight = 0.0
        total_n_kg = 0.0
        total_p_kg = 0.0
        total_k_kg = 0.0
        total_ca_kg = 0.0
        total_mg_kg = 0.0
        weighted_cn_sum = 0.0

        details = []

        for item in items:
            mat_name = item.get("material", "")
            weight = float(item.get("weight_kg", 0.0))
            if weight <= 0 or mat_name not in self.organic_db:
                continue

            spec = self.organic_db[mat_name]
            n_val = spec.get("N", 0.0)
            p_val = spec.get("P", 0.0)
            k_val = spec.get("K", 0.0)
            ca_val = spec.get("Ca", 0.0)
            mg_val = spec.get("Mg", 0.0)
            cn_val = spec.get("C_N", 15.0)

            n_kg = weight * (n_val / 100.0)
            p_kg = weight * (p_val / 100.0)
            k_kg = weight * (k_val / 100.0)
            ca_kg = weight * (ca_val / 100.0)
            mg_kg = weight * (mg_val / 100.0)

            total_weight += weight
            total_n_kg += n_kg
            total_p_kg += p_kg
            total_k_kg += k_kg
            total_ca_kg += ca_kg
            total_mg_kg += mg_kg
            weighted_cn_sum += weight * cn_val

            details.append({
                "material": mat_name,
                "weight_kg": weight,
                "category": spec.get("category", "-"),
                "n_pct": n_val,
                "p_pct": p_val,
                "k_pct": k_val,
                "n_kg": round(n_kg, 2),
                "p_kg": round(p_kg, 2),
                "k_kg": round(k_kg, 2),
                "desc": spec.get("desc", ""),
            })

        if total_weight <= 0:
            return {"success": False, "message": "Total berat campuran harus lebih dari 0 kg"}

        final_n_pct = round((total_n_kg / total_weight) * 100.0, 2)
        final_p_pct = round((total_p_kg / total_weight) * 100.0, 2)
        final_k_pct = round((total_k_kg / total_weight) * 100.0, 2)
        avg_cn_ratio = round(weighted_cn_sum / total_weight, 1)

        # Usability Diagnostics
        notes = []
        if final_n_pct >= 2.0:
            notes.append("🌱 Tinggi Nitrogen: Sangat baik untuk memacu pertumbuhan vegetatif daun dan anakan.")
        if final_p_pct >= 2.0:
            notes.append("🌸 Tinggi Fosfor: Mendorong pembungaan serempak dan pertumbuhan akar rambut.")
        if final_k_pct >= 2.0:
            notes.append("🍇 Tinggi Kalium: Mengisi bobot buah/biji, meningkatkan rasa manis, dan kekebalan penyakit.")
        if final_n_pct < 1.0 and final_p_pct < 1.0 and final_k_pct < 1.0:
            notes.append("🛡️ Tipikal Kompos Pembenah Tanah: Lebih dominan memperbaiki struktur tanah dan populasi mikroba.")

        if avg_cn_ratio > 30:
            notes.append("⚠️ C/N Rasio Tinggi (>30): Butuh waktu fermentasi lebih lama (~3-4 pekan) atau tambahkan sumber N (urine/kotoran ayam).")
        elif avg_cn_ratio < 12:
            notes.append("⚡ C/N Rasio Rendah (<12): Fermentasi sangat cepat panas, cocok dicampur bahan berserat seperti sekam/jerami.")

        return {
            "success": True,
            "total_weight_kg": round(total_weight, 1),
            "npk_composition": f"{final_n_pct} - {final_p_pct} - {final_k_pct}",
            "metrics": {
                "n_percent": final_n_pct,
                "p_percent": final_p_pct,
                "k_percent": final_k_pct,
                "total_n_kg": round(total_n_kg, 2),
                "total_p_kg": round(total_p_kg, 2),
                "total_k_kg": round(total_k_kg, 2),
                "total_ca_kg": round(total_ca_kg, 2),
                "total_mg_kg": round(total_mg_kg, 2),
                "estimated_cn_ratio": avg_cn_ratio,
            },
            "recommendations": notes,
            "details": details,
        }

    def get_inorganic_catalog(self) -> List[Dict[str, Any]]:
        """Daftar katalog pupuk tunggal dan majemuk lengkap dengan harga subsidi HET & non-subsidi komersial."""
        catalog = []
        for name, spec in self.inorganic_db.items():
            catalog.append({
                "name": name,
                "type": spec.get("type", "Tunggal"),
                "n_pct": spec.get("N", 0.0),
                "p_pct": spec.get("P", 0.0),
                "k_pct": spec.get("K", 0.0),
                "s_pct": spec.get("S", 0.0),
                "mg_pct": spec.get("Mg", 0.0),
                "is_subsidi": spec.get("is_subsidi", False),
                "subsidi_price_per_kg": spec.get("subsidi_price_per_kg", 2500),
                "nonsubsidi_price_per_kg": spec.get("nonsubsidi_price_per_kg", 12000),
                "desc": spec.get("desc", ""),
                "color": spec.get("color", "#10b981"),
            })
        return catalog

    def calculate_combination_blending(
        self,
        target_n_kg: float,
        target_p_kg: float,
        target_k_kg: float,
        land_area_ha: float = 1.0,
        buffer_pct: float = 5.0,
        price_mode: str = "subsidi",  # 'subsidi', 'nonsubsidi', 'custom'
        custom_prices: Optional[Dict[str, float]] = None,
        compound_choice: str = "NPK Phonska Subsidi (15-10-12)",
    ) -> Dict[str, Any]:
        """
        Menghitung perbandingan kebutuhan pupuk tunggal vs majemuk vs kombinasi hybrid
        dengan dukungan skema harga subsidi (HET), non-subsidi komersial, dan kustom harga daerah.
        """
        mult = land_area_ha * (1.0 + buffer_pct / 100.0)
        req_n = target_n_kg * mult
        req_p = target_p_kg * mult
        req_k = target_k_kg * mult

        custom_prices = custom_prices or {}

        def get_price(fertilizer_name: str) -> float:
            if fertilizer_name in custom_prices and custom_prices[fertilizer_name] > 0:
                return float(custom_prices[fertilizer_name])
            spec = self.inorganic_db.get(fertilizer_name, {})
            if price_mode == "subsidi":
                return float(spec.get("subsidi_price_per_kg", 2500))
            return float(spec.get("nonsubsidi_price_per_kg", 12000))

        # Helper price retriever for specific mode
        def get_mode_price(fertilizer_name: str, mode: str) -> float:
            spec = self.inorganic_db.get(fertilizer_name, {})
            if mode == "subsidi":
                return float(spec.get("subsidi_price_per_kg", 2500))
            return float(spec.get("nonsubsidi_price_per_kg", 12000))

        # ── 1. OPSI A: Pupuk Tunggal Standar (Urea + SP-36 + KCl) ──
        urea_name = "Urea Subsidi" if price_mode == "subsidi" else "Urea Non-Subsidi (Petro/Pusri)"
        sp36_name = "SP-36 Non-Subsidi (Super Fosfat)"
        kcl_name = "KCl / MOP 60 (Kanada/Rusia)"

        urea_kg = round(req_n / 0.46, 1)
        sp36_kg = round(req_p / 0.36, 1)
        kcl_kg = round(req_k / 0.60, 1)

        cost_single_active = (
            urea_kg * get_price(urea_name) +
            sp36_kg * get_price(sp36_name) +
            kcl_kg * get_price(kcl_name)
        )
        cost_single_subsidi = (
            urea_kg * get_mode_price(urea_name, "subsidi") +
            sp36_kg * get_mode_price(sp36_name, "subsidi") +
            kcl_kg * get_mode_price(kcl_name, "subsidi")
        )
        cost_single_nonsubsidi = (
            urea_kg * get_mode_price(urea_name, "nonsubsidi") +
            sp36_kg * get_mode_price(sp36_name, "nonsubsidi") +
            kcl_kg * get_mode_price(kcl_name, "nonsubsidi")
        )

        # ── 2. OPSI B: Pupuk Majemuk Pilihan (Phonska / Mutiara / Mahkota) + Penyeimbang ──
        compound_spec = self.inorganic_db.get(compound_choice, self.inorganic_db["NPK Phonska Subsidi (15-10-12)"])
        cp_n_pct = compound_spec.get("N", 15.0) / 100.0
        cp_p_pct = compound_spec.get("P", 15.0) / 100.0
        cp_k_pct = compound_spec.get("K", 15.0) / 100.0

        # Penuhi kebutuhan P utama menggunakan pupuk majemuk
        if cp_p_pct > 0:
            compound_weight = round(req_p / cp_p_pct, 1)
        else:
            compound_weight = round(req_n / cp_n_pct, 1)

        n_from_compound = compound_weight * cp_n_pct
        p_from_compound = compound_weight * cp_p_pct
        k_from_compound = compound_weight * cp_k_pct

        extra_n_needed = max(0.0, req_n - n_from_compound)
        extra_k_needed = max(0.0, req_k - k_from_compound)

        extra_urea = round(extra_n_needed / 0.46, 1)
        extra_kcl = round(extra_k_needed / 0.60, 1)

        cost_compound_active = (
            compound_weight * get_price(compound_choice) +
            extra_urea * get_price(urea_name) +
            extra_kcl * get_price(kcl_name)
        )
        cost_compound_subsidi = (
            compound_weight * get_mode_price(compound_choice, "subsidi") +
            extra_urea * get_mode_price(urea_name, "subsidi") +
            extra_kcl * get_mode_price(kcl_name, "subsidi")
        )
        cost_compound_nonsubsidi = (
            compound_weight * get_mode_price(compound_choice, "nonsubsidi") +
            extra_urea * get_mode_price(urea_name, "nonsubsidi") +
            extra_kcl * get_mode_price(kcl_name, "nonsubsidi")
        )

        # ── 3. OPSI C: Formulasi Hybrid Berimbang (50% Organik + 50% Majemuk) ──
        organik_name = "Petroganik / Organik Subsidi" if price_mode == "subsidi" else "Kompos Matang / Bokashi Lokal"
        organik_kg = round((req_n * 0.5) / 0.015, 1) # 1.5% N
        n_from_organik = organik_kg * 0.015
        p_from_organik = organik_kg * 0.010
        k_from_organik = organik_kg * 0.015

        rem_n = max(0.0, req_n - n_from_organik)
        rem_p = max(0.0, req_p - p_from_organik)
        rem_k = max(0.0, req_k - k_from_organik)

        if cp_p_pct > 0:
            hybrid_compound_kg = round(rem_p / cp_p_pct, 1)
        else:
            hybrid_compound_kg = round(rem_n / cp_n_pct, 1)

        n_from_hy_cp = hybrid_compound_kg * cp_n_pct
        k_from_hy_cp = hybrid_compound_kg * cp_k_pct

        hy_extra_n = max(0.0, rem_n - n_from_hy_cp)
        hy_extra_k = max(0.0, rem_k - k_from_hy_cp)

        hy_urea = round(hy_extra_n / 0.46, 1)
        hy_kcl = round(hy_extra_k / 0.60, 1)

        cost_hybrid_active = (
            organik_kg * get_price(organik_name) +
            hybrid_compound_kg * get_price(compound_choice) +
            hy_urea * get_price(urea_name) +
            hy_kcl * get_price(kcl_name)
        )
        cost_hybrid_subsidi = (
            organik_kg * get_mode_price(organik_name, "subsidi") +
            hybrid_compound_kg * get_mode_price(compound_choice, "subsidi") +
            hy_urea * get_mode_price(urea_name, "subsidi") +
            hy_kcl * get_mode_price(kcl_name, "subsidi")
        )
        cost_hybrid_nonsubsidi = (
            organik_kg * get_mode_price(organik_name, "nonsubsidi") +
            hybrid_compound_kg * get_mode_price(compound_choice, "nonsubsidi") +
            hy_urea * get_mode_price(urea_name, "nonsubsidi") +
            hy_kcl * get_mode_price(kcl_name, "nonsubsidi")
        )

        return {
            "success": True,
            "target": {
                "n_kg": round(req_n, 1),
                "p_kg": round(req_p, 1),
                "k_kg": round(req_k, 1),
                "land_area_ha": land_area_ha,
                "buffer_pct": buffer_pct,
                "price_mode": price_mode,
                "compound_choice": compound_choice,
            },
            "options": [
                {
                    "name": f"Opsi 1: Pupuk Majemuk {compound_choice} + Penyeimbang",
                    "category": "Majemuk Presisi & Cepat Serap",
                    "total_cost_rp": round(cost_compound_active),
                    "cost_subsidi_rp": round(cost_compound_subsidi),
                    "cost_nonsubsidi_rp": round(cost_compound_nonsubsidi),
                    "savings_subsidi_rp": max(0, round(cost_compound_nonsubsidi - cost_compound_subsidi)),
                    "items": [
                        {
                            "fertilizer": compound_choice,
                            "weight_kg": compound_weight,
                            "sacks_50kg": round(compound_weight / 50, 1),
                            "price_per_kg": get_price(compound_choice),
                            "cost_rp": round(compound_weight * get_price(compound_choice)),
                        },
                        {
                            "fertilizer": f"{urea_name} (Penyeimbang N)",
                            "weight_kg": extra_urea,
                            "sacks_50kg": round(extra_urea / 50, 1),
                            "price_per_kg": get_price(urea_name),
                            "cost_rp": round(extra_urea * get_price(urea_name)),
                        },
                        {
                            "fertilizer": f"{kcl_name} (Penyeimbang K)",
                            "weight_kg": extra_kcl,
                            "sacks_50kg": round(extra_kcl / 50, 1),
                            "price_per_kg": get_price(kcl_name),
                            "cost_rp": round(extra_kcl * get_price(kcl_name)),
                        },
                    ],
                    "pros": "Aplikasi tabur seragam, hara majemuk N-P-K langsung tersedia dalam satu butir granul.",
                },
                {
                    "name": "Opsi 2: Pupuk Tunggal Standar (Urea + SP-36 + KCl)",
                    "category": "Tunggal Terpisah (Custom Ratio)",
                    "total_cost_rp": round(cost_single_active),
                    "cost_subsidi_rp": round(cost_single_subsidi),
                    "cost_nonsubsidi_rp": round(cost_single_nonsubsidi),
                    "savings_subsidi_rp": max(0, round(cost_single_nonsubsidi - cost_single_subsidi)),
                    "items": [
                        {
                            "fertilizer": urea_name,
                            "weight_kg": urea_kg,
                            "sacks_50kg": round(urea_kg / 50, 1),
                            "price_per_kg": get_price(urea_name),
                            "cost_rp": round(urea_kg * get_price(urea_name)),
                        },
                        {
                            "fertilizer": sp36_name,
                            "weight_kg": sp36_kg,
                            "sacks_50kg": round(sp36_kg / 50, 1),
                            "price_per_kg": get_price(sp36_name),
                            "cost_rp": round(sp36_kg * get_price(sp36_name)),
                        },
                        {
                            "fertilizer": kcl_name,
                            "weight_kg": kcl_kg,
                            "sacks_50kg": round(kcl_kg / 50, 1),
                            "price_per_kg": get_price(kcl_name),
                            "cost_rp": round(kcl_kg * get_price(kcl_name)),
                        },
                    ],
                    "pros": "Sangat fleksibel mengatur waktu aplikasi (misal P saat tanam, N fase vegetatif, K fase generatif).",
                },
                {
                    "name": f"Opsi 3: Formulasi Hybrid Berimbang (50% Organik + 50% Majemuk {compound_choice})",
                    "category": "Hybrid Ramah Lingkungan & Kesuburan Tanah",
                    "total_cost_rp": round(cost_hybrid_active),
                    "cost_subsidi_rp": round(cost_hybrid_subsidi),
                    "cost_nonsubsidi_rp": round(cost_hybrid_nonsubsidi),
                    "savings_subsidi_rp": max(0, round(cost_hybrid_nonsubsidi - cost_hybrid_subsidi)),
                    "items": [
                        {
                            "fertilizer": organik_name,
                            "weight_kg": organik_kg,
                            "sacks_50kg": round(organik_kg / 40, 1), # karung organik 40kg
                            "price_per_kg": get_price(organik_name),
                            "cost_rp": round(organik_kg * get_price(organik_name)),
                        },
                        {
                            "fertilizer": compound_choice,
                            "weight_kg": hybrid_compound_kg,
                            "sacks_50kg": round(hybrid_compound_kg / 50, 1),
                            "price_per_kg": get_price(compound_choice),
                            "cost_rp": round(hybrid_compound_kg * get_price(compound_choice)),
                        },
                        {
                            "fertilizer": f"{urea_name} (Penyeimbang N)",
                            "weight_kg": hy_urea,
                            "sacks_50kg": round(hy_urea / 50, 1),
                            "price_per_kg": get_price(urea_name),
                            "cost_rp": round(hy_urea * get_price(urea_name)),
                        },
                        {
                            "fertilizer": f"{kcl_name} (Penyeimbang K)",
                            "weight_kg": hy_kcl,
                            "sacks_50kg": round(hy_kcl / 50, 1),
                            "price_per_kg": get_price(kcl_name),
                            "cost_rp": round(hy_kcl * get_price(kcl_name)),
                        },
                    ],
                    "pros": "Meningkatkan daya ikat air tanah, mencegah pencucian hara (leaching), dan menjaga biomassa mikroba.",
                },
            ],
        }

    def get_recipes(self) -> List[Dict[str, Any]]:
        """Mengembalikan daftar ensiklopedia resep SOP pembuatan pupuk organik."""
        return self.recipes

    def get_raw_materials(self) -> Dict[str, Any]:
        """Mengembalikan daftar database bahan baku organik ilmiah."""
        return self.organic_db

        return self.organic_db
