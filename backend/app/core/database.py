import sqlite3
import json
from typing import Optional, List, Dict, Any
from app.core.config import settings

_fallback_memory_db: Optional[sqlite3.Connection] = None

def get_db() -> sqlite3.Connection:
    global _fallback_memory_db
    try:
        conn = sqlite3.connect(settings.DATABASE_PATH, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn
    except Exception:
        # Fallback to in-memory database if file path cannot be written (e.g. read-only serverless)
        if _fallback_memory_db is None:
            _fallback_memory_db = sqlite3.connect(":memory:", check_same_thread=False)
            _fallback_memory_db.row_factory = sqlite3.Row
        return _fallback_memory_db

def init_db():
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            filename TEXT NOT NULL,
            media_type TEXT,
            original_size INTEGER NOT NULL,
            original_sha256 TEXT NOT NULL,
            compression TEXT,
            encoding_strategy TEXT,
            rs_parity INTEGER,
            total_nucleotides INTEGER,
            gc_content REAL,
            status TEXT NOT NULL,
            package_json TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS benchmarks (
            id TEXT PRIMARY KEY,
            session_id TEXT,
            filename TEXT,
            file_size INTEGER,
            strategy TEXT,
            compression_ratio REAL,
            encoding_time_ms REAL,
            decoding_time_ms REAL,
            encryption_time_ms REAL,
            decryption_time_ms REAL,
            error_rate REAL,
            recovery_success INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        conn.commit()
        if _fallback_memory_db is None or conn != _fallback_memory_db:
            conn.close()
    except Exception as e:
        print(f"Warning: could not initialize database: {e}")
