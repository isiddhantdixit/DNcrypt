# DNcrypt Sequence Package Format (v1.0.0)

## Overview
DNcrypt packages represent encoded data accompanied by the cryptographic and biological metadata required for deterministic reconstruction and error-correction.

## Specification

```json
{
  "format_version": "1.0.0",
  "session_id": "dncrypt-uuid4",
  "created_at": "ISO-8601 UTC timestamp",
  "file_metadata": {
    "original_filename": "sample.pdf",
    "media_type": "application/pdf",
    "original_size": 1024,
    "original_sha256": "64-character lowercase hex digest"
  },
  "pipeline_parameters": {
    "compression": "none" | "deflate",
    "compressed_size": 950,
    "encryption": {
      "algorithm": "AES-256-GCM",
      "kdf": "argon2id" | "scrypt",
      "salt": "base64-encoded 16 bytes",
      "nonce": "base64-encoded 12 bytes",
      "tag_included": true
    },
    "encoding": {
      "strategy": "baseline_2bit" | "constrained_rotation",
      "mapping_table": {
        "00": "A",
        "01": "C",
        "10": "G",
        "11": "T"
      }
    },
    "error_correction": {
      "scheme": "reed_solomon_gf256",
      "parity_bytes_per_chunk": 16,
      "chunk_payload_size": 200,
      "total_chunks": 6
    }
  },
  "sequence_data": {
    "total_nucleotides": 5184,
    "gc_content_pct": 50.2,
    "max_homopolymer_run": 3,
    "chunks": [
      {
        "index": 0,
        "chunk_id": "chk_0000",
        "dna_sequence": "ACGTACGT...",
        "crc32": "a1b2c3d4"
      }
    ],
    "full_sequence": "ACGTACGT..."
  }
}
```

## FASTA Format Export
Packages can also be exported as standard multi-line FASTA files:
```text
>DNcrypt|session_id|chunk_0|len_864|gc_50.2
ACGTACGTACGT...
```
