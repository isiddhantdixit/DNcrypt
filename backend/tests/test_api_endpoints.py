import pytest
from app.api.routes import health_check, validate_sequence, mutate_sequence, recover_file, run_benchmark
from app.schemas.package import ValidateRequest, MutateRequest, RecoverRequest, BenchmarkRequest
from app.services.encoding.baseline import BaselineDNAEncoder
from app.services.encryption.biocrypt import BioCryptEngine
import hashlib

def test_api_health():
    res = health_check()
    assert res["status"] == "healthy"
    assert "DNcrypt" in res["service"]

def test_api_validation_and_mutation_and_recovery():
    # 1. Prepare sample package
    content = b"Integration test payload for DNcrypt API direct route tests."
    password = "IntegrationPassword2026!"
    orig_sha256 = hashlib.sha256(content).hexdigest()
    
    enc_res = BioCryptEngine.encrypt(content, password=password)
    pkg_enc = BaselineDNAEncoder.encode_payload_with_chunks(enc_res["ciphertext"], chunk_size=128, rs_parity=16)

    package = {
        "format_version": "1.0.0",
        "session_id": "test-direct-session",
        "created_at": "2026-11-20T12:00:00Z",
        "file_metadata": {
            "original_filename": "direct_test.txt",
            "media_type": "text/plain",
            "original_size": len(content),
            "original_sha256": orig_sha256
        },
        "pipeline_parameters": {
            "compression": "none",
            "encryption": {
                "algorithm": "AES-256-GCM",
                "salt": enc_res["salt_b64"],
                "nonce": enc_res["nonce_b64"],
                "kdf": enc_res["kdf_params"]
            },
            "encoding": {
                "strategy": "baseline_2bit"
            },
            "error_correction": {
                "parity_bytes_per_chunk": 16,
                "total_chunks": pkg_enc["total_chunks"]
            }
        },
        "sequence_data": {
            "chunks": pkg_enc["chunks"],
            "full_sequence": pkg_enc["full_sequence"],
            "total_nucleotides": pkg_enc["total_nucleotides"]
        }
    }

    # 2. Test validate_sequence
    val_res = validate_sequence(ValidateRequest(package=package))
    assert val_res["valid_alphabet"] is True
    assert val_res["gc_content_pct"] >= 0

    # 3. Test mutate_sequence
    mut_req = MutateRequest(package=package, substitution_rate=0.005, seed=42)
    mut_res = mutate_sequence(mut_req)
    assert mut_res["mutation_stats"]["substitutions"] > 0
    mutated_pkg = mut_res["mutated_package"]

    # 4. Test recover_file (success)
    rec_req = RecoverRequest(package=mutated_pkg, password=password)
    rec_res = recover_file(rec_req)
    assert rec_res["status"] == "SUCCESS"
    assert rec_res["integrity_verified"] is True
    assert rec_res["recovered_file_base64"] is not None

    # 5. Test recover_file (wrong password fails authentication)
    rec_wrong = recover_file(RecoverRequest(package=mutated_pkg, password="WrongPassword!"))
    assert rec_wrong["status"] == "FAILED"
    assert rec_wrong["authentication_verified"] is False

def test_api_benchmark_runner():
    req = BenchmarkRequest(
        file_size_bytes=512,
        strategy="baseline_2bit",
        compression=True,
        rs_parity=16,
        test_error_rate=0.01
    )
    bench_res = run_benchmark(req)
    assert "timings_ms" in bench_res
    assert bench_res["recovery_results"]["clean_recovery_success"] is True
