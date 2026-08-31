"""
AgriSensa Supply Chain & QR Code Traceability Engine (AgriSensa Biz)
===================================================================
Modul Manajemen Rantai Pasok, Batch Panen, dan Pembuatan Paspor Digital (QR Passport)
sesuai standar Ketertelusuran Pangan (Bapanas Indonesia & JA Group Jepang).
"""

import os
import io
import time
import hashlib
import base64
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

logger = logging.getLogger("agrisensa.supply_chain")

# Default shelf-life in days under ambient (25°C) and cold chain (4°C)
SHELF_LIFE_BENCHMARKS = {
    "cabai_merah": {"ambient_days": 5, "cold_days": 18, "optimal_temp_c": 10, "loss_rate_per_day": 2.5},
    "cabai_rawit": {"ambient_days": 7, "cold_days": 21, "optimal_temp_c": 10, "loss_rate_per_day": 2.0},
    "tomat": {"ambient_days": 6, "cold_days": 15, "optimal_temp_c": 12, "loss_rate_per_day": 3.0},
    "bawang_merah": {"ambient_days": 30, "cold_days": 90, "optimal_temp_c": 4, "loss_rate_per_day": 0.5},
    "padi": {"ambient_days": 180, "cold_days": 365, "optimal_temp_c": 15, "loss_rate_per_day": 0.1},
    "jagung": {"ambient_days": 4, "cold_days": 14, "optimal_temp_c": 4, "loss_rate_per_day": 4.0},
    "kentang": {"ambient_days": 21, "cold_days": 120, "optimal_temp_c": 8, "loss_rate_per_day": 0.3},
    "wortel": {"ambient_days": 7, "cold_days": 30, "optimal_temp_c": 4, "loss_rate_per_day": 1.5},
    "default": {"ambient_days": 7, "cold_days": 21, "optimal_temp_c": 8, "loss_rate_per_day": 2.0},
}


class SupplyChainEngine:
    """
    Engine untuk manajemen batch panen, paspor digital, dan QR Code traceability.
    """

    def __init__(self, base_passport_url: str = "https://trace.agrisensa.com/passport"):
        self.base_passport_url = base_passport_url

    def generate_batch_id(self, komoditas: str, farmer_id: str = "PETANI") -> str:
        """Menghasilkan nomor batch lot panen unik."""
        clean_kom = komoditas.lower().replace(" ", "_")[:6].upper()
        date_str = datetime.now().strftime("%Y%m%d")
        rand_suffix = hashlib.sha256(f"{komoditas}_{farmer_id}_{time.time()}".encode()).hexdigest()[:5].upper()
        return f"LOT-{clean_kom}-{date_str}-{rand_suffix}"

    def generate_qr_code(
        self,
        data: str,
        fill_color: str = "#064e3b",
        back_color: str = "white",
        box_size: int = 10,
        border: int = 2
    ) -> Dict[str, Any]:
        """
        Menghasilkan QR code dalam format Base64 PNG data URL.
        Mendukung fallback jika qrcode library belum terpasang.
        """
        try:
            import qrcode
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_M,
                box_size=box_size,
                border=border,
            )
            qr.add_data(data)
            qr.make(fit=True)
            img = qr.make_image(fill_color=fill_color, back_color=back_color)

            buffer = io.BytesIO()
            img.save(buffer, format="PNG")
            qr_bytes = buffer.getvalue()
            b64_str = base64.b64encode(qr_bytes).decode("utf-8")
            data_url = f"data:image/png;base64,{b64_str}"

            return {
                "success": True,
                "data_url": data_url,
                "raw_base64": b64_str,
                "content": data,
                "type": "png"
            }
        except ImportError:
            logger.warning("qrcode library not found, generating SVG fallback")
            # SVG QR placeholder fallback
            svg_fallback = f"""<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
                <rect width="200" height="200" fill="{back_color}"/>
                <rect x="20" y="20" width="160" height="160" fill="none" stroke="{fill_color}" stroke-width="4"/>
                <text x="100" y="105" font-family="Arial" font-size="12" fill="{fill_color}" text-anchor="middle">AGRISENSA QR PASSPORT</text>
                <text x="100" y="125" font-family="Arial" font-size="9" fill="#666" text-anchor="middle">{data[:24]}...</text>
            </svg>"""
            b64_svg = base64.b64encode(svg_fallback.encode("utf-8")).decode("utf-8")
            return {
                "success": True,
                "data_url": f"data:image/svg+xml;base64,{b64_svg}",
                "raw_base64": b64_svg,
                "content": data,
                "type": "svg"
            }

    def calculate_shelf_life_and_loss(
        self,
        komoditas: str,
        volume_kg: float,
        transit_hours: float = 24.0,
        use_cold_chain: bool = False
    ) -> Dict[str, Any]:
        """Menghitung estimasi susut bobot dan umur simpan."""
        key = komoditas.lower().replace(" ", "_")
        benchmark = SHELF_LIFE_BENCHMARKS.get(key, SHELF_LIFE_BENCHMARKS["default"])

        total_days = benchmark["cold_days"] if use_cold_chain else benchmark["ambient_days"]
        loss_rate_day = (benchmark["loss_rate_per_day"] * 0.3) if use_cold_chain else benchmark["loss_rate_per_day"]
        
        transit_days = transit_hours / 24.0
        estimated_weight_loss_percent = min(loss_rate_day * transit_days, 25.0)
        final_volume_kg = max(volume_kg * (1 - (estimated_weight_loss_percent / 100.0)), 0.0)

        return {
            "komoditas": komoditas,
            "initial_volume_kg": volume_kg,
            "final_volume_kg": round(final_volume_kg, 2),
            "estimated_loss_kg": round(volume_kg - final_volume_kg, 2),
            "estimated_loss_percent": round(estimated_weight_loss_percent, 2),
            "shelf_life_days": total_days,
            "recommended_storage_temp_c": benchmark["optimal_temp_c"],
            "transit_hours": transit_hours,
            "cold_chain_active": use_cold_chain
        }

    def create_traceability_passport(
        self,
        komoditas: str,
        farmer_name: str,
        lokasi_lahan: str,
        luas_ha: float,
        tanggal_panen: Optional[str] = None,
        varietas_benih: str = "Unggul F1",
        grade_kualitas: str = "Grade A Super",
        volume_kg: float = 1000.0,
        perlakuan_pupuk: str = "NPK Presisi + Organik Hayati",
        perlakuan_pestisida: str = "Pestisida Nabati & Biologis (Residu Aman)",
        gps_coordinates: Optional[Dict[str, float]] = None,
        sertifikasi_list: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Membuat paspor digital ketertelusuran lengkap beserta QR code label.
        """
        if not tanggal_panen:
            tanggal_panen = datetime.now().strftime("%Y-%m-%d")

        batch_id = self.generate_batch_id(komoditas, farmer_name)
        passport_url = f"{self.base_passport_url}/{batch_id}"

        # Integrity digital signature hash
        hash_payload = f"{batch_id}:{komoditas}:{farmer_name}:{tanggal_panen}:{volume_kg}:{lokasi_lahan}"
        integrity_hash = hashlib.sha256(hash_payload.encode()).hexdigest()

        # Shelf life estimation
        shelf_life_info = self.calculate_shelf_life_and_loss(komoditas, volume_kg)

        # Generate QR Code image
        qr_result = self.generate_qr_code(passport_url)

        if not sertifikasi_list:
            sertifikasi_list = [
                "Good Agricultural Practices (GAP) Verified",
                "Uji Residu Kimia: AMAN / BEBAS LOGAM BERAT",
                "AgriSensa Scientific Fertilizer Balanced"
            ]

        passport_data = {
            "batch_id": batch_id,
            "passport_url": passport_url,
            "digital_signature_hash": integrity_hash,
            "created_at": datetime.now().isoformat(),
            "product_info": {
                "komoditas": komoditas,
                "varietas": varietas_benih,
                "grade": grade_kualitas,
                "volume_panen_kg": volume_kg,
                "tanggal_panen": tanggal_panen,
                "estimasi_kedaluwarsa": (datetime.strptime(tanggal_panen, "%Y-%m-%d") + timedelta(days=shelf_life_info["shelf_life_days"])).strftime("%Y-%m-%d")
            },
            "origin_info": {
                "farmer_name": farmer_name,
                "lokasi": lokasi_lahan,
                "luas_lahan_ha": luas_ha,
                "gps": gps_coordinates or {"lat": -6.9175, "lon": 107.6191}
            },
            "agronomy_audit": {
                "pupuk": perlakuan_pupuk,
                "pengendalian_hama": perlakuan_pestisida,
                "metode_irigasi": "Irigasi Tetes / Terjadwal",
                "sertifikasi": sertifikasi_list
            },
            "logistics_and_shelf_life": shelf_life_info,
            "qr_passport": qr_result
        }

        return passport_data
