import sys
import os

# Set VERCEL environment indicator
os.environ["VERCEL"] = "1"

# Add backend directory to sys.path so app modules import cleanly
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(current_dir, "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app

# Export as ASGI application for Vercel Python runtime
app = app
