import pytest
import hashlib
from app.services.encoding.baseline import BaselineDNAEncoder
from app.services.encryption.biocrypt import BioCryptEngine
from app.services.mutation.simulator import MutationSimulator
from app.services.recovery.pipeline import RecoveryPipeline

def test_mutation_and_successful_recovery_under_threshold():
    original_file = b"DNcrypt molecular storage recovery test with simulated radiation."
    password = "RadiationTestPassword2026"
    orig_sha256 = hashlib.sha256(original_file).hexdigest()
    
    enc_res = BioCryptEngine.encrypt(original_file, password=password)
    pkg_enc = BaselineDNAEncoder.encode_payload_with_chunks(enc_res["ciphertext"], chunk_size=128, rs_parity=24)
    
    package = {
        "format_version": "1.0.0",
        "session_id": "test-session",
        "file_metadata": {
            "original_filename": "test.txt",
            "media_type": "text/plain",
            "original_size": len(original_file),
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
                "parity_bytes_per_chunk": 24,
                "total_chunks": pkg_enc["total_chunks"]
            }
        },
        "sequence_data": {
            "chunks": pkg_enc["chunks"],
            "full_sequence": pkg_enc["full_sequence"],
            "total_nucleotides": pkg_enc["total_nucleotides"]
        }
    }
    
    # Apply modest substitution mutation (0.5% rate)
    mut_res = MutationSimulator.mutate_package(
        package=package,
        substitution_rate=0.005,
        seed=1234
    )
    assert mut_res["mutation_stats"]["substitutions"] > 0
    
    # Run recovery
    rec_res = RecoveryPipeline.run_recovery(mut_res["mutated_package"], password=password)
    assert rec_res["status"] == "SUCCESS"
    assert rec_res["integrity_verified"] is True
    assert rec_res["recovered_bytes"] == original_file

def test_missing_chunk_causes_controlled_failure():
    original_file = b"Critical data split into multiple chunks for dropout test" * 5
    password = "DropoutTestPassword"
    orig_sha256 = hashlib.sha256(original_file).hexdigest()
    
    enc_res = BioCryptEngine.encrypt(original_file, password=password)
    pkg_enc = BaselineDNAEncoder.encode_payload_with_chunks(enc_res["ciphertext"], chunk_size=64, rs_parity=8)
    
    package = {
        "format_version": "1.0.0",
        "session_id": "test-dropout",
        "file_metadata": {
            "original_filename": "dropout.txt",
            "media_type": "text/plain",
            "original_size": len(original_file),
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
                "parity_bytes_per_chunk": 8,
                "total_chunks": pkg_enc["total_chunks"]
            }
        },
        "sequence_data": {
            "chunks": pkg_enc["chunks"],
            "full_sequence": pkg_enc["full_sequence"],
            "total_nucleotides": pkg_enc["total_nucleotides"]
        }
    }
    
    # Drop 1 chunk
    mut_res = MutationSimulator.mutate_package(
        package=package,
        missing_chunks_count=1,
        seed=99
    )
    
    rec_res = RecoveryPipeline.run_recovery(mut_res["mutated_package"], password=password)
    assert rec_res["status"] == "FAILED"
    assert rec_res["integrity_verified"] is False
    assert rec_res["missing_chunks_count"] >= 1
