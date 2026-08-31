import streamlit as st
import os
import sys

# Add root directory to sys.path if not there
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from services.api_core_client import chat_with_agent, get_health

st.set_page_config(
    page_title="Smart Agri Assistant",
    page_icon="🤖",
    layout="wide",
)

st.title("🤖 Smart Agri Assistant")
st.markdown("""
Selamat datang di **AgriSensa Smart Assistant**. 
Asisten ini terhubung langsung ke **AI Core Backend** yang memiliki kemampuan *Agentic RAG*. 
Anda dapat menanyakan informasi pertanian umum atau meminta prediksi cerdas dengan memasukkan data spesifik (misal: NPK tanah, suhu, pH).
""")

# Health check (optional, but good for UX)
health = get_health()
if health.get("status") == "unreachable":
    st.error("⚠️ AI Core Server tidak dapat dihubungi. Pastikan FastAPI server `agrisensa-ai-core` sedang berjalan.")
    st.stop()
elif health.get("status") != "healthy":
    st.warning("⚠️ AI Core Server berjalan namun beberapa layanan mungkin tidak tersedia (misal: MLOps belum diload penuh).")

# Initialize chat history
if "chat_history" not in st.session_state:
    st.session_state.chat_history = [
        {"role": "assistant", "content": "Halo! Saya adalah AgriSensa Smart Assistant. Ada yang bisa saya bantu hari ini terkait pertanian atau prediksi panen?"}
    ]

# Display chat messages from history on app rerun
for message in st.session_state.chat_history:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# React to user input
if prompt := st.chat_input("Tanyakan sesuatu (contoh: NPK tanah N=90, P=42, K=43, tanaman apa yang cocok?)"):
    # Display user message in chat message container
    st.chat_message("user").markdown(prompt)
    
    # Add user message to chat history
    st.session_state.chat_history.append({"role": "user", "content": prompt})

    # Display assistant response in chat message container
    with st.chat_message("assistant"):
        with st.spinner("Berpikir..."):
            # Call AI Core
            # We exclude the first welcome message and map history
            history_for_api = st.session_state.chat_history[1:-1]
            response_data = chat_with_agent(prompt, history_for_api)
            
            answer = response_data.get("answer", "Maaf, tidak ada respons.")
            st.markdown(answer)
            
            # Show sources if any (for knowledge route)
            sources = response_data.get("sources", [])
            if sources:
                with st.expander("Lihat Sumber Referensi"):
                    for i, src in enumerate(sources):
                        st.text(f"--- Referensi {i+1} ---\n{src}")
            
            # Show tool debug info if any (for tool route)
            tool_used = response_data.get("tool_used")
            if tool_used:
                with st.expander("🛠️ Tool yang Dipanggil"):
                    st.json({
                        "tool": tool_used,
                        "parameters": response_data.get("tool_params", {})
                    })

    # Add assistant response to chat history
    st.session_state.chat_history.append({"role": "assistant", "content": answer})
