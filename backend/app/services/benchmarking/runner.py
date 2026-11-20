import time
import uuid
import hashlib
from typing import Dict, Any, List
from app.services.compression.engine import CompressionEngine
from app.services.encryption.biocrypt import BioCryptEngine
from app.services.encoding.baseline import BaselineDNAEncoder
from app.services.encoding.constrained import ConstrainedDNAEncoder
from app.services.decoding.decoder import DNADecoder
from app.services.validation.helix_guard import HelixGuardValidator
from app.services.mutation.simulator import MutationSimulator
from app.services.recovery.pipeline import RecoveryPipeline
from app.core.database import get_db

class BenchmarkRunner:
    @classmethod
    def run_benchmark(
        cls,
        sample_data: bytes,
        filename: str = "benchmark_sample.bin",
        password: str = "BenchmarkSecret123!",
        compression: bool = True,
        strategy: str = "baseline_2bit",
        rs_parity: int = 16,
        test_error_rate: float = 0.02
    ) -> Dict[str, Any]:
        """
        Executes a timed benchmark comparing encoding strategies, compression,
        cryptographic latency, sequence overhead, and recovery performance.
        Records actual timings and outputs in SQLite.
        """
        orig_size = len(sample_data)
        orig_sha256 = hashlib.sha256(sample_data).hexdigest()

        # 1. Compression timing
        t0 = time.perf_counter()
        if compression:
            comp_data, comp_ratio = CompressionEngine.compress(sample_data)
        else:
            comp_data = sample_data
            comp_ratio = 1.0
        t_comp = round((time.perf_counter() - t0) * 1000, 3)

        # 2. Encryption timing
        t0 = time.perf_counter()
        enc_res = BioCryptEngine.encrypt(comp_data, password=password, kdf_type="argon2id")
        t_enc = round((time.perf_counter() - t0) * 1000, 3)
        ciphertext = enc_res["ciphertext"]

        # 3. Encoding timing
        t0 = time.perf_counter()
        if strategy == "constrained_rotation":
            pkg_enc = ConstrainedDNAEncoder.encode_payload_with_chunks(ciphertext, chunk_size=192, rs_parity=rs_parity)
        else:
            pkg_enc = BaselineDNAEncoder.encode_payload_with_chunks(ciphertext, chunk_size=192, rs_parity=rs_parity)
        t_encode = round((time.perf_counter() - t0) * 1000, 3)

        dna_sequence = pkg_enc["full_sequence"]
        total_nucleotides = len(dna_sequence)
        overhead_ratio = round(total_nucleotides / orig_size, 2) if orig_size > 0 else 0.0

        # Helix Guard analysis
        validation = HelixGuardValidator.validate_sequence(dna_sequence)

        # Build full package for recovery
        package = {
            "format_version": "1.0.0",
            "session_id": str(uuid.uuid4()),
            "file_metadata": {
                "original_filename": filename,
                "media_type": "application/octet-stream",
                "original_size": orig_size,
                "original_sha256": orig_sha256
            },
            "pipeline_parameters": {
                "compression": "deflate" if compression else "none",
                "compressed_size": len(comp_data),
                "encryption": {
                    "algorithm": "AES-256-GCM",
                    "salt": enc_res["salt_b64"],
                    "nonce": enc_res["nonce_b64"],
                    "kdf": enc_res["kdf_params"]
                },
                "encoding": {
                    "strategy": strategy
                },
                "error_correction": {
                    "parity_bytes_per_chunk": rs_parity,
                    "total_chunks": pkg_enc["total_chunks"]
                }
            },
            "sequence_data": {
                "chunks": pkg_enc["chunks"],
                "full_sequence": dna_sequence,
                "total_nucleotides": total_nucleotides
            }
        }

        # 4. Clean decoding timing (0 errors)
        t0 = time.perf_counter()
        rec_clean = RecoveryPipeline.run_recovery(package, password=password)
        t_decode_clean = round((time.perf_counter() - t0) * 1000, 3)

        # 5. Damaged recovery test
        t_recovery_damaged = 0.0
        recovery_damaged_success = False
        if test_error_rate > 0:
            mut_res = MutationSimulator.mutate_package(
                package=package,
                substitution_rate=test_error_rate,
                seed=42
            )
            t0 = time.perf_counter()
            rec_damaged = RecoveryPipeline.run_recovery(mut_res["mutated_package"], password=password)
            t_recovery_damaged = round((time.perf_counter() - t0) * 1000, 3)
            recovery_damaged_success = (rec_damaged["status"] == "SUCCESS")
        else:
            recovery_damaged_success = (rec_clean["status"] == "SUCCESS")

        benchmark_id = str(uuid.uuid4())
        
        # Save to SQLite
        try:
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO benchmarks (
                id, session_id, filename, file_size, strategy, compression_ratio,
                encoding_time_ms, decoding_time_ms, encryption_time_ms, decryption_time_ms,
                error_rate, recovery_success
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                benchmark_id,
                package["session_id"],
                filename,
                orig_size,
                strategy,
                comp_ratio,
                t_encode,
                t_decode_clean,
                t_enc,
                t_decode_clean, # includes decryption
                test_error_rate,
                1 if recovery_damaged_success else 0
            ))
            conn.commit()
            conn.close()
        except Exception:
            pass

        return {
            "benchmark_id": benchmark_id,
            "filename": filename,
            "file_size": orig_size,
            "strategy": strategy,
            "compression_enabled": compression,
            "compression_ratio": comp_ratio,
            "timings_ms": {
                "compression": t_comp,
                "encryption": t_enc,
                "dna_encoding": t_encode,
                "clean_recovery": t_decode_clean,
                "damaged_recovery": t_recovery_damaged
            },
            "sequence_metrics": {
                "total_nucleotides": total_nucleotides,
                "overhead_ratio": overhead_ratio,
                "gc_content_pct": validation["gc_content_pct"],
                "max_homopolymer_run": validation["max_homopolymer_run"]
            },
            "recovery_results": {
                "clean_recovery_success": (rec_clean["status"] == "SUCCESS"),
                "damaged_recovery_success": recovery_damaged_success,
                "tested_error_rate": test_error_rate
            }
        }
