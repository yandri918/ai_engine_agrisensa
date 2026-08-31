"""
AgriSensa Monte Carlo Simulation Engine
=======================================
Menjalankan 10.000 iterasi simulasi Monte Carlo untuk analisis risiko RAB:
- Distribusi ROI (Return on Investment)
- Distribusi BEP (Break-Even Point)
- Distribusi Keuntungan Bersih
- Probabilitas untung/rugi
- Skenario: P10 (pessimis), P50 (netral), P90 (optimis)
- Value at Risk (VaR 95%)

Menggunakan:
- numpy random sampling (Normal & Triangular distributions)
- Seed reproducible untuk validasi
"""

import logging
import time
from dataclasses import dataclass, asdict
from typing import Dict, Any, Optional, List

import numpy as np

logger = logging.getLogger("agrisensa.monte_carlo")

# ─────────────────────────────────────────────────────────────────────────────
# Data Classes
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class MonteCarloInput:
    """Parameter input simulasi Monte Carlo."""
    # Base values dari RAB
    total_biaya_rp: float
    estimasi_yield_ton_ha: float
    harga_jual_rp_kg: float
    luas_ha: float

    # Uncertainty ranges (%)
    yield_std_persen: float = 15.0        # Std dev yield ±15%
    harga_std_persen: float = 20.0        # Std dev harga ±20%
    biaya_std_persen: float = 10.0        # Std dev biaya ±10%

    # Distribusi alternatif untuk harga (triangular)
    harga_min_persen: float = 70.0        # Min harga = 70% base
    harga_mode_persen: float = 100.0      # Mode harga = 100% base
    harga_max_persen: float = 140.0       # Max harga = 140% base

    # Simulasi
    n_iterations: int = 10_000
    random_seed: Optional[int] = 42
    use_triangular_price: bool = True     # True=triangular, False=normal


@dataclass
class PercentileResult:
    """Hasil persentil untuk satu metrik."""
    p5:  float   # Sangat pesimis (5th percentile)
    p10: float   # Pesimis (10th percentile)
    p25: float   # Q1
    p50: float   # Median (netral)
    p75: float   # Q3
    p90: float   # Optimis
    p95: float   # Sangat optimis
    mean: float
    std: float
    min: float
    max: float


@dataclass
class MonteCarloResult:
    """Hasil lengkap simulasi Monte Carlo."""
    n_iterations: int
    elapsed_seconds: float

    # Distribusi metrik utama
    roi_distribution: PercentileResult
    profit_distribution: PercentileResult
    bep_distribution: PercentileResult
    revenue_distribution: PercentileResult

    # Probabilitas
    prob_untung_persen: float          # P(ROI > 0) %
    prob_rugi_persen: float            # P(ROI < 0) %
    prob_roi_gt_20_persen: float       # P(ROI > 20%) %
    prob_roi_gt_50_persen: float       # P(ROI > 50%) %

    # Value at Risk
    var_95_rp: float                   # Max kerugian pada confidence 95%
    var_99_rp: float                   # Max kerugian pada confidence 99%
    expected_shortfall_rp: float       # Expected loss jika rugi (CVaR)

    # Skenario representatif
    scenario_pesimis: Dict             # P10
    scenario_netral: Dict              # P50
    scenario_optimis: Dict             # P90

    # Histogram data (untuk chart)
    histogram_roi: Dict                # bins & counts
    histogram_profit: Dict


# ─────────────────────────────────────────────────────────────────────────────
# Core Engine
# ─────────────────────────────────────────────────────────────────────────────

class MonteCarloEngine:
    """
    Monte Carlo Simulation Engine — 10.000 iterasi.
    Menggunakan distribusi Normal (yield, biaya) dan Triangular (harga).
    """

    def __init__(self):
        logger.info("MonteCarloEngine initialized")

    # ──────────────────────────────────────
    # Public API
    # ──────────────────────────────────────

    def simulate(self, mc_input: MonteCarloInput) -> MonteCarloResult:
        """Jalankan simulasi Monte Carlo dengan parameter yang diberikan."""
        t0 = time.perf_counter()
        n  = mc_input.n_iterations

        if mc_input.random_seed is not None:
            np.random.seed(mc_input.random_seed)

        logger.info(f"Starting Monte Carlo: {n:,} iterations, seed={mc_input.random_seed}")

        # ── Sampling distribusi ──────────────────────────────────────────────

        # Yield (ton/ha) → distribusi Normal, truncated > 0
        yield_base = mc_input.estimasi_yield_ton_ha
        yield_std  = yield_base * (mc_input.yield_std_persen / 100)
        yields = np.abs(np.random.normal(yield_base, yield_std, n))

        # Harga jual (Rp/kg)
        harga_base = mc_input.harga_jual_rp_kg
        if mc_input.use_triangular_price:
            h_min  = harga_base * (mc_input.harga_min_persen  / 100)
            h_mode = harga_base * (mc_input.harga_mode_persen / 100)
            h_max  = harga_base * (mc_input.harga_max_persen  / 100)
            prices = np.random.triangular(h_min, h_mode, h_max, n)
        else:
            harga_std = harga_base * (mc_input.harga_std_persen / 100)
            prices = np.abs(np.random.normal(harga_base, harga_std, n))

        # Total biaya → distribusi Normal, truncated > 0
        biaya_base = mc_input.total_biaya_rp
        biaya_std  = biaya_base * (mc_input.biaya_std_persen / 100)
        costs = np.abs(np.random.normal(biaya_base, biaya_std, n))

        # ── Kalkulasi per iterasi ────────────────────────────────────────────

        production_kg = mc_input.luas_ha * yields * 1000        # (n,)
        revenues      = production_kg * prices                   # (n,)
        profits       = revenues - costs                         # (n,)
        roi_arr       = (profits / costs) * 100                  # (n,) %
        bep_arr       = (costs / prices)                         # (n,) kg

        # ── Statistik ───────────────────────────────────────────────────────

        roi_result    = self._compute_percentiles(roi_arr)
        profit_result = self._compute_percentiles(profits)
        bep_result    = self._compute_percentiles(bep_arr)
        rev_result    = self._compute_percentiles(revenues)

        # ── Probabilitas ────────────────────────────────────────────────────

        prob_untung   = float(np.mean(roi_arr > 0)  * 100)
        prob_rugi     = float(np.mean(roi_arr <= 0) * 100)
        prob_roi_20   = float(np.mean(roi_arr > 20) * 100)
        prob_roi_50   = float(np.mean(roi_arr > 50) * 100)

        # ── Value at Risk (VaR) ──────────────────────────────────────────────

        var_95 = float(np.percentile(profits, 5))   # 5th percentile
        var_99 = float(np.percentile(profits, 1))   # 1st percentile
        losses = profits[profits < 0]
        expected_shortfall = float(np.mean(losses)) if len(losses) > 0 else 0.0

        # ── Skenario representatif ───────────────────────────────────────────

        def _build_scenario(p: int) -> Dict:
            idx = np.argsort(profits)[int(n * p / 100)]
            return {
                "yield_ton_ha": round(float(yields[idx]), 3),
                "harga_rp_kg":  round(float(prices[idx]), 0),
                "biaya_rp":     round(float(costs[idx]),  0),
                "pendapatan_rp":round(float(revenues[idx]),0),
                "keuntungan_rp":round(float(profits[idx]), 0),
                "roi_persen":   round(float(roi_arr[idx]), 2),
                "bep_kg":       round(float(bep_arr[idx]), 1),
                "percentile":   p,
            }

        # ── Histogram data ───────────────────────────────────────────────────

        hist_roi    = self._build_histogram(roi_arr,   bins=50, label="ROI (%)")
        hist_profit = self._build_histogram(profits/1e6, bins=50, label="Keuntungan (Juta Rp)")

        elapsed = time.perf_counter() - t0
        logger.info(f"Monte Carlo complete: {n:,} iter in {elapsed:.3f}s, P(profit)={prob_untung:.1f}%")

        return MonteCarloResult(
            n_iterations=n,
            elapsed_seconds=round(elapsed, 4),
            roi_distribution=roi_result,
            profit_distribution=profit_result,
            bep_distribution=bep_result,
            revenue_distribution=rev_result,
            prob_untung_persen=round(prob_untung, 2),
            prob_rugi_persen=round(prob_rugi, 2),
            prob_roi_gt_20_persen=round(prob_roi_20, 2),
            prob_roi_gt_50_persen=round(prob_roi_50, 2),
            var_95_rp=round(var_95, 0),
            var_99_rp=round(var_99, 0),
            expected_shortfall_rp=round(expected_shortfall, 0),
            scenario_pesimis=_build_scenario(10),
            scenario_netral=_build_scenario(50),
            scenario_optimis=_build_scenario(90),
            histogram_roi=hist_roi,
            histogram_profit=hist_profit,
        )

    def simulate_from_dict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Parse dict → MonteCarloInput → simulate → dict (untuk API)."""
        try:
            # Bisa menerima langsung dari RAB result atau manual
            rab_data = data.get("rab_data") or {}

            mc_input = MonteCarloInput(
                total_biaya_rp=float(
                    data.get("total_biaya_rp") or
                    rab_data.get("total_biaya_rp", 10_000_000)
                ),
                estimasi_yield_ton_ha=float(
                    data.get("estimasi_yield_ton_ha") or
                    rab_data.get("yield_per_ha_ton", 5.0)
                ),
                harga_jual_rp_kg=float(
                    data.get("harga_jual_rp_kg") or
                    rab_data.get("harga_jual_rp_kg", 4000)
                ),
                luas_ha=float(
                    data.get("luas_ha") or
                    rab_data.get("luas_ha", 1.0)
                ),
                yield_std_persen=float(data.get("yield_std_persen", 15.0)),
                harga_std_persen=float(data.get("harga_std_persen", 20.0)),
                biaya_std_persen=float(data.get("biaya_std_persen", 10.0)),
                harga_min_persen=float(data.get("harga_min_persen", 70.0)),
                harga_mode_persen=float(data.get("harga_mode_persen", 100.0)),
                harga_max_persen=float(data.get("harga_max_persen", 140.0)),
                n_iterations=min(int(data.get("n_iterations", 10_000)), 100_000),
                random_seed=data.get("random_seed", 42),
                use_triangular_price=bool(data.get("use_triangular_price", True)),
            )
            result = self.simulate(mc_input)
            return {"success": True, "data": asdict(result)}
        except Exception as e:
            logger.error(f"Monte Carlo error: {e}")
            return {"success": False, "error": str(e)}

    # ──────────────────────────────────────
    # Private helpers
    # ──────────────────────────────────────

    @staticmethod
    def _compute_percentiles(arr: np.ndarray) -> PercentileResult:
        return PercentileResult(
            p5=round(float(np.percentile(arr, 5)),  2),
            p10=round(float(np.percentile(arr, 10)), 2),
            p25=round(float(np.percentile(arr, 25)), 2),
            p50=round(float(np.percentile(arr, 50)), 2),
            p75=round(float(np.percentile(arr, 75)), 2),
            p90=round(float(np.percentile(arr, 90)), 2),
            p95=round(float(np.percentile(arr, 95)), 2),
            mean=round(float(np.mean(arr)),  2),
            std=round(float(np.std(arr)),    2),
            min=round(float(np.min(arr)),    2),
            max=round(float(np.max(arr)),    2),
        )

    @staticmethod
    def _build_histogram(arr: np.ndarray, bins: int = 50, label: str = "") -> Dict:
        counts, bin_edges = np.histogram(arr, bins=bins)
        return {
            "label": label,
            "bins": [round(float(e), 3) for e in bin_edges],
            "counts": [int(c) for c in counts],
            "bin_centers": [round(float((bin_edges[i] + bin_edges[i+1]) / 2), 3) for i in range(len(counts))],
        }


# ─────────────────────────────────────────────────────────────────────────────
# Standalone usage
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import json
    engine = MonteCarloEngine()
    result = engine.simulate_from_dict({
        "total_biaya_rp": 12_500_000,
        "estimasi_yield_ton_ha": 6.0,
        "harga_jual_rp_kg": 4500,
        "luas_ha": 1.0,
        "n_iterations": 10_000,
    })
    # Print summary only
    d = result["data"]
    print(f"✅ Monte Carlo {d['n_iterations']:,} iterasi ({d['elapsed_seconds']:.3f}s)")
    print(f"   ROI P50: {d['roi_distribution']['p50']:.1f}%")
    print(f"   P(Untung): {d['prob_untung_persen']:.1f}%")
    print(f"   P(ROI>20%): {d['prob_roi_gt_20_persen']:.1f}%")
    print(f"   VaR 95%: Rp {d['var_95_rp']:,.0f}")
