# DNcrypt

## Project Documentation & Product Specification

**Tagline:** Secure. Encode. Preserve. Recover.\
**Product descriptor:** DNA-Inspired Secure Data Encoding & Recovery Platform\
**Project type:** Fully software-based computational biology + cybersecurity project\
**Working status:** Project concept and implementation specification\
**Primary implementation environment:** Google Antigravity

---

## 1. Project Overview

DNcrypt is a software platform that demonstrates how digital files can be represented as DNA-like nucleotide sequences and later reconstructed. Before conversion, files can be protected using modern cryptographic encryption. The platform can also simulate errors that might occur in a DNA-like storage or transmission process and evaluate how well its recovery pipeline reconstructs the original data.

The project combines three related ideas:
1. **Digital data encoding:** Convert file bytes into a sequence made from the four DNA bases: A, C, G and T.
2. **Cryptographic security:** Encrypt the file before encoding it, so the nucleotide representation is not mistaken for a security mechanism.
3. **Error simulation and recovery:** Introduce controlled sequence damage, attempt correction, decode the sequence and verify whether the original file can be recovered.

DNcrypt is an **in-silico prototype**. It simulates DNA-inspired data encoding entirely in software. It does not synthesize DNA, store data in physical DNA molecules, sequence biological samples or perform laboratory work.

---

## 2. Problem Statement

Digital information is usually stored and transferred using conventional binary representations. DNA data storage research explores a different representation in which digital information is mapped to sequences of the four nucleotide bases. This creates an interesting intersection of biology, information theory, data engineering and cybersecurity.

However, a DNA-like sequence is not automatically secure, and a sequence that has been damaged may not decode correctly. A useful educational and engineering prototype should therefore demonstrate the complete data lifecycle:
- How a digital file can be mapped to a nucleotide sequence.
- Why encoding and encryption are different operations.
- How sequence constraints can affect the encoding strategy.
- How substitutions, insertions, deletions and missing fragments affect recovery.
- How error-control methods and integrity checks can improve reliability.
- How to measure encoding overhead, processing time and recovery performance.

---

## 3. Goals and Objectives

### Main goals
- Build a working file-to-DNA-sequence encoder and decoder.
- Add authenticated encryption before sequence encoding.
- Preserve sufficient metadata to reconstruct files correctly.
- Implement configurable DNA-sequence validation and constraints.
- Simulate common sequence-level errors.
- Add an error-correction and recovery layer.
- Verify recovered files using cryptographic integrity checks.
- Provide a clear interface for experiments and performance comparisons.

### Learning objectives
- Understand DNA as an information-storage medium at a conceptual level.
- Apply binary encoding and decoding to file data.
- Understand the difference between representation, encryption and error correction.
- Explore sequence properties such as GC content and homopolymer runs.
- Understand the computational challenges of insertions and deletions.
- Apply software testing, benchmarking and data visualisation to a biology-inspired problem.

---

## 4. What DNcrypt Is — and Is Not

### DNcrypt is
- A software-only DNA-inspired file encoding and recovery platform.
- A demonstration of digital information represented using A, C, G and T.
- A cybersecurity-aware workflow using authenticated encryption.
- A simulation environment for sequence damage and recovery experiments.
- A platform for comparing encoding and error-control strategies.

### DNcrypt is not
- A physical DNA storage system.
- A DNA synthesis or sequencing service.
- A biological experiment or wet-lab project.
- A claim that nucleotide sequences themselves provide encryption.
- A demonstration of real-world DNA storage capacity, cost or long-term durability.

---

## 5. End-to-End Workflow

1. **Upload:** User selects a file (TXT, PDF, PNG, JPG, CSV, DOCX, ZIP, etc.).
2. **Inspect:** Application records filename, media type, original size, and SHA-256 digest.
3. **Optional compression:** zlib/deflate compression before encryption when useful.
4. **Encrypt:** AES-256-GCM authenticated encryption using an Argon2id/scrypt derived key.
5. **Prepare payload & Error-correction:** Apply chunking, index headers, and Reed-Solomon redundancy.
6. **Encode:** Convert bytes to A, C, G, T nucleotide symbols (baseline 2-bit or constrained strategy).
7. **Package output:** Export sequence package JSON & FASTA format.
8. **Simulate damage (MutationLab):** Apply substitutions, insertions, deletions, or missing chunks with reproducible seed.
9. **Recover:** Perform error correction, decode sequence to bytes, reassemble chunks.
10. **Decrypt:** AES-256-GCM decryption with user password, authenticate tag.
11. **Verify:** SHA-256 integrity verification against original digest.
12. **Report & Benchmark:** Display comprehensive metrics and visual comparisons.

---

## 6. Core Modules and Features

- **6.1 Secure File Vault:** Session management, file upload, status tracking, package download.
- **6.2 DNA Encoder:** 2-bit baseline (`00->A`, `01->C`, `10->G`, `11->T`) and constrained rotation encoder.
- **6.3 DNA Decoder:** Reverses nucleotide symbols to bits, validates alphabet, reconstructs chunks.
- **6.4 BioCrypt Encryption Engine:** AES-256-GCM, PBKDF2/scrypt key derivation, fresh salt & nonce.
- **6.5 HelixGuard:** Sequence constraints (GC ratio, homopolymer run length, invalid char detection).
- **6.6 MutationLab:** Substitutions, insertions, deletions, dropped chunks with seed control.
- **6.7 Error Correction & Recovery:** Reed-Solomon (RS) codec per chunk with parity bytes, chunk integrity checks.
- **6.8 Benchmarking Dashboard:** Real execution measurements: compression ratio, sequence length, overhead, timings, recovery verification.

---

## 7. Syllabus Alignment (Biology for Engineers)
- **Module 1 — Biomolecular Engineering:** DNA as digital information storage medium; nucleotides A, C, G, T.
- **Module 2 — Human Machine:** Biological information transfer & signaling context.
- **Module 3 — Biomimicry:** Nature-inspired architectures for long-term data storage.
- **Module 4 — Engineering Life:** Computational sequence analysis, bioinformatics, sequence validation.
- **Module 5 — Frontier Bioengineering:** In-silico simulation, error control, computational robustness.
