# DNcrypt Experimental Protocol & Benchmarks

## Overview
DNcrypt allows controlled in-silico experimentation evaluating how biological DNA constraints and environmental damage affect digital data preservation.

## Experimental Dimensions

1. **Encoding Overhead:**
   - 2-bit baseline: 4 nucleotide bases per byte.
   - Reed-Solomon Parity: (chunk_size + n_parity) * 4 nucleotides per chunk.
   - Constrained encoding: Rotation encoding to prevent homopolymer runs >= 3 and balance GC content between 45% and 55%.

2. **Damage Simulation (MutationLab):**
   - **Point Substitutions:** Transversion / Transition rate $\lambda_s \in [0.001, 0.15]$.
   - **Insertions:** Frame-shift inducing base insertions $\lambda_i \in [0.001, 0.05]$.
   - **Deletions:** Base deletions causing length shrinkage $\lambda_d \in [0.001, 0.05]$.
   - **Dropouts / Missing Chunks:** Simulating physical breakage or degradation.

3. **Recovery Limits:**
   - Reed-Solomon GF(256) with $2t$ parity symbols can correct up to $t$ byte errors in known alignments.
   - Uncorrectable damage fails gracefully with clear diagnostic reports and tamper detection.
