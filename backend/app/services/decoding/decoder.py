import zlib
from typing import List, Dict, Any, Tuple, Optional
from app.services.error_correction.reed_solomon import ReedSolomonCodec
from app.services.encoding.constrained import ConstrainedDNAEncoder

class DNADecoder:
    REVERSE_BASELINE = {
        'A': 0, # 00
        'C': 1, # 01
        'G': 2, # 10
        'T': 3  # 11
    }

    @classmethod
    def baseline_dna_to_bytes(cls, dna: str) -> bytes:
        dna = dna.upper().strip()
        if len(dna) % 4 != 0:
            raise ValueError(f"Baseline DNA sequence length ({len(dna)}) must be a multiple of 4.")
            
        byte_arr = bytearray()
        for i in range(0, len(dna), 4):
            b0 = cls.REVERSE_BASELINE.get(dna[i])
            b1 = cls.REVERSE_BASELINE.get(dna[i+1])
            b2 = cls.REVERSE_BASELINE.get(dna[i+2])
            b3 = cls.REVERSE_BASELINE.get(dna[i+3])
            
            if b0 is None or b1 is None or b2 is None or b3 is None:
                raise ValueError(f"Invalid nucleotide character found at position {i}.")
                
            byte_val = (b0 << 6) | (b1 << 4) | (b2 << 2) | b3
            byte_arr.append(byte_val)
            
        return bytes(byte_arr)

    @classmethod
    def decode_chunk_dna(cls, chunk_dna: str, strategy: str, rs_parity: int = 16) -> Dict[str, Any]:
        """
        Decodes a single chunk's DNA sequence, applies Reed-Solomon correction,
        parses the 10-byte header (idx, len, crc32), and validates CRC32.
        """
        # Step 1: Decode nucleotide sequence to raw protected bytes
        try:
            if strategy == "constrained_rotation":
                protected_bytes = ConstrainedDNAEncoder.dna_to_bytes(chunk_dna)
            else:
                protected_bytes = cls.baseline_dna_to_bytes(chunk_dna)
        except Exception as e:
            return {
                "success": False,
                "error": f"Nucleotide decoding failed: {str(e)}",
                "corrected_bytes": 0
            }

        # Step 2: Apply Reed-Solomon error correction
        corrected_bytes = 0
        if rs_parity > 0:
            codec = ReedSolomonCodec(n_parity=rs_parity)
            raw_with_header, corrected_bytes, rs_ok = codec.decode_chunk(protected_bytes)
            if not rs_ok or raw_with_header is None:
                return {
                    "success": False,
                    "error": "Reed-Solomon error correction failed (excessive damage)",
                    "corrected_bytes": 0
                }
        else:
            raw_with_header = protected_bytes

        # Step 3: Validate header (min 10 bytes: 4 byte idx, 2 byte len, 4 byte crc)
        if len(raw_with_header) < 10:
            return {
                "success": False,
                "error": "Chunk payload too short to contain valid DNcrypt header",
                "corrected_bytes": corrected_bytes
            }

        idx = int.from_bytes(raw_with_header[0:4], 'big')
        length = int.from_bytes(raw_with_header[4:6], 'big')
        expected_crc = int.from_bytes(raw_with_header[6:10], 'big')
        payload = raw_with_header[10:10+length]

        # Step 4: Verify CRC32
        actual_crc = zlib.crc32(payload)
        if actual_crc != expected_crc:
            return {
                "success": False,
                "error": f"CRC32 mismatch on chunk {idx}: expected {expected_crc:08x}, got {actual_crc:08x}",
                "corrected_bytes": corrected_bytes,
                "index": idx
            }

        return {
            "success": True,
            "index": idx,
            "payload": payload,
            "corrected_bytes": corrected_bytes,
            "crc32": f"{actual_crc:08x}"
        }
