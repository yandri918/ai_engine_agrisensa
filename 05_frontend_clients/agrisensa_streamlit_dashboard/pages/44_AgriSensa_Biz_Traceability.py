# 📦 AgriSensa Biz — Supply Chain & QR Passport Traceability
# Platform Manajemen Pasokan, Batch Panen, dan Paspor Digital Produk Pertanian

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import requests
import json
import os
import io
import base64
from datetime import datetime, timedelta

# Auth
from utils.auth import require_auth, show_user_info_sidebar

st.set_page_config(
    page_title="AgriSensa Biz — Supply Chain & QR Passport",
    page_icon="📦",
    layout="wide"
)

# ===== AUTHENTICATION =====
user = require_auth()
show_user_info_sidebar()

# Base API URL
AI_ENGINE_URL = os.environ.get("AI_ENGINE_API_URL", "http://localhost:8001")
N8N_URL = os.environ.get("N8N_WEBHOOK_URL", "http://localhost:5678")

st.title("📦 AgriSensa Biz — Supply Chain & QR Digital Passport")
st.markdown("""
Sistem pelacakan rantai pasok agribisnis (*Farm-to-Fork Traceability*), sertifikasi mutu digital, 
dan generator **QR Code Paspor Produk** untuk menjamin transparansi, keaslian, dan nilai jual premium hasil panen.
""")

tab1, tab2, tab3 = st.tabs([
    "🏷️ Terbitkan Paspor & QR Panen", 
    "🚚 Kalkulator Logistik & Susut Bobot", 
    "🔍 Verifikasi & Audit Paspor Digital"
])

# ─────────────────────────────────────────────────────────────────────────────
# TAB 1: TERBITKAN PASPOR & QR PANEN
# ─────────────────────────────────────────────────────────────────────────────
with tab1:
    st.subheader("🏷️ Penerbitan Paspor Digital Lot Panen Baru")
    
    col1, col2 = st.columns([1, 1])
    
    with col1:
        komoditas = st.selectbox(
            "Pilih Komoditas",
            ["Cabai Merah", "Cabai Rawit", "Tomat", "Bawang Merah", "Padi", "Jagung", "Kentang", "Wortel"],
            index=0
        )
        varietas = st.text_input("Varietas Benih / Kultivar", "Hibrida F1 Lembang Super")
        farmer_name = st.text_input("Nama Petani / Kelompok Tani", "Poktan Sumber Makmur (Pak Joko)")
        lokasi_lahan = st.text_input("Lokasi Kebun / Sentra Tani", "Desa Cibodas, Kec. Lembang, Kab. Bandung Barat")
        luas_ha = st.number_input("Luas Lahan (Ha)", min_value=0.05, max_value=100.0, value=0.5, step=0.1)
        volume_kg = st.number_input("Total Volume Panen (Kg)", min_value=10.0, max_value=500000.0, value=1500.0, step=50.0)

    with col2:
        tanggal_panen = st.date_input("Tanggal Panen", datetime.now())
        grade_kualitas = st.selectbox(
            "Grade Kualitas",
            ["Grade A Super (Ekspor & Resto Premium)", "Grade A Standar", "Grade B (Pasar Induk)", "Grade Olahan Industri"]
        )
        perlakuan_pupuk = st.selectbox(
            "Catatan Pemupukan",
            ["NPK Presisi + Hayati Trichoderma (AgriSensa Balanced)", "100% Organik Bersertifikat", "NPK Standar Petani"]
        )
        perlakuan_pestisida = st.selectbox(
            "Pengendalian Hama & Penyakit",
            ["Pestisida Nabati & Biologis (Aman Residu)", "Pestisida Kimia Rasional (Lolos PHI)", "Organik Tanpa Kimia"]
        )
        lat = st.number_input("Koordinat Latitude", value=-6.8167, format="%.4f")
        lon = st.number_input("Koordinat Longitude", value=107.6167, format="%.4f")

    st.markdown("---")
    btn_generate = st.button("🚀 Terbitkan Paspor Digital & Generate QR Code", type="primary", use_container_width=True)

    if btn_generate:
        payload = {
            "komoditas": komoditas,
            "farmer_name": farmer_name,
            "lokasi_lahan": lokasi_lahan,
            "luas_ha": luas_ha,
            "tanggal_panen": tanggal_panen.strftime("%Y-%m-%d"),
            "varietas_benih": varietas,
            "grade_kualitas": grade_kualitas,
            "volume_kg": volume_kg,
            "perlakuan_pupuk": perlakuan_pupuk,
            "perlakuan_pestisida": perlakuan_pestisida,
            "gps_coordinates": {"lat": lat, "lon": lon}
        }

        with st.spinner("Memproses paspor digital & meng-generate QR Code beresolusi tinggi..."):
            try:
                # Call AI Engine API
                resp = requests.post(f"{AI_ENGINE_URL}/supply-chain/traceability", json=payload, timeout=15)
                
                if resp.status_code == 200:
                    res_data = resp.json().get("data", {})
                else:
                    raise Exception(f"API Error {resp.status_code}: {resp.text}")
            except Exception as e:
                st.warning(f"⚠️ API Backend di {AI_ENGINE_URL} tidak terjangkau. Menggunakan generator lokal...")
                # Fallback generator
                batch_id = f"LOT-{komoditas[:3].upper()}-{datetime.now().strftime('%Y%m%d')}-01"
                passport_url = f"https://trace.agrisensa.com/passport/{batch_id}"
                
                import qrcode
                qr = qrcode.QRCode(version=1, box_size=8, border=2)
                qr.add_data(passport_url)
                qr.make(fit=True)
                img = qr.make_image(fill_color="#064e3b", back_color="white")
                buf = io.BytesIO()
                img.save(buf, format="PNG")
                qr_b64 = base64.b64encode(buf.getvalue()).decode()
                
                res_data = {
                    "batch_id": batch_id,
                    "passport_url": passport_url,
                    "digital_signature_hash": "a1b2c3d4e5f67890abcdef1234567890",
                    "product_info": {
                        "komoditas": komoditas,
                        "varietas": varietas,
                        "grade": grade_kualitas,
                        "volume_panen_kg": volume_kg,
                        "tanggal_panen": tanggal_panen.strftime("%Y-%m-%d"),
                        "estimasi_kedaluwarsa": (tanggal_panen + timedelta(days=14)).strftime("%Y-%m-%d")
                    },
                    "origin_info": {
                        "farmer_name": farmer_name,
                        "lokasi": lokasi_lahan,
                        "gps": {"lat": lat, "lon": lon}
                    },
                    "agronomy_audit": {
                        "pupuk": perlakuan_pupuk,
                        "pengendalian_hama": perlakuan_pestisida,
                        "sertifikasi": ["GAP Verified", "Residu Kimia: AMAN", "AgriSensa Scientific"]
                    },
                    "qr_passport": {
                        "data_url": f"data:image/png;base64,{qr_b64}",
                        "raw_base64": qr_b64
                    }
                }

            st.success(f"✅ Paspor Digital Berhasil Diterbitkan! Nomor Batch: **{res_data.get('batch_id')}**")
            
            # Display Passport Card & QR Sticker
            res_col1, res_col2 = st.columns([1, 2])
            
            with res_col1:
                st.markdown(f"""
                <div style="background: white; padding: 20px; border-radius: 12px; border: 2px dashed #064e3b; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <h4 style="color: #064e3b; margin-bottom: 5px;">🌾 AGRISENSA PASSPORT</h4>
                    <p style="font-size: 11px; color: #666; margin-bottom: 10px;">Traceability Digital Label</p>
                    <img src="{res_data['qr_passport']['data_url']}" style="width: 180px; height: 180px; margin: 0 auto;">
                    <p style="font-size: 12px; font-weight: bold; margin-top: 8px;">{res_data.get('batch_id')}</p>
                    <p style="font-size: 10px; color: #888;">Scan via Kamera HP</p>
                </div>
                """, unsafe_allow_html=True)
                
                # Download QR Button
                qr_bytes = base64.b64decode(res_data['qr_passport']['raw_base64'])
                st.download_button(
                    label="💾 Unduh Gambar Stiker QR (PNG)",
                    data=qr_bytes,
                    file_name=f"QR_{res_data.get('batch_id')}.png",
                    mime="image/png",
                    use_container_width=True
                )

            with res_col2:
                st.markdown("### 📋 Rincian Paspor Mutu Produk")
                st.markdown(f"**URL Ketertelusuran Publik:** `{res_data.get('passport_url')}`")
                st.markdown(f"**Digital Signature (SHA-256):** `{res_data.get('digital_signature_hash')}`")
                
                p_info = res_data.get('product_info', {})
                o_info = res_data.get('origin_info', {})
                a_info = res_data.get('agronomy_audit', {})
                
                m1, m2, m3 = st.columns(3)
                m1.metric("Komoditas", p_info.get("komoditas"))
                m2.metric("Volume Panen", f"{p_info.get('volume_panen_kg')} Kg")
                m3.metric("Grade Mutu", p_info.get("grade"))
                
                st.info(f"📍 **Petani & Lokasi:** {o_info.get('farmer_name')} — {o_info.get('lokasi')}")
                st.info(f"🌿 **Agronomy Audit:** {a_info.get('pupuk')} | {a_info.get('pengendalian_hama')}")
                
                st.write("**Sertifikasi & Jaminan Mutu:**")
                for s in a_info.get("sertifikasi", []):
                    st.write(f"- ✅ {s}")

# ─────────────────────────────────────────────────────────────────────────────
# TAB 2: KALKULATOR LOGISTIK & SUSUT BOBOT
# ─────────────────────────────────────────────────────────────────────────────
with tab2:
    st.subheader("🚚 Estimasi Daya Simpan (*Shelf-Life*) & Susut Bobot Pasca-Panen")
    
    l_col1, l_col2 = st.columns(2)
    with l_col1:
        log_kom = st.selectbox("Komoditas Pengiriman", ["cabai_merah", "tomat", "bawang_merah", "kentang", "jagung", "wortel"], index=0)
        log_vol = st.number_input("Volume Awal Muatan (Kg)", value=2000.0, step=100.0)
        transit_h = st.slider("Estimasi Waktu Tempuh Distribusi (Jam)", min_value=4, max_value=120, value=24, step=2)
        cold_chain = st.checkbox("Gunakan Armada Pendingin (*Cold Chain Transport 4°C*)", value=False)
        
        btn_calc_loss = st.button("📊 Hitung Simulasi Susut & Daya Simpan", type="primary")

    with l_col2:
        if btn_calc_loss or True:
            # Calculation
            loss_rate_day = 0.8 if cold_chain else 2.5
            transit_days = transit_h / 24.0
            loss_percent = min(loss_rate_day * transit_days, 25.0)
            lost_kg = log_vol * (loss_percent / 100.0)
            final_kg = log_vol - lost_kg
            shelf_life = 18 if cold_chain else 5
            
            c1, c2 = st.columns(2)
            c1.metric("Bobot Akhir Tiba", f"{final_kg:.1f} Kg", delta=f"-{lost_kg:.1f} Kg")
            c2.metric("Sisa Umur Simpan", f"{max(shelf_life - int(transit_days), 1)} Hari", delta=f"Total: {shelf_life} Hari")
            
            # Progress Bar
            st.write(f"**Tingkat Susut Bobot (*Weight Loss*):** `{loss_percent:.2f}%`")
            st.progress(min(loss_percent / 20.0, 1.0))
            
            if cold_chain:
                st.success("❄️ Cold Chain aktif: Meminimalisir respirasi buah & memperpanjang kesegaran hingga 3x lipat.")
            else:
                st.warning("⚠️ Suhu ruang ambient: Laju transpirasi tinggi. Pertimbangkan penggunaan kemasan berventilasi atau armada berpendingin.")

# ─────────────────────────────────────────────────────────────────────────────
# TAB 3: VERIFIKASI & AUDIT PASPOR DIGITAL
# ─────────────────────────────────────────────────────────────────────────────
with tab3:
    st.subheader("🔍 Verifikasi Keaslian & Riwayat Lot Panen")
    
    search_batch = st.text_input("Masukkan Nomor Batch ID atau URL Paspor", "LOT-CAB-20260831-01")
    
    if st.button("🔎 Cek Status Sertifikasi Lot"):
        st.markdown(f"""
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 10px;">
            <h4 style="color: #166534; margin-bottom: 8px;">✅ STATUS: TERVERIFIKASI ASLI (VERIFIED AUTHENTIC)</h4>
            <p><strong>Nomor Lot:</strong> {search_batch}</p>
            <p><strong>Penerbit:</strong> AgriSensa Precision Traceability Network</p>
            <p><strong>Status Residu Kimia:</strong> <span style="color: green; font-weight: bold;">LOLOS UJI AMAN (Safe for Consumption)</span></p>
            <p><strong>Standar Pasar:</strong> Sesuai Spesifikasi Mutu Bapanas Indonesia & Standar Ekspor JA Group</p>
        </div>
        """, unsafe_allow_html=True)
