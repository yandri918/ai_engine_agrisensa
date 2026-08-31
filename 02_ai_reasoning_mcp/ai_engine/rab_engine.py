"""
AgriSensa RAB Engine (Rencana Anggaran Biaya)
=============================================
Menghitung RAB pertanian secara komprehensif beserta:
- ROI   : Return on Investment
- BEP   : Break-Even Point (ton & Rp)
- MOS   : Margin of Safety
- TCR   : Total Cost to Revenue Ratio
- Skenario: Optimis / Netral / Pesimis

Digunakan oleh Monte Carlo sebagai base model.
"""

from dataclasses import dataclass, field, asdict
from typing import List, Optional, Dict, Any
from enum import Enum
import math
import logging

logger = logging.getLogger("agrisensa.rab_engine")


# ─────────────────────────────────────────────────────────────────────────────
# Enums & Constants
# ─────────────────────────────────────────────────────────────────────────────

class Scenario(str, Enum):
    OPTIMIS  = "optimis"
    NETRAL   = "netral"
    PESIMIS  = "pesimis"

SCENARIO_MULTIPLIERS = {
    Scenario.OPTIMIS: {"yield": 1.20, "price": 1.15, "cost": 0.90},
    Scenario.NETRAL:  {"yield": 1.00, "price": 1.00, "cost": 1.00},
    Scenario.PESIMIS: {"yield": 0.80, "price": 0.85, "cost": 1.10},
}

# ─────────────────────────────────────────────────────────────────────────────
# Data Classes
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class BiayaItem:
    """Satu item biaya dalam RAB."""
    kategori: str           # 'benih', 'pupuk', 'pestisida', 'tenaga_kerja', 'sewa_lahan', 'lain'
    nama: str
    volume: float
    satuan: str             # 'kg', 'liter', 'HOK', 'bulan', 'paket'
    harga_satuan: float     # Rp / satuan
    keterangan: str = ""

    @property
    def total(self) -> float:
        return self.volume * self.harga_satuan


@dataclass
class RABInput:
    """Input utama RAB Engine."""
    komoditas: str
    luas_ha: float                          # Luas lahan (ha)
    estimasi_yield_ton_ha: float            # Estimasi hasil panen (ton/ha)
    harga_jual_rp_kg: float                 # Harga jual (Rp/kg)
    komponen_biaya: List[BiayaItem] = field(default_factory=list)
    musim_tanam_bulan: int = 4              # Durasi musim tanam
    biaya_penyusutan_persen: float = 5.0    # % dari total biaya (alat)
    pajak_persen: float = 0.0              # % pajak penghasilan
    catatan: str = ""

    def total_biaya(self) -> float:
        base = sum(item.total for item in self.komponen_biaya)
        penyusutan = base * (self.biaya_penyusutan_persen / 100)
        return base + penyusutan

    def total_produksi_kg(self) -> float:
        return self.luas_ha * self.estimasi_yield_ton_ha * 1000

    def total_pendapatan(self) -> float:
        return self.total_produksi_kg() * self.harga_jual_rp_kg


@dataclass
class RABResult:
    """Hasil kalkulasi RAB lengkap."""
    # Input summary
    komoditas: str
    luas_ha: float
    musim_tanam_bulan: int

    # Produksi
    total_produksi_kg: float
    total_produksi_ton: float
    yield_per_ha_ton: float

    # Keuangan
    total_biaya_rp: float
    total_pendapatan_rp: float
    keuntungan_bersih_rp: float

    # Indikator
    roi_persen: float          # Return on Investment (%)
    bep_kg: float              # Break-Even Point dalam kg
    bep_ton: float             # Break-Even Point dalam ton
    bep_rp: float              # Break-Even Point dalam Rp (harga minimum)
    mos_persen: float          # Margin of Safety (%)
    tcr: float                 # Total Cost Ratio (biaya/pendapatan)

    # Biaya per unit
    hpp_rp_kg: float           # Harga Pokok Produksi per kg
    hpp_rp_ton: float          # HPP per ton

    # Tabel biaya detail
    breakdown_biaya: List[Dict]

    # Skenario
    scenarios: Dict[str, Dict]

    # Metadata
    catatan: str = ""


# ─────────────────────────────────────────────────────────────────────────────
# Core Engine
# ─────────────────────────────────────────────────────────────────────────────

class RABEngine:
    """
    RAB (Rencana Anggaran Biaya) Calculator untuk pertanian.
    Menghitung ROI, BEP, MOS, TCR, dan skenario optimis/netral/pesimis.
    """

    def __init__(self):
        logger.info("RABEngine initialized")

    # ──────────────────────────────────────
    # Public: Calculate RAB
    # ──────────────────────────────────────

    def calculate(self, rab_input: RABInput) -> RABResult:
        """Hitung RAB lengkap dari input yang diberikan."""
        logger.info(f"Calculating RAB for {rab_input.komoditas}, {rab_input.luas_ha} ha")

        total_biaya   = rab_input.total_biaya()
        total_produksi_kg  = rab_input.total_produksi_kg()
        total_produksi_ton = total_produksi_kg / 1000
        total_pendapatan   = rab_input.total_pendapatan()

        # Pajak
        laba_sebelum_pajak = total_pendapatan - total_biaya
        pajak = max(0, laba_sebelum_pajak) * (rab_input.pajak_persen / 100)
        keuntungan_bersih = laba_sebelum_pajak - pajak

        # ROI (Return on Investment)
        roi = (keuntungan_bersih / total_biaya * 100) if total_biaya > 0 else 0.0

        # BEP (Break-Even Point)
        bep_kg  = (total_biaya / rab_input.harga_jual_rp_kg) if rab_input.harga_jual_rp_kg > 0 else 0.0
        bep_ton = bep_kg / 1000
        bep_rp  = (total_biaya / total_produksi_kg) if total_produksi_kg > 0 else 0.0

        # MOS (Margin of Safety)
        mos = ((total_produksi_kg - bep_kg) / total_produksi_kg * 100) if total_produksi_kg > 0 else 0.0

        # TCR (Total Cost Ratio)
        tcr = (total_biaya / total_pendapatan) if total_pendapatan > 0 else float('inf')

        # HPP (Harga Pokok Produksi)
        hpp_kg  = (total_biaya / total_produksi_kg)  if total_produksi_kg > 0 else 0.0
        hpp_ton = (total_biaya / total_produksi_ton) if total_produksi_ton > 0 else 0.0

        # Breakdown biaya per kategori
        breakdown = self._build_breakdown(rab_input)

        # Skenario
        scenarios = self._build_scenarios(rab_input, total_biaya)

        return RABResult(
            komoditas=rab_input.komoditas,
            luas_ha=rab_input.luas_ha,
            musim_tanam_bulan=rab_input.musim_tanam_bulan,
            total_produksi_kg=round(total_produksi_kg, 2),
            total_produksi_ton=round(total_produksi_ton, 3),
            yield_per_ha_ton=rab_input.estimasi_yield_ton_ha,
            total_biaya_rp=round(total_biaya, 0),
            total_pendapatan_rp=round(total_pendapatan, 0),
            keuntungan_bersih_rp=round(keuntungan_bersih, 0),
            roi_persen=round(roi, 2),
            bep_kg=round(bep_kg, 2),
            bep_ton=round(bep_ton, 3),
            bep_rp=round(bep_rp, 0),
            mos_persen=round(mos, 2),
            tcr=round(tcr, 4),
            hpp_rp_kg=round(hpp_kg, 0),
            hpp_rp_ton=round(hpp_ton, 0),
            breakdown_biaya=breakdown,
            scenarios=scenarios,
            catatan=rab_input.catatan,
        )

    def calculate_from_dict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Parse dict → RABInput → RABResult → dict (untuk API)."""
        try:
            raw_komponen = data.get("komponen_biaya") or []
            komponen = []
            for item in raw_komponen:
                komponen.append(BiayaItem(
                    kategori=item.get("kategori", "lain"),
                    nama=item.get("nama", ""),
                    volume=float(item.get("volume", 0)),
                    satuan=item.get("satuan", "unit"),
                    harga_satuan=float(item.get("harga_satuan", 0)),
                    keterangan=item.get("keterangan", ""),
                ))

            rab_input = RABInput(
                komoditas=data.get("komoditas", "tanaman"),
                luas_ha=float(data.get("luas_ha", 1.0)),
                estimasi_yield_ton_ha=float(data.get("estimasi_yield_ton_ha", 5.0)),
                harga_jual_rp_kg=float(data.get("harga_jual_rp_kg", 3000)),
                komponen_biaya=komponen,
                musim_tanam_bulan=int(data.get("musim_tanam_bulan", 4)),
                biaya_penyusutan_persen=float(data.get("biaya_penyusutan_persen", 5.0)),
                pajak_persen=float(data.get("pajak_persen", 0.0)),
                catatan=data.get("catatan", ""),
            )

            # Jika komponen biaya kosong, gunakan default
            if not komponen:
                rab_input = self._apply_default_costs(rab_input)

            result = self.calculate(rab_input)
            return {"success": True, "data": asdict(result)}

        except Exception as e:
            logger.error(f"RAB calculation error: {e}")
            return {"success": False, "error": str(e)}

    # ──────────────────────────────────────
    # Private helpers
    # ──────────────────────────────────────

    def _build_breakdown(self, rab_input: RABInput) -> List[Dict]:
        """Bangun tabel breakdown biaya per kategori."""
        categories: Dict[str, float] = {}
        for item in rab_input.komponen_biaya:
            categories[item.kategori] = categories.get(item.kategori, 0) + item.total

        total = sum(categories.values())
        breakdown = []
        for kat, jumlah in categories.items():
            persen = (jumlah / total * 100) if total > 0 else 0
            breakdown.append({
                "kategori": kat,
                "total_rp": round(jumlah, 0),
                "persentase": round(persen, 2),
            })

        # Detail per item
        detail = []
        for item in rab_input.komponen_biaya:
            detail.append({
                "kategori": item.kategori,
                "nama": item.nama,
                "volume": item.volume,
                "satuan": item.satuan,
                "harga_satuan_rp": item.harga_satuan,
                "total_rp": round(item.total, 0),
                "keterangan": item.keterangan,
            })

        return {"ringkasan_kategori": breakdown, "detail_item": detail}

    def _build_scenarios(self, rab_input: RABInput, base_total_biaya: float) -> Dict:
        """Bangun tiga skenario: optimis, netral, pesimis."""
        scenarios = {}
        for scenario in Scenario:
            mult = SCENARIO_MULTIPLIERS[scenario]
            yield_adj   = rab_input.estimasi_yield_ton_ha * mult["yield"]
            price_adj   = rab_input.harga_jual_rp_kg * mult["price"]
            cost_adj    = base_total_biaya * mult["cost"]

            produksi_kg  = rab_input.luas_ha * yield_adj * 1000
            pendapatan   = produksi_kg * price_adj
            keuntungan   = pendapatan - cost_adj
            roi          = (keuntungan / cost_adj * 100) if cost_adj > 0 else 0
            bep_kg       = (cost_adj / price_adj) if price_adj > 0 else 0
            mos          = ((produksi_kg - bep_kg) / produksi_kg * 100) if produksi_kg > 0 else 0

            scenarios[scenario.value] = {
                "yield_ton_ha": round(yield_adj, 2),
                "harga_jual_rp_kg": round(price_adj, 0),
                "total_biaya_rp": round(cost_adj, 0),
                "total_pendapatan_rp": round(pendapatan, 0),
                "keuntungan_rp": round(keuntungan, 0),
                "roi_persen": round(roi, 2),
                "bep_kg": round(bep_kg, 2),
                "mos_persen": round(mos, 2),
                "status": "UNTUNG" if keuntungan > 0 else "RUGI",
            }
        return scenarios

        
    def get_available_templates(self) -> List[str]:
        """Daftar template komoditas budidaya yang tersedia di AgriSensa."""
        return [
            "Padi Sawah (Inpari / IR64)",
            "Cabai Merah (Lahan Terbuka / Mulsa)",
            "Cabai Merah (Greenhouse Hydroponic)",
            "Jagung Hibrida",
            "Kentang (Dieng / Granola)",
            "Kubis / Kol",
            "Wortel",
            "Semangka (Non-Biji)",
            "Melon (Greenhouse Premium)",
            "Krisan / Bunga Potong (Greenhouse)",
            "Buah Naga (Investasi Tahun 1)",
        ]

    def _apply_default_costs(self, rab_input: RABInput) -> RABInput:
        """Default komponen biaya presisi per komoditas budidaya AgriSensa."""
        try:
            from agrisensa_biz.data.crop_rab_templates import CROP_TEMPLATES
        except Exception:
            CROP_TEMPLATES = None

        key = rab_input.komoditas.lower()
        matched_template = None

        if CROP_TEMPLATES:
            for c_name, t_data in CROP_TEMPLATES.items():
                if key in c_name.lower() or c_name.lower() in key:
                    matched_template = t_data
                    break

        if matched_template:
            # Set params if using baseline defaults
            params = matched_template.get("params", {})
            if rab_input.estimasi_yield_ton_ha <= 0 or rab_input.estimasi_yield_ton_ha == 5.0:
                rab_input.estimasi_yield_ton_ha = float(params.get("total_panen_kg", 5000)) / 1000.0
            if rab_input.harga_jual_rp_kg <= 0 or rab_input.harga_jual_rp_kg == 3000:
                rab_input.harga_jual_rp_kg = float(params.get("harga_jual", 3000))
            if params.get("lama_tanam_bulan"):
                rab_input.musim_tanam_bulan = int(params.get("lama_tanam_bulan", 4))

            rab_input.komponen_biaya = [
                BiayaItem(
                    kategori=item.get("kategori", "lain").lower().replace(" ", "_"),
                    nama=item.get("item", item.get("nama", "")),
                    volume=float(item.get("volume", 1)) * rab_input.luas_ha,
                    satuan=item.get("satuan", "unit"),
                    harga_satuan=float(item.get("harga", item.get("harga_satuan", 0))),
                    keterangan=item.get("catatan", "")
                )
                for item in matched_template.get("items", [])
            ]
            return rab_input

        # Fallback dictionary standard
        komoditas_defaults = {
            "padi": [
                BiayaItem("benih",        "Benih Padi Unggul (IR64/Inpari)", 25.0, "kg",   15000, "Sertifikasi Unggul"),
                BiayaItem("pupuk",        "Urea (N=46%)",                   200.0, "kg",    3000, "Pupuk Dasar & Susulan"),
                BiayaItem("pupuk",        "SP-36 (P=36%)",                  100.0, "kg",    4500, "Pupuk Dasar"),
                BiayaItem("pupuk",        "KCl (K=60%)",                    100.0, "kg",    6000, "Pengisi Bulir"),
                BiayaItem("pestisida",    "Insektisida (Wereng/Penggerek)",    2.0, "liter", 80000, ""),
                BiayaItem("pestisida",    "Fungisida (Blast/Hawar Daun)",      1.5, "liter", 70000, ""),
                BiayaItem("tenaga_kerja", "Olah Lahan (Traktor)",              5.0, "HOK",  100000, ""),
                BiayaItem("tenaga_kerja", "Tanam / Tandur",                   20.0, "HOK",   80000, ""),
                BiayaItem("tenaga_kerja", "Pemupukan & Matun",                10.0, "HOK",   80000, ""),
                BiayaItem("tenaga_kerja", "Panen & Perontokan",               15.0, "HOK",   90000, ""),
                BiayaItem("sewa_lahan",   "Sewa Lahan Sawah",                  1.0, "ha",  2000000, "Per musim"),
                BiayaItem("lain",         "Irigasi & Pengairan",               1.0, "paket", 300000, ""),
            ],
            "cabai": [
                BiayaItem("benih",        "Benih Cabai Hibrida F1",           0.05, "kg",  3000000, "18.000 bibit"),
                BiayaItem("pupuk",        "Pupuk Kandang Matang (Fermentasi)",2000.0, "kg",     500, "Pupuk Dasar Organik"),
                BiayaItem("pupuk",        "NPK Mutiara 16-16-16",             300.0, "kg",    6500, "Dasar & Kocor"),
                BiayaItem("penunjang",    "Mulsa Plastik Hitam Perak (MPHP)",  5.0, "roll",  650000, "1 Ha"),
                BiayaItem("penunjang",    "Ajir / Bambu Penyangga",        18000.0, "batang",   200, "Penyangga Cabai"),
                BiayaItem("pestisida",    "Insektisida (Kutu Kebul/Thrips)",   3.0, "liter", 120000, ""),
                BiayaItem("pestisida",    "Fungisida (Antraknosa/Patek)",      3.0, "liter", 110000, ""),
                BiayaItem("tenaga_kerja", "Olah Lahan & Bedengan",            30.0, "HOK",   80000, ""),
                BiayaItem("tenaga_kerja", "Pasang Mulsa & Tanam",             20.0, "HOK",   80000, ""),
                BiayaItem("tenaga_kerja", "Perawatan & Kocor Rutin",          40.0, "HOK",   80000, ""),
                BiayaItem("tenaga_kerja", "Panen Bertahap (10-15x Petik)",    40.0, "HOK",   80000, ""),
                BiayaItem("sewa_lahan",   "Sewa Lahan",                        1.0, "ha",  2500000, "Per musim"),
            ]
        }
        fallback_key = "cabai" if "caba" in key or "chili" in key else ("padi" if "padi" in key or "rice" in key else "padi")
        defaults = komoditas_defaults.get(fallback_key, komoditas_defaults["padi"])
        rab_input.komponen_biaya = [
            BiayaItem(
                i.kategori, i.nama,
                i.volume * rab_input.luas_ha,
                i.satuan, i.harga_satuan, i.keterangan
            ) for i in defaults
        ]
        return rab_input
