import os
import uuid
import json
import base64
import hashlib
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Response
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import get_db
from app.schemas.package import MutateRequest, RecoverRequest, ValidateRequest, BenchmarkRequest
from app.services.compression.engine import CompressionEngine
from app.services.encryption.biocrypt import BioCryptEngine
from app.services.encoding.baseline import BaselineDNAEncoder
from app.services.encoding.constrained import ConstrainedDNAEncoder
from app.services.validation.helix_guard import HelixGuardValidator
from app.services.mutation.simulator import MutationSimulator
from app.services.recovery.pipeline import RecoveryPipeline
from app.services.benchmarking.runner import BenchmarkRunner

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "DNcrypt Backend",
        "version": settings.VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@router.post("/encode")
async def encode_file(
    file: UploadFile = File(...),
    password: str = Form(...),
    compression: bool = Form(True),
    strategy: str = Form("baseline_2bit"),
    rs_parity: int = Form(16),
    chunk_size: int = Form(192)
):
    if not password or len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(status_code=413, detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_BYTES // (1024*1024)}MB.")

    orig_sha256 = hashlib.sha256(content).hexdigest()
    orig_size = len(content)
    session_id = f"dn-{uuid.uuid4().hex[:12]}"

    # Step 1: Optional compression (before encryption)
    if compression:
        payload_to_encrypt, comp_ratio = CompressionEngine.compress(content)
        comp_mode = "deflate"
    else:
        payload_to_encrypt = content
        comp_ratio = 1.0
        comp_mode = "none"

    # Step 2: Authenticated AES-256-GCM encryption
    enc_res = BioCryptEngine.encrypt(payload_to_encrypt, password=password, kdf_type="argon2id")

    # Step 3: DNA encoding
    if strategy == "constrained_rotation":
        enc_pkg = ConstrainedDNAEncoder.encode_payload_with_chunks(
            enc_res["ciphertext"], chunk_size=chunk_size, rs_parity=rs_parity
        )
    else:
        enc_pkg = BaselineDNAEncoder.encode_payload_with_chunks(
            enc_res["ciphertext"], chunk_size=chunk_size, rs_parity=rs_parity
        )

    # Step 4: HelixGuard validation
    validation = HelixGuardValidator.validate_sequence(enc_pkg["full_sequence"])

    package = {
        "format_version": "1.0.0",
        "session_id": session_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "file_metadata": {
            "original_filename": file.filename or "unnamed_file",
            "media_type": file.content_type or "application/octet-stream",
            "original_size": orig_size,
            "original_sha256": orig_sha256
        },
        "pipeline_parameters": {
            "compression": comp_mode,
            "compressed_size": len(payload_to_encrypt),
            "encryption": {
                "algorithm": enc_res["algorithm"],
                "salt": enc_res["salt_b64"],
                "nonce": enc_res["nonce_b64"],
                "kdf": enc_res["kdf_params"]
            },
            "encoding": {
                "strategy": strategy,
                "chunk_size": chunk_size
            },
            "error_correction": {
                "scheme": "reed_solomon_gf256",
                "parity_bytes_per_chunk": rs_parity,
                "total_chunks": enc_pkg["total_chunks"]
            }
        },
        "sequence_data": {
            "total_nucleotides": enc_pkg["total_nucleotides"],
            "gc_content_pct": validation["gc_content_pct"],
            "max_homopolymer_run": validation["max_homopolymer_run"],
            "chunks": enc_pkg["chunks"],
            "full_sequence": enc_pkg["full_sequence"]
        },
        "validation_report": validation
    }

    # Store in SQLite database
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO sessions (
            id, filename, media_type, original_size, original_sha256,
            compression, encoding_strategy, rs_parity, total_nucleotides,
            gc_content, status, package_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            session_id,
            file.filename or "unnamed_file",
            file.content_type or "application/octet-stream",
            orig_size,
            orig_sha256,
            comp_mode,
            strategy,
            rs_parity,
            enc_pkg["total_nucleotides"],
            validation["gc_content_pct"],
            "ENCODED",
            json.dumps(package)
        ))
        conn.commit()
        conn.close()
    except Exception as e:
        # SQLite error shouldn't block response
        pass

    return package

@router.post("/validate")
def validate_sequence(req: ValidateRequest):
    if req.sequence:
        return HelixGuardValidator.validate_sequence(req.sequence)
    elif req.package and "sequence_data" in req.package:
        seq = req.package["sequence_data"].get("full_sequence", "")
        return HelixGuardValidator.validate_sequence(seq)
    else:
        raise HTTPException(status_code=400, detail="Must provide either 'sequence' or 'package' for validation.")

@router.post("/mutate")
def mutate_sequence(req: MutateRequest):
    res = MutationSimulator.mutate_package(
        package=req.package,
        substitution_rate=req.substitution_rate,
        insertion_rate=req.insertion_rate,
        deletion_rate=req.deletion_rate,
        missing_chunks_count=req.missing_chunks_count,
        seed=req.seed
    )
    return res

@router.post("/recover")
def recover_file(req: RecoverRequest):
    if not req.password:
        raise HTTPException(status_code=400, detail="Password is required for decryption.")
        
    result = RecoveryPipeline.run_recovery(
        package=req.package,
        password=req.password
    )

    # Encode recovered bytes to base64 so frontend can download directly
    if result.get("recovered_bytes") is not None:
        rec_bytes = result.pop("recovered_bytes")
        result["recovered_file_base64"] = base64.b64encode(rec_bytes).decode('utf-8')
    else:
        result["recovered_file_base64"] = None

    return result

@router.post("/benchmark")
def run_benchmark(req: BenchmarkRequest):
    # Generate deterministic pseudo-random binary payload for benchmark
    seed_data = os.urandom(req.file_size_bytes)
    res = BenchmarkRunner.run_benchmark(
        sample_data=seed_data,
        filename=f"bench_{req.file_size_bytes}b.bin",
        password="BenchPassword123!",
        compression=req.compression,
        strategy=req.strategy,
        rs_parity=req.rs_parity,
        test_error_rate=req.test_error_rate
    )
    return res

@router.get("/benchmarks")
def get_benchmarks(limit: int = 20):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT id, session_id, filename, file_size, strategy, compression_ratio,
           encoding_time_ms, decoding_time_ms, encryption_time_ms, decryption_time_ms,
           error_rate, recovery_success, created_at
    FROM benchmarks
    ORDER BY created_at DESC
    LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(r) for r in rows]

@router.get("/sessions")
def get_sessions(limit: int = 15):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT id, filename, media_type, original_size, original_sha256,
           compression, encoding_strategy, rs_parity, total_nucleotides,
           gc_content, status, created_at
    FROM sessions
    ORDER BY created_at DESC
    LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(r) for r in rows]

@router.get("/sessions/{session_id}")
def get_session(session_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT package_json FROM sessions WHERE id = ?", (session_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row or not row["package_json"]:
        raise HTTPException(status_code=404, detail="Session not found.")
        
    return json.loads(row["package_json"])

@router.get("/export-fasta/{session_id}")
def export_fasta(session_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT filename, package_json FROM sessions WHERE id = ?", (session_id,))
    row = cursor.fetchone()
    conn.close()

    if not row or not row["package_json"]:
        raise HTTPException(status_code=404, detail="Session not found.")

    pkg = json.loads(row["package_json"])
    chunks = pkg.get("sequence_data", {}).get("chunks", [])
    filename = row["filename"]

    fasta_lines = []
    for chk in chunks:
        hdr = f">DNcrypt|{session_id}|{chk['chunk_id']}|len_{chk['dna_len']}|crc_{chk['crc32']}"
        fasta_lines.append(hdr)
        # Format in 80-char FASTA standard wrapping
        dna = chk["dna_sequence"]
        for i in range(0, len(dna), 80):
            fasta_lines.append(dna[i:i+80])

    fasta_content = "\n".join(fasta_lines)
    return Response(
        content=fasta_content,
        media_type="text/plain",
        headers={"Content-Disposition": f"attachment; filename={filename}.fasta"}
    )
