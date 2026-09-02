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
# 2. Chemical / Inorganic Fertilizer Database
# ─────────────────────────────────────────────────────────────────────────────

INORGANIC_FERTILIZERS_DB: Dict[str, Dict[str, Any]] = {
    "Urea": {"N": 46.0, "P": 0.0, "K": 0.0, "price_per_kg": 2500, "density": 0.75, "color": "#3b82f6"},
    "SP-36": {"N": 0.0, "P": 36.0, "K": 0.0, "price_per_kg": 3000, "density": 1.1, "color": "#10b981"},
    "KCl / MOP 60": {"N": 0.0, "P": 0.0, "K": 60.0, "price_per_kg": 3500, "density": 1.0, "color": "#f59e0b"},
    "ZA (Amonium Sulfat)": {"N": 21.0, "P": 0.0, "K": 0.0, "S": 24.0, "price_per_kg": 2200, "density": 0.9, "color": "#06b6d4"},
    "NPK 15-15-15": {"N": 15.0, "P": 15.0, "K": 15.0, "price_per_kg": 4000, "density": 1.0, "color": "#8b5cf6"},
    "NPK 16-16-16 (Mutiara)": {"N": 16.0, "P": 16.0, "K": 16.0, "price_per_kg": 4200, "density": 1.0, "color": "#ec4899"},
    "KNO3 Putih (Kalium Nitrat)": {"N": 13.0, "P": 0.0, "K": 45.0, "price_per_kg": 18000, "density": 1.1, "color": "#6366f1"},
    "MKP (Mono Kalium Fosfat)": {"N": 0.0, "P": 52.0, "K": 34.0, "price_per_kg": 22000, "density": 1.0, "color": "#14b8a6"},
    "Kompos Matang (Organik)": {"N": 1.5, "P": 1.0, "K": 1.5, "price_per_kg": 1200, "density": 0.55, "color": "#84cc16"},
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

    def calculate_combination_blending(
        self,
        target_n_kg: float,
        target_p_kg: float,
        target_k_kg: float,
        land_area_ha: float = 1.0,
        buffer_pct: float = 5.0,
    ) -> Dict[str, Any]:
        """
        Menghitung perbandingan kebutuhan pupuk tunggal vs majemuk vs kombinasi organik-kimia.
        """
        mult = land_area_ha * (1.0 + buffer_pct / 100.0)
        req_n = target_n_kg * mult
        req_p = target_p_kg * mult
        req_k = target_k_kg * mult

        # 1. Opsi A: Pupuk Tunggal Standar (Urea + SP-36 + KCl)
        urea_kg = round(req_n / 0.46, 1)
        sp36_kg = round(req_p / 0.36, 1)
        kcl_kg = round(req_k / 0.60, 1)
        cost_single = (
            urea_kg * self.inorganic_db["Urea"]["price_per_kg"] +
            sp36_kg * self.inorganic_db["SP-36"]["price_per_kg"] +
            kcl_kg * self.inorganic_db["KCl / MOP 60"]["price_per_kg"]
        )

        # 2. Opsi B: Pupuk Majemuk NPK 16-16-16 + Tambahan Tunggal
        # Penuhi P dengan NPK 16-16-16 dulu
        npk_weight = round(req_p / 0.16, 1)
        n_from_npk = npk_weight * 0.16
        k_from_npk = npk_weight * 0.16

        extra_n_needed = max(0.0, req_n - n_from_npk)
        extra_k_needed = max(0.0, req_k - k_from_npk)

        extra_urea = round(extra_n_needed / 0.46, 1)
        extra_kcl = round(extra_k_needed / 0.60, 1)

        cost_compound = (
            npk_weight * self.inorganic_db["NPK 16-16-16 (Mutiara)"]["price_per_kg"] +
            extra_urea * self.inorganic_db["Urea"]["price_per_kg"] +
            extra_kcl * self.inorganic_db["KCl / MOP 60"]["price_per_kg"]
        )

        # 3. Opsi C: Pupuk Kombinasi Terpadu (50% Organik Kompos Matang + 50% Anorganik)
        kompos_kg = round((req_n * 0.5) / 0.015, 1) # 1.5% N
        n_from_kompos = kompos_kg * 0.015
        p_from_kompos = kompos_kg * 0.010
        k_from_kompos = kompos_kg * 0.015

        sub_n_needed = max(0.0, req_n - n_from_kompos)
        sub_p_needed = max(0.0, req_p - p_from_kompos)
        sub_k_needed = max(0.0, req_k - k_from_kompos)

        sub_urea = round(sub_n_needed / 0.46, 1)
        sub_sp36 = round(sub_p_needed / 0.36, 1)
        sub_kcl = round(sub_k_needed / 0.60, 1)

        cost_hybrid = (
            kompos_kg * self.inorganic_db["Kompos Matang (Organik)"]["price_per_kg"] +
            sub_urea * self.inorganic_db["Urea"]["price_per_kg"] +
            sub_sp36 * self.inorganic_db["SP-36"]["price_per_kg"] +
            sub_kcl * self.inorganic_db["KCl / MOP 60"]["price_per_kg"]
        )

        return {
            "success": True,
            "target": {
                "n_kg": round(req_n, 1),
                "p_kg": round(req_p, 1),
                "k_kg": round(req_k, 1),
                "land_area_ha": land_area_ha,
                "buffer_pct": buffer_pct,
            },
            "options": [
                {
                    "name": "Opsi 1: Pupuk Tunggal Berimbang (Urea + SP-36 + KCl)",
                    "category": "Anorganik Murni",
                    "total_cost_rp": round(cost_single),
                    "items": [
                        {"fertilizer": "Urea (46% N)", "weight_kg": urea_kg, "sacks_50kg": round(urea_kg / 50, 1), "cost_rp": round(urea_kg * 2500)},
                        {"fertilizer": "SP-36 (36% P)", "weight_kg": sp36_kg, "sacks_50kg": round(sp36_kg / 50, 1), "cost_rp": round(sp36_kg * 3000)},
                        {"fertilizer": "KCl 60 (60% K)", "weight_kg": kcl_kg, "sacks_50kg": round(kcl_kg / 50, 1), "cost_rp": round(kcl_kg * 3500)},
                    ],
                    "pros": "Fleksibel mengatur rasio hara spesifik tiap fase tanam.",
                },
                {
                    "name": "Opsi 2: Pupuk Majemuk NPK 16-16-16 + Suplemen",
                    "category": "Majemuk Efisien",
                    "total_cost_rp": round(cost_compound),
                    "items": [
                        {"fertilizer": "NPK Mutiara 16-16-16", "weight_kg": npk_weight, "sacks_50kg": round(npk_weight / 50, 1), "cost_rp": round(npk_weight * 4200)},
                        {"fertilizer": "Urea (Penyeimbang N)", "weight_kg": extra_urea, "sacks_50kg": round(extra_urea / 50, 1), "cost_rp": round(extra_urea * 2500)},
                        {"fertilizer": "KCl 60 (Penyeimbang K)", "weight_kg": extra_kcl, "sacks_50kg": round(extra_kcl / 50, 1), "cost_rp": round(extra_kcl * 3500)},
                    ],
                    "pros": "Praktis saat aplikasi tabur dan larut cepat.",
                },
                {
                    "name": "Opsi 3: Formulasi Kombinasi Hybrid (50% Kompos + 50% Kimia)",
                    "category": "Hybrid Ramah Lingkungan & ESG",
                    "total_cost_rp": round(cost_hybrid),
                    "items": [
                        {"fertilizer": "Kompos Organik Matang", "weight_kg": kompos_kg, "sacks_50kg": round(kompos_kg / 50, 1), "cost_rp": round(kompos_kg * 1200)},
                        {"fertilizer": "Urea (46% N)", "weight_kg": sub_urea, "sacks_50kg": round(sub_urea / 50, 1), "cost_rp": round(sub_urea * 2500)},
                        {"fertilizer": "SP-36 (36% P)", "weight_kg": sub_sp36, "sacks_50kg": round(sub_sp36 / 50, 1), "cost_rp": round(sub_sp36 * 3000)},
                        {"fertilizer": "KCl 60 (60% K)", "weight_kg": sub_kcl, "sacks_50kg": round(sub_kcl / 50, 1), "cost_rp": round(sub_kcl * 3500)},
                    ],
                    "pros": "Meningkatkan retensi air tanah, menekan emisi karbon, dan menjaga kesuburan tanah jangka panjang.",
                },
            ],
        }

    def get_recipes(self) -> List[Dict[str, Any]]:
        """Mengembalikan daftar ensiklopedia resep SOP pembuatan pupuk organik."""
        return self.recipes

    def get_raw_materials(self) -> Dict[str, Any]:
        """Mengembalikan daftar database bahan baku organik ilmiah."""
        return self.organic_db
