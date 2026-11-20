import sqlite3
import json
from typing import Optional, List, Dict, Any
from app.core.config import settings

def get_db():
    conn = sqlite3.connect(settings.DATABASE_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
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
    conn.close()
