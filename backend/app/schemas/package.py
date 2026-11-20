from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class FileMetadata(BaseModel):
    original_filename: str
    media_type: str
    original_size: int
    original_sha256: str

class EncryptionParams(BaseModel):
    algorithm: str = "AES-256-GCM"
    salt: str
    nonce: str
    kdf: Dict[str, Any]

class EncodingParams(BaseModel):
    strategy: str = "baseline_2bit" # or "constrained_rotation"

class ErrorCorrectionParams(BaseModel):
    scheme: str = "reed_solomon_gf256"
    parity_bytes_per_chunk: int = 16
    chunk_payload_size: int = 192
    total_chunks: int

class PipelineParameters(BaseModel):
    compression: str = "none" # "none" or "deflate"
    compressed_size: Optional[int] = None
    encryption: EncryptionParams
    encoding: EncodingParams
    error_correction: ErrorCorrectionParams

class ChunkItem(BaseModel):
    index: int
    chunk_id: str
    raw_size: int
    protected_size: int
    dna_len: int
    dna_sequence: str
    crc32: str

class SequenceData(BaseModel):
    total_nucleotides: int
    gc_content_pct: Optional[float] = None
    max_homopolymer_run: Optional[int] = None
    chunks: List[ChunkItem]
    full_sequence: str

class DNcryptPackage(BaseModel):
    format_version: str = "1.0.0"
    session_id: str
    created_at: str
    file_metadata: FileMetadata
    pipeline_parameters: PipelineParameters
    sequence_data: SequenceData

class MutateRequest(BaseModel):
    package: Dict[str, Any]
    substitution_rate: float = Field(0.01, ge=0.0, le=0.5)
    insertion_rate: float = Field(0.0, ge=0.0, le=0.2)
    deletion_rate: float = Field(0.0, ge=0.0, le=0.2)
    missing_chunks_count: int = Field(0, ge=0)
    seed: int = 42

class RecoverRequest(BaseModel):
    package: Dict[str, Any]
    password: str

class ValidateRequest(BaseModel):
    sequence: Optional[str] = None
    package: Optional[Dict[str, Any]] = None

class BenchmarkRequest(BaseModel):
    file_size_bytes: int = Field(4096, ge=64, le=1048576) # default 4KB, max 1MB
    strategy: str = "baseline_2bit"
    compression: bool = True
    rs_parity: int = 16
    test_error_rate: float = 0.02
