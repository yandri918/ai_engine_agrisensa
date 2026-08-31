"""
AgriSensa Carbon Footprint Model
=================================
Menghitung jejak karbon (Carbon Footprint) kegiatan pertanian berdasarkan:
- IPCC 2006 Guidelines for Agriculture, Forestry and Other Land Use (AFOLU)
- Tier 1 emission factors
- Faktor emisi pupuk nitrogen (N₂O)
- Emisi pembakaran bahan bakar (CO₂)
- Emisi tanah (CH₄ dari sawah)
- Potensi carbon offset (penyerapan karbon)

Output:
- Total GHG (CO₂ equivalent) dalam ton CO₂e/ha
- Breakdown per sumber emisi
- Carbon credit potensial (USD)
- Jumlah pohon setara
- Rekomendasi reduksi emisi
"""

import logging
from dataclasses import dataclass, field, asdict
from typing import Dict, Any, List, Optional

logger = logging.getLogger("agrisensa.carbon_model")

# ─────────────────────────────────────────────────────────────────────────────
# IPCC Emission Factors (Tier 1)
# ─────────────────────────────────────────────────────────────────────────────

# N₂O emission factor dari pupuk nitrogen → CO₂e
# IPCC 2006: EF1 = 0.01 kg N₂O-N / kg N input
# GWP N₂O = 265 (AR5), GWP CH₄ = 28 (AR5)
EF_N2O_NITROGEN     = 0.01       # kg N₂O-N per kg N applied
GWP_N2O             = 265.0      # Global Warming Potential N₂O (100yr, AR5)
GWP_CH4             = 28.0       # Global Warming Potential CH₄
N_TO_N2O            = 44 / 28    # Konversi N₂O-N → N₂O (44/28)

# Bahan bakar → CO₂e
FUEL_EMISSION = {
    "solar":         2.68,   # kg CO₂/liter (diesel)
    "bensin":        2.31,   # kg CO₂/liter (petrol)
    "gas_lpg":       2.98,   # kg CO₂/kg LPG
    "listrik_grid":  0.87,   # kg CO₂/kWh (grid Indonesia)
}

# Pupuk anorganik (kg CO₂e per kg pupuk) — emisi produksi
FERTILIZER_PRODUCTION_EF = {
    "urea":          3.5,   # kg CO₂e/kg (termasuk produksi)
    "sp36":          1.0,   # kg CO₂e/kg
    "kcl":           0.5,   # kg CO₂e/kg
    "npk":           2.0,   # rata-rata
    "za":            2.8,   # Ammonium Sulfate
    "ponska":        2.0,   # NPK Ponska
    "pupuk_kandang": 0.05,  # low EF untuk organik
    "kompos":        0.02,  # near-zero
}

# Rice paddy CH₄ emission (kg CH₄/ha/musim) — IPCC default
PADDY_CH4_EMISSION = 1.3    # ton CO₂e/ha/musim (continuous flooding)

# Carbon sequestration (pohon/lahan)
TREE_CO2_ABSORPTION_KG_YR  = 21.77  # kg CO₂/pohon/tahun (rata-rata)
CARBON_CREDIT_PRICE_USD    = 15.0   # USD per ton CO₂e (voluntary market)

# ─────────────────────────────────────────────────────────────────────────────
# Data Classes
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class FertilizerInput:
    """Input pupuk untuk kalkulasi emisi."""
    jenis: str          # 'urea', 'sp36', 'kcl', 'npk', etc.
    jumlah_kg: float    # kg per ha

@dataclass
class FuelInput:
    """Input bahan bakar untuk kalkulasi emisi."""
    jenis: str          # 'solar', 'bensin', 'listrik_grid'
    jumlah: float       # liter / kWh
    satuan: str = "liter"

@dataclass
class CarbonInput:
    """Input lengkap Carbon Model."""
    komoditas: str
    luas_ha: float
    pupuk_list: List[FertilizerInput] = field(default_factory=list)
    bahan_bakar_list: List[FuelInput] = field(default_factory=list)
    pembakaran_biomassa_ton: float = 0.0    # Ton biomassa yang dibakar
    is_sawah: bool = False                  # True = padi sawah (ada CH₄)
    jumlah_ternak: int = 0                  # Ternak (enteric fermentation)
    jenis_ternak: str = "sapi"              # 'sapi', 'kambing', 'ayam'
    carbon_sink_pohon: int = 0              # Jumlah pohon yang ditanam
    periode_tahun: float = 1.0             # Periode analisis (tahun)
    catatan: str = ""

@dataclass
class EmissionSource:
    """Satu sumber emisi."""
    nama: str
    nilai_co2e_ton: float
    persen_total: float = 0.0
    keterangan: str = ""

@dataclass
class CarbonResult:
    """Hasil lengkap perhitungan carbon footprint."""
    komoditas: str
    luas_ha: float
    periode_tahun: float

    # Total GHG
    total_co2e_ton: float              # Total emisi ton CO₂e
    co2e_per_ha: float                 # Emisi per hektar
    co2e_per_ton_produksi: float       # Emisi per ton produksi (jika diketahui)

    # Breakdown emisi
    emisi_pupuk_n2o_ton: float         # Emisi N₂O dari pupuk
    emisi_pupuk_produksi_ton: float    # Emisi produksi pupuk
    emisi_bahan_bakar_ton: float       # Emisi CO₂ bahan bakar
    emisi_pembakaran_ton: float        # Emisi pembakaran biomassa
    emisi_sawah_ch4_ton: float         # Emisi CH₄ sawah padi
    emisi_ternak_ton: float            # Emisi enteric fermentation
    sources_detail: List[Dict]         # Detail per sumber

    # Carbon sink & offset
    carbon_sink_pohon_ton: float       # Penyerapan pohon yang ditanam
    net_co2e_ton: float                # Emisi bersih (setelah sink)
    offset_percentage: float           # % emisi yang di-offset

    # Carbon credit
    carbon_credit_potential_ton: float # Ton CO₂e yang bisa dijual
    carbon_credit_usd: float           # Nilai carbon credit (USD)
    carbon_credit_idr: float           # Nilai carbon credit (IDR)
    equivalent_trees: int              # Setara berapa pohon per tahun

    # Interpretasi
    rating: str                        # "Sangat Rendah" → "Sangat Tinggi"
    rekomendasi: List[str]             # Rekomendasi reduksi emisi
    catatan: str


# ─────────────────────────────────────────────────────────────────────────────
# Core Engine
# ─────────────────────────────────────────────────────────────────────────────

class CarbonModel:
    """
    Carbon Footprint Calculator untuk pertanian.
    Berbasis IPCC 2006 Tier 1 emission factors.
    """

    USD_IDR_RATE = 15_700.0   # Kurs USD/IDR

    def __init__(self, usd_idr_rate: float = 15_700.0):
        self.usd_idr_rate = usd_idr_rate
        logger.info("CarbonModel initialized")

    # ──────────────────────────────────────
    # Public API
    # ──────────────────────────────────────

    def calculate(self, carbon_input: CarbonInput) -> CarbonResult:
        """Hitung jejak karbon lengkap."""
        logger.info(f"Calculating carbon for {carbon_input.komoditas}, {carbon_input.luas_ha} ha")

        sources: List[EmissionSource] = []

        # 1. Emisi N₂O dari aplikasi pupuk nitrogen
        n2o_ton = self._calc_n2o_emissions(carbon_input.pupuk_list, carbon_input.luas_ha)
        if n2o_ton > 0:
            sources.append(EmissionSource("Pupuk N (N₂O emisi lapang)", n2o_ton,
                                          keterangan="IPCC EF1=0.01 kg N₂O-N/kg N"))

        # 2. Emisi produksi pupuk (embodied carbon)
        prod_ton = self._calc_fertilizer_production(carbon_input.pupuk_list, carbon_input.luas_ha)
        if prod_ton > 0:
            sources.append(EmissionSource("Produksi Pupuk (embodied CO₂)", prod_ton,
                                          keterangan="CO₂e dari manufaktur pupuk"))

        # 3. Emisi bahan bakar
        fuel_ton = self._calc_fuel_emissions(carbon_input.bahan_bakar_list)
        if fuel_ton > 0:
            sources.append(EmissionSource("Bahan Bakar (CO₂)", fuel_ton,
                                          keterangan="Traktor, pompa, transportasi"))

        # 4. Emisi pembakaran biomassa
        burn_ton = carbon_input.pembakaran_biomassa_ton * 1.57 / 1000   # CH₄+N₂O factor
        if burn_ton > 0:
            sources.append(EmissionSource("Pembakaran Biomassa", burn_ton,
                                          keterangan="Pembakaran jerami/sisa panen"))

        # 5. CH₄ sawah padi
        ch4_ton = 0.0
        if carbon_input.is_sawah:
            ch4_ton = PADDY_CH4_EMISSION * carbon_input.luas_ha * carbon_input.periode_tahun
            sources.append(EmissionSource("Metana Sawah (CH₄)", ch4_ton,
                                          keterangan="Emisi anaerob sawah padi tergenang"))

        # 6. Emisi ternak (enteric fermentation)
        livestock_ton = self._calc_livestock(
            carbon_input.jumlah_ternak,
            carbon_input.jenis_ternak,
            carbon_input.periode_tahun,
        )
        if livestock_ton > 0:
            sources.append(EmissionSource(f"Ternak ({carbon_input.jenis_ternak})", livestock_ton,
                                          keterangan="Enteric fermentation"))

        total_co2e = sum(s.nilai_co2e_ton for s in sources)

        # Hitung persentase
        for s in sources:
            s.persen_total = round((s.nilai_co2e_ton / total_co2e * 100) if total_co2e > 0 else 0, 2)

        # Carbon sink (pohon)
        sink_ton = (carbon_input.carbon_sink_pohon *
                    TREE_CO2_ABSORPTION_KG_YR *
                    carbon_input.periode_tahun) / 1000

        net_co2e = max(0, total_co2e - sink_ton)
        offset_pct = (sink_ton / total_co2e * 100) if total_co2e > 0 else 0

        # Carbon credit
        credit_ton = max(0, sink_ton - total_co2e)  # hanya surplus sink yang bisa dijual
        credit_usd = credit_ton * CARBON_CREDIT_PRICE_USD
        credit_idr = credit_usd * self.usd_idr_rate

        equiv_trees = int(total_co2e * 1000 / TREE_CO2_ABSORPTION_KG_YR)

        # Rating emisi per ha
        co2_per_ha = total_co2e / max(carbon_input.luas_ha, 0.01)
        rating = self._rate_emission(co2_per_ha)
        rekomendasi = self._build_recommendations(carbon_input, sources, total_co2e)

        return CarbonResult(
            komoditas=carbon_input.komoditas,
            luas_ha=carbon_input.luas_ha,
            periode_tahun=carbon_input.periode_tahun,
            total_co2e_ton=round(total_co2e, 4),
            co2e_per_ha=round(co2_per_ha, 4),
            co2e_per_ton_produksi=0.0,  # Diisi jika yield diketahui
            emisi_pupuk_n2o_ton=round(n2o_ton, 4),
            emisi_pupuk_produksi_ton=round(prod_ton, 4),
            emisi_bahan_bakar_ton=round(fuel_ton, 4),
            emisi_pembakaran_ton=round(burn_ton, 4),
            emisi_sawah_ch4_ton=round(ch4_ton, 4),
            emisi_ternak_ton=round(livestock_ton, 4),
            sources_detail=[{"nama": s.nama, "co2e_ton": round(s.nilai_co2e_ton, 4),
                             "persen": s.persen_total, "keterangan": s.keterangan}
                            for s in sources],
            carbon_sink_pohon_ton=round(sink_ton, 4),
            net_co2e_ton=round(net_co2e, 4),
            offset_percentage=round(offset_pct, 2),
            carbon_credit_potential_ton=round(credit_ton, 4),
            carbon_credit_usd=round(credit_usd, 2),
            carbon_credit_idr=round(credit_idr, 0),
            equivalent_trees=equiv_trees,
            rating=rating,
            rekomendasi=rekomendasi,
            catatan=carbon_input.catatan,
        )

    def calculate_from_dict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Parse dict → CarbonInput → calculate → dict (untuk API)."""
        try:
            raw_pupuk = data.get("pupuk_list") or []
            raw_fuel  = data.get("bahan_bakar_list") or []
            pupuk_list = [
                FertilizerInput(jenis=p["jenis"], jumlah_kg=float(p["jumlah_kg"]))
                for p in raw_pupuk
            ]
            fuel_list = [
                FuelInput(jenis=f["jenis"], jumlah=float(f["jumlah"]),
                          satuan=f.get("satuan", "liter"))
                for f in raw_fuel
            ]

            # Default pupuk jika kosong (padi default)
            if not pupuk_list:
                pupuk_list = [
                    FertilizerInput("urea", 200.0),
                    FertilizerInput("sp36", 100.0),
                    FertilizerInput("kcl",  100.0),
                ]
            if not fuel_list:
                fuel_list = [FuelInput("solar", 20.0)]

            carbon_input = CarbonInput(
                komoditas=data.get("komoditas", "padi"),
                luas_ha=float(data.get("luas_ha", 1.0)),
                pupuk_list=pupuk_list,
                bahan_bakar_list=fuel_list,
                pembakaran_biomassa_ton=float(data.get("pembakaran_biomassa_ton", 0)),
                is_sawah=bool(data.get("is_sawah", False)),
                jumlah_ternak=int(data.get("jumlah_ternak", 0)),
                jenis_ternak=data.get("jenis_ternak", "sapi"),
                carbon_sink_pohon=int(data.get("carbon_sink_pohon", 0)),
                periode_tahun=float(data.get("periode_tahun", 1.0)),
                catatan=data.get("catatan", ""),
            )
            result = self.calculate(carbon_input)
            return {"success": True, "data": asdict(result)}
        except Exception as e:
            logger.error(f"Carbon calculation error: {e}")
            return {"success": False, "error": str(e)}

    # ──────────────────────────────────────
    # Private helpers
    # ──────────────────────────────────────

    @staticmethod
    def _calc_n2o_emissions(pupuk_list: List[FertilizerInput], luas_ha: float) -> float:
        """Hitung emisi N₂O dari aplikasi pupuk N (IPCC Tier 1)."""
        n_content = {"urea": 0.46, "za": 0.21, "npk": 0.15, "ponska": 0.15,
                     "sp36": 0.0, "kcl": 0.0, "pupuk_kandang": 0.02, "kompos": 0.01}
        total_n_kg = 0.0
        for p in pupuk_list:
            n_frac = n_content.get(p.jenis.lower(), 0.0)
            total_n_kg += p.jumlah_kg * n_frac
        total_n_kg *= luas_ha
        # N₂O-N → N₂O → CO₂e
        n2o_n = total_n_kg * EF_N2O_NITROGEN
        n2o   = n2o_n * N_TO_N2O
        co2e  = n2o * GWP_N2O / 1000  # ton CO₂e
        return co2e

    @staticmethod
    def _calc_fertilizer_production(pupuk_list: List[FertilizerInput], luas_ha: float) -> float:
        """Emisi CO₂ dari proses produksi pupuk."""
        total_co2e = 0.0
        for p in pupuk_list:
            ef = FERTILIZER_PRODUCTION_EF.get(p.jenis.lower(), 1.5)
            total_co2e += p.jumlah_kg * luas_ha * ef
        return total_co2e / 1000  # ton

    @staticmethod
    def _calc_fuel_emissions(fuel_list: List[FuelInput]) -> float:
        """Emisi CO₂ dari pembakaran bahan bakar."""
        total_kg = 0.0
        for f in fuel_list:
            ef = FUEL_EMISSION.get(f.jenis.lower(), 2.5)
            total_kg += f.jumlah * ef
        return total_kg / 1000  # ton

    @staticmethod
    def _calc_livestock(n_animals: int, animal_type: str, years: float) -> float:
        """Emisi enteric fermentation ternak (ton CO₂e)."""
        # IPCC Tier 1 default CH₄ emission factors (kg CH₄/head/year)
        ef_livestock = {"sapi": 57.0, "kerbau": 55.0, "kambing": 5.0,
                        "domba": 8.0, "babi": 1.5, "ayam": 0.0}
        ef = ef_livestock.get(animal_type.lower(), 10.0)
        ch4_kg = n_animals * ef * years
        return ch4_kg * GWP_CH4 / 1000  # ton CO₂e

    @staticmethod
    def _rate_emission(co2e_per_ha: float) -> str:
        """Beri rating emisi per ha."""
        if co2e_per_ha < 0.5:  return "✅ Sangat Rendah (Very Low)"
        if co2e_per_ha < 1.5:  return "🟢 Rendah (Low)"
        if co2e_per_ha < 3.0:  return "🟡 Sedang (Medium)"
        if co2e_per_ha < 5.0:  return "🟠 Tinggi (High)"
        return "🔴 Sangat Tinggi (Very High) — perlu reduksi segera"

    @staticmethod
    def _build_recommendations(ci: CarbonInput, sources: List[EmissionSource],
                                total_co2e: float) -> List[str]:
        recs = []
        if ci.pembakaran_biomassa_ton > 0:
            recs.append("♻️ Ganti pembakaran jerami dengan komposting atau PUTS (Pupuk Urea Tablet Slowrelease)")
        if ci.is_sawah:
            recs.append("🌾 Terapkan AWD (Alternate Wetting and Drying) untuk kurangi CH₄ sawah hingga 30%")
        if total_co2e > 2:
            recs.append("🌱 Tanam pohon batas lahan (agroforestry) untuk meningkatkan carbon sink")
        if ci.jumlah_ternak > 5:
            recs.append("🐄 Tambahkan suplemen pakan ternak (3-NOP) untuk kurangi emisi enteric")
        if any(p.jenis.lower() == "urea" and p.jumlah_kg > 150 for p in ci.pupuk_list):
            recs.append("💊 Gunakan pupuk N lambat-lepas (slow-release) atau nitrifikasi inhibitor")
        if not recs:
            recs.append("✅ Emisi sudah relatif rendah. Pertahankan praktik pertanian saat ini.")
        recs.append("📊 Daftarkan ke program carbon credit voluntary market untuk potensi pendapatan tambahan")
        return recs


# ─────────────────────────────────────────────────────────────────────────────
# Standalone
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import json
    model = CarbonModel()
    result = model.calculate_from_dict({
        "komoditas": "padi",
        "luas_ha": 1.0,
        "is_sawah": True,
        "carbon_sink_pohon": 50,
        "periode_tahun": 1.0,
    })
    d = result["data"]
    print(f"✅ Carbon Footprint: {d['komoditas']}")
    print(f"   Total Emisi: {d['total_co2e_ton']:.4f} ton CO₂e/musim")
    print(f"   Per Ha: {d['co2e_per_ha']:.4f} ton CO₂e/ha")
    print(f"   Rating: {d['rating']}")
    print(f"   Setara {d['equivalent_trees']} pohon/tahun")
    print(f"   Carbon Credit: ${d['carbon_credit_usd']:.2f}")
