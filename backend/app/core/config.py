import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "DNcrypt"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    MAX_UPLOAD_SIZE_BYTES: int = 50 * 1024 * 1024 # 50 MB
    DATABASE_PATH: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "dncrypt.db")
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "temp_uploads")

settings = Settings()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
