<div align="center">

# DNcrypt

### **Secure. Encode. Preserve. Recover.**

*DNA-Inspired Secure Data Encoding & Recovery Platform*

[![Python](https://img.shields.io/badge/Python-3.10%20%7C%203.11%20%7C%203.12%20%7C%203.14-173F35?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-102F28?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-2A6F5E?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-8FAE91?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-R3F-173F35?logo=threedotjs&logoColor=white)](https://threejs.org/)
[![Cryptography](https://img.shields.io/badge/AES--256--GCM-Argon2id-102F28?logo=gnupg&logoColor=white)](https://cryptography.io/)
[![Reed-Solomon](https://img.shields.io/badge/Reed--Solomon-GF(256)-2A6F5E)](https://en.wikipedia.org/wiki/Reed%E2%80%93Solomon_error_correction)
[![Tests](https://img.shields.io/badge/Pytest-14%20Passing-success?logo=pytest&logoColor=white)](https://pytest.org/)

<p align="center">
  <b>A software-based computational biology and cybersecurity platform simulating file encoding into DNA-like nucleotide sequences (A, C, G, T), in-silico mutation damage, algebraic error-correction recovery, and SHA-256 byte-for-byte integrity verification.</b>
</p>

</div>

---

> [!IMPORTANT]
> **In-Silico Simulation Notice:** DNcrypt is a software-based computational biology prototype. It simulates DNA-inspired data storage mathematically and algorithmically. It does not synthesize physical oligonucleotides, store data in wet-lab biological samples, or conduct wet-lab sequencing. All benchmarks and error-tolerance metrics describe algorithms executing on standard silicon computing hardware.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture & Data Pipeline](#architecture--data-pipeline)
- [Biology Syllabus Alignment](#biology-syllabus-alignment)
- [Encoding vs Encryption](#encoding-vs-encryption)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Local Setup & Execution](#local-setup--execution)
- [Testing & Quality Verification](#testing--quality-verification)
- [License & Academic Attribution](#license--academic-attribution)

---

## Overview

Digital archival data faces longevity and degradation challenges on magnetic and optical media. Biological DNA provides an ultra-dense, durable storage concept with theoretical limits exceeding **200 petabytes per gram**. 

**DNcrypt** explores this intersection of computer science, information theory, and biology:
1. **Confidentiality & Authentication:** Files are first encrypted with **AES-256-GCM** using keys derived via **Argon2id**.
2. **Error Resilience:** Data chunks are protected with **Reed-Solomon GF(256)** error-correcting codes.
3. **Biological Representation:** Encrypted payloads are mapped to nucleotide sequences ($A, C, G, T$) via baseline 2-bit or constrained rotating algorithms.
4. **Environmental Stress Testing:** An interactive **MutationLab** simulates point substitutions, frame-shifting indels, and fragment dropouts.
5. **Exact Recovery:** The recovery pipeline corrects nucleotide errors, authenticates cryptographic tags, and verifies exact byte-for-byte reconstruction with **SHA-256**.

---

## Key Features

- **Continuous 3D Double-Helix Scene:** Built with **Three.js** and **React Three Fiber**, showcasing two intertwined antiparallel strands with distinct green/teal sugar-phosphate backbones, coordinating nucleotide base pairs, and mouse-directed 3D parallax.
- **BioCrypt Cryptographic Engine:** Authenticated encryption using AES-256-GCM. Generates unique 16-byte random salts and 12-byte nonces per session. Passwords and raw keys are strictly ephemeral and never stored.
- **Dual DNA Encoding Strategies:**
  - *Baseline 2-bit:* Direct mapping (`00→A`, `01→C`, `10→G`, `11→T`) yielding 4 nucleotides per byte.
  - *Constrained Rotation:* Differential state-wheel mapping guaranteeing **zero homopolymer runs** (max run length = 1) and balanced GC content (~50%).
- **HelixGuard Sequence Validator:** Checks sequence alphabet validity, calculates GC percentage against biological sweet-spots (45–55%), and detects homopolymer runs.
- **MutationLab Damage Simulator:** Configurable mutation models (substitutions, insertions, deletions, chunk dropouts) with deterministic random seed reproducibility.
- **Multi-Stage Recovery Centre:** Performs Reed-Solomon algebraic decoding, CRC32 chunk verification, AES-GCM authentication, and SHA-256 digest validation.
- **Experimental Benchmark Lab:** Real-time benchmark runner with **Recharts** visualizations and persistent **SQLite** telemetry.

---

## Architecture & Data Pipeline

```
+-----------------------------------------------------------------------------------+
|                         React + Three.js Interface                                |
|  - Rotating 3D DNA double-helix scene with real-time mouse parallax               |
|  - Pages: Home, Dashboard, Encode, Sequence Explorer, MutationLab,                 |
|           Recovery Centre, Benchmark Lab, Documentation                           |
+-----------------------------------------+-----------------------------------------+
                                          | HTTP / REST (Vite Proxy: /api)
                                          v
+-----------------------------------------------------------------------------------+
|                            FastAPI Backend Engine                                 |
|  - Session tracking via SQLite, Pydantic schemas, safe temp-file management        |
+-----------------------------------------+-----------------------------------------+
                                          |
         +--------------------------------+--------------------------------+
         |                                                                 |
         v                                                                 v
+----------------------------------+             +----------------------------------+
|        Encoding Pipeline         |             |        Recovery Pipeline         |
| 1. SHA-256 baseline hash         |             | 1. HelixGuard symbol validation  |
| 2. Optional Deflate compression  |             | 2. Nucleotide -> Bytes decoding  |
| 3. AES-256-GCM encryption        |             | 3. Reed-Solomon GF(256) repair   |
|    (Argon2id / scrypt KDF,       |             | 4. Packet sequence & CRC32 check |
|     fresh salt & nonce)          |             | 5. AES-256-GCM authentication    |
| 4. Chunking & RS Parity symbols  |             | 6. Optional decompression        |
| 5. DNA nucleotide mapping        |             | 7. SHA-256 exact integrity check |
| 6. Package export (.json/.fasta) |             | 8. Reconstructed file download   |
+----------------------------------+             +----------------------------------+
```

---

## Biology Syllabus Alignment

DNcrypt directly aligns with key learning objectives in **Biology for Engineers**:

| Syllabus Module | Alignment | Computational Application |
|---|---|---|
| **Module 1 — Biomolecular Engineering** | **Strong** | Explores DNA as an information-storage molecule; maps binary digital data into $A, C, G, T$ nucleotide sequences. |
| **Module 2 — Human Machine** | Supporting | Contextual reference for biological information transmission and signaling protocols. |
| **Module 3 — Biomimicry** | **Strong** | Applies biological preservation principles to solve physical archival degradation in modern data storage. |
| **Module 4 — Engineering Life** | **Strong** | Bioinformatics and computational sequence processing; implements HelixGuard for GC content and homopolymer analysis. |
| **Module 5 — Frontier Bioengineering** | **Strong** | In-silico modeling of mutational forces paired with Reed-Solomon algebraic error-correction codes. |

---

## Encoding vs Encryption

A foundational principle of DNcrypt is emphasizing the critical distinction between **encoding** and **encryption**:

- **DNA Encoding is NOT Encryption:** Converting bits to nucleotide symbols (`00→A, 01→C`) is a format transformation. It provides **zero confidentiality**.
- **Cryptographic Encryption:** Confidentiality and tamper detection are provided strictly by **AES-256-GCM** with **Argon2id** key derivation *before* DNA encoding occurs.

---

## Technology Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS (Custom biological forest/sage/cream palette)
- **3D Graphics:** Three.js, `@react-three/fiber`, `@react-three/drei`
- **Navigation:** React Router v7
- **Motion:** Framer Motion
- **Icons:** Lucide React
- **Visualizations:** Recharts

### Backend
- **Framework:** FastAPI
- **Validation:** Pydantic v2
- **Cryptography:** `cryptography` (AES-256-GCM), `argon2-cffi`
- **Error Correction:** `reedsolo` (Reed-Solomon GF(256) codec)
- **Database:** SQLite
- **Test Framework:** Pytest with HTTPX

---

## Project Structure

```text
DNcrypt/
├── frontend/                     # React + TypeScript frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── dna/              # 3D Double-Helix Scene & Canvas (Three.js/R3F)
│   │   │   └── layout/           # Navbar, Footer, Page Layout
│   │   ├── pages/                # Home, Dashboard, Encode, Explorer, MutationLab,
│   │   │                         # Recovery, Benchmarks, About
│   │   ├── services/             # API client & fetch handlers
│   │   ├── styles/               # Tailwind theme & CSS
│   │   └── types/                # TypeScript interfaces
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                      # FastAPI Python backend
│   ├── app/
│   │   ├── api/routes.py         # REST API endpoints
│   │   ├── core/                 # Config & database setup
│   │   ├── schemas/              # Pydantic package schemas
│   │   ├── services/
│   │   │   ├── compression/      # Deflate engine
│   │   │   ├── encryption/       # AES-256-GCM + Argon2id
│   │   │   ├── error_correction/ # Reed-Solomon GF(256)
│   │   │   ├── encoding/         # Baseline & Constrained encoders
│   │   │   ├── decoding/         # Byte reassembly & CRC32
│   │   │   ├── validation/       # HelixGuard validator
│   │   │   ├── mutation/         # MutationLab simulator
│   │   │   ├── recovery/         # Recovery pipeline
│   │   │   └── benchmarking/     # Benchmark runner
│   │   └── main.py               # FastAPI entry point
│   ├── tests/                    # 14 Pytest test suites
│   └── requirements.txt
│
├── docs/                         # Architecture, Package Schema, Experimental Docs
├── README_SETUP.md               # Localhost run guide
└── run_local.ps1                 # Single-click launcher script
```

---

## Local Setup & Execution

### Option 1: Unified Script (PowerShell)
```powershell
.\run_local.ps1
```

### Option 2: Manual Terminal Commands

#### 1. Backend Server
```bash
cd backend
python -m venv venv
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On macOS/Linux:
# source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Base URL: `http://localhost:8000`
- Interactive Swagger Docs: `http://localhost:8000/docs`

#### 2. Frontend Application
```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:5173`

---

## Testing & Quality Verification

Run the complete backend test suite:
```powershell
$env:PYTHONPATH = "backend"
backend\venv\Scripts\pytest backend\tests -v
```

Output:
```text
backend\tests\test_api_endpoints.py ...                                  [ 21%]
backend\tests\test_encoding_decoding.py ...                              [ 42%]
backend\tests\test_encryption.py ...                                     [ 64%]
backend\tests\test_error_correction.py ...                               [ 85%]
backend\tests\test_mutation_and_recovery.py ..                           [100%]

============================= 14 passed in 5.79s ==============================
```

Build verification:
```powershell
npm run build --prefix frontend
# Output: built in 31s with 0 errors
```

---

## License & Academic Attribution

Developed for academic demonstration and computational biology research.  
**DNcrypt — Secure. Encode. Preserve. Recover.**
