"""
AgriSensa Advanced AI & MCP Engine - Root Entrypoint
"""
import os
import uvicorn
from api.main import app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run("api.main:app", host="0.0.0.0", port=port, reload=False)
