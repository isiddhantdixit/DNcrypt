# DNcrypt Setup & Execution Guide

Welcome to **DNcrypt** (DNA-Inspired Secure Data Encoding & Recovery Platform). This guide details how to run both the FastAPI backend and Vite/React frontend locally.

---

## 1. Prerequisites

- **Python 3.10+** (Tested with Python 3.14.0)
- **Node.js 18+** (Tested with Node.js v24.15.0 and npm 11.12.1)
- Windows / macOS / Linux

---

## 2. Quick Start (Single Command)

On Windows PowerShell:
```powershell
.\run_local.ps1
```

This starts both:
- **Backend API**: `http://localhost:8000` (API Docs: `http://localhost:8000/docs`)
- **Frontend App**: `http://localhost:5173`

---

## 3. Manual Step-by-Step Setup

### Step A: Backend Setup (FastAPI)

1. Open a terminal and navigate to `backend/`:
   ```bash
   cd backend
   ```

2. Activate the virtual environment (created in `backend/venv`):
   - **Windows PowerShell**:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **Windows CMD**:
     ```cmd
     .\venv\Scripts\activate.bat
     ```
   - **Linux / macOS**:
     ```bash
     source venv/bin/activate
     ```

3. (If re-installing) Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI development server:
   ```bash
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```

5. Verify backend health:
   - Visit `http://localhost:8000/api/health`
   - Interactive Swagger API docs: `http://localhost:8000/docs`

---

### Step B: Frontend Setup (React + Vite + Three.js)

1. Open a second terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   ```

2. (If re-installing) Install npm packages:
   ```bash
   npm install
   ```

3. Launch the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 4. Running Backend Unit & API Tests

Run the full pytest suite (14 passing tests):

```powershell
$env:PYTHONPATH = "backend"
backend\venv\Scripts\pytest backend\tests -v
```

Tests cover:
- Authenticated AES-256-GCM encryption & Argon2id key derivation
- Baseline 2-bit DNA encoding & decoding
- Constrained rotating DNA encoding (zero homopolymers, GC balance)
- Reed-Solomon GF(256) parity correction under byte corruptions
- MutationLab damage simulation (substitutions, insertions, deletions, dropouts)
- End-to-end file recovery with SHA-256 verification
- FastAPI REST endpoints
