import os
from pydantic import BaseModel

# Detect serverless (Vercel, AWS Lambda, etc.)
is_serverless = bool(
    os.environ.get("VERCEL") 
    or os.environ.get("AWS_LAMBDA_FUNCTION_NAME")
    or not os.access(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), os.W_OK)
)

base_dir = "/tmp" if is_serverless else os.path.dirname(os.path.dirname(os.path.dirname(__file__)))

class Settings(BaseModel):
    PROJECT_NAME: str = "DNcrypt"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    MAX_UPLOAD_SIZE_BYTES: int = 50 * 1024 * 1024 # 50 MB
    DATABASE_PATH: str = os.path.join(base_dir, "dncrypt.db")
    UPLOAD_DIR: str = os.path.join(base_dir, "temp_uploads")

settings = Settings()

try:
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
except Exception:
    pass
