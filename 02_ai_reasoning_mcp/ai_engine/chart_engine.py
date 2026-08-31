"""
AgriSensa Industry-Standard Chart & Data Visualization Engine
=============================================================
Menyediakan generator grafik standar industri dalam format:
1. Plotly (JSON / Interactive Spec) - Standar Scientific & MLOps
2. Apache ECharts (JSON Options Spec) - Standar Web Enterprise & Mobile
"""

from typing import Dict, Any, List, Optional
import json
import logging

logger = logging.getLogger("agrisensa.chart_engine")


class ChartEngine:
    """Generator spesifikasi visualisasi data standar industri untuk pertanian presisi."""

    def __init__(self):
        self.theme_colors = {
            "primary": "#16a34a",       # Emerald green
            "secondary": "#3b82f6",     # Blue
            "accent": "#f59e0b",        # Amber
            "danger": "#ef4444",        # Red
            "dark_bg": "#0f172a",       # Slate 900
            "light_bg": "#ffffff"
        }

    # =========================================================================
    # 1. SOIL NPK RADAR & NUTRITION CHART
    # =========================================================================
    def generate_soil_radar(self, n: float, p: float, k: float, ph: float = 6.5, moisture: float = 70.0, format: str = "echarts") -> Dict[str, Any]:
        """Menghasilkan Radar Chart profil hara tanah."""
        # Normalize scores to 0-100 scale for radar
        n_score = min(100.0, (n / 140.0) * 100.0)
        p_score = min(100.0, (p / 80.0) * 100.0)
        k_score = min(100.0, (k / 150.0) * 100.0)
        ph_score = min(100.0, (ph / 7.0) * 100.0) if ph <= 7.0 else max(0.0, 100.0 - (ph - 7.0) * 20.0)
        moisture_score = min(100.0, moisture)

        if format.lower() == "plotly":
            return {
                "format": "plotly",
                "chart_type": "radar",
                "data": [{
                    "type": "scatterpolar",
                    "r": [n_score, p_score, k_score, ph_score, moisture_score, n_score],
                    "theta": ["Nitrogen (N)", "Fosfor (P)", "Kalium (K)", "pH Tanah", "Kelembaban", "Nitrogen (N)"],
                    "fill": "toself",
                    "name": "Status Aktual Lahan",
                    "line": {"color": "#16a34a"}
                }],
                "layout": {
                    "polar": {
                        "radialaxis": {"visible": True, "range": [0, 100]}
                    },
                    "title": "Profil Kesuburan & Hara Tanah (NPK)",
                    "showlegend": True
                }
            }

        # Default Apache ECharts option
        return {
            "format": "echarts",
            "chart_type": "radar",
            "option": {
                "title": {"text": "Profil Kesuburan & Hara Tanah (NPK)", "left": "center"},
                "tooltip": {"trigger": "item"},
                "radar": {
                    "indicator": [
                        {"name": f"Nitrogen ({n} mg/kg)", "max": 100},
                        {"name": f"Fosfor ({p} mg/kg)", "max": 100},
                        {"name": f"Kalium ({k} mg/kg)", "max": 100},
                        {"name": f"pH ({ph})", "max": 100},
                        {"name": f"Kelembaban ({moisture}%)", "max": 100}
                    ],
                    "shape": "polygon"
                },
                "series": [{
                    "name": "Status Tanah",
                    "type": "radar",
                    "data": [
                        {
                            "value": [n_score, p_score, k_score, ph_score, moisture_score],
                            "name": "Kondisi Lahan Aktual",
                            "areaStyle": {"color": "rgba(22, 163, 74, 0.35)"},
                            "lineStyle": {"color": "#16a34a", "width": 2}
                        }
                    ]
                }]
            }
        }

    # =========================================================================
    # 2. MARKET PRICE TIME-SERIES & FORECAST CHART
    # =========================================================================
    def generate_market_trend(self, commodity: str, dates: List[str], historical_prices: List[float], forecast_prices: Optional[List[float]] = None, format: str = "echarts") -> Dict[str, Any]:
        """Grafik tren harga komoditas dan proyeksi ke depan."""
        if format.lower() == "plotly":
            traces = [{
                "x": dates[:len(historical_prices)],
                "y": historical_prices,
                "type": "scatter",
                "mode": "lines+markers",
                "name": "Harga Historis",
                "line": {"color": "#3b82f6", "width": 3}
            }]
            if forecast_prices:
                forecast_dates = dates[len(historical_prices)-1:]
                traces.append({
                    "x": forecast_dates,
                    "y": [historical_prices[-1]] + forecast_prices,
                    "type": "scatter",
                    "mode": "lines+markers",
                    "name": "Prediksi AI",
                    "line": {"color": "#f59e0b", "width": 3, "dash": "dash"}
                })
            return {
                "format": "plotly",
                "chart_type": "time_series",
                "data": traces,
                "layout": {
                    "title": f"Tren & Proyeksi Harga Komoditas: {commodity}",
                    "xaxis": {"title": "Tanggal"},
                    "yaxis": {"title": "Harga (Rp/kg)"}
                }
            }

        # Apache ECharts
        series = [{
            "name": "Harga Historis",
            "type": "line",
            "smooth": True,
            "data": historical_prices,
            "itemStyle": {"color": "#3b82f6"}
        }]
        if forecast_prices:
            combined_forecast = [None] * (len(historical_prices) - 1) + [historical_prices[-1]] + forecast_prices
            series.append({
                "name": "Proyeksi AI",
                "type": "line",
                "smooth": True,
                "lineStyle": {"type": "dashed", "width": 3},
                "data": combined_forecast,
                "itemStyle": {"color": "#f59e0b"}
            })

        return {
            "format": "echarts",
            "chart_type": "time_series",
            "option": {
                "title": {"text": f"Tren & Proyeksi Harga: {commodity}", "left": "center"},
                "tooltip": {"trigger": "axis"},
                "legend": {"top": "bottom"},
                "xAxis": {"type": "category", "data": dates},
                "yAxis": {"type": "value", "axisLabel": {"formatter": "Rp {value}"}},
                "series": series
            }
        }

    # =========================================================================
    # 3. YIELD COMPARISON & BENCHMARK CHART
    # =========================================================================
    def generate_yield_benchmark(self, commodity: str, predicted_yield: float, regional_avg: float, national_target: float, format: str = "echarts") -> Dict[str, Any]:
        """Grafik perbandingan estimasi panen dengan benchmark regional & nasional."""
        categories = ["Estimasi Kebun Anda", "Rata-rata Regional", "Target Potensi Varietas"]
        values = [predicted_yield, regional_avg, national_target]
        colors = ["#16a34a", "#64748b", "#3b82f6"]

        if format.lower() == "plotly":
            return {
                "format": "plotly",
                "chart_type": "bar",
                "data": [{
                    "x": categories,
                    "y": values,
                    "type": "bar",
                    "marker": {"color": colors}
                }],
                "layout": {
                    "title": f"Benchmark Hasil Panen {commodity} (ton/ha)",
                    "yaxis": {"title": "Yield (Ton/Ha)"}
                }
            }

        return {
            "format": "echarts",
            "chart_type": "bar",
            "option": {
                "title": {"text": f"Benchmark Hasil Panen: {commodity}", "subtext": "Satuan: Ton / Hektar", "left": "center"},
                "tooltip": {"trigger": "axis"},
                "xAxis": {"type": "category", "data": categories},
                "yAxis": {"type": "value", "axisLabel": {"formatter": "{value} t/ha"}},
                "series": [{
                    "data": [
                        {"value": predicted_yield, "itemStyle": {"color": "#16a34a"}},
                        {"value": regional_avg, "itemStyle": {"color": "#64748b"}},
                        {"value": national_target, "itemStyle": {"color": "#3b82f6"}}
                    ],
                    "type": "bar",
                    "barWidth": "45%",
                    "label": {"show": True, "position": "top", "formatter": "{c} ton/ha"}
                }]
            }
        }

    # =========================================================================
    # 4. MLOPS FEATURE IMPORTANCE (SHAP WATERFALL / BAR)
    # =========================================================================
    def generate_feature_importance(self, features: Dict[str, float], format: str = "echarts") -> Dict[str, Any]:
        """Visualisasi kontribusi faktor tanah & iklim terhadap hasil panen."""
        sorted_feats = sorted(features.items(), key=lambda x: abs(x[1]), reverse=True)
        labels = [item[0] for item in sorted_feats]
        vals = [round(item[1], 3) for item in sorted_feats]
        colors = ["#16a34a" if v >= 0 else "#ef4444" for v in vals]

        if format.lower() == "plotly":
            return {
                "format": "plotly",
                "chart_type": "horizontal_bar",
                "data": [{
                    "y": labels,
                    "x": vals,
                    "type": "bar",
                    "orientation": "h",
                    "marker": {"color": colors}
                }],
                "layout": {
                    "title": "Faktor Penentu Keberhasilan Panen (SHAP Feature Importance)",
                    "xaxis": {"title": "Pengaruh Relatif terhadap Yield"}
                }
            }

        return {
            "format": "echarts",
            "chart_type": "horizontal_bar",
            "option": {
                "title": {"text": "Faktor Penentu Panen (SHAP Feature Importance)", "left": "center"},
                "tooltip": {"trigger": "axis"},
                "grid": {"left": "25%"},
                "xAxis": {"type": "value"},
                "yAxis": {"type": "category", "data": labels, "inverse": True},
                "series": [{
                    "type": "bar",
                    "data": [
                        {"value": v, "itemStyle": {"color": "#16a34a" if v >= 0 else "#ef4444"}}
                        for v in vals
                    ],
                    "label": {"show": True, "position": "right"}
                }]
            }
        }

    # =========================================================================
    # 5. DISPATCHER / GENERIC ROUTER FOR MCP
    # =========================================================================
    def generate_chart(self, chart_type: str, payload: Dict[str, Any], format: str = "echarts") -> Dict[str, Any]:
        """Entry point umum untuk MCP chart generator."""
        fmt = payload.get("format", format)
        chart_type = chart_type.lower()

        if "soil" in chart_type or "npk" in chart_type or "radar" in chart_type:
            return self.generate_soil_radar(
                n=float(payload.get("n", payload.get("nitrogen", 90))),
                p=float(payload.get("p", payload.get("phosphorus", 40))),
                k=float(payload.get("k", payload.get("potassium", 50))),
                ph=float(payload.get("ph", 6.5)),
                moisture=float(payload.get("moisture", 70)),
                format=fmt
            )
        elif "market" in chart_type or "price" in chart_type or "trend" in chart_type:
            return self.generate_market_trend(
                commodity=payload.get("commodity", "Beras"),
                dates=payload.get("dates", ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]),
                historical_prices=payload.get("historical_prices", [14000, 14200, 14100, 14300, 14500, 14600, 14800]),
                forecast_prices=payload.get("forecast_prices", [14900, 15100, 15000]),
                format=fmt
            )
        elif "yield" in chart_type or "benchmark" in chart_type:
            return self.generate_yield_benchmark(
                commodity=payload.get("commodity", "Padi"),
                predicted_yield=float(payload.get("predicted_yield", 6.5)),
                regional_avg=float(payload.get("regional_avg", 5.2)),
                national_target=float(payload.get("national_target", 7.0)),
                format=fmt
            )
        elif "shap" in chart_type or "importance" in chart_type or "feature" in chart_type:
            return self.generate_feature_importance(
                features=payload.get("features", {
                    "Curah Hujan (Rainfall)": 0.35,
                    "Nitrogen (N)": 0.28,
                    "Kalium (K)": 0.18,
                    "pH Tanah": -0.09,
                    "Fosfor (P)": 0.12
                }),
                format=fmt
            )
        else:
            # Fallback to soil radar
            return self.generate_soil_radar(90, 40, 50, 6.5, 70, format=fmt)
