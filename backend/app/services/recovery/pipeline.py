import hashlib
from typing import Dict, Any, Optional
from app.services.decoding.decoder import DNADecoder
from app.services.encryption.biocrypt import BioCryptEngine
from app.services.compression.engine import CompressionEngine

class RecoveryPipeline:
    @classmethod
    def run_recovery(
        cls,
        package: Dict[str, Any],
        password: str
    ) -> Dict[str, Any]:
        """
        Executes end-to-end recovery:
        1. Decode and error-correct each chunk.
        2. Detect missing / damaged chunks.
        3. Reassemble ciphertext payload.
        4. AES-256-GCM authenticated decryption.
        5. Decompress if compression was enabled.
        6. Compute SHA-256 and verify exact match.
        """
        pipeline_params = package.get("pipeline_parameters", {})
        enc_params = pipeline_params.get("encryption", {})
        err_params = pipeline_params.get("error_correction", {})
        comp_mode = pipeline_params.get("compression", "none")
        encoding_strategy = pipeline_params.get("encoding", {}).get("strategy", "baseline_2bit")
        
        rs_parity = err_params.get("parity_bytes_per_chunk", 16)
        expected_total_chunks = err_params.get("total_chunks", 1)
        
        file_meta = package.get("file_metadata", {})
        expected_sha256 = file_meta.get("original_sha256", "").lower()
        original_filename = file_meta.get("original_filename", "recovered_file")
        media_type = file_meta.get("media_type", "application/octet-stream")

        chunks = package.get("sequence_data", {}).get("chunks", [])
        
        # Step 1: Decode and correct chunks
        recovered_chunks = {}
        corrected_chunks_count = 0
        total_corrected_bytes = 0
        failed_chunks = []

        for chk in chunks:
            chk_dna = chk.get("dna_sequence", "")
            chk_res = DNADecoder.decode_chunk_dna(chk_dna, strategy=encoding_strategy, rs_parity=rs_parity)
            if chk_res.get("success"):
                idx = chk_res["index"]
                recovered_chunks[idx] = chk_res["payload"]
                if chk_res.get("corrected_bytes", 0) > 0:
                    corrected_chunks_count += 1
                    total_corrected_bytes += chk_res["corrected_bytes"]
            else:
                failed_chunks.append({
                    "chunk_id": chk.get("chunk_id", "unknown"),
                    "error": chk_res.get("error", "Failed decoding")
                })

        # Step 2: Check missing chunks
        missing_indices = []
        for i in range(expected_total_chunks):
            if i not in recovered_chunks:
                missing_indices.append(i)

        if missing_indices or len(recovered_chunks) < expected_total_chunks:
            return {
                "status": "FAILED",
                "recovery_stage": "chunk_reassembly",
                "message": f"Unrecoverable sequence: missing or destroyed chunk(s): {missing_indices}. Failed chunks count: {len(failed_chunks)}",
                "corrected_chunks_count": corrected_chunks_count,
                "total_corrected_bytes": total_corrected_bytes,
                "missing_chunks_count": len(missing_indices),
                "authentication_verified": False,
                "integrity_verified": False,
                "recovered_bytes": None
            }

        # Step 3: Reassemble full ciphertext
        reassembled_ciphertext = bytearray()
        for i in range(expected_total_chunks):
            reassembled_ciphertext.extend(recovered_chunks[i])
        reassembled_bytes = bytes(reassembled_ciphertext)

        # Step 4: AES-256-GCM Decryption
        salt_b64 = enc_params.get("salt", "")
        nonce_b64 = enc_params.get("nonce", "")
        kdf_params = enc_params.get("kdf", {})

        try:
            decrypted_payload = BioCryptEngine.decrypt(
                ciphertext_and_tag=reassembled_bytes,
                password=password,
                salt_b64=salt_b64,
                nonce_b64=nonce_b64,
                kdf_params=kdf_params
            )
        except Exception as e:
            return {
                "status": "FAILED",
                "recovery_stage": "decryption_authentication",
                "message": f"Cryptographic authentication failed: {str(e)}",
                "corrected_chunks_count": corrected_chunks_count,
                "total_corrected_bytes": total_corrected_bytes,
                "missing_chunks_count": 0,
                "authentication_verified": False,
                "integrity_verified": False,
                "recovered_bytes": None
            }

        # Step 5: Decompression
        try:
            if comp_mode == "deflate":
                final_bytes = CompressionEngine.decompress(decrypted_payload)
            else:
                final_bytes = decrypted_payload
        except Exception as e:
            return {
                "status": "FAILED",
                "recovery_stage": "decompression",
                "message": f"Decompression failed: {str(e)}",
                "corrected_chunks_count": corrected_chunks_count,
                "total_corrected_bytes": total_corrected_bytes,
                "missing_chunks_count": 0,
                "authentication_verified": True,
                "integrity_verified": False,
                "recovered_bytes": None
            }

        # Step 6: SHA-256 Integrity Verification
        actual_sha256 = hashlib.sha256(final_bytes).hexdigest().lower()
        integrity_ok = (actual_sha256 == expected_sha256)

        if not integrity_ok:
            return {
                "status": "FAILED",
                "recovery_stage": "sha256_verification",
                "message": f"Integrity digest mismatch! Expected {expected_sha256}, got {actual_sha256}",
                "corrected_chunks_count": corrected_chunks_count,
                "total_corrected_bytes": total_corrected_bytes,
                "missing_chunks_count": 0,
                "authentication_verified": True,
                "integrity_verified": False,
                "expected_sha256": expected_sha256,
                "actual_sha256": actual_sha256,
                "recovered_bytes": None
            }

        return {
            "status": "SUCCESS",
            "recovery_stage": "complete",
            "message": "File successfully recovered, authenticated, and cryptographically verified byte-for-byte.",
            "filename": original_filename,
            "media_type": media_type,
            "recovered_size": len(final_bytes),
            "corrected_chunks_count": corrected_chunks_count,
            "total_corrected_bytes": total_corrected_bytes,
            "missing_chunks_count": 0,
            "authentication_verified": True,
            "integrity_verified": True,
            "sha256": actual_sha256,
            "recovered_bytes": final_bytes
        }
