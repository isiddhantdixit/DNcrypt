import zlib
from typing import List, Dict, Any
from app.services.error_correction.reed_solomon import ReedSolomonCodec

class BaselineDNAEncoder:
    """
    Standard 2-bit baseline mapping:
    00 -> A
    01 -> C
    10 -> G
    11 -> T
    """
    MAPPING = {
        0: 'A', # 0b00
        1: 'C', # 0b01
        2: 'G', # 0b10
        3: 'T'  # 0b11
    }

    @classmethod
    def bytes_to_dna(cls, data: bytes) -> str:
        dna_chars = []
        for byte in data:
            dna_chars.append(cls.MAPPING[(byte >> 6) & 0b11])
            dna_chars.append(cls.MAPPING[(byte >> 4) & 0b11])
            dna_chars.append(cls.MAPPING[(byte >> 2) & 0b11])
            dna_chars.append(cls.MAPPING[byte & 0b11])
        return "".join(dna_chars)

    @classmethod
    def encode_payload_with_chunks(cls, payload: bytes, chunk_size: int = 192, rs_parity: int = 16) -> Dict[str, Any]:
        """
        Splits payload into chunks, adds 4-byte CRC32, applies Reed-Solomon parity,
        and encodes each chunk into DNA.
        """
        rs = ReedSolomonCodec(n_parity=rs_parity) if rs_parity > 0 else None
        chunks_info = []
        full_dna_parts = []
        
        total_chunks = (len(payload) + chunk_size - 1) // chunk_size if payload else 1
        if len(payload) == 0:
            raw_chunks = [b""]
        else:
            raw_chunks = [payload[i:i + chunk_size] for i in range(0, len(payload), chunk_size)]

        for idx, chunk_bytes in enumerate(raw_chunks):
            chunk_crc = zlib.crc32(chunk_bytes)
            # 4-byte index + 2-byte length + 4-byte crc32 + chunk payload
            header = idx.to_bytes(4, 'big') + len(chunk_bytes).to_bytes(2, 'big') + chunk_crc.to_bytes(4, 'big')
            chunk_with_header = header + chunk_bytes
            
            if rs:
                chunk_protected = rs.encode_chunk(chunk_with_header)
            else:
                chunk_protected = chunk_with_header
                
            chunk_dna = cls.bytes_to_dna(chunk_protected)
            full_dna_parts.append(chunk_dna)
            
            chunks_info.append({
                "index": idx,
                "chunk_id": f"chk_{idx:04d}",
                "raw_size": len(chunk_bytes),
                "protected_size": len(chunk_protected),
                "dna_len": len(chunk_dna),
                "dna_sequence": chunk_dna,
                "crc32": f"{chunk_crc:08x}"
            })

        full_dna = "".join(full_dna_parts)
        
        return {
            "strategy": "baseline_2bit",
            "chunk_size": chunk_size,
            "rs_parity": rs_parity,
            "total_chunks": len(chunks_info),
            "chunks": chunks_info,
            "full_sequence": full_dna,
            "total_nucleotides": len(full_dna)
        }
