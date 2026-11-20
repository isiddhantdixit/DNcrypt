# DNcrypt System Architecture

## Overview
DNcrypt is an in-silico computational biology and cybersecurity platform simulating secure file encoding into DNA nucleotide sequences (A, C, G, T), sequence damage simulation, error-corrected recovery, and cryptographic integrity verification.

## Architecture Layers

```
+-------------------------------------------------------------------+
|                        React + Three.js UI                        |
|  - 3D Double-Helix Interactive Background (Three.js / R3F)       |
|  - Pages: Home, Dashboard, Encode, Sequence Explorer,             |
|           MutationLab, Recovery Centre, Benchmark Lab, About      |
+---------------------------------+---------------------------------+
                                  | HTTP / REST (Vite Proxy: /api)
                                  v
+---------------------------------+---------------------------------+
|                         FastAPI Backend                           |
|  - CORS, Request Validation, Safe Temp Cleanup, SQLite History     |
+---------------------------------+---------------------------------+
                                  |
         +------------------------+------------------------+
         |                                                 |
         v                                                 v
+-----------------------------+               +-----------------------------+
|    Encoding Pipeline        |               |    Recovery Pipeline        |
| 1. SHA-256 Digest           |               | 1. Sequence Validation      |
| 2. Optional Deflate Compress|               | 2. Nucleotide -> Bytes      |
| 3. AES-256-GCM Encryption   |               | 3. Reed-Solomon Decode /    |
|    (Argon2id/scrypt KDF,    |               |    Error Correction         |
|     fresh salt & nonce)     |               | 4. Chunk Reassembly         |
| 4. Chunking & RS Parity     |               | 5. AES-256-GCM Decrypt      |
| 5. DNA Mapping (Baseline/   |               | 6. Optional Decompress      |
|    Constrained GC-balanced) |               | 7. SHA-256 Exact Integrity  |
| 6. Package Metadata Export  |               |    Verification             |
+-----------------------------+               +-----------------------------+
```

## Security Model
1. **Confidentiality:** Provided strictly by AES-256-GCM with PBKDF2/scrypt/Argon2id key derivation. DNA mapping is a representation/encoding layer, NOT encryption.
2. **Key Hygiene:** User passwords and raw keys are NEVER persisted, logged, or included in exported packages.
3. **Integrity:** Authenticated GCM tag verification combined with payload-level SHA-256 digests.
