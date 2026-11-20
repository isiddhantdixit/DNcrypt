from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db
from app.api.routes import router as api_router

# Initialize SQLite tables on startup
try:
    init_db()
except Exception as e:
    print(f"Database startup warning: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="DNA-Inspired Secure Data Encoding & Recovery Platform API",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for local development and Vercel domains
origins = [
    "https://dncrypt.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount router on both /api and root / so requests work regardless of whether
# the proxy/rewrite forwards the /api prefix or strips it.
app.include_router(api_router, prefix="/api")
app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
