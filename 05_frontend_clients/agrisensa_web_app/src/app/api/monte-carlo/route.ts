import { NextRequest, NextResponse } from "next/server";

interface MonteCarloPayload {
  crop_type: string;
  land_area_ha: number;
  initial_capital: number;
  seed_cost_per_ha: number;
  fertilizer_cost_per_ha: number;
  labor_cost_per_ha: number;
  expected_yield_ton_per_ha: number;
  min_market_price_per_kg: number;
  max_market_price_per_kg: number;
}

// Box-Muller transform for normal distribution simulation
function randomNormal(mean: number, stdDev: number): number {
  let u = 1 - Math.random();
  let v = Math.random();
  let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + z * stdDev;
}

export async function POST(req: NextRequest) {
  try {
    const data: MonteCarloPayload = await req.json();

    const iterations = 10000;
    const totalCostPerHa = data.seed_cost_per_ha + data.fertilizer_cost_per_ha + data.labor_cost_per_ha;
    const totalProductionCost = totalCostPerHa * data.land_area_ha;

    const yieldMean = data.expected_yield_ton_per_ha * 1000 * data.land_area_ha;
    const yieldStdDev = yieldMean * 0.15; // 15% standard deviation due to weather/pest

    const priceMin = data.min_market_price_per_kg;
    const priceMax = data.max_market_price_per_kg;
    const priceMean = (priceMin + priceMax) / 2;
    const priceStdDev = (priceMax - priceMin) / 4;

    const profitRuns: number[] = [];
    let profitableCount = 0;

    for (let i = 0; i < iterations; i++) {
      // Sample yield (clamped to prevent negative)
      const simulatedYield = Math.max(yieldMean * 0.4, randomNormal(yieldMean, yieldStdDev));
      // Sample price (clamped to range)
      const simulatedPrice = Math.max(priceMin * 0.7, randomNormal(priceMean, priceStdDev));

      const revenue = simulatedYield * simulatedPrice;
      const profit = revenue - totalProductionCost;

      profitRuns.push(profit);
      if (profit > 0) profitableCount++;
    }

    profitRuns.sort((a, b) => a - b);

    const sumProfit = profitRuns.reduce((a, b) => a + b, 0);
    const expectedProfit = Math.round(sumProfit / iterations);
    const minProfit = Math.round(profitRuns[0]);
    const maxProfit = Math.round(profitRuns[iterations - 1]);

    // 5th percentile for Value at Risk (VaR 95%)
    const var95 = Math.abs(Math.min(0, profitRuns[Math.floor(iterations * 0.05)]));

    const roi = Number(((expectedProfit / (totalProductionCost || 1)) * 100).toFixed(1));
    const winProbability = Number(((profitableCount / iterations) * 100).toFixed(1));

    // Group into 5 histogram bins
    const rangeStep = (maxProfit - minProfit) / 5 || 1;
    const bins = [];
    for (let b = 0; b < 5; b++) {
      const bMin = minProfit + b * rangeStep;
      const bMax = bMin + rangeStep;
      const count = profitRuns.filter((p) => p >= bMin && (b === 4 ? p <= bMax : p < bMax)).length;
      bins.push({
        range: `Rp ${(bMin / 1000000).toFixed(1)}M - ${(bMax / 1000000).toFixed(1)}M`,
        count,
        probability: Number(((count / iterations) * 100).toFixed(1)),
      });
    }

    const riskLevel: "Rendah" | "Moderat" | "Tinggi" =
      winProbability >= 85 ? "Rendah" : winProbability >= 65 ? "Moderat" : "Tinggi";

    const recommendations = [
      winProbability >= 85
        ? "Tingkat probabilitas keuntungan sangat tinggi (>85%). Skala usaha sangat layak untuk direplikasi dan ditingkatkan luasannya."
        : "Risiko harga minimum cukup sensitif. Dianjurkan melakukan kontrak tanam (*contract farming*) dengan offtaker sebelum masa panen.",
      `Modal awal yang dibutuhkan: Rp ${totalProductionCost.toLocaleString("id-ID")}. Cadangan risiko tak terduga (VaR 95%): Rp ${Math.round(var95).toLocaleString("id-ID")}.`,
      "Optimalkan aplikasi pupuk hayati mikroba untuk menekan biaya pupuk kimia sintetis hingga 20% tanpa mengurangi potensi bobot gabah/buah.",
    ];

    return NextResponse.json({
      expected_profit: expectedProfit,
      min_profit: minProfit,
      max_profit: maxProfit,
      roi_percentage: roi,
      probability_of_profit: winProbability,
      value_at_risk_95: Math.round(var95),
      risk_level: riskLevel,
      distribution_bins: bins,
      recommendations,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
