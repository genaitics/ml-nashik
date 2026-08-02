import sys
import os

# Ensure backend directory is in sys.path for backend module resolution
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

os.environ["VERCEL"] = "1"

from main import app
